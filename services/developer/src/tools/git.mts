import type { FastMCP } from 'fastmcp'
import { z } from 'zod'

import { runCommand } from '../lib/exec.mjs'
import {
  ensurePhaseAtLeast,
  requireProjectContext,
  setPhaseStatus,
} from '../workflow/engine.mjs'
import { loadWorkflowState, saveWorkflowState } from '../workflow/state.mjs'

const branchSchema = z
  .object({
    branchName: z
      .string()
      .min(3)
      .regex(/^[a-z0-9._\-/]+$/i, 'Branch name contains invalid characters'),
  })
  .describe('Name of the feature branch to create from development.')

const pushSchema = z
  .object({
    remote: z.string().default('origin'),
  })
  .describe('Pushes the tracked feature branch to the specified remote.')

const prSchema = z
  .object({
    title: z.string().min(3),
    body: z.string().min(3),
    draft: z.boolean().default(false),
  })
  .describe('Creates a pull request using the GitHub CLI (gh).')

const mergeSchema = z
  .object({
    mergeMethod: z.enum(['merge', 'squash', 'rebase']).default('squash'),
  })
  .describe('Merge the active pull request when CI succeeds.')

const commitSchema = z
  .object({
    message: z.string().min(1, 'Commit message is required.'),
    patterns: z.array(z.string()).optional(),
  })
  .describe(
    'Commit changes with the provided message and optional file patterns.',
  )

