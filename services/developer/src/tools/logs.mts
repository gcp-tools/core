import type { FastMCP } from 'fastmcp'
import { z } from 'zod'

import { runCommand } from '../lib/exec.mjs'
import { ensurePhaseAtLeast } from '../workflow/engine.mjs'

const logsParams = z
  .object({
    project: z.string().optional(),
    filter: z.string().optional(),
    minutes: z.number().int().min(1).max(1440).default(60),
    limit: z.number().int().min(1).max(1000).default(50),
    format: z.enum(['text', 'json']).default('text'),
  })
  .describe('Reads recent deployment logs from Cloud Logging using gcloud.')

export const registerLogTools = (server: FastMCP): void => {
  server.addTool({
    name: 'fetch_deployment_logs',
    description:
      'Retrieve recent deployment-related logs via gcloud logging read.',
    parameters: logsParams,
    execute: async (input) => {
      const { project, filter, minutes, limit, format } =
        logsParams.parse(input)
      await ensurePhaseAtLeast('infrastructure')

      const args = [
        'logging',
        'read',
        `timestamp>="${new Date(Date.now() - minutes * 60 * 1000).toISOString()}"`,
        '--limit',
        limit.toString(),
        '--format',
        format,
      ]

      if (project) {
        args.push('--project', project)
      }

      if (filter) {
        args.push('--filter', filter)
      }

      const result = await runCommand('gcloud', args)
      return JSON.stringify({
        status: result.code === 0 ? 'ok' : 'error',
        command: ['gcloud', ...args].join(' '),
        exitCode: result.code,
        stdout: result.stdout,
        stderr: result.stderr,
      })
    },
  })
}
