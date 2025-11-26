import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { FastMCP } from 'fastmcp'
import { z } from 'zod'

import { rootDir } from '../config/paths.mjs'
import {
  ensurePhaseAtLeast,
  getActiveStoryId,
  requireFeatureContext,
  requireProjectContext,
  setActiveStoryId,
  setPhaseStatus,
} from '../workflow/engine.mjs'

const storySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  commandId: z.string().optional(),
  acceptanceCriteria: z.array(z.string().min(1)),
  context: z.array(z.string().min(1)).default([]),
  goal: z.array(z.string().min(1)).default([]),
  nonGoals: z.array(z.string().min(1)).default([]),
  automatedStrategy: z.array(z.string().min(1)).default([]),
  automatedTests: z
    .object({
      unit: z.array(z.string().min(1)).default([]),
      integration: z.array(z.string().min(1)).default([]),
      e2e: z.array(z.string().min(1)).default([]),
    })
    .default({ unit: [], integration: [], e2e: [] }),
  dependencies: z
    .object({
      upstream: z.array(z.string().min(1)).default([]),
      downstream: z.array(z.string().min(1)).default([]),
      risks: z.array(z.string().min(1)).default([]),
    })
    .default({ upstream: [], downstream: [], risks: [] }),
  documentation: z
    .object({
      readme: z.string().optional(),
      runbooks: z.string().optional(),
      iac: z.string().optional(),
    })
    .default({}),
})

