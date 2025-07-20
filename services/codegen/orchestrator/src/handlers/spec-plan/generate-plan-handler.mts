import { getClient } from '../../client.mjs'
import {
  type LLMPlanResponse,
  llmPlanResponseSchema,
  stateSchema,
} from '../../types.mjs'

import { flattenForLLM } from '../../lib/flatten-for-llm.mjs'
import { type ToolAgentFn, makeToolAgentHandler } from '../../lib/make-tool.mjs'

export const generatePlan: ToolAgentFn<LLMPlanResponse> = async (
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
      name: 'generate_plan',
      arguments: {
        messages: flattenForLLM(state.GENERATE_PLAN),
      },
    })
    const agentSchema = agentResponseSchema
    const agentResponse = agentSchema.safeParse(clientResult.structuredContent)

    if (!agentResponse.success) {
      return {
        cause: agentResponse.error.issues,
        error: null,
        message: 'Invalid data returned from generate_plan client',
        outcome: 'ERROR',
        state: input,
      }
    }

    const agentMessage = agentResponse.data

    state.GENERATE_PLAN.push({
      role: 'agent',
      context: 'plan',
      content: agentMessage.plan,
    })

    return {
      from: 'GENERATE_PLAN',
      outcome: 'HITL',
      state,
    }
  } catch (err) {
    const e = err as Error
    return {
      cause: e.message || 'Unknown error',
      error: e,
      message: 'Client generate_plan failed: generatePlanHandler',
      outcome: 'ERROR',
      state: input,
    }
  }
}

export const generatePlanHandler = makeToolAgentHandler(
  generatePlan,
  stateSchema,
  llmPlanResponseSchema,
)
