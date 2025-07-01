import type { AgentInput, AgentResponse } from '../types/agent.js'
export declare function specActivity(input: AgentInput): Promise<AgentResponse>
export declare function planActivity(input: AgentInput): Promise<AgentResponse>
export declare function codegenActivity(
  input: AgentInput,
): Promise<AgentResponse>
export declare function testActivity(input: AgentInput): Promise<AgentResponse>
export declare function infraActivity(input: AgentInput): Promise<AgentResponse>
export declare function reviewActivity(
  input: AgentInput,
): Promise<AgentResponse>
export declare function opsActivity(input: AgentInput): Promise<AgentResponse>
