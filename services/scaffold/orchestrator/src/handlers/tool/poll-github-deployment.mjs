import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';
import { z } from 'zod';
import { createRepoName } from '../../lib/repo.mjs';
const exec = promisify(execCb);
export const PollGithubDeploymentInputSchema = z.object({
    githubIdentity: z.string(),
    projectName: z.string(),
    workflow: z.string(),
    ref: z.string().optional(),
    interval: z.number().optional(),
    timeout: z.number().optional(),
});
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function pollGithubDeployment(input) {
    const parsed = PollGithubDeploymentInputSchema.safeParse(input);
    if (!parsed.success) {
        return {
            status: 'error',
            githubIdentity: '',
            projectName: '',
            message: 'Invalid input',
        };
    }
    const { githubIdentity, projectName, workflow, ref, interval = 30, timeout = 600, } = parsed.data;
    const repo = createRepoName({ githubIdentity, projectName });
    const start = Date.now();
    const deadline = start + timeout * 1000;
    let lastConclusion = '';
    let lastRunId = 0;
    while (Date.now() < deadline) {
        try {
            const cmd = `gh run list --repo ${repo} --workflow ${workflow} --limit 1 --json status,conclusion,databaseId,headBranch`;
            const { stdout } = await exec(cmd);
            const runs = JSON.parse(stdout);
            if (!runs.length) {
                await sleep(interval * 1000);
                continue;
            }
            const run = runs[0];
            if (ref && run.headBranch !== ref) {
                await sleep(interval * 1000);
                continue;
            }
            lastConclusion = run.conclusion;
            lastRunId = run.databaseId;
            if (['completed'].includes(run.status)) {
                return {
                    status: run.conclusion || 'success',
                    githubIdentity,
                    projectName,
                    conclusion: run.conclusion,
                    runId: run.databaseId,
                    message: `Workflow completed with status: ${run.conclusion}`,
                };
            }
        }
        catch (error) {
            return {
                status: 'error',
                githubIdentity,
                projectName,
                message: `Polling failed: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
        await sleep(interval * 1000);
    }
    return {
        status: 'timeout',
        githubIdentity,
        projectName,
        conclusion: lastConclusion,
        runId: lastRunId,
        message: 'Polling timed out before workflow completed',
    };
}
//# sourceMappingURL=poll-github-deployment.mjs.map