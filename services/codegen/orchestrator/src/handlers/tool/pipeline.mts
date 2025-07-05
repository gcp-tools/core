import { z } from 'zod'
import { AgentsMCPClient } from '../../lib/mcp-client.mjs'
import type {
  ApprovePlanResult,
  FullPipelineResult,
  PlanResult,
  SpecResult,
} from '../../types.mjs'
import {
  generateApprovalId,
  generateWorkflowId,
  pendingApprovals,
  updateWorkflowState,
} from './state.mjs'

// Zod schemas for input validation
export const FullPipelineArgsSchema = z.object({
  project_description: z.string().min(1, 'Project description is required'),
  language: z
    .enum(['typescript', 'python', 'rust', 'react'])
    .optional()
    .default('typescript'),
  auto_approve: z.boolean().optional().default(false),
})

export const ApprovePlanArgsSchema = z.object({
  approval_id: z.string().min(1, 'Approval ID is required'),
  approved: z.boolean(),
})

export type FullPipelineArgsValidated = z.infer<typeof FullPipelineArgsSchema>
export type ApprovePlanArgsValidated = z.infer<typeof ApprovePlanArgsSchema>

/**
 * Continue pipeline after plan approval
 */
async function continuePipelineAfterApproval(
  workflowId: string,
  approvalId: string,
  language: 'typescript' | 'python' | 'rust' | 'react',
): Promise<FullPipelineResult> {
  const client = new AgentsMCPClient()
  const approval = pendingApprovals.get(approvalId)

  if (!approval) {
    return {
      status: 'failed',
      error: 'Invalid approval_id',
    }
  }

  try {
    // Step 3: Generate code
    console.log('Step 3: Generating code...')
    const codeResult = await client.generateCode(approval.plan.plan, language)

    if (codeResult.status === 'error') {
      updateWorkflowState(workflowId, {
        id: workflowId,
        state: 'failed',
        spec: approval.spec,
        plan: approval.plan,
        code: codeResult,
        created_at: new Date(),
        updated_at: new Date(),
      })

      return {
        status: 'failed',
        error: codeResult.error,
      }
    }

    // Step 4: Generate infrastructure
    console.log('Step 4: Generating infrastructure...')
    const infraResult = await client.generateInfra(approval.plan.plan)

    if (infraResult.status === 'error') {
      updateWorkflowState(workflowId, {
        id: workflowId,
        state: 'failed',
        spec: approval.spec,
        plan: approval.plan,
        code: codeResult,
        infra: infraResult,
        created_at: new Date(),
        updated_at: new Date(),
      })

      return {
        status: 'failed',
        error: infraResult.error,
      }
    }

    // Step 5: Run tests
    console.log('Step 5: Running tests...')
    const testResult = await client.runTests(codeResult.code)

    if (testResult.status === 'error') {
      updateWorkflowState(workflowId, {
        id: workflowId,
        state: 'failed',
        spec: approval.spec,
        plan: approval.plan,
        code: codeResult,
        infra: infraResult,
        tests: testResult,
        created_at: new Date(),
        updated_at: new Date(),
      })

      return {
        status: 'failed',
        error: testResult.error,
      }
    }

    // Step 6: Review code
    console.log('Step 6: Reviewing code...')
    const reviewResult = await client.reviewCode(codeResult.code)

    if (reviewResult.status === 'error') {
      updateWorkflowState(workflowId, {
        id: workflowId,
        state: 'failed',
        spec: approval.spec,
        plan: approval.plan,
        code: codeResult,
        infra: infraResult,
        tests: testResult,
        review: reviewResult,
        created_at: new Date(),
        updated_at: new Date(),
      })

      return {
        status: 'failed',
        error: reviewResult.error,
      }
    }

    // Step 7: Deploy operations
    console.log('Step 7: Generating deployment plan...')
    const deployResult = await client.deployOps(
      JSON.stringify({
        code: codeResult.code,
        infra: infraResult.iac_code,
        tests: testResult.test_code,
      }),
    )

    if (deployResult.status === 'error') {
      updateWorkflowState(workflowId, {
        id: workflowId,
        state: 'failed',
        spec: approval.spec,
        plan: approval.plan,
        code: codeResult,
        infra: infraResult,
        tests: testResult,
        review: reviewResult,
        deployment: deployResult,
        created_at: new Date(),
        updated_at: new Date(),
      })

      return {
        status: 'failed',
        error: deployResult.error,
      }
    }

    // Update final workflow state
    updateWorkflowState(workflowId, {
      id: workflowId,
      state: 'deployed',
      spec: approval.spec,
      plan: approval.plan,
      code: codeResult,
      infra: infraResult,
      tests: testResult,
      review: reviewResult,
      deployment: deployResult,
      created_at: new Date(),
      updated_at: new Date(),
    })

    // Clean up approval
    pendingApprovals.delete(approvalId)

    return {
      status: 'completed',
      workflow_id: workflowId,
      spec: approval.spec,
      plan: approval.plan,
      code: codeResult,
      infra: infraResult,
      tests: testResult,
      review: reviewResult,
      deployment: deployResult,
    }
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Execute full pipeline workflow
 */
export async function runFullPipelineHandler(
  input: unknown,
): Promise<FullPipelineResult> {
  const parsed = FullPipelineArgsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'failed',
      error: `Invalid input: ${parsed.error.message}`,
    }
  }
  const args = parsed.data

  const client = new AgentsMCPClient()
  const workflowId = generateWorkflowId()
  const approvalId = generateApprovalId()

  try {
    // Test connection to agents server
    const isConnected = await client.testConnection()
    if (!isConnected) {
      return {
        status: 'failed',
        error: 'Failed to connect to agents MCP server',
      }
    }

    // Step 1: Generate spec
    console.log('Step 1: Generating project specifications...')
    const specResult = await client.generateSpec(args.project_description)

    if (specResult.status === 'error') {
      updateWorkflowState(workflowId, {
        id: workflowId,
        state: 'failed',
        spec: specResult,
        created_at: new Date(),
        updated_at: new Date(),
      })

      return {
        status: 'failed',
        error: specResult.error,
      }
    }

    // Step 2: Generate plan
    console.log('Step 2: Generating project plan...')
    const planResult = await client.generatePlan(specResult.requirements)

    if (planResult.status === 'error') {
      updateWorkflowState(workflowId, {
        id: workflowId,
        state: 'failed',
        spec: specResult,
        plan: planResult,
        created_at: new Date(),
        updated_at: new Date(),
      })

      return {
        status: 'failed',
        error: planResult.error,
      }
    }

    // Store for approval
    pendingApprovals.set(approvalId, {
      spec: specResult,
      plan: planResult,
      workflow_id: workflowId,
    })

    updateWorkflowState(workflowId, {
      id: workflowId,
      state: 'plan_generated',
      spec: specResult,
      plan: planResult,
      created_at: new Date(),
      updated_at: new Date(),
    })

    // If auto-approve is enabled, continue with the pipeline
    if (args.auto_approve) {
      return await continuePipelineAfterApproval(
        workflowId,
        approvalId,
        args.language,
      )
    }

    return {
      status: 'awaiting_approval',
      approval_id: approvalId,
      workflow_id: workflowId,
      spec: specResult,
      plan: planResult,
      message:
        'Plan generated. Please approve or reject using the approval_id.',
    }
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Approve or reject a plan
 */
export async function approvePlanHandler(
  input: unknown,
): Promise<ApprovePlanResult> {
  const parsed = ApprovePlanArgsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'error',
      message: `Invalid input: ${parsed.error.message}`,
    }
  }
  const args = parsed.data

  const approval = pendingApprovals.get(args.approval_id)

  if (!approval) {
    return {
      status: 'error',
      message: 'Invalid approval_id',
    }
  }

  if (!args.approved) {
    // Plan rejected
    pendingApprovals.delete(args.approval_id)
    updateWorkflowState(approval.workflow_id, {
      id: approval.workflow_id,
      state: 'failed',
      spec: approval.spec,
      plan: approval.plan,
      created_at: new Date(),
      updated_at: new Date(),
    })

    return {
      status: 'rejected',
      message: 'Plan rejected by human. Please restart pipeline.',
      workflow_id: approval.workflow_id,
    }
  }

  // Plan approved - continue pipeline
  const result = await continuePipelineAfterApproval(
    approval.workflow_id,
    args.approval_id,
    'typescript', // Default language, could be made configurable
  )

  if (result.status === 'completed') {
    return {
      status: 'approved',
      message: 'Plan approved and pipeline completed successfully!',
      workflow_id: approval.workflow_id,
    }
  }
  return {
    status: 'error',
    message: `Plan approved but pipeline failed: ${result.error}`,
    workflow_id: approval.workflow_id,
  }
}

