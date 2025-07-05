import { z } from 'zod'
import { runFoundationProject } from '../../lib/setup-foundation-project.mjs'
import type { SetupFoundationProjectResult } from '../../types.mts'

export type RunFoundationProjectHandlerResult = SetupFoundationProjectResult

export const RunFoundationProjectHandlerInputSchema = z.object({
  projectName: z.string(),
  orgId: z.string(),
  billingAccount: z.string(),
  regions: z.string(),
  githubIdentity: z.string(),
  developerIdentity: z.string(),
  ownerEmails: z.string(),
})

export type RunFoundationProjectHandlerInput = z.infer<
  typeof RunFoundationProjectHandlerInputSchema
>

export const SetupFoundationProjectInputSchema = z.object({
  projectName: z.string(),
  orgId: z.string(),
  billingAccount: z.string(),
  region: z.string(),
  githubIdentity: z.string(),
  developerIdentity: z.string(),
})

export async function runFoundationProjectHandler(
  input: unknown,
): Promise<RunFoundationProjectHandlerResult> {
  const parsed = RunFoundationProjectHandlerInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      projectId: '',
      serviceAccount: '',
      workloadIdentityPool: '',
      status: 'failed',
      message: parsed.error.message,
    }
  }
  const args = parsed.data
  try {
    // Call the TypeScript implementation directly
    const result = await runFoundationProject({
      projectName: args.projectName,
      orgId: args.orgId,
      billingAccount: args.billingAccount,
      regions: args.regions,
      githubIdentity: args.githubIdentity,
      developerIdentity: args.developerIdentity,
      ownerEmails: args.ownerEmails,
    })
    return {
      ...result,
      workloadIdentityPool: '',
      status: 'success',
      message: 'GCP foundation project setup completed',
    }
  } catch (error) {
    return {
      projectId: '',
      serviceAccount: '',
      workloadIdentityPool: '',
      status: 'failed',
      message: error instanceof Error ? error.message : String(error),
    }
  }
}
