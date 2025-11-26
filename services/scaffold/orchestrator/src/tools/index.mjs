import { ToolSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
const ToolInputSchema = ToolSchema.shape.inputSchema;
import { CompleteProjectSetupInputSchema } from '../handlers/tool/complete-project-setup.mjs';
import { CreateGitHubEnvironmentsInputSchema } from '../handlers/tool/create-github-environments.mjs';
import { CreateGitHubRepoInputSchema } from '../handlers/tool/create-github-repo.mjs';
import { CreateSkeletonAppInputSchema } from '../handlers/tool/create-skeleton-app.mjs';
import { InstallPrerequisitesInputSchema } from '../handlers/tool/install-prerequisites.mjs';
import { PollGithubDeploymentInputSchema } from '../handlers/tool/poll-github-deployment.mjs';
import { RunFoundationProjectHandlerInputSchema } from '../handlers/tool/run-foundation-project-handler.mjs';
import { SetupFoundationProjectInputSchema } from '../handlers/tool/run-foundation-project-handler.mjs';
import { SetupGitHubSecretsInputSchema } from '../handlers/tool/setup-github-secrets.mjs';
export const tools = [
    {
        name: 'setup_foundation_project',
        description: 'Execute the setup_foundation_project.sh script in GCP',
        inputSchema: zodToJsonSchema(SetupFoundationProjectInputSchema),
    },
    {
        name: 'install_prerequisites',
        description: 'Check for and optionally install required (terraform, cdktf, cdktf-cli, gcloud, gh) and optional (python, rust) dependencies.',
        inputSchema: zodToJsonSchema(InstallPrerequisitesInputSchema),
    },
    {
        name: 'create_github_repo',
        description: 'Create a new GitHub repository with proper structure and configuration for GCP/CDKTF projects.',
        inputSchema: zodToJsonSchema(CreateGitHubRepoInputSchema),
    },
    {
        name: 'setup_github_secrets',
        description: 'Create GitHub repository secrets and environment variables based on GCP foundation project setup.',
        inputSchema: zodToJsonSchema(SetupGitHubSecretsInputSchema),
    },
    {
        name: 'complete_project_setup',
        description: 'Complete end-to-end setup: install prerequisites, create GitHub repo, setup GCP foundation project, and configure GitHub secrets.',
        inputSchema: zodToJsonSchema(CompleteProjectSetupInputSchema),
    },
    {
        name: 'create_skeleton_app',
        description: 'Clone and rebrand the gcp-tools/example-app repo as a new project, update references, set remote, and push.',
        inputSchema: zodToJsonSchema(CreateSkeletonAppInputSchema),
    },
    {
        name: 'poll_github_deployment',
        description: 'Poll the status of a GitHub Actions workflow run for a given repo, workflow, and branch/ref until completion or timeout.',
        inputSchema: zodToJsonSchema(PollGithubDeploymentInputSchema),
    },
    {
        name: 'create_github_environments',
        description: 'Create GitHub environments for a given repository.',
        inputSchema: zodToJsonSchema(CreateGitHubEnvironmentsInputSchema),
    },
    {
        name: 'run_foundation_project_handler',
        description: 'Execute the setup_foundation_project.sh script in GCP.',
        inputSchema: zodToJsonSchema(RunFoundationProjectHandlerInputSchema),
    },
];
export const toolRegistry = new Map();
for (const tool of tools) {
    toolRegistry.set(tool.name, tool);
}
//# sourceMappingURL=index.mjs.map