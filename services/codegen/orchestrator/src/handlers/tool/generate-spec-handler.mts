import { z } from 'zod'
import { getClient } from '../../client.mjs'
import type { ToolHandler } from '../../types.mts'

export const GenerateSpecArgsSchema = z.object({
  project_description: z.string().min(1, 'Project description is required'),
})
export type GenerateSpecArgs = z.infer<typeof GenerateSpecArgsSchema>

export const GenerateSpecResultSchema = z.object({
  requirements: z.array(z.string()),
  clarifyingQuestions: z.array(z.string()),
})
export type GenerateSpecResult = z.infer<typeof GenerateSpecResultSchema>

export const ClientResultSchema = z.object({
  data: z.object({
    requirements: z.array(z.string()),
    clarifying_questions: z.array(z.string()),
  }),
})


export const generateSpecHandler: ToolHandler<GenerateSpecResult> = async (
  input,
) => {
  const parsed = GenerateSpecArgsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      cause: parsed.error.issues,
      data: input,
      message: 'Invalid input data',
      status: 'TOOL_REQUEST_ERROR',
    }
  }
  const { project_description } = parsed.data
  const client = await getClient()

  try {
    const result = await client.callTool({
      name: 'generate_spec',
      arguments: {
        messages: [{ role: 'user', content: project_description }],
      },
    })
    console.error('fuck fuck', result)

    const parsedResult = ClientResultSchema.safeParse(result.structuredContent)

    if (!parsedResult.success) {
      console.error({
        errors: parsedResult.error.issues,
        message: 'Invalid data returned from generate_spec tool',
        result: result.structuredContent,
        status: 'TOOL_AGENT_ERROR',
      })
      return {
        status: 'TOOL_AGENT_ERROR',
        message: 'Invalid data returned from generate_spec tool',
      }
    }

    return {
      status: 'SUCCESS',
      data: {
        requirements: parsedResult.data.data.requirements,
        clarifyingQuestions: parsedResult.data.data.clarifying_questions,
      },
    }
  } catch (e) {
    console.error({
      cause: e,
      data: input,
      message: 'Client generateSpec failed',
      status: 'TOOL_AGENT_ERROR',
    })
    return {
      cause: e,
      data: input,
      message: 'Client generateSpec failed',
      status: 'TOOL_AGENT_ERROR',
    }
  }
}
