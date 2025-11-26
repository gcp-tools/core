import { setTimeout as sleep } from 'node:timers/promises'
import type { FastMCP } from 'fastmcp'
import { z } from 'zod'
import type { StatusCheck } from '../lib/ci.mjs'
import { runCommand } from '../lib/exec.mjs'
import { requireProjectContext } from '../workflow/engine.mjs'
import { loadWorkflowState } from '../workflow/state.mjs'
import { evaluatePullRequestStatus } from './review.mjs'

const monitorParams = z
  .object({
    intervalSeconds: z.number().int().min(10).default(30),
    timeoutSeconds: z.number().int().min(10).max(3600).default(900),
  })
  .describe('Polls PR status until success/failure or timeout.')

export const registerMonitorTools = (server: FastMCP): void => {
  server.addTool({
    name: 'monitor_pr_until_complete',
    description:
      'Continuously poll PR status, updating workflow phases until completion.',
    parameters: monitorParams,
    execute: async (input) => {
      const { intervalSeconds, timeoutSeconds } = monitorParams.parse(input)
      const state = await loadWorkflowState()
      if (!state.featureBranch) {
        throw new Error(
          'Feature branch not set. Prepare branch before monitoring.',
        )
      }

      const { root: projectRoot } = await requireProjectContext()

      const start = Date.now()
      const deadline = start + timeoutSeconds * 1000
      const history: Array<{
        readonly timestamp: string
        readonly conclusion: string
        readonly failingChecks: readonly StatusCheck[]
      }> = []

      while (Date.now() <= deadline) {
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

        const {
          status: prStatus,
          rollup,
          gate,
        } = evaluatePullRequestStatus(result.stdout)

        history.push({
          timestamp: new Date().toISOString(),
          conclusion: rollup.conclusion,
          failingChecks: rollup.failingChecks,
        })

        if (gate === 'merge') {
          return JSON.stringify({
            status: 'ok',
            conclusion: rollup.conclusion,
            failingChecks: rollup.failingChecks,
            history,
            raw: prStatus,
          })
        }

        if (gate === 'testing') {
          return JSON.stringify({
            status: 'error',
            conclusion: rollup.conclusion,
            failingChecks: rollup.failingChecks,
            history,
            raw: prStatus,
          })
        }

        await sleep(intervalSeconds * 1000)
      }

      return JSON.stringify({
        status: 'timeout',
        history,
      })
    },
  })
}
