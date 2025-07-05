import { z } from 'zod'
import { AgentsMCPClient } from '../../lib/mcp-client.mjs'
import type {
  DeployOpsResult,
  GenerateCodeResult,
  GenerateInfraResult,
  GenerateTestsResult,
  ReviewCodeResult,
} from '../../types.mjs'

// Zod schemas for input validation
export const GenerateCodeArgsSchema = z.object({
  plan: z.string().min(1, 'Plan is required'),
  language: z
    .enum(['typescript', 'python', 'rust', 'react'])
    .default('typescript'),
})

export const GenerateInfraArgsSchema = z.object({
  plan: z.string().min(1, 'Plan is required'),
})

export const GenerateTestsArgsSchema = z.object({
  artifact: z.string().min(1, 'Artifact is required'),
})

export const ReviewCodeArgsSchema = z.object({
  artifact: z.string().min(1, 'Artifact is required'),
})

export const DeployOpsArgsSchema = z.object({
  artifacts: z.string().min(1, 'Artifacts are required'),
})

export type GenerateCodeArgsValidated = z.infer<typeof GenerateCodeArgsSchema>
export type GenerateInfraArgsValidated = z.infer<typeof GenerateInfraArgsSchema>
export type GenerateTestsArgsValidated = z.infer<typeof GenerateTestsArgsSchema>
export type ReviewCodeArgsValidated = z.infer<typeof ReviewCodeArgsSchema>
export type DeployOpsArgsValidated = z.infer<typeof DeployOpsArgsSchema>

/**
 * Generate code handler
 */
export async function generateCodeHandler(
  input: unknown,
): Promise<GenerateCodeResult> {
  const parsed = GenerateCodeArgsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'error',
      code: `Error: Invalid input - ${parsed.error.message}`,
      language: 'typescript',
      error: parsed.error.message,
    }
  }
  const args = parsed.data

  const client = new AgentsMCPClient()

  try {
    const result = await client.generateCode(args.plan, args.language)
    return {
      code: result.code,
      language: args.language,
      status: 'success',
    }
  } catch (error) {
    return {
      status: 'error',
      code: `Error: Could not generate ${args.language} code from plan.`,
      language: args.language,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Generate infrastructure handler
 */
export async function generateInfraHandler(
  input: unknown,
): Promise<GenerateInfraResult> {
  const parsed = GenerateInfraArgsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'error',
      iac_code: `Error: Invalid input - ${parsed.error.message}`,
      error: parsed.error.message,
    }
  }
  const args = parsed.data

  const client = new AgentsMCPClient()

  try {
    const result = await client.generateInfra(args.plan)
    return {
      status: 'success',
      iac_code: result.iac_code,
    }
  } catch (error) {
    return {
      status: 'error',
      iac_code: 'Error: Could not generate infrastructure code from plan.',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Run tests handler
 */
export async function generateTestsHandler(
  input: unknown,
): Promise<GenerateTestsResult> {
  const parsed = GenerateTestsArgsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'error',
      test_code: `Error: Invalid input - ${parsed.error.message}`,
      error: parsed.error.message,
    }
  }
  const args = parsed.data

  const client = new AgentsMCPClient()

  try {
    const result = await client.runTests(args.artifact)
    return {
      status: 'success',
      test_code: result.test_code,
    }
  } catch (error) {
    return {
      status: 'error',
      test_code: 'Error: Could not generate test code for artifact.',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Review code handler
 */
export async function reviewCodeHandler(
  input: unknown,
): Promise<ReviewCodeResult> {
  const parsed = ReviewCodeArgsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'error',
      review_feedback: `Error: Invalid input - ${parsed.error.message}`,
      error: parsed.error.message,
    }
  }
  const args = parsed.data

  const client = new AgentsMCPClient()

  try {
    const result = await client.reviewCode(args.artifact)
    return {
      status: 'success',
      review_feedback: result.review_feedback,
    }
  } catch (error) {
    return {
      status: 'error',
      review_feedback: 'Error: Could not review artifact.',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Deploy operations handler
 */
export async function deployOpsHandler(
  input: unknown,
): Promise<DeployOpsResult> {
  const parsed = DeployOpsArgsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'error',
      ops_plan: `Error: Invalid input - ${parsed.error.message}`,
      error: parsed.error.message,
    }
  }
  const args = parsed.data

  const client = new AgentsMCPClient()

  try {
    const result = await client.deployOps(args.artifacts)
    return {
      status: 'success',
      ops_plan: result.ops_plan,
    }
  } catch (error) {
    return {
      status: 'error',
      ops_plan: 'Error: Could not generate deployment plan for artifacts.',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
