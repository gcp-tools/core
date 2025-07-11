import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { z } from 'zod'
import { createRepoName } from '../../lib/repo.mjs'
import type { CreateGitHubRepoResult } from '../../types.mjs'

const execAsync = promisify(exec)

// Helper to list all GitHub repos for the org/user
async function listGitHubRepos(githubIdentity: string): Promise<string[]> {
  try {
    const { stdout } = await execAsync(
      `gh repo list ${githubIdentity} --limit 200 --json name -q '.[].name'`,
    )
    return stdout
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  } catch (err) {
    console.error('[error] Failed to list GitHub repos:', err)
    return []
  }
}

export const CreateGitHubRepoInputSchema = z.object({
  githubIdentity: z.string(),
  projectName: z.string(),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
  addReadme: z.boolean().optional(),
  addGitignore: z.boolean().optional(),
  addLicense: z.string().optional(),
})

export type CreateGitHubRepoInput = z.infer<typeof CreateGitHubRepoInputSchema>

export async function createGitHubRepo(
  input: unknown,
): Promise<CreateGitHubRepoResult> {
  const parsed = CreateGitHubRepoInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'failed',
      message: 'Invalid input',
      error: parsed.error.message,
      githubIdentity: '',
      projectName: '',
    }
  }
  const args = parsed.data
  const fullRepoName = createRepoName({
    githubIdentity: args.githubIdentity,
    projectName: args.projectName,
  })
  try {
    // Check if GitHub CLI is available
    try {
      await execAsync('gh --version')
    } catch {
      return {
        status: 'failed',
        message:
          'GitHub CLI (gh) is not installed. Please install it first: https://cli.github.com/',
        error: 'GitHub CLI not found',
        githubIdentity: args.githubIdentity,
        projectName: args.projectName,
      }
    }

    // Check if user is authenticated with GitHub
    try {
      await execAsync('gh auth status')
    } catch {
      return {
        status: 'failed',
        message: 'Not authenticated with GitHub. Please run: gh auth login',
        error: 'GitHub authentication required',
        githubIdentity: args.githubIdentity,
        projectName: args.projectName,
      }
    }

    // Check if repo already exists
    const repos = await listGitHubRepos(args.githubIdentity)
    if (repos.includes(args.projectName)) {
      console.error(
        `[info] GitHub repo ${fullRepoName} already exists. Skipping creation.`,
      )
      return {
        status: 'success',
        message: 'GitHub repository already exists. Skipped creation.',
        githubIdentity: args.githubIdentity,
        projectName: args.projectName,
        repoUrl: `https://github.com/${fullRepoName}`,
        isPrivate: args.isPrivate !== false,
      }
    }

    // Create repo
    let cmd = `gh repo create ${fullRepoName}`
    if (args.isPrivate !== false) cmd += ' --private'
    else cmd += ' --public'
    if (args.description) cmd += ` --description "${args.description}"`
    if (args.addReadme) cmd += ' --enable-issues --enable-wiki --add-readme'
    if (args.addGitignore) cmd += ' --gitignore Node'
    if (args.addLicense && args.addLicense !== 'none')
      cmd += ` --license ${args.addLicense}`
    cmd += ' --confirm'

    console.error(`Creating GitHub repository: ${fullRepoName}`)
    const { stdout, stderr } = await execAsync(cmd, {
      env: process.env,
      maxBuffer: 1024 * 1024, // 1MB buffer
      timeout: 60000, // 1 minute timeout
    })

    if (stderr) {
      console.error('GitHub CLI stderr:', stderr)
    }

    console.error('GitHub CLI stdout:', stdout)

    // Extract repository URL from output
    const repoUrlMatch = stdout.match(/https:\/\/github\.com\/[^\/]+\/[^\/\s]+/)
    const repoUrl = repoUrlMatch
      ? repoUrlMatch[0]
      : `https://github.com/${fullRepoName}`

    return {
      status: 'success',
      message: 'GitHub repository created successfully',
      githubIdentity: args.githubIdentity,
      projectName: args.projectName,
      repoUrl: repoUrl,
      isPrivate: args.isPrivate !== false,
    }
  } catch (error) {
    console.error('GitHub repository creation failed:', error)
    return {
      status: 'failed',
      message: `GitHub repository creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error',
      githubIdentity: args.githubIdentity,
      projectName: args.projectName,
    }
  }
}
