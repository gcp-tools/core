import type { AgentInput, AgentResponse } from '../types/agent.js'
/**
 * Full agent workflow: spec -> plan -> codegen -> test -> infra -> review -> ops
 * Each step calls the next agent and returns the results.
 * Returns an array of agent responses for all steps.
 */
export declare function fullAgentWorkflow(
  input: AgentInput,
): Promise<AgentResponse[]>
