import { z } from 'zod';
export declare const CreateGitHubEnvironmentsInputSchema: z.ZodObject<{
    githubIdentity: z.ZodString;
    projectName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectName: string;
    githubIdentity: string;
}, {
    projectName: string;
    githubIdentity: string;
}>;
export type CreateGitHubEnvironmentsInput = z.infer<typeof CreateGitHubEnvironmentsInputSchema>;
export type CreateGitHubEnvironmentsResult = {
    status: 'success' | 'partial' | 'failed';
    githubIdentity: string;
    projectName: string;
    message: string;
    results: Array<{
        env: string;
        status: string;
        error?: string;
    }>;
    error?: string;
};
export declare function createGitHubEnvironments(input: unknown): Promise<CreateGitHubEnvironmentsResult>;
