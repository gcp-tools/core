import { z } from 'zod';
import type { CreateGitHubRepoResult } from '../../types.mjs';
export declare const CreateGitHubRepoInputSchema: z.ZodObject<{
    githubIdentity: z.ZodString;
    projectName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    isPrivate: z.ZodOptional<z.ZodBoolean>;
    addReadme: z.ZodOptional<z.ZodBoolean>;
    addGitignore: z.ZodOptional<z.ZodBoolean>;
    addLicense: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectName: string;
    githubIdentity: string;
    description?: string | undefined;
    isPrivate?: boolean | undefined;
    addReadme?: boolean | undefined;
    addGitignore?: boolean | undefined;
    addLicense?: string | undefined;
}, {
    projectName: string;
    githubIdentity: string;
    description?: string | undefined;
    isPrivate?: boolean | undefined;
    addReadme?: boolean | undefined;
    addGitignore?: boolean | undefined;
    addLicense?: string | undefined;
}>;
export type CreateGitHubRepoInput = z.infer<typeof CreateGitHubRepoInputSchema>;
export declare function createGitHubRepo(input: unknown): Promise<CreateGitHubRepoResult>;
