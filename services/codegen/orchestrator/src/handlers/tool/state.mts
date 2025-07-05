import { z } from 'zod'
import type { PlanResult, SpecResult, WorkflowStateData } from '../../types.mjs'

// Zod schema for workflow state validation
export const WorkflowStateDataSchema = z.object({
  status: z.enum([
    'pending',
    'spec_generated',
    'plan_generated',
    'plan_approved',
    'code_generated',
    'infra_generated',
    'tests_generated',
    'reviewed',
    'deployment_approved',
    'deployed',
    'failed',
  ]),
  spec: z.unknown().optional(),
  plan: z.unknown().optional(),
  code: z.unknown().optional(),
  infra: z.unknown().optional(),
  tests: z.unknown().optional(),
  review: z.unknown().optional(),
  deployment: z.unknown().optional(),
  created_at: z.date(),
  updated_at: z.date(),
})

// In-memory store for pending approvals and workflow state
export const pendingApprovals = new Map<
  string,
  { spec: SpecResult; plan: PlanResult; workflow_id: string }
>()
export const workflowStates = new Map<string, WorkflowStateData>()

/**
 * Generate a unique approval ID
 */
export function generateApprovalId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

/**
 * Generate a unique workflow ID
 */
export function generateWorkflowId(): string {
  return `wf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

/**
 * Update workflow state
 */
export function updateWorkflowState(
  workflowId: string,
  state: WorkflowStateData,
): void {
  workflowStates.set(workflowId, {
    ...state,
    updated_at: new Date(),
  })
}
