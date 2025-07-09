import { exec as execCb } from 'node:child_process'
import { promisify } from 'node:util'
import { z } from 'zod'
import type { CompleteProjectSetupResult } from '../../types.mjs'
import { createGitHubEnvironments } from './create-github-environments.mjs'
import { createGitHubRepo } from './create-github-repo.mjs'
import { createSkeletonApp } from './create-skeleton-app.mjs'
import { installPrerequisites } from './install-prerequisites.mjs'
import { runFoundationProjectHandler } from './run-foundation-project-handler.mjs'
import { setupGitHubSecrets } from './setup-github-secrets.mjs'
const execAsync = promisify(execCb)

export const CompleteProjectSetupInputSchema = z.object({
  projectName: z.string(),
  orgId: z.string(),
  billingAccount: z.string(),
  regions: z.string(),
  githubIdentity: z.string(),
  developerIdentity: z.string(),
  ownerEmails: z.string(),
  repoDescription: z.string().optional(),
  isPrivate: z.boolean().optional(),
  addLicense: z.string().optional(),
  includeOptionalDeps: z.boolean().optional(),
  codePath: z.string(),
})
export type CompleteProjectSetupInput = z.infer<
  typeof CompleteProjectSetupInputSchema
>

export async function completeProjectSetup(
  input: unknown,
): Promise<CompleteProjectSetupResult> {
  const parsed = CompleteProjectSetupInputSchema.safeParse(input)
  if (!parsed.success) {
    const zodErrorString = parsed.error.toString()
    return {
      status: 'failed',
      message: zodErrorString,
      results: {
        step1: {
          status: 'failed',
          message: zodErrorString,
          details: { summary: [], message: zodErrorString },
        },
        step2: {
          status: 'failed',
          message: zodErrorString,
          details: {
            status: 'failed',
            message: zodErrorString,
            githubIdentity: '',
            projectName: '',
          },
        },
        step3: {
          status: 'failed',
          message: zodErrorString,
          details: {
            projectId: '',
            serviceAccount: '',
            workloadIdentityPool: '',
            status: 'failed',
            message: zodErrorString,
          },
        },
        step4: {
          status: 'failed',
          message: zodErrorString,
          details: {
            status: 'failed',
            githubIdentity: '',
            projectName: '',
            results: [],
            summary: {
              secretsCreated: 0,
              variablesCreated: 0,
              workflowsCreated: 0,
              totalItems: 0,
            },
            message: zodErrorString,
          },
        },
      },
    }
  }
  const args = parsed.data
  const results: CompleteProjectSetupResult['results'] = {
    step1: { status: 'pending', message: 'Installing prerequisites...' },
    step2: { status: 'pending', message: 'Creating GitHub repository...' },
    step3: {
      status: 'pending',
      message: 'Setting up GCP foundation project...',
    },
    step4: { status: 'pending', message: 'Configuring GitHub secrets...' },
    step5: { status: 'pending', message: 'Creating skeleton app...' },
  }

  try {
    // Step 1: Install prerequisites
    console.error('Step 1: Installing prerequisites...')
    const prereqResult = await installPrerequisites()

    if (
      Array.isArray(prereqResult.summary) &&
      prereqResult.summary.some((r) => r.installed === false)
    ) {
      results.step1 = {
        status: 'failed',
        message: 'Some prerequisites failed to install',
        details: prereqResult,
      }
      return {
        status: 'failed',
        message: 'Prerequisites installation failed',
        results,
      }
    }
    results.step1 = {
      status: 'success',
      message: 'Prerequisites installed successfully',
      details: prereqResult,
    }

    // Check GitHub CLI authentication
    let ghAuthOk = false
    try {
      const { stdout } = await execAsync('gh auth status')
      if (stdout?.includes('Logged in to github.com')) {
        ghAuthOk = true
      }
    } catch (e) {
      ghAuthOk = false
    }
    if (!ghAuthOk) {
      results.step1 = {
        status: 'failed',
        message: 'GitHub CLI is not authenticated. Please run: gh auth login',
        details: prereqResult,
      }
      return {
        status: 'failed',
        message:
          'GitHub CLI is not authenticated. Please run: gh auth login and then re-run the setup.',
        results,
      }
    }

    // Check gcloud authentication
    let gcloudAuthOk = false
    try {
      const { stdout } = await execAsync('gcloud auth list --format=json')
      const accounts = JSON.parse(stdout)
      if (
        Array.isArray(accounts) &&
        accounts.some((a) => a.status === 'ACTIVE')
      ) {
        gcloudAuthOk = true
      }
    } catch (e) {
      gcloudAuthOk = false
    }
    if (!gcloudAuthOk) {
      results.step1 = {
        status: 'failed',
        message: 'gcloud is not authenticated. Please run: gcloud auth login',
        details: prereqResult,
      }
      return {
        status: 'failed',
        message:
          'gcloud is not authenticated. Please run: gcloud auth login and then re-run the setup.',
        results,
      }
    }

    // Step 2: Create GitHub repository
    console.error('Step 2: Creating GitHub repository...')
    const createGitHubRepoInput = {
      githubIdentity: args.githubIdentity,
      projectName: args.projectName,
      description:
        args.repoDescription || `GCP infrastructure for ${args.projectName}`,
      isPrivate: args.isPrivate !== false,
      addReadme: true,
      addGitignore: true,
      addLicense: args.addLicense,
    }
    console.error(
      '[DEBUG] createGitHubRepo input:',
      JSON.stringify(createGitHubRepoInput, null, 2),
    )
    const repoResult = await createGitHubRepo(createGitHubRepoInput)
    console.error(
      '[DEBUG] createGitHubRepo result:',
      JSON.stringify(repoResult, null, 2),
    )

    if (repoResult.status === 'failed') {
      results.step2 = {
        status: 'failed',
        message: 'GitHub repository creation failed',
        details: repoResult,
      }
      return {
        status: 'failed',
        message: 'GitHub repository creation failed',
        results,
      }
    }
    results.step2 = {
      status: 'success',
      message: 'GitHub repository created successfully',
      details: repoResult,
    }

    // Add after foundationResult is received, before proceeding to GitHub secrets
    // Wait for dev Workload Identity Provider to be ready
    async function waitForWorkloadIdentityProviderReady({
      projectId,
      poolId,
      providerId,
      timeoutMs = 120000,
      pollIntervalMs = 5000,
    }: {
      projectId: string
      poolId: string
      providerId: string
      timeoutMs?: number
      pollIntervalMs?: number
    }) {
      const start = Date.now()
      let attempt = 0
      while (Date.now() - start < timeoutMs) {
        attempt++
        try {
          console.error(
            `[wait] Checking for WIP provider dev (attempt ${attempt})...`,
          )
          const { stdout } = await execAsync(
            `gcloud iam workload-identity-pools providers describe ${providerId} --project=${projectId} --workload-identity-pool=${poolId} --location=global --format=json`,
          )
          const provider = JSON.parse(stdout)
          if (
            provider &&
            (provider.state === undefined || provider.state === 'ACTIVE')
          ) {
            console.error(
              `[wait] WIP provider dev is ready after ${((Date.now() - start) / 1000).toFixed(1)}s.`,
            )
            return true
          }
          console.error(
            `[wait] WIP provider dev found but not active (state: ${provider.state}). Retrying...`,
          )
        } catch (e) {
          console.error('[wait] WIP provider dev not found yet. Retrying...')
        }
        await new Promise((res) => setTimeout(res, pollIntervalMs))
      }
      throw new Error(
        `Workload Identity Provider 'dev' not ready after ${timeoutMs / 1000}s`,
      )
    }

    // Step 3: Setup GCP foundation project
    console.error('Step 3: Setting up GCP foundation project...')
    const runFoundationProjectHandlerInput = {
      projectName: args.projectName,
      orgId: args.orgId,
      billingAccount: args.billingAccount,
      regions: args.regions,
      githubIdentity: args.githubIdentity,
      developerIdentity: args.developerIdentity,
      ownerEmails: args.ownerEmails,
    }
    console.error(
      '[DEBUG] runFoundationProjectHandler input:',
      JSON.stringify(runFoundationProjectHandlerInput, null, 2),
    )
    const foundationResult = await runFoundationProjectHandler(
      runFoundationProjectHandlerInput,
    )
    console.error(
      '[DEBUG] runFoundationProjectHandler result:',
      JSON.stringify(foundationResult, null, 2),
    )

    // Wait for dev WIP to be ready before proceeding
    if (
      foundationResult?.projectId &&
      foundationResult.workloadIdentityProviders &&
      foundationResult.workloadIdentityProviders.dev
    ) {
      const devProviderResource = foundationResult.workloadIdentityProviders.dev
      // Extract poolId and providerId from resource string
      // Format: projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID
      const match = devProviderResource.match(
        /workloadIdentityPools\/(.+)\/providers\/(.+)$/,
      )
      if (match) {
        const poolId = match[1]
        const providerId = match[2]
        try {
          await waitForWorkloadIdentityProviderReady({
            projectId: foundationResult.projectId,
            poolId,
            providerId,
          })
        } catch (e) {
          results.step3 = {
            status: 'failed',
            message: `Dev Workload Identity Provider not ready: ${e instanceof Error ? e.message : String(e)}`,
            details: foundationResult,
          }
          return {
            status: 'failed',
            message: `Dev Workload Identity Provider not ready: ${e instanceof Error ? e.message : String(e)}`,
            results,
          }
        }
      } else {
        console.error(
          '[wait] Could not parse poolId/providerId from dev WIP resource string. Skipping wait.',
        )
      }
    } else {
      console.error(
        '[wait] No dev WIP resource found in foundationResult. Skipping wait.',
      )
    }

    if (foundationResult.status === 'failed') {
      results.step3 = {
        status: 'failed',
        message: 'GCP foundation project setup failed',
        details: foundationResult,
      }
      return {
        status: 'failed',
        message: 'GCP foundation project setup failed',
        results,
      }
    }
    results.step3 = {
      status: 'success',
      message: 'GCP foundation project setup completed',
      details: foundationResult,
    }

    // Step 3.5: Create GitHub environments before secrets
    const createGitHubEnvironmentsInput = {
      githubIdentity: args.githubIdentity,
      projectName: args.projectName,
    }
    console.error(
      '[DEBUG] createGitHubEnvironments input:',
      JSON.stringify(createGitHubEnvironmentsInput, null, 2),
    )
    const envResult = await createGitHubEnvironments(
      createGitHubEnvironmentsInput,
    )
    console.error(
      '[DEBUG] createGitHubEnvironments result:',
      JSON.stringify(envResult, null, 2),
    )

    if (envResult.status !== 'success') {
      results.step4 = {
        status: 'partial',
        message: 'Some environments failed to create',
        details: {
          status: 'failed',
          message: envResult.message,
          githubIdentity: args.githubIdentity,
          projectName: args.projectName,
          results: (envResult.results ?? []).map((r) => ({
            name: 'GITHUB_ENVIRONMENT',
            type: 'environment',
            env: r.env,
            status: r.status,
            error: r.error,
          })),
          summary: {
            secretsCreated: 0,
            variablesCreated: 0,
            workflowsCreated: 0,
            totalItems: (envResult.results ?? []).length,
          },
        },
      }
      return {
        status: 'failed',
        message: 'Some environments failed to create',
        results,
      }
    }

    // Step 4: Setup GitHub secrets
    console.error('Step 4: Setting up GitHub secrets...')
    const setupGitHubSecretsInput = {
      githubIdentity: args.githubIdentity,
      projectName: args.projectName,
      projectId: foundationResult.projectId,
      serviceAccount: foundationResult.serviceAccount,
      workloadIdentityPool: foundationResult.workloadIdentityPool,
      projectNumber: foundationResult.projectNumber,
      workloadIdentityProviders: foundationResult.workloadIdentityProviders,
      regions: args.regions,
      orgId: args.orgId,
      billingAccount: args.billingAccount,
      ownerEmails: args.ownerEmails,
      developerIdentity: args.developerIdentity,
    }
    console.error(
      '[DEBUG] setupGitHubSecrets input:',
      JSON.stringify(setupGitHubSecretsInput, null, 2),
    )
    const secretsResult = await setupGitHubSecrets(setupGitHubSecretsInput)
    console.error(
      '[DEBUG] setupGitHubSecrets result:',
      JSON.stringify(secretsResult, null, 2),
    )

    if (secretsResult.status === 'failed') {
      results.step4 = {
        status: 'failed',
        message: 'GitHub secrets setup failed',
        details: secretsResult,
      }
      return {
        status: 'failed',
        message: 'GitHub secrets setup failed',
        results,
      }
    }
    results.step4 = {
      status: 'success',
      message: 'GitHub secrets configured successfully',
      details: secretsResult,
    }

    // Step 5: Create skeleton app
    console.error('Step 5: Creating skeleton app...')
    const createSkeletonAppInput = {
      githubIdentity: args.githubIdentity,
      projectName: args.projectName,
      codePath: args.codePath,
    }
    console.error(
      '[DEBUG] createSkeletonApp input:',
      JSON.stringify(createSkeletonAppInput, null, 2),
    )
    const skeletonResult = await createSkeletonApp(createSkeletonAppInput)
    console.error(
      '[DEBUG] createSkeletonApp result:',
      JSON.stringify(skeletonResult, null, 2),
    )
    results.step5 = {
      status: skeletonResult.status,
      message: skeletonResult.message,
      details: skeletonResult,
    }

    // All steps completed successfully
    return {
      status: 'success',
      message: 'Complete project setup finished successfully!',
      results,
      summary: {
        githubRepo: repoResult.repoUrl,
        gcpProject: foundationResult.projectId,
        serviceAccount: foundationResult.serviceAccount,
        secretsCreated: secretsResult.summary?.secretsCreated || 0,
        variablesCreated: secretsResult.summary?.variablesCreated || 0,
        workflowCreated: secretsResult.summary?.workflowsCreated || 0,
        skeletonAppPath: skeletonResult.path,
      },
    }
  } catch (error) {
    console.error('Complete project setup failed:', error)
    return {
      status: 'failed',
      message: `Complete project setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
    }
  }
}
