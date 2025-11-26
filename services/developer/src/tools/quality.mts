import type { FastMCP } from 'fastmcp'
import { z } from 'zod'

import { runCommand } from '../lib/exec.mjs'
import {
  ensurePhaseAtLeast,
  requireProjectContext,
  setPhaseStatus,
} from '../workflow/engine.mjs'

const ensureDependenciesInstalled = async (
  projectRoot: string,
): Promise<void> => {
  // Run npm install --workspaces at project root before lint/build
  await runCommand('npm', ['i', '--workspaces'], {
    cwd: projectRoot,
  })
}

const noParams = z.object({}).describe('No parameters required.')

const formatResult = (result: {
  readonly code: number
  readonly stdout: string
  readonly stderr: string
  readonly command: string
  readonly args: readonly string[]
}) => ({
  status: result.code === 0 ? 'ok' : 'error',
  command: [result.command, ...result.args].join(' '),
  exitCode: result.code,
  stdout: result.stdout,
  stderr: result.stderr,
})

export const registerQualityTools = (server: FastMCP): void => {
  server.addTool({
    name: 'run_lint',
    description: 'Run project lint checks and return output.',
    parameters: noParams,
    execute: async (input) => {
      noParams.parse(input)
      await ensurePhaseAtLeast('implementation')
      const { root: projectRoot } = await requireProjectContext()
      await ensureDependenciesInstalled(projectRoot)
      const result = await runCommand('npm', ['run', 'lint'], {
        cwd: projectRoot,
      })
      await setPhaseStatus(
        'implementation',
        result.code === 0 ? 'in_progress' : 'blocked',
        result.code === 0 ? undefined : 'Lint failed',
      )
      return JSON.stringify(formatResult(result))
    },
  })

  server.addTool({
    name: 'run_build',
    description: 'Run project build pipeline and return output.',
    parameters: noParams,
    execute: async (input) => {
      noParams.parse(input)
      await ensurePhaseAtLeast('implementation')
      const { root: projectRoot } = await requireProjectContext()
      await ensureDependenciesInstalled(projectRoot)
      const result = await runCommand('npm', ['run', 'build'], {
        cwd: projectRoot,
      })
      await setPhaseStatus(
        'implementation',
        result.code === 0 ? 'in_progress' : 'blocked',
        result.code === 0 ? undefined : 'Build failed',
      )
      return JSON.stringify(formatResult(result))
    },
  })
}
