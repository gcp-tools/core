import { mkdir, writeFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'

import type { FastMCP } from 'fastmcp'
import { z } from 'zod'
import {
  ensurePhaseAtLeast,
  getFeatureContext,
  getServiceContext,
  requireFeatureBrief,
  requireFeatureContext,
  requireProjectContext,
  requireServiceContext,
  setFeatureBrief,
  setFeatureContext,
  setFeatureEnvironmentVariables,
  setServiceContext,
} from '../workflow/engine.mjs'

const identifier = z
  .string()
  .min(1)
  .max(64)
  .regex(
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    'Use alphanumeric and dashes only.',
  )

const serviceContextSchema = z.object({
  kind: z.enum(['service', 'app']).default('service'),
  name: identifier,
  component: identifier,
})

type ServiceContextInput = z.infer<typeof serviceContextSchema>

const featureContextSchema = z.object({
  feature: identifier,
})

type FeatureContextInput = z.infer<typeof featureContextSchema>

const briefSchema = z.object({
  title: z.string().trim().optional(),
  content: z.string().min(1, 'Brief content is required.'),
})

const normaliseFeatureName = (value: string): string => value.toLowerCase()

const deriveServicePath = (input: ServiceContextInput): string => {
  const base = input.kind === 'service' ? 'services' : 'apps'
  return `${base}/${input.name}/${input.component}`
}

const deriveFeatureDocsPath = (input: FeatureContextInput): string => {
  const feature = normaliseFeatureName(input.feature)
  return `docs/feat/${feature}`
}

export const registerContextTools = (server: FastMCP): void => {
  server.addTool({
    name: 'set_service_context',
    description:
      'Record the active service or app component path under the project root.',
    parameters: serviceContextSchema,
    execute: async (rawInput) => {
      await ensurePhaseAtLeast('brief-intake')
      const input = serviceContextSchema.parse(rawInput)
      const { root } = await requireProjectContext()
      const relativePath = deriveServicePath(input)
      const absolutePath = resolve(root, relativePath)

      await mkdir(absolutePath, { recursive: true })

      const context = await setServiceContext({
        ...input,
        relativePath,
      })

      return JSON.stringify({
        status: 'ok',
        context,
        absolutePath,
      })
    },
  })

  server.addTool({
    name: 'get_service_context',
    description: 'Retrieve the currently configured service context.',
    parameters: z.object({}).describe('No parameters required.'),
    execute: async () => {
      const context = await getServiceContext()
      if (!context) {
        return JSON.stringify({ status: 'unset' })
      }
      const { root } = await requireProjectContext()
      return JSON.stringify({
        status: 'ok',
        context,
        absolutePath: resolve(root, context.relativePath),
      })
    },
  })

  server.addTool({
    name: 'set_feature_context',
    description: 'Record the feature name and docs directory for the workflow.',
    parameters: featureContextSchema,
    execute: async (rawInput) => {
      await ensurePhaseAtLeast('brief-intake')
      const input = featureContextSchema.parse(rawInput)
      const docsRelativePath = deriveFeatureDocsPath(input)
      const { root } = await requireProjectContext()
      const docsPath = resolve(root, docsRelativePath)

      await mkdir(docsPath, { recursive: true })

      const context = await setFeatureContext({
        feature: normaliseFeatureName(input.feature),
        docsRelativePath,
      })

      return JSON.stringify({
        status: 'ok',
        context,
        docsPath,
      })
    },
  })

  server.addTool({
    name: 'get_feature_context',
    description: 'Retrieve the current feature context metadata.',
    parameters: z.object({}).describe('No parameters required.'),
    execute: async () => {
      const context = await getFeatureContext()
      if (!context) {
        return JSON.stringify({ status: 'unset' })
      }
      const { root } = await requireProjectContext()
      return JSON.stringify({
        status: 'ok',
        context,
        docsPath: resolve(root, context.docsRelativePath),
      })
    },
  })

  server.addTool({
    name: 'write_feature_brief',
    description:
      'Persist the feature brief to docs/feat/{feature}/brief.md and cache metadata.',
    parameters: briefSchema,
    execute: async (rawInput) => {
      await ensurePhaseAtLeast('brief-intake')
      const input = briefSchema.parse(rawInput)
      const featureContext = await requireFeatureContext()
      const { root } = await requireProjectContext()
      const docsPath = resolve(root, featureContext.docsRelativePath)

      await mkdir(docsPath, { recursive: true })

      const filePath = resolve(docsPath, 'brief.md')
      const heading = input.title?.trim()
      const body = input.content.trim()
      const document = heading ? `# ${heading}\n\n${body}\n` : `${body}\n`

      await writeFile(filePath, document, 'utf-8')
      const briefRelativePath = relative(root, filePath)
      const context = await setFeatureBrief(briefRelativePath)

      return JSON.stringify({
        status: 'ok',
        context,
        filePath,
      })
    },
  })

  server.addTool({
    name: 'assert_feature_ready',
    description:
      'Ensure project, service, feature context, and brief have all been recorded.',
    parameters: z.object({}).describe('No parameters required.'),
    execute: async () => {
      await ensurePhaseAtLeast('brief-intake')
      await requireProjectContext()
      await requireServiceContext()
      const context = await requireFeatureBrief()
      return JSON.stringify({ status: 'ok', context })
    },
  })

  server.addTool({
    name: 'set_environment_variables',
    description:
      'Set environment variables that will be available to all subsequent shell commands. Call this during brief-intake phase.',
    parameters: z.object({
      variables: z
        .record(z.string(), z.string())
        .describe('Object mapping environment variable names to their values.'),
    }),
    execute: async (rawInput) => {
      await ensurePhaseAtLeast('brief-intake')
      const input = z
        .object({
          variables: z.record(z.string(), z.string()),
        })
        .parse(rawInput)
      const context = await setFeatureEnvironmentVariables(input.variables)
      return JSON.stringify({
        status: 'ok',
        context,
        variables: input.variables,
      })
    },
  })
}
