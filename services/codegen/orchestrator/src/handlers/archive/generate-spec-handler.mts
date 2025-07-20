import { getClient } from '../../client.mjs'
import {
  type SpecResponse,
  specResponseSchema,
  stateSchema,
} from '../../types.mjs'

import { type ToolAgentFn, makeToolAgentHandler } from './make-tool.mjs'

export const generateSpec: ToolAgentFn<SpecResponse> = async (
  input,
  stateSchema,
  agentResponseSchema,
) => {
  const parsedState = stateSchema.safeParse(input)
  if (!parsedState.success) {
    return {
      cause: parsedState.error.issues,
      error: null,
      // from: 'ERROR',
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
        messages: state,
      },
    })
    // Validate the new agent message
    const agentSchema = agentResponseSchema
    const agentResponse = agentSchema.safeParse(clientResult.structuredContent)

    if (!agentResponse.success) {
      return {
        cause: agentResponse.error.issues,
        error: null,
        // from: 'ERROR',
        message: 'Invalid data returned from generate_spec client',
        outcome: 'ERROR',
        state: input,
      }
    }

    const agentMessage = agentResponse.data
    const questions = agentMessage.content.find(
      (m) => m.context === 'questions',
    )

    state.GENERATE_SPEC.push(agentMessage)

    return {
      from: 'GENERATE_SPEC',
      outcome: questions && questions.text.length ? 'HITL' : 'OK',
      state,
    }
  } catch (err) {
    const e = err as Error
    return {
      cause: e.message || 'Unknown error',
      error: e,
      // from: 'ERROR',
      message: 'Client generate_spec failed',
      outcome: 'ERROR',
      state: input,
    }
  }
}

export const generateSpecHandler = makeToolAgentHandler(
  generateSpec,
  stateSchema,
  specResponseSchema,
)
