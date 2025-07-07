import { exec as execCb } from 'node:child_process'
import { promisify } from 'node:util'
import { z } from 'zod'
import { createRepoName } from '../../lib/repo.mjs'
import type { SetupGitHubSecretsResult } from '../../types.mjs'

const execAsync = promisify(execCb)

export const SetupGitHubSecretsInputSchema = z.object({
  githubIdentity: z.string(),
  projectName: z.string(),
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
      githubIdentity: '',
      projectName: '',
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
  const repoName = createRepoName({
    githubIdentity: args.githubIdentity,
    projectName: args.projectName,
  })

  console.error(
    '[DEBUG] setupGitHubSecrets input:',
    JSON.stringify(args, null, 2),
  )

  try {
    // Check if GitHub CLI is available and authenticated
    try {
      await execAsync('gh auth status')
    } catch {
      return {
        status: 'failed',
        message: 'Not authenticated with GitHub. Please run: gh auth login',
        error: 'GitHub authentication required',
        githubIdentity: args.githubIdentity,
        projectName: args.projectName,
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
        const cmd = `gh variable set GCP_TOOLS_ENVIRONMENT --repo ${repoName} --env ${env} --body "${env}"`
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
      const provider = args.workloadIdentityProviders?.[env]
      if (provider) {
        try {
          const cmd = `gh secret set GCP_TOOLS_WORKLOAD_IDENTITY_PROVIDER --repo ${repoName} --env ${env} --body "${provider}"`
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
        value: args.billingAccount,
      },
      {
        name: 'GCP_TOOLS_FOUNDATION_PROJECT_ID',
        value: args.projectId,
      },
      { name: 'GCP_TOOLS_ORG_ID', value: args.orgId },
      {
        name: 'GCP_TOOLS_SERVICE_ACCOUNT_EMAIL',
        value: args.serviceAccount,
      },
      {
        name: 'GCP_TOOLS_FOUNDATION_PROJECT_NUMBER',
        value: args.projectNumber,
      },
      {
        name: 'GCP_TOOLS_TERRAFORM_REMOTE_STATE_BUCKET_ID',
        value: `${args.projectId}-terraform-state`,
      },
    ]
    for (const secret of secrets) {
      if (secret.value) {
        try {
          const cmd = `gh secret set ${secret.name} --repo ${repoName} --body "${secret.value}"`
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

    // Variable mapping
    const variables = [
      {
        name: 'GCP_TOOLS_DEVELOPER_IDENTITY_SPECIFIER',
        value: args.developerIdentity,
      },
      {
        name: 'GCP_TOOLS_GITHUB_IDENTITY_SPECIFIER',
        value: args.githubIdentity,
      },
      { name: 'GCP_TOOLS_PROJECT_NAME', value: args.projectName },
      { name: 'GCP_TOOLS_OWNER_EMAILS', value: args.ownerEmails },
      { name: 'GCP_TOOLS_REGIONS', value: args.regions },
    ]
    for (const variable of variables) {
      if (variable.value) {
        try {
          const cmd = `gh variable set ${variable.name} --repo ${repoName} --body "${variable.value}"`
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
    try {
      const cmd = `gh variable set GCP_TOOLS_REGIONS --repo ${repoName} --body "${args.regions}"`
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
      githubIdentity: args.githubIdentity,
      projectName: args.projectName,
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
      githubIdentity: args.githubIdentity,
      projectName: args.projectName,
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