const writeStoriesParams = z.object({
  feature: z.string().min(1),
  prd: z.object({
    problemSummary: z.string().min(1),
    opportunity: z.string().optional(),
    goals: z.array(z.string().min(1)),
    nonGoals: z.array(z.string().min(1)).default([]),
    personas: z
      .array(
        z.object({
          persona: z.string().min(1),
          scenario: z.string().min(1),
          painPoint: z.string().min(1),
          outcome: z.string().min(1),
        }),
      )
      .default([]),
    featureSummary: z.string().min(1),
    constraints: z.string().optional(),
    dependencies: z.string().optional(),
    metrics: z
      .array(
        z.object({
          metric: z.string().min(1),
          baseline: z.string().optional(),
          target: z.string().optional(),
          measurement: z.string().optional(),
        }),
      )
      .default([]),
    risks: z.array(z.string().min(1)).default([]),
    questions: z.array(z.string().min(1)).default([]),
  }),
  commands: z
    .array(
      z.object({
        id: z.string().min(1),
        description: z.string().min(1),
        inputSchema: z.string().min(1),
        outputSchema: z.string().min(1),
        sideEffects: z.string().optional(),
      }),
    )
    .default([]),
  services: z
    .array(
      z.object({
        service: z.string().min(1),
        responsibility: z.string().min(1),
        interfaces: z.string().min(1),
        dependencies: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .default([]),
  stories: z.array(storySchema).min(1),
})

type StoryInput = z.infer<typeof storySchema>
type PrdInput = z.infer<typeof writeStoriesParams>['prd']
type CommandInput = z.infer<typeof writeStoriesParams>['commands'][number]
type ServiceInput = z.infer<typeof writeStoriesParams>['services'][number]

type StoryWithCommand = StoryInput & { readonly commandId?: string }

const loadTemplate = async (name: string): Promise<string> => {
  const templatePath = resolve(rootDir, 'templates', name)
  return await readFile(templatePath, 'utf-8')
}

const renderTemplate = (template: string, story: StoryInput): string => {
  const withCheckboxes = (
    values: readonly string[],
    fallback: string,
  ): string => {
    if (values.length === 0) {
      return `- [ ] ${fallback}`
    }
    return values.map((value) => `- [ ] ${value}`).join('\n')
  }

  const outputItems = template
    .replaceAll('{{STORY_ID}}', story.id)
    .replaceAll('{{STORY_TITLE}}', story.title)
    .replace(
      '{{brief description of existing state}}',
      story.context.join('\n  - ') || 'TBD',
    )
    .replace(
      '{{primary outcome for the story}}',
      story.goal.join('\n  - ') || 'TBD',
    )
    .replace(
      '{{explicitly list items out of scope}}',
      story.nonGoals.join('\n  - ') || 'None',
    )
    .replace(
      '{{enumerate behaviour requirements}}',
      withCheckboxes(story.summary ? [story.summary] : [], 'Define behaviour'),
    )
    .replace(
      '{{document service boundaries, data flows, and environment notes}}',
      withCheckboxes([], 'Document technical notes'),
    )
    .replace(
      '{{performance, security, or regulatory considerations}}',
      withCheckboxes([], 'List constraints'),
    )
    .replace(
      '1. {{Given/When/Then statement}}\n- [ ] {{additional acceptance criterion}}\n- [ ] {{additional acceptance criterion}}',
      story.acceptanceCriteria.length
        ? story.acceptanceCriteria
            .map((criterion) => `- [ ] ${criterion}`)
            .join('\n')
        : '- [ ] TBD acceptance criteria',
    )
    .replace(
      '{{automation strategy}}',
      withCheckboxes(story.automatedStrategy, 'Document automated validation'),
    )
    .replace(
      '{{files or suites}}',
      withCheckboxes(story.automatedTests.unit, 'Add unit test suites'),
    )
    .replace(
      '{{integration tests}}',
      withCheckboxes(story.automatedTests.integration, 'Add integration tests'),
    )
    .replace(
      '{{end-to-end tests}}',
      withCheckboxes(story.automatedTests.e2e, 'Add end-to-end tests'),
    )
    .replace(
      '{{list impacted services or packages}}',
      withCheckboxes([], 'Identify services/packages'),
    )
    .replace(
      '{{files/modules to touch}}',
      withCheckboxes([], 'List components to modify'),
    )
    .replace(
      '{{metrics, logs, or alerts to update}}',
      withCheckboxes([], 'Specify observability updates'),
    )
    .replace(
      '{{systems or teams required}}',
      withCheckboxes(story.dependencies.upstream, 'List upstream teams'),
    )
    .replace(
      '{{consumers influenced by the change}}',
      withCheckboxes(
        story.dependencies.downstream,
        'List downstream consumers',
      ),
    )
    .replace(
      '{{description}}',
      withCheckboxes(story.dependencies.risks, 'Identify risk'),
    )
    .replace('{{approach}}', withCheckboxes([], 'Add mitigation plan'))
    .replace(
      '{{yes/no + references}}',
      withCheckboxes([], 'Assess documentation updates'),
    )
    .replace('{{link or identifier}}', withCheckboxes([], 'Link to brief/spec'))
    .replace(
      '{{links or identifiers}}',
      withCheckboxes([], 'Link related stories'),
    )

  return outputItems
}

const renderSpecificationTemplate = (
  template: string,
  feature: string,
  prd: PrdInput,
  commands: readonly CommandInput[],
  services: readonly ServiceInput[],
  stories: readonly StoryWithCommand[],
): string => {
  const commandRows =
    commands
      .map(
        (command) =>
          `| ${command.id} | ${command.description} | ${command.inputSchema} | ${command.outputSchema} | ${command.sideEffects ?? 'None'} |`,
      )
      .join('\n') || '| (add command) |  |  |  |  |'

  const serviceRows =
    services
      .map(
        (service) =>
          `| ${service.service} | ${service.responsibility} | ${service.interfaces} | ${service.dependencies ?? 'None'} | ${service.notes ?? '—'} |`,
      )
      .join('\n') || '| (add service) |  |  |  |  |'

  const personaRows =
    prd.personas
      .map(
        (persona) =>
          `| ${persona.persona} | ${persona.scenario} | ${persona.painPoint} | ${persona.outcome} |`,
      )
      .join('\n') || '| (persona) |  |  |  |'

  const metricsRows =
    prd.metrics
      .map(
        (metric) =>
          `| ${metric.metric} | ${metric.baseline ?? 'TBD'} | ${metric.target ?? 'TBD'} | ${metric.measurement ?? 'TBD'} |`,
      )
      .join('\n') || '| (metric) |  |  |  |'

  const storyLinks = stories
    .map(
      (story) =>
        `- [${story.title}](./story-${story.id.replace(/[^a-z0-9_-]/gi, '-').toLowerCase()}.md) → Command: ${story.commandId ?? 'TBD'}`,
    )
    .join('\n')

  let output = template

  output = output.replace('{{PROBLEM_SUMMARY}}', prd.problemSummary)
  output = output.replace('{{OPPORTUNITY}}', prd.opportunity ?? 'TBD')
  output = output.replace(
    '{{GOALS}}',
    prd.goals.map((goal) => `  - ${goal}`).join('\n'),
  )
  output = output.replace(
    '{{NONGOALS}}',
    prd.nonGoals.length
      ? prd.nonGoals.map((item) => `  - ${item}`).join('\n')
      : '  - None',
  )
  output = output.replace('{{PERSONAS}}', personaRows)
  output = output.replace('{{FEATURE_SUMMARY}}', prd.featureSummary)
  output = output.replace('{{CONSTRAINTS}}', prd.constraints ?? 'TBD')
  output = output.replace('{{DEPENDENCIES}}', prd.dependencies ?? 'TBD')
  output = output.replace('{{METRICS}}', metricsRows)
  output = output.replace(
    '{{RISKS}}',
    prd.risks.length
      ? prd.risks.map((risk) => `  - ${risk}`).join('\n')
      : '  - None',
  )
  output = output.replace(
    '{{QUESTIONS}}',
    prd.questions.length
      ? prd.questions.map((question) => `  - ${question}`).join('\n')
      : '  - None',
  )
  output = output.replace('{{COMMAND_TABLE}}', commandRows)
  output = output.replace('{{SERVICE_TABLE}}', serviceRows)
  output = output.replace('{{STORY_LINKS}}', storyLinks)
  output = output.replace('{{FEATURE_NAME}}', feature)

  return output
}

export const registerStoryTools = (server: FastMCP): void => {
  server.addTool({
    name: 'write_story_files',
    description:
      'Generate specification (PRD + command/service tables) and story files under docs/{feature}.',
    parameters: writeStoriesParams,
    execute: async (input) => {
      const { feature, prd, commands, services, stories } =
        writeStoriesParams.parse(input)
      await ensurePhaseAtLeast('specification')
      const { root: projectRoot } = await requireProjectContext()
      const featureContext = await requireFeatureContext()

      const featureDir = resolve(projectRoot, featureContext.docsRelativePath)
      await mkdir(featureDir, { recursive: true })

      const specPath = resolve(featureDir, 'index.md')
      await writeFile(
        specPath,
        renderSpecificationTemplate(
          await loadTemplate('spec.md'),
          feature,
          prd,
          commands,
          services,
          stories,
        ),
        'utf-8',
      )

      const template = await loadTemplate('story.md')
      const files = await Promise.all(
        stories.map(async (story) => {
          const filename = `story-${story.id.replace(/[^a-z0-9_-]/gi, '-').toLowerCase()}.md`
          const filePath = resolve(featureDir, filename)
          const contents = renderTemplate(template, story)
            .replace('{{COMMAND_REFERENCE}}', story.commandId ?? 'TBD')
            .replace(
              '{{PRD_REFERENCE}}',
              `[Spec](./index.md#command-${(story.commandId ?? 'tbd').toLowerCase()})`,
            )
          await writeFile(filePath, contents, 'utf-8')
          return filePath
        }),
      )
      await setPhaseStatus('specification', 'complete')

      return JSON.stringify({
        status: 'ok',
        spec: specPath,
        files,
      })
    },
  })

  server.addTool({
    name: 'read_story_files',
    description:
      'Read all story markdown files from the feature docs directory. Returns array of story file contents.',
    parameters: z.object({}).describe('No parameters required.'),
    execute: async () => {
      await ensurePhaseAtLeast('specification')
      const { root: projectRoot } = await requireProjectContext()
      const featureContext = await requireFeatureContext()
      const featureDir = resolve(projectRoot, featureContext.docsRelativePath)

      const files = await readdir(featureDir)
      const storyFiles = files.filter(
        (file) => file.startsWith('story-') && file.endsWith('.md'),
      )

      const stories = await Promise.all(
        storyFiles.map(async (file) => {
          const filePath = resolve(featureDir, file)
          const content = await readFile(filePath, 'utf-8')
          return {
            filename: file,
            path: filePath,
            content,
          }
        }),
      )

      return JSON.stringify({
        status: 'ok',
        stories,
      })
    },
  })

  server.addTool({
    name: 'get_active_story',
    description: 'Get the currently active story ID being worked on, if any.',
    parameters: z.object({}).describe('No parameters required.'),
    execute: async () => {
      await ensurePhaseAtLeast('implementation')
      const storyId = await getActiveStoryId()
      if (!storyId) {
        return JSON.stringify({
          status: 'ok',
          activeStoryId: null,
          message: 'No active story set',
        })
      }

      const { root: projectRoot } = await requireProjectContext()
      const featureContext = await requireFeatureContext()
      const featureDir = resolve(projectRoot, featureContext.docsRelativePath)
      const filename = `story-${storyId.replace(/[^a-z0-9_-]/gi, '-').toLowerCase()}.md`
      const filePath = resolve(featureDir, filename)

      try {
        const content = await readFile(filePath, 'utf-8')
        return JSON.stringify({
          status: 'ok',
          activeStoryId: storyId,
          filename,
          path: filePath,
          content,
        })
      } catch {
        return JSON.stringify({
          status: 'error',
          activeStoryId: storyId,
          message: `Story file not found: ${filename}`,
        })
      }
    },
  })

  server.addTool({
    name: 'set_active_story',
    description:
      'Set the active story ID to work on. Use this to track which story is currently being implemented.',
    parameters: z.object({
      storyId: z.string().min(1).describe('The story ID to set as active'),
    }),
    execute: async (rawInput) => {
      await ensurePhaseAtLeast('implementation')
      const input = z
        .object({
          storyId: z.string().min(1),
        })
        .parse(rawInput)
      await setActiveStoryId(input.storyId)
      return JSON.stringify({
        status: 'ok',
        activeStoryId: input.storyId,
      })
    },
  })

  server.addTool({
    name: 'mark_acceptance_criterion_complete',
    description:
      'Mark an acceptance criterion as complete in a story markdown file by updating the checkbox from [ ] to [x].',
    parameters: z.object({
      storyId: z.string().min(1).describe('The story ID'),
      criterionText: z
        .string()
        .min(1)
        .describe(
          'The text of the acceptance criterion to mark as complete (partial match is OK)',
        ),
    }),
    execute: async (rawInput) => {
      await ensurePhaseAtLeast('implementation')
      const input = z
        .object({
          storyId: z.string().min(1),
          criterionText: z.string().min(1),
        })
        .parse(rawInput)
      const { root: projectRoot } = await requireProjectContext()
      const featureContext = await requireFeatureContext()
      const featureDir = resolve(projectRoot, featureContext.docsRelativePath)
      const filename = `story-${input.storyId.replace(/[^a-z0-9_-]/gi, '-').toLowerCase()}.md`
      const filePath = resolve(featureDir, filename)

      const content = await readFile(filePath, 'utf-8')
      const lines = content.split('\n')

      // Find the Acceptance Criteria section
      let inAcceptanceCriteria = false
      let updated = false

      const updatedLines = lines.map((line) => {
        if (line.startsWith('## Acceptance Criteria')) {
          inAcceptanceCriteria = true
          return line
        }
        if (inAcceptanceCriteria && line.startsWith('##')) {
          inAcceptanceCriteria = false
          return line
        }
        if (
          inAcceptanceCriteria &&
          line.includes(input.criterionText) &&
          line.trim().startsWith('- [ ]')
        ) {
          updated = true
          return line.replace('- [ ]', '- [x]')
        }
        return line
      })

      if (!updated) {
        return JSON.stringify({
          status: 'error',
          message: `Could not find acceptance criterion matching "${input.criterionText}" in story ${input.storyId}`,
        })
      }

      await writeFile(filePath, updatedLines.join('\n'), 'utf-8')

      return JSON.stringify({
        status: 'ok',
        storyId: input.storyId,
        criterionText: input.criterionText,
        filePath,
      })
    },
  })
}
