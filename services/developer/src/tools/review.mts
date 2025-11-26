import type { FastMCP } from 'fastmcp'
import { z } from 'zod'

import {
  earliestPhaseFromStatus,
  type PullRequestStatus,
  parseStatusConclusion,
  type StatusCheck,
} from '../lib/ci.mjs'
import { runCommand } from '../lib/exec.mjs'
import {
  advancePhase,
  ensurePhaseAtLeast,
  requireProjectContext,
  revertToPhase,
  setPhaseStatus,
} from '../workflow/engine.mjs'
import type { WorkflowPhase } from '../workflow/phases.mjs'
import { loadWorkflowState } from '../workflow/state.mjs'

const reviewSummaryParams = z
  .object({
    summary: z.string().min(1),
    outcome: z.enum(['approve', 'changes', 'block']),
  })
  .describe('Record human review output for traceability.')

const statusCheckSchema: z.ZodType<StatusCheck> = z.object({
  name: z.string(),
  conclusion: z.string().optional(),
  status: z.string().optional(),
  url: z.string().optional(),
})

const statusCheckRollupSchema: z.ZodType<
  PullRequestStatus['statusCheckRollup']
> = z
  .object({
    conclusion: z.string().optional(),
    state: z.string().optional(),
    checks: z.array(statusCheckSchema).optional(),
  })
  .optional()

const pullRequestStatusSchema: z.ZodType<PullRequestStatus> = z.object({
  url: z.string().optional(),
  mergeStateStatus: z.string().optional(),
  statusCheckRollup: statusCheckRollupSchema,
})

export const registerReviewTools = (server: FastMCP): void => {
  server.addTool({
    name: 'record_review_summary',
    description: 'Persist review outcome and update phase status.',
    parameters: reviewSummaryParams,
    execute: async (input) => {
      const { summary, outcome } = reviewSummaryParams.parse(input)
      await ensurePhaseAtLeast('review')

      const status = outcome === 'approve' ? 'complete' : 'blocked'
      await setPhaseStatus('review', status, summary)
      if (status === 'complete') {
        await advancePhase('pr')
      }

      const state = await loadWorkflowState()
      return JSON.stringify({ status: 'ok', state })
    },
  })

  server.addTool({
    name: 'update_pr_status',
    description:
      'Fetch PR status via gh, update workflow phase, and surface CI conclusion.',
    parameters: z.object({}).describe('No parameters required.'),
    execute: async () => {
      const state = await loadWorkflowState()
      if (!state.featureBranch) {
        throw new Error(
          'Feature branch not set. Prepare branch before checking status.',
        )
      }

      const { root: projectRoot } = await requireProjectContext()

      const result = await runCommand(
        'gh',
        [
          'pr',
          'view',
          state.featureBranch,
          '--json',
          'number,state,statusCheckRollup,mergeStateStatus,url',
        ],
        { cwd: projectRoot },
      )

      if (result.code !== 0) {
        return JSON.stringify({
          status: 'error',
          stdout: result.stdout,
          stderr: result.stderr,
        })
      }

      const { rollup, gate } = evaluatePullRequestStatus(result.stdout)

      if (gate) {
        if (gate === 'merge') {
          await advancePhase('merge')
          await setPhaseStatus('merge', 'in_progress')
        } else if (gate === 'review') {
          await revertToPhase('review', {
            reason: 'CI pending or failures detected during review.',
          })
          await setPhaseStatus('review', 'in_progress')
        } else if (gate === 'testing') {
          await revertToPhase('implementation', {
            reason: 'CI checks failing. Returning to implementation phase.',
          })
        }
      }

      return JSON.stringify({
        status: 'ok',
        conclusion: rollup.conclusion,
        failingChecks: rollup.failingChecks,
      })
    },
  })
}

export const evaluatePullRequestStatus = (
  stdout: string,
): {
  readonly status: PullRequestStatus
  readonly rollup: ReturnType<typeof parseStatusConclusion>
  readonly gate?: WorkflowPhase
} => {
  let data: unknown
  try {
    data = JSON.parse(stdout) as unknown
  } catch {
    return {
      status: {},
      rollup: { conclusion: 'UNKNOWN', failingChecks: [] },
    }
  }

  const parsed = pullRequestStatusSchema.safeParse(data)
  if (!parsed.success) {
    return {
      status: {},
      rollup: { conclusion: 'UNKNOWN', failingChecks: [] },
    }
  }

  const status = parsed.data
  const rollup = parseStatusConclusion(status)
  const gate = earliestPhaseFromStatus(rollup.conclusion)

  return { status, rollup, gate }
}
