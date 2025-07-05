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
export type WorkflowState =
  | 'spec_generated'
  | 'plan_generated'
  | 'plan_approved'
  | 'code_generated'
  | 'infra_generated'
  | 'tests_passed'
  | 'code_reviewed'
  | 'deployment_ready'
  | 'deployment_approved'
  | 'deployed'
  | 'failed'

// Tool argument types are defined as Zod schemas in their respective handlers

// Result types
export interface FullPipelineResult {
  status: 'awaiting_approval' | 'completed' | 'failed'
  approval_id?: string
  workflow_id?: string
  spec?: SpecResult
  plan?: PlanResult
  code?: CodeResult
  infra?: InfraResult
  tests?: TestResult
  review?: ReviewResult
  deployment?: OpsResult
  error?: string
  message?: string
}

export interface ApprovePlanResult {
  status: 'approved' | 'rejected' | 'error'
  message: string
  workflow_id?: string
}

export interface GenerateCodeResult {
  status: 'success' | 'error'
  code?: string
  language?: string
  error?: string
}

export interface GenerateInfraResult {
  status: 'success' | 'error'
  iac_code?: string
  error?: string
}

export interface GenerateTestsResult {
  status: 'success' | 'error'
  test_code?: string
  error?: string
}

export interface ReviewCodeResult {
  status: 'success' | 'error'
  review_feedback?: string
  error?: string
}

export interface DeployOpsResult {
  status: 'success' | 'error'
  ops_plan?: string
  error?: string
}

// Workflow state management
export interface WorkflowStateData {
  id: string
  state: WorkflowState
  spec?: SpecResult
  plan?: PlanResult
  code?: CodeResult
  infra?: InfraResult
  tests?: TestResult
  review?: ReviewResult
  deployment?: OpsResult
  created_at: Date
  updated_at: Date
}

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
