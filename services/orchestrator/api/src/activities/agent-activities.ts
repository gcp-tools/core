import { AgentRegistry } from '../agents/registry.js'
import type { AgentInput, AgentResponse } from '../types/agent.js'

const registry = new AgentRegistry()

export async function specActivity(input: AgentInput): Promise<AgentResponse> {
  return registry.spec(input)
}

export async function planActivity(input: AgentInput): Promise<AgentResponse> {
  return registry.plan(input)
}

export async function codegenActivity(
  input: AgentInput,
): Promise<AgentResponse> {
  return registry.codegen(input)
}

export async function testActivity(input: AgentInput): Promise<AgentResponse> {
  return registry.test(input)
}

export async function infraActivity(input: AgentInput): Promise<AgentResponse> {
  return registry.infra(input)
}

export async function reviewActivity(
  input: AgentInput,
): Promise<AgentResponse> {
  return registry.review(input)
}

export async function opsActivity(input: AgentInput): Promise<AgentResponse> {
  return registry.ops(input)
}