/**
 * Generate project specifications from a brief description
 */
export async function generateSpecHandler(input: unknown): Promise<SpecResult> {
  const schema = z
    .object({
      project_description: z.string().min(1, 'Project description is required'),
    })
    .strict()

  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'error',
      requirements: '',
      error: `Invalid input: ${parsed.error.message}`,
    }
  }
  const args = parsed.data

  const client = new AgentsMCPClient()

  try {
    // Test connection to agents server
    const isConnected = await client.testConnection()
    if (!isConnected) {
      return {
        status: 'error',
        requirements: '',
        error: 'Failed to connect to agents MCP server',
      }
    }

    const result = await client.generateSpec(args.project_description)
    return result
  } catch (error) {
    return {
      status: 'error',
      requirements: '',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Generate a detailed project plan from requirements
 */
export async function generatePlanHandler(input: unknown): Promise<PlanResult> {
  const schema = z
    .object({
      requirements: z.string().min(1, 'Requirements are required'),
    })
    .strict()

  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'error',
      plan: '',
      error: `Invalid input: ${parsed.error.message}`,
    }
  }
  const args = parsed.data

  const client = new AgentsMCPClient()

  try {
    // Test connection to agents server
    const isConnected = await client.testConnection()
    if (!isConnected) {
      return {
        status: 'error',
        plan: '',
        error: 'Failed to connect to agents MCP server',
      }
    }

    const result = await client.generatePlan(args.requirements)
    return result
  } catch (error) {
    return {
      status: 'error',
      plan: '',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Approve or reject a deployment plan
 */
export async function approveDeploymentHandler(
  input: unknown,
): Promise<ApprovePlanResult> {
  const schema = z
    .object({
      approval_id: z.string().min(1, 'Approval ID is required'),
      approved: z.boolean(),
      feedback: z.string().optional(),
    })
    .strict()

  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'error',
      message: `Invalid input: ${parsed.error.message}`,
    }
  }
  const args = parsed.data

  const approval = pendingApprovals.get(args.approval_id)

  if (!approval) {
    return {
      status: 'error',
      message: 'Invalid approval_id',
    }
  }

  if (!args.approved) {
    // Deployment rejected
    pendingApprovals.delete(args.approval_id)
    updateWorkflowState(approval.workflow_id, {
      id: approval.workflow_id,
      state: 'failed',
      spec: approval.spec,
      plan: approval.plan,
      created_at: new Date(),
      updated_at: new Date(),
    })

    return {
      status: 'rejected',
      message: `Deployment rejected by human.${args.feedback ? ` Feedback: ${args.feedback}` : ''}`,
      workflow_id: approval.workflow_id,
    }
  }

  // Deployment approved
  pendingApprovals.delete(args.approval_id)
  updateWorkflowState(approval.workflow_id, {
    id: approval.workflow_id,
    state: 'deployment_approved',
    spec: approval.spec,
    plan: approval.plan,
    created_at: new Date(),
    updated_at: new Date(),
  })

  return {
    status: 'approved',
    message: `Deployment approved by human.${args.feedback ? ` Feedback: ${args.feedback}` : ''}`,
    workflow_id: approval.workflow_id,
  }
}
