import type { AgentInput, AgentResponse } from '../types/agent.js'
export declare class AgentRegistry {
  private readonly baseUrl
  constructor(baseUrl?: string)
  private validateResponse
  spec(input: AgentInput): Promise<AgentResponse>
  plan(input: AgentInput): Promise<AgentResponse>
  codegen(input: AgentInput): Promise<AgentResponse>
  test(input: AgentInput): Promise<AgentResponse>
  infra(input: AgentInput): Promise<AgentResponse>
  review(input: AgentInput): Promise<AgentResponse>
  ops(input: AgentInput): Promise<AgentResponse>
}
