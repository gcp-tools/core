import { z } from 'zod'
import type { WorkflowStateData } from '../../types.mjs'
import { workflowStates } from './state.mjs'

// Zod schema for workflow status input validation
export const GetWorkflowStatusArgsSchema = z.object({
  workflow_id: z.string().min(1, 'Workflow ID is required'),
})

export type GetWorkflowStatusArgsValidated = z.infer<
  typeof GetWorkflowStatusArgsSchema
>

export interface GetWorkflowStatusResult {
  status: 'success' | 'error'
  workflow?: WorkflowStateData
  message?: string
}

/**
 * Get workflow status handler
 */
export async function getWorkflowStatusHandler(
  input: unknown,
): Promise<GetWorkflowStatusResult> {
  const parsed = GetWorkflowStatusArgsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'error',
      message: `Invalid input: ${parsed.error.message}`,
    }
  }
  const { workflow_id } = parsed.data
  const workflow = workflowStates.get(workflow_id)
  if (!workflow) {
    return {
      status: 'error',
      message: 'Workflow not found',
    }
  }
  return {
    status: 'success',
    workflow: workflow,
  }
}
