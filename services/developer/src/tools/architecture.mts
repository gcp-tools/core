import { mkdir, writeFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'

import type { FastMCP } from 'fastmcp'
import { z } from 'zod'

import {
  ensurePhaseAtLeast,
  requireFeatureContext,
  requireProjectContext,
  setFeatureArchitecture,
  setPhaseStatus,
} from '../workflow/engine.mjs'

const architectureSchema = z.object({
  content: z.string().min(1, 'Architecture content is required.'),
  title: z.string().trim().optional(),
})

export const registerArchitectureTools = (server: FastMCP): void => {
  server.addTool({
    name: 'write_architecture',
    description:
      'Persist the architecture document to docs/feat/{feature}/architecture.md and cache metadata.',
    parameters: architectureSchema,
    execute: async (rawInput) => {
      await ensurePhaseAtLeast('architecture')
      const input = architectureSchema.parse(rawInput)
      const featureContext = await requireFeatureContext()
      const { root } = await requireProjectContext()
      const docsPath = resolve(root, featureContext.docsRelativePath)

      await mkdir(docsPath, { recursive: true })

      const filePath = resolve(docsPath, 'architecture.md')
      const heading = input.title?.trim()
      const body = input.content.trim()
      const document = heading ? `# ${heading}\n\n${body}\n` : `${body}\n`

      await writeFile(filePath, document, 'utf-8')
      const architectureRelativePath = relative(root, filePath)
      const context = await setFeatureArchitecture(architectureRelativePath)

      await setPhaseStatus('architecture', 'complete')

      return JSON.stringify({
        status: 'ok',
        context,
        filePath,
      })
    },
  })
}
