import { z } from 'zod';
export type CreateSkeletonAppResult = {
    status: 'success' | 'failed';
    githubIdentity: string;
    projectName: string;
    message: string;
    path?: string;
    error?: string;
};
export declare const CreateSkeletonAppInputSchema: z.ZodObject<{
    githubIdentity: z.ZodString;
    projectName: z.ZodString;
    codePath: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectName: string;
    codePath: string;
    githubIdentity: string;
}, {
    projectName: string;
    codePath: string;
    githubIdentity: string;
}>;
export type CreateSkeletonAppInput = z.infer<typeof CreateSkeletonAppInputSchema>;
export declare function createSkeletonApp(input: unknown): Promise<CreateSkeletonAppResult>;
