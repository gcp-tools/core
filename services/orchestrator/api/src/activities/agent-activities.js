import { AgentRegistry } from '../agents/registry.js'
const registry = new AgentRegistry()
export async function specActivity(input) {
  return registry.spec(input)
}
export async function planActivity(input) {
  return registry.plan(input)
}
export async function codegenActivity(input) {
  return registry.codegen(input)
}
export async function testActivity(input) {
  return registry.test(input)
}
export async function infraActivity(input) {
  return registry.infra(input)
}
export async function reviewActivity(input) {
  return registry.review(input)
}
export async function opsActivity(input) {
  return registry.ops(input)
}
//# sourceMappingURL=agent-activities.js.map
