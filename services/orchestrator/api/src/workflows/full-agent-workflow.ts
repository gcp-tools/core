import { proxyActivities } from '@temporalio/workflow'
import type { AgentInput, AgentResponse } from '../types/agent.js'

const activities = proxyActivities<{
  specActivity(input: AgentInput): Promise<AgentResponse>
  planActivity(input: AgentInput): Promise<AgentResponse>
  codegenActivity(input: AgentInput): Promise<AgentResponse>
  testActivity(input: AgentInput): Promise<AgentResponse>
  infraActivity(input: AgentInput): Promise<AgentResponse>
  reviewActivity(input: AgentInput): Promise<AgentResponse>
  opsActivity(input: AgentInput): Promise<AgentResponse>
}>({
  startToCloseTimeout: '2 minutes',
})

/**
 * Full agent workflow: spec -> plan -> codegen -> test -> infra -> review -> ops
 * Each step calls the next agent and returns the results.
 * Returns an array of agent responses for all steps.
 */
export async function fullAgentWorkflow(
  input: AgentInput,
): Promise<AgentResponse[]> {
  // Step 1: spec
  const spec = await activities.specActivity(input)

  // Step 2: plan
  const plan = await activities.planActivity(spec.input)

  // Step 3: codegen
  const code = await activities.codegenActivity(plan.input)

  // Step 4: test
  const test = await activities.testActivity(code.input)

  // Step 5: infra
  const infra = await activities.infraActivity(test.input)

  // Step 6: review
  const review = await activities.reviewActivity(infra.input)

  // Step 7: ops
  const ops = await activities.opsActivity(review.input)

  return [spec, plan, code, test, infra, review, ops]
}
