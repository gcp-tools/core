import type { FastMCP } from 'fastmcp'
import { z } from 'zod'

// import { getFirestoreProjectId } from '../config/environment.mjs'
import { runCommand } from '../lib/exec.mjs'
import {
  ensurePhaseAtLeast,
  getCurrentPhase,
  requireProjectContext,
  revertToPhase,
  setPhaseStatus,
} from '../workflow/engine.mjs'

const ensureDependenciesInstalled = async (
  projectRoot: string,
): Promise<void> => {
  // Run npm install --workspaces at project root before tests
  await runCommand('npm', ['i', '--workspaces'], {
    cwd: projectRoot,
  })
}

const testParams = z
  .object({
    watch: z.boolean().default(false),
  })
  .describe('Set watch=true to run tests continuously (if supported).')

export const registerTestTools = (server: FastMCP): void => {
  server.addTool({
    name: 'run_tests',
    description: 'Execute project test suite and capture results.',
    parameters: testParams,
    execute: async (input) => {
      const { watch } = testParams.parse(input)
      await ensurePhaseAtLeast('implementation')
      const { root: projectRoot } = await requireProjectContext()
      await ensureDependenciesInstalled(projectRoot)

      // Phase-aware test execution: run test during implementation, test:coverage during testing
      const currentPhase = await getCurrentPhase()
      const testScript =
        currentPhase === 'testing'
          ? 'test:coverage'
          : watch
            ? 'test:watch'
            : 'test'
      const args = ['run', testScript]
      const result = await runCommand('npm', args, {
        cwd: projectRoot,
      })

      // Handle test results based on phase
      if (currentPhase === 'testing') {
        if (result.code === 0) {
          await setPhaseStatus('testing', 'complete')
        } else {
          // Tests/coverage failed during testing phase - automatically revert to implementation
          await setPhaseStatus('testing', 'blocked', 'Tests/coverage failed')
          await revertToPhase('implementation', {
            reason:
              'Tests or coverage failed during testing phase. Returning to implementation phase to fix issues.',
          })

          return JSON.stringify({
            status: 'error',
            command: ['npm', ...args].join(' '),
            exitCode: result.code,
            stdout: result.stdout,
            stderr: result.stderr,
            message:
              'Tests/coverage failed. Workflow automatically reverted to implementation phase. Fix issues and retry.',
            phaseReverted: 'implementation',
          })
        }
      }

      return JSON.stringify({
        status: result.code === 0 ? 'ok' : 'error',
        command: ['npm', ...args].join(' '),
        exitCode: result.code,
        stdout: result.stdout,
        stderr: result.stderr,
      })
    },
  })
}
