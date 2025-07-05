import { exec as execCb } from 'node:child_process'
import { promisify } from 'node:util'
import { z } from 'zod'
import type { FoundationSetupResult } from '../../lib/setup-foundation-project.mjs'
import type { SetupGitHubSecretsResult } from '../../types.mjs'

const execAsync = promisify(execCb)

export const SetupGitHubSecretsInputSchema = z.object({
  repoName: z.string(),
  projectId: z.string(),
  serviceAccount: z.string(),
  workloadIdentityPool: z.string(),
  projectNumber: z.string().optional(),
  workloadIdentityProviders: z
    .object({
      dev: z.string().optional(),
      test: z.string().optional(),
      sbx: z.string().optional(),
      prod: z.string().optional(),
    })
    .optional(),
  regions: z.string(),
  orgId: z.string().optional(),
  billingAccount: z.string().optional(),
  ownerEmails: z.string().optional(),
  developerIdentity: z.string().optional(),
})
export type SetupGitHubSecretsInput = z.infer<
  typeof SetupGitHubSecretsInputSchema
>

export async function setupGitHubSecrets(
  input: unknown,
): Promise<SetupGitHubSecretsResult> {
  const parsed = SetupGitHubSecretsInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'failed',
      message: 'Invalid input',
      error: parsed.error.message,
      repoName: '',
      results: [],
      summary: {
        secretsCreated: 0,
        variablesCreated: 0,
        workflowsCreated: 0,
        totalItems: 0,
      },
    }
  }
  const args = parsed.data

  console.error(
    '[DEBUG] setupGitHubSecrets input:',
    JSON.stringify(args, null, 2),
  )

  // Type guard: is this a FoundationSetupResult?
  const isFoundationResult = (obj: unknown): obj is FoundationSetupResult => {
    if (!obj || typeof obj !== 'object') return false
    return (
      'projectId' in obj &&
      'serviceAccount' in obj &&
      'workloadIdentityProviders' in obj
    )
  }

  const argsForGitHub = isFoundationResult(args)
    ? {
        repoName: args.githubIdentity?.includes('/')
          ? args.githubIdentity
          : `${args.githubIdentity}/${args.projectId.replace(/-fdn-.*/, '')}`,
        projectId: args.projectId,
        serviceAccount: args.serviceAccount,
        workloadIdentityPool: args.workloadIdentityProviders?.dev || '',
        projectNumber: args.projectNumber,
        workloadIdentityProviders: args.workloadIdentityProviders,
        regions: args.regions,
        orgId: args.orgId,
        billingAccount: args.billingAccount,
        ownerEmails: args.ownerEmails,
        developerIdentity: args.developerIdentity,
      }
    : args

  try {
    // Check if GitHub CLI is available and authenticated
    try {
      await execAsync('gh auth status')
    } catch {
      return {
        status: 'failed',
        message: 'Not authenticated with GitHub. Please run: gh auth login',
        error: 'GitHub authentication required',
        repoName: argsForGitHub.repoName,
        results: [],
        summary: {
          secretsCreated: 0,
          variablesCreated: 0,
          workflowsCreated: 0,
          totalItems: 0,
        },
      }
    }

    const results = []
    // --- Environment-specific secrets/variables ---
    const environments: Array<'dev' | 'test' | 'sbx' | 'prod'> = [
      'dev',
      'test',
      'sbx',
      'prod',
    ]
    for (const env of environments) {
      // Set GCP_TOOLS_ENVIRONMENT variable
      try {
        const cmd = `gh variable set GCP_TOOLS_ENVIRONMENT --repo ${argsForGitHub.repoName} --env ${env} --body "${env}"`
        await execAsync(cmd)
        results.push({
          name: 'GCP_TOOLS_ENVIRONMENT',
          env,
          type: 'variable',
          status: 'created',
        })
      } catch (error) {
        results.push({
          name: 'GCP_TOOLS_ENVIRONMENT',
          env,
          type: 'variable',
          status: 'failed',
          error: String(error),
        })
      }
      // Set GCP_TOOLS_WORKLOAD_IDENTITY_PROVIDER secret
      const provider = argsForGitHub.workloadIdentityProviders?.[env]
      if (provider) {
        try {
          const cmd = `gh secret set GCP_TOOLS_WORKLOAD_IDENTITY_PROVIDER --repo ${argsForGitHub.repoName} --env ${env} --body "${provider}"`
          await execAsync(cmd)
          results.push({
            name: 'GCP_TOOLS_WORKLOAD_IDENTITY_PROVIDER',
            env,
            type: 'secret',
            status: 'created',
          })
        } catch (error) {
          results.push({
            name: 'GCP_TOOLS_WORKLOAD_IDENTITY_PROVIDER',
            env,
            type: 'secret',
            status: 'failed',
            error: String(error),
          })
        }
      }
    }

    // --- Global secrets ---
    const secrets = [
      {
        name: 'GCP_TOOLS_BILLING_ACCOUNT',
        value: argsForGitHub.billingAccount,
      },
      {
        name: 'GCP_TOOLS_FOUNDATION_PROJECT_ID',
        value: argsForGitHub.projectId,
      },
      { name: 'GCP_TOOLS_ORG_ID', value: argsForGitHub.orgId },
      {
        name: 'GCP_TOOLS_SERVICE_ACCOUNT_EMAIL',
        value: argsForGitHub.serviceAccount,
      },
      {
        name: 'GCP_TOOLS_FOUNDATION_PROJECT_NUMBER',
        value: argsForGitHub.projectNumber,
      },
      {
        name: 'GCP_TOOLS_TERRAFORM_REMOTE_STATE_BUCKET_ID',
        value: `${argsForGitHub.projectId}-terraform-state`,
      },
    ]
    for (const secret of secrets) {
      if (secret.value) {
        try {
          const cmd = `gh secret set ${secret.name} --repo ${argsForGitHub.repoName} --body "${secret.value}"`
          await execAsync(cmd)
          results.push({
            name: secret.name,
            type: 'secret',
            status: 'created',
          })
        } catch (error) {
          results.push({
            name: secret.name,
            type: 'secret',
            status: 'failed',
            error: String(error),
          })
        }
      }
    }

    // Extract githubIdentity and projectName for correct variable mapping
    let githubIdentity = ''
    let projectName = ''
    if (isFoundationResult(args)) {
      githubIdentity = args.githubIdentity || ''
      projectName = args.projectId.replace(/-fdn-.*/, '')
    } else {
      // Try to parse from repoName if possible
      if (argsForGitHub.repoName?.includes('/')) {
        githubIdentity = argsForGitHub.repoName.split('/')[0]
        projectName = argsForGitHub.repoName.split('/')[1]
      }
    }
    // Use the full regions string if present
    const fullRegions =
      isFoundationResult(args) && args.regions
        ? args.regions
        : argsForGitHub.regions
    const variables = [
      {
        name: 'GCP_TOOLS_DEVELOPER_IDENTITY_SPECIFIER',
        value: argsForGitHub.developerIdentity,
      },
      { name: 'GCP_TOOLS_GITHUB_IDENTITY_SPECIFIER', value: githubIdentity },
      { name: 'GCP_TOOLS_PROJECT_NAME', value: projectName },
      { name: 'GCP_TOOLS_OWNER_EMAILS', value: argsForGitHub.ownerEmails },
      { name: 'GCP_TOOLS_REGIONS', value: fullRegions },
    ]
    for (const variable of variables) {
      if (variable.value) {
        try {
          const cmd = `gh variable set ${variable.name} --repo ${argsForGitHub.repoName} --body "${variable.value}"`
          await execAsync(cmd)
          results.push({
            name: variable.name,
            type: 'variable',
            status: 'created',
          })
        } catch (error) {
          results.push({
            name: variable.name,
            type: 'variable',
            status: 'failed',
            error: String(error),
          })
        }
      }
    }

    // --- GCP_REGION variable ---
    // try {
    //   const cmd = `gh secret set GCP_TOOLS_REGIONS --repo ${argsForGitHub.repoName} --body "${fullRegions}"`
    //   await execAsync(cmd)
    //   results.push({
    //     name: 'GCP_TOOLS_REGIONS',
    //     type: 'secret',
    //     status: 'created',
    //   })
    // } catch (error) {
    //   results.push({
    //     name: 'GCP_TOOLS_REGIONS',
    //     type: 'secret',
    //     status: 'failed',
    //     error: String(error),
    //   })
    // }
    try {
      const cmd = `gh variable set GCP_TOOLS_REGIONS --repo ${argsForGitHub.repoName} --body "${fullRegions}"`
      await execAsync(cmd)
      results.push({
        name: 'GCP_TOOLS_REGIONS',
        type: 'variable',
        status: 'created',
      })
    } catch (error) {
      results.push({
        name: 'GCP_TOOLS_REGIONS',
        type: 'variable',
        status: 'failed',
        error: String(error),
      })
    }

    return {
      status: 'success',
      message: 'GitHub secrets and environment variables setup completed',
      repoName: argsForGitHub.repoName,
      results: results,
      summary: {
        secretsCreated: results.filter(
          (r) => r.type === 'secret' && r.status === 'created',
        ).length,
        variablesCreated: results.filter(
          (r) => r.type === 'variable' && r.status === 'created',
        ).length,
        workflowsCreated: 0,
        totalItems: results.length,
      },
    }
  } catch (error) {
    console.error('GitHub secrets setup failed:', error)
    return {
      status: 'failed',
      message: `GitHub secrets setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error',
      repoName: argsForGitHub.repoName,
      results: [],
      summary: {
        secretsCreated: 0,
        variablesCreated: 0,
        workflowsCreated: 0,
        totalItems: 0,
      },
    }
  }
}
