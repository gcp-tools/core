import { getClient } from '../../client.mjs'
import {
  type LLMSpecResponse,
  llmSpecResponseSchema,
  stateSchema,
} from '../../types.mjs'

import { flattenForLLM } from '../../lib/flatten-for-llm.mjs'
import { type ToolAgentFn, makeToolAgentHandler } from '../../lib/make-tool.mjs'

export const generateSpec: ToolAgentFn<LLMSpecResponse> = async (
  input,
  stateSchema,
  agentResponseSchema,
) => {
  const parsedState = stateSchema.safeParse(input)
  if (!parsedState.success) {
    return {
      cause: parsedState.error.issues,
      error: null,
      message: 'Invalid input data',
      outcome: 'ERROR',
      state: input,
    }
  }
  const state = parsedState.data
  const client = await getClient()

  try {
    const clientResult = await client.callTool({
      name: 'generate_spec',
      arguments: {
        messages: flattenForLLM(state.GENERATE_SPEC),
      },
    })
    // Validate the new agent message
    const agentSchema = agentResponseSchema
    const agentResponse = agentSchema.safeParse(clientResult.structuredContent)

    if (!agentResponse.success) {
      return {
        cause: agentResponse.error.issues,
        error: null,
        message: 'Invalid data returned from generate_spec client',
        outcome: 'ERROR',
        state: input,
      }
    }

    const agentMessage = agentResponse.data
    const questions = agentMessage.questions
    const requirements = agentMessage.requirements

    state.GENERATE_SPEC.push(
      {
        role: 'agent',
        context: 'requirements',
        content: requirements,
      },
      {
        role: 'agent',
        context: 'questions',
        content: questions,
      },
    )

    return {
      from: 'GENERATE_SPEC',
      outcome: questions?.length ? 'HITL' : 'OK',
      state,
    }
  } catch (err) {
    const e = err as Error
    return {
      cause: e.message || 'Unknown error',
      error: e,
      message: 'Client generate_spec failed',
      outcome: 'ERROR',
      state: input,
    }
  }
}

export const generateSpecHandler = makeToolAgentHandler(
  generateSpec,
  stateSchema,
  llmSpecResponseSchema,
)
