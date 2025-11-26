import { z } from 'zod';
import type { SetupGitHubSecretsResult } from '../../types.mjs';
export declare const SetupGitHubSecretsInputSchema: z.ZodObject<{
    githubIdentity: z.ZodString;
    projectName: z.ZodString;
    projectId: z.ZodString;
    serviceAccount: z.ZodString;
    workloadIdentityPool: z.ZodString;
    projectNumber: z.ZodString;
    workloadIdentityProviders: z.ZodObject<{
        dev: z.ZodString;
        test: z.ZodString;
        sbx: z.ZodString;
        prod: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        dev: string;
        test: string;
        sbx: string;
        prod: string;
    }, {
        dev: string;
        test: string;
        sbx: string;
        prod: string;
    }>;
    regions: z.ZodString;
    orgId: z.ZodString;
    billingAccount: z.ZodString;
    ownerEmails: z.ZodString;
    developerIdentity: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectName: string;
    githubIdentity: string;
    orgId: string;
    billingAccount: string;
    regions: string;
    developerIdentity: string;
    ownerEmails: string;
    projectId: string;
    serviceAccount: string;
    workloadIdentityPool: string;
    projectNumber: string;
    workloadIdentityProviders: {
        dev: string;
        test: string;
        sbx: string;
        prod: string;
    };
}, {
    projectName: string;
    githubIdentity: string;
    orgId: string;
    billingAccount: string;
    regions: string;
    developerIdentity: string;
    ownerEmails: string;
    projectId: string;
    serviceAccount: string;
    workloadIdentityPool: string;
    projectNumber: string;
    workloadIdentityProviders: {
        dev: string;
        test: string;
        sbx: string;
        prod: string;
    };
}>;
export type SetupGitHubSecretsInput = z.infer<typeof SetupGitHubSecretsInputSchema>;
export declare function setupGitHubSecrets(input: unknown): Promise<SetupGitHubSecretsResult>;
