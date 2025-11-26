import type { FastMCP } from 'fastmcp'
import { z } from 'zod'

import { runCommand } from '../lib/exec.mjs'
import { requireProjectContext } from '../workflow/engine.mjs'
import { loadWorkflowState } from '../workflow/state.mjs'

const syncParams = z
  .object({
    remote: z.string().default('origin'),
  })
  .describe('Fetch latest remote state without modifying the branch.')

export const registerSyncTools = (server: FastMCP): void => {
  server.addTool({
    name: 'sync_feature_branch',
    description: 'Fetch and fast-forward the feature branch from remote.',
    parameters: syncParams,
    execute: async (input) => {
      const { remote } = syncParams.parse(input)
      const state = await loadWorkflowState()
      if (!state.featureBranch) {
        throw new Error(
          'Feature branch not set. Prepare branch before syncing.',
        )
      }

      const { root: projectRoot } = await requireProjectContext()

      const fetchResult = await runCommand(
        'git',
        ['fetch', remote, state.featureBranch],
        { cwd: projectRoot },
      )
      if (fetchResult.code !== 0) {
        return JSON.stringify({
          status: 'error',
          stdout: fetchResult.stdout,
          stderr: fetchResult.stderr,
        })
      }

      const ffResult = await runCommand(
        'git',
        ['merge', '--ff-only', `${remote}/${state.featureBranch}`],
        { cwd: projectRoot },
      )

      return JSON.stringify({
        status: ffResult.code === 0 ? 'ok' : 'error',
        fetch: {
          stdout: fetchResult.stdout,
          stderr: fetchResult.stderr,
        },
        merge: {
          stdout: ffResult.stdout,
          stderr: ffResult.stderr,
        },
      })
    },
  })
}