export const registerGitTools = (server: FastMCP): void => {
  server.addTool({
    name: 'prepare_feature_branch',
    description:
      'Checkout development, sync with origin, and create the feature branch.',
    parameters: branchSchema,
    execute: async (input) => {
      const { branchName } = branchSchema.parse(input)
      await ensurePhaseAtLeast('implementation')
      const { root: projectRoot } = await requireProjectContext()

      const commands = [
        ['git', ['checkout', 'development']] as const,
        ['git', ['fetch', 'origin']] as const,
        ['git', ['pull', '--ff-only', 'origin', 'development']] as const,
        ['git', ['checkout', '-B', branchName]] as const,
      ]

      const results = [] as Array<ReturnType<typeof formatResult>>

      for (const [command, cmdArgs] of commands) {
        const result = await runCommand(command, cmdArgs, { cwd: projectRoot })
        results.push(formatResult(result))
        if (result.code !== 0) {
          return JSON.stringify({
            status: 'error',
            failedCommand: [command, ...cmdArgs].join(' '),
            stdout: result.stdout,
            stderr: result.stderr,
          })
        }
      }

      const state = await loadWorkflowState()
      const nextState = {
        ...state,
        featureBranch: branchName,
        lastGitSyncAt: new Date().toISOString(),
      }
      await saveWorkflowState(nextState)
      await setPhaseStatus('implementation', 'in_progress')

      return JSON.stringify({
        status: 'ok',
        branch: branchName,
        commands: results,
      })
    },
  })

  server.addTool({
    name: 'commit_changes',
    description: 'Commit code changes with the provided message.',
    parameters: commitSchema,
    execute: async (input) => {
      await ensurePhaseAtLeast('implementation')
      const { message, patterns } = commitSchema.parse(input)
      await requireFeatureBranch() // Validate feature branch exists
      const { root: projectRoot } = await requireProjectContext()

      // Check that we're not trying to commit after infrastructure phase has started
      // (unless infrastructure is complete, in which case commits are allowed for fixes)
      const state = await loadWorkflowState()
      const currentPhase = state.currentPhase
      const infrastructureStatus = state.phaseStatuses.infrastructure?.status

      // Allow commits during implementation, testing, and infrastructure phases
      // Block commits if we're past infrastructure and it's not complete
      if (
        (currentPhase === 'review' ||
          currentPhase === 'pr' ||
          currentPhase === 'merge') &&
        infrastructureStatus !== 'complete'
      ) {
        return JSON.stringify({
          status: 'error',
          message:
            'Cannot commit: infrastructure phase must be complete before review. Complete infrastructure work first.',
        })
      }

      // Check for changes
      const statusResult = await runCommand('git', ['status', '--porcelain'], {
        cwd: projectRoot,
      })

      if (!statusResult.stdout.trim()) {
        return JSON.stringify({
          status: 'error',
          message: 'No changes to commit.',
        })
      }

      // Stage changes
      if (patterns && patterns.length > 0) {
        for (const pattern of patterns) {
          const addResult = await runCommand('git', ['add', pattern], {
            cwd: projectRoot,
          })
          if (addResult.code !== 0) {
            return JSON.stringify({
              status: 'error',
              message: `Failed to stage ${pattern}`,
              stdout: addResult.stdout,
              stderr: addResult.stderr,
            })
          }
        }
      } else {
        const addResult = await runCommand('git', ['add', '.'], {
          cwd: projectRoot,
        })
        if (addResult.code !== 0) {
          return JSON.stringify({
            status: 'error',
            message: 'Failed to stage changes',
            stdout: addResult.stdout,
            stderr: addResult.stderr,
          })
        }
      }

      // Commit
      const commitResult = await runCommand('git', ['commit', '-m', message], {
        cwd: projectRoot,
      })

      if (commitResult.code !== 0) {
        return JSON.stringify({
          status: 'error',
          message: 'Failed to commit changes',
          stdout: commitResult.stdout,
          stderr: commitResult.stderr,
        })
      }

      // Get commit SHA
      const shaResult = await runCommand('git', ['rev-parse', 'HEAD'], {
        cwd: projectRoot,
      })

      const commitSha = shaResult.stdout.trim()

      // Update workflow state (reuse state loaded earlier)
      const nextState = {
        ...state,
        lastCommitAt: new Date().toISOString(),
        commitsCount: (state.commitsCount ?? 0) + 1,
      }
      await saveWorkflowState(nextState)

      return JSON.stringify({
        status: 'ok',
        commitSha,
        message,
        stdout: commitResult.stdout,
      })
    },
  })

  server.addTool({
    name: 'push_feature_branch',
    description: 'Push the current feature branch to the remote.',
    parameters: pushSchema,
    execute: async (input) => {
      const { remote } = pushSchema.parse(input)
      const featureBranch = await requireFeatureBranch()
      const { root: projectRoot } = await requireProjectContext()

      // Check if branch has commits
      const logResult = await runCommand(
        'git',
        ['log', '--oneline', '-n', '1'],
        { cwd: projectRoot },
      )

      if (!logResult.stdout.trim()) {
        return JSON.stringify({
          status: 'error',
          message:
            'Cannot push: branch has no commits. Use commit_changes tool first.',
        })
      }

      // Check that infrastructure phase is complete before allowing push
      const state = await loadWorkflowState()
      const infrastructureStatus = state.phaseStatuses.infrastructure?.status
      if (infrastructureStatus !== 'complete') {
        return JSON.stringify({
          status: 'error',
          message:
            'Cannot push: infrastructure phase must be complete before pushing. Complete infrastructure work first.',
        })
      }

      const result = await runCommand('git', ['push', remote, featureBranch], {
        cwd: projectRoot,
      })
      if (result.code !== 0) {
        return JSON.stringify({
          status: 'error',
          stdout: result.stdout,
          stderr: result.stderr,
        })
      }

      return JSON.stringify({
        status: 'ok',
        remote,
        branch: featureBranch,
        stdout: result.stdout,
      })
    },
  })

  server.addTool({
    name: 'create_pull_request',
    description: 'Create a pull request using gh PR create.',
    parameters: prSchema,
    execute: async (input) => {
      const { title, body, draft } = prSchema.parse(input)
      const featureBranch = await requireFeatureBranch()
      const { root: projectRoot } = await requireProjectContext()

      const args = [
        'pr',
        'create',
        '--title',
        title,
        '--body',
        body,
        '--head',
        featureBranch,
        '--base',
        'development',
      ]
      if (draft) args.push('--draft')

      const result = await runCommand('gh', args, { cwd: projectRoot })
      if (result.code !== 0) {
        return JSON.stringify({
          status: 'error',
          stdout: result.stdout,
          stderr: result.stderr,
        })
      }

      const urlMatch = result.stdout.match(/https?:\/\/\S+/)
      const prUrl = urlMatch?.[0]

      const nextState = {
        ...(await loadWorkflowState()),
        pullRequestUrl: prUrl,
      }
      await saveWorkflowState(nextState)
      await setPhaseStatus('pr', 'in_progress')

      return JSON.stringify({
        status: 'ok',
        url: prUrl,
        stdout: result.stdout,
      })
    },
  })

  server.addTool({
    name: 'check_pr_status',
    description: 'Fetch PR status (reviews and checks) using gh.',
    parameters: z.object({}).describe('No parameters required.'),
    execute: async () => {
      const featureBranch = await requireFeatureBranch()
      const { root: projectRoot } = await requireProjectContext()
      const args = [
        'pr',
        'view',
        featureBranch,
        '--json',
        'number,state,statusCheckRollup,mergeStateStatus,url',
      ]

      const result = await runCommand('gh', args, { cwd: projectRoot })
      if (result.code !== 0) {
        return JSON.stringify({
          status: 'error',
          stdout: result.stdout,
          stderr: result.stderr,
        })
      }

      return JSON.stringify({
        status: 'ok',
        data: result.stdout,
      })
    },
  })

  server.addTool({
    name: 'merge_pull_request',
    description: 'Merge the active pull request once CI passes.',
    parameters: mergeSchema,
    execute: async (input) => {
      const { mergeMethod } = mergeSchema.parse(input)
      const featureBranch = await requireFeatureBranch()
      const { root: projectRoot } = await requireProjectContext()

      const result = await runCommand(
        'gh',
        [
          'pr',
          'merge',
          featureBranch,
          '--auto',
          `--${mergeMethod}`,
          '--delete-branch',
        ],
        {
          cwd: projectRoot,
        },
      )

      if (result.code !== 0) {
        return JSON.stringify({
          status: 'error',
          stdout: result.stdout,
          stderr: result.stderr,
        })
      }

      await setPhaseStatus('merge', 'complete')
      return JSON.stringify({
        status: 'ok',
        stdout: result.stdout,
      })
    },
  })
}

const requireFeatureBranch = async (): Promise<string> => {
  const state = await loadWorkflowState()
  if (!state.featureBranch) {
    throw new Error(
      'Feature branch is not set. Run prepare_feature_branch first.',
    )
  }
  return state.featureBranch
}

const formatResult = (result: {
  readonly command: string
  readonly args: readonly string[]
  readonly code: number
  readonly stdout: string
  readonly stderr: string
}) => ({
  command: [result.command, ...result.args].join(' '),
  exitCode: result.code,
  stdout: result.stdout,
  stderr: result.stderr,
})
