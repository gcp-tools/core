import type { AgentInput, AgentResponse } from '../types/agent.js'
/**
 * Basic agent workflow: plan -> codegen -> review (stub)
 */
export declare function basicAgentWorkflow(
  input: AgentInput,
): Promise<AgentResponse[]>
