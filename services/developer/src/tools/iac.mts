import type { FastMCP } from 'fastmcp'
import { z } from 'zod'

import { runCommand } from '../lib/exec.mjs'
import {
  ensurePhaseAtLeast,
  requirePhaseStatus,
  requireProjectContext,
  setPhaseStatus,
} from '../workflow/engine.mjs'

const synthParams = z
  .object({
    workspace: z.string().min(1),
    stack: z.string().optional(),
  })
  .describe('Runs make synth with the provided workspace and optional stack.')

export const registerIacTools = (server: FastMCP): void => {
  server.addTool({
    name: 'synth_iac',
    description: 'Run make synth for the specified workspace/stack.',
    parameters: synthParams,
    execute: async (input) => {
      const { workspace, stack } = synthParams.parse(input)
      await ensurePhaseAtLeast('infrastructure')
      await requirePhaseStatus('testing', 'complete')
      const { root: projectRoot } = await requireProjectContext()

      const args = ['synth', `workspace=${workspace}`]
      if (stack) args.push(`stack=${stack}`)

      const result = await runCommand('make', args, { cwd: projectRoot })
      await setPhaseStatus(
        'infrastructure',
        result.code === 0 ? 'complete' : 'blocked',
        result.code === 0 ? undefined : 'IaC synth failed',
      )

      return JSON.stringify({
        status: result.code === 0 ? 'ok' : 'error',
        command: ['make', ...args].join(' '),
        exitCode: result.code,
        stdout: result.stdout,
        stderr: result.stderr,
      })
    },
  })
}
