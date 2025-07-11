import type { Tool as MCPTool } from '@modelcontextprotocol/sdk/types.js'

// Re-export the MCP Tool type directly to ensure compatibility
export type Tool = MCPTool

export interface MCPServerConfig {
  name: string
  version: string
  capabilities: {
    resources: Record<string, unknown>
    tools: Record<string, unknown>
    prompts: Record<string, unknown>
  }
}

// Workflow state types
// export type WorkflowState =
//   | 'spec_generated'
//   | 'plan_generated'
//   | 'plan_approved'
//   | 'code_generated'
//   | 'infra_generated'
//   | 'tests_passed'
//   | 'code_reviewed'
//   | 'deployment_ready'
//   | 'deployment_approved'
//   | 'deployed'
//   | 'failed'

// Tool argument types are defined as Zod schemas in their respective handlers

// Result types
// export interface FullPipelineResult {
//   status: 'awaiting_approval' | 'completed' | 'failed'
//   approval_id?: string
//   workflow_id?: string
//   spec?: SpecResult
//   plan?: PlanResult
//   code?: CodeResult
//   infra?: InfraResult
//   tests?: TestResult
//   review?: ReviewResult
//   deployment?: OpsResult
//   error?: string
//   message?: string
// }

// export interface ApprovePlanResult {
//   status: 'approved' | 'rejected' | 'error'
//   message: string
//   workflow_id?: string
// }

// export interface GenerateCodeResult {
//   status: 'success' | 'error'
//   code?: string
//   language?: string
//   error?: string
// }

// export interface GenerateInfraResult {
//   status: 'success' | 'error'
//   iac_code?: string
//   error?: string
// }

// export interface GenerateTestsResult {
//   status: 'success' | 'error'
//   test_code?: string
//   error?: string
// }

// export interface ReviewCodeResult {
//   status: 'success' | 'error'
//   review_feedback?: string
//   error?: string
// }

// export interface DeployOpsResult {
//   status: 'success' | 'error'
//   ops_plan?: string
//   error?: string
// }

// Workflow state management
// export interface WorkflowStateData {
//   id: string
//   state: WorkflowState
//   spec?: SpecResult
//   plan?: PlanResult
//   code?: CodeResult
//   infra?: InfraResult
//   tests?: TestResult
//   review?: ReviewResult
//   deployment?: OpsResult
//   created_at: Date
//   updated_at: Date
// }

// MCP Client wrapper types
export interface AgentsMCPClientConfig {
  serverUrl?: string
  timeout?: number
}

export interface SpecResult {
  requirements: string
  status: 'success' | 'error'
  error?: string
}

export interface PlanResult {
  plan: string
  status: 'success' | 'error'
  error?: string
}

export interface CodeResult {
  code: string
  language: string
  status: 'success' | 'error'
  error?: string
}

export interface InfraResult {
  iac_code: string
  status: 'success' | 'error'
  error?: string
}

export interface TestResult {
  test_code: string
  status: 'success' | 'error'
  error?: string
}

export interface ReviewResult {
  review_feedback: string
  status: 'success' | 'error'
  error?: string
}

export interface OpsResult {
  ops_plan: string
  status: 'success' | 'error'
  error?: string
}

// export type DataWithClarifyingQuestions = {
//   content: string
//   clarifyingQuestions: string[]
// }

export type BaseError = {
  cause?: Error | unknown
  data?: unknown
  message: string
}
export type ToolRequestError = BaseError & {
  status: 'TOOL_REQUEST_ERROR'
}
export type ToolAgentError = BaseError & {
  status: 'TOOL_AGENT_ERROR'
}
export type ToolError = ToolRequestError | ToolAgentError
export type ToolSucess<R> = {
  status: 'SUCCESS'
  data: R
}
export type ToolResult<R> = ToolSucess<R> | ToolError
export type ToolHandler<R> = (input: unknown) => Promise<ToolResult<R>>

// export type ClientRequestError = BaseError & {
//   status: 'CLIENT_REQUEST_ERROR'
// }
// export type ClientAgentError = BaseError & {
//   status: 'TOOL_AGENT_ERROR'
// }
// export type ClientError =
//   ClientRequestError |
//   ClientAgentError;
// export type ClientSucess<R> = {
//   status: 'SUCCESS'
//   data: R
// }
// export type ClientResult<R> =
//   ClientSucess<R> |
//   ClientError

/*
export type ApiSuccess<R> = {
  code: 'API_SUCCESS'
  data: R
}
export type BaseError = {
  cause?: Error | unknown
  data?: unknown
  message: string
}
export type ApiNotFoundError = BaseError & {
  code: 'NOT_FOUND'
}
*/
