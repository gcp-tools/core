import { proxyActivities } from '@temporalio/workflow'
const activities = proxyActivities({
  startToCloseTimeout: '1 minute',
})
/**
 * Basic agent workflow: plan -> codegen -> review (stub)
 */
export async function basicAgentWorkflow(input) {
  const plan = await activities.planActivity(input)
  const code = await activities.codegenActivity(plan.input)
  const review = await activities.reviewActivity(code.input)
  return [plan, code, review]
}
//# sourceMappingURL=basic-agent-workflow.js.map
