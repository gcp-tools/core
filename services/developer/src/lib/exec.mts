import { spawn } from 'node:child_process'

import { getEnvironmentVariables } from '../workflow/engine.mjs'

export type CommandResult = {
  readonly command: string
  readonly args: readonly string[]
  readonly code: number
  readonly stdout: string
  readonly stderr: string
}

export const runCommand = async (
  command: string,
  args: readonly string[] = [],
  options: {
    readonly cwd?: string
    readonly env?: NodeJS.ProcessEnv
  } = {},
): Promise<CommandResult> => {
  const workflowEnvVars = await getEnvironmentVariables()
  return await new Promise<CommandResult>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: {
        ...process.env,
        ...workflowEnvVars,
        ...options.env,
      },
      shell: false,
    })

    const stdoutChunks: Buffer[] = []
    const stderrChunks: Buffer[] = []

    child.stdout.on('data', (data) => {
      stdoutChunks.push(data as Buffer)
    })

    child.stderr.on('data', (data) => {
      stderrChunks.push(data as Buffer)
    })

    child.on('error', (error) => {
      reject(error)
    })

    child.on('close', (code) => {
      resolve({
        command,
        args,
        code: code ?? -1,
        stdout: Buffer.concat(stdoutChunks).toString('utf-8'),
        stderr: Buffer.concat(stderrChunks).toString('utf-8'),
      })
    })
  })
}
