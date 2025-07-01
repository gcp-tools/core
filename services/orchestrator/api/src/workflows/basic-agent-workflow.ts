import { proxyActivities } from '@temporalio/workflow'
import type { AgentInput, AgentResponse } from '../types/agent.js'

const activities = proxyActivities<{
  planActivity(input: AgentInput): Promise<AgentResponse>
  codegenActivity(input: AgentInput): Promise<AgentResponse>
  reviewActivity(input: AgentInput): Promise<AgentResponse>
}>({
  startToCloseTimeout: '1 minute',
})

/**
 * Basic agent workflow: plan -> codegen -> review (stub)
 */
export async function basicAgentWorkflow(
  input: AgentInput,
): Promise<AgentResponse[]> {
  const plan = await activities.planActivity(input)
  const code = await activities.codegenActivity(plan.input)
  const review = await activities.reviewActivity(code.input)
  return [plan, code, review]
}
