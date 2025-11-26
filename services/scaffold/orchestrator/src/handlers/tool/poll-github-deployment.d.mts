import { z } from 'zod';
export type PollGithubDeploymentParams = {
    repo: string;
    workflow: string;
    ref?: string;
    interval?: number;
    timeout?: number;
};
export type PollGithubDeploymentResult = {
    status: 'success' | 'failure' | 'cancelled' | 'timeout' | 'error';
    githubIdentity: string;
    projectName: string;
    conclusion?: string;
    runId?: number;
    message?: string;
};
export declare const PollGithubDeploymentInputSchema: z.ZodObject<{
    githubIdentity: z.ZodString;
    projectName: z.ZodString;
    workflow: z.ZodString;
    ref: z.ZodOptional<z.ZodString>;
    interval: z.ZodOptional<z.ZodNumber>;
    timeout: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    projectName: string;
    githubIdentity: string;
    workflow: string;
    timeout?: number | undefined;
    ref?: string | undefined;
    interval?: number | undefined;
}, {
    projectName: string;
    githubIdentity: string;
    workflow: string;
    timeout?: number | undefined;
    ref?: string | undefined;
    interval?: number | undefined;
}>;
export type PollGithubDeploymentInput = z.infer<typeof PollGithubDeploymentInputSchema>;
export declare function pollGithubDeployment(input: unknown): Promise<PollGithubDeploymentResult>;
