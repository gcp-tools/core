import type { Tool as MCPTool } from '@modelcontextprotocol/sdk/types.js'
import type { ZodType } from 'zod/v4'
import type { State } from '../types.mjs'

export type Tool = MCPTool

export type ToolSuccess = {
  from: keyof State
  outcome: 'OK' | 'HITL' | 'DONE'
  state: State
}

export type ToolError = {
  outcome: 'ERROR'
  state: State
  message: string
  cause: string | unknown[]
  error: Error | null
}

export type ToolResult = ToolSuccess | ToolError

export type ToolAgentFn<R> = (
  state: State,
  stateSchema: ZodType<State>,
  agentResponseSchema: ZodType<R>,
) => Promise<ToolResult>

export type ToolAgentHandler<R> = (state: State) => ReturnType<ToolAgentFn<R>>

export type MakeToolAgentHandler = <R>(
  fn: ToolAgentFn<R>,
  stateSchema: ZodType<State>,
  agentResponseSchema: ZodType<R>,
) => ToolAgentHandler<R>

export const makeToolAgentHandler: MakeToolAgentHandler =
  (fn, stateSchema, agentResponseSchema) => (state: State) =>
    fn(state, stateSchema, agentResponseSchema)
