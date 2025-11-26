import type { Tool as MCPTool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
export type Tool = MCPTool;
export type Resource = {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
};
export declare const SetupFoundationProjectSchema: z.ZodObject<{
    projectName: z.ZodString;
    orgId: z.ZodString;
    billingAccount: z.ZodString;
    regions: z.ZodString;
    githubIdentity: z.ZodString;
    developerIdentity: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectName: string;
    githubIdentity: string;
    orgId: string;
    billingAccount: string;
    regions: string;
    developerIdentity: string;
}, {
    projectName: string;
    githubIdentity: string;
    orgId: string;
    billingAccount: string;
    regions: string;
    developerIdentity: string;
}>;
export type SetupFoundationProjectArgs = z.infer<typeof SetupFoundationProjectSchema>;
export type SetupFoundationProjectResult = {
    projectId: string;
    serviceAccount: string;
    workloadIdentityPool: string;
    projectNumber?: string;
    workloadIdentityProviders?: {
        dev?: string;
        test?: string;
        sbx?: string;
        prod?: string;
    };
    status: 'success' | 'failed';
    message: string;
};
export type EnvironmentConfig = {
    GCP_PROJECT_ID?: string;
    GITHUB_TOKEN?: string;
    GCP_REGION?: string;
    GCP_ORG_ID?: string;
    GCP_BILLING_ACCOUNT?: string;
};
export type ToolRegistry = Map<string, Tool>;
export type ResourceRegistry = Map<string, Resource>;
export type MCPServerConfig = {
    name: string;
    version: string;
    capabilities: {
        resources: Record<string, unknown>;
        tools: Record<string, unknown>;
        prompts: Record<string, unknown>;
    };
};
export type DependencyCheckResult = {
    name: string;
    present?: boolean;
    installed?: boolean;
    error?: string;
};
export type CreateGitHubRepoResult = {
    status: 'success' | 'failed';
    message: string;
    githubIdentity: string;
    projectName: string;
    repoUrl?: string;
    isPrivate?: boolean;
    topics?: string[];
    error?: string;
};
export type SetupGitHubSecretsResult = {
    status: 'success' | 'failed';
    message: string;
    githubIdentity: string;
    projectName: string;
    results: Array<{
        name: string;
        type: string;
        status: string;
        env?: string;
        error?: string;
    }>;
    summary: {
        secretsCreated: number;
        variablesCreated: number;
        workflowsCreated: number;
        totalItems: number;
    };
    error?: string;
};
export type InstallPrerequisitesResult = {
    summary: DependencyCheckResult[];
    message: string;
};
export type CompleteProjectSetupResult = {
    status: 'success' | 'failed';
    message: string;
    results: {
        step1: {
            status: string;
            message: string;
            details?: InstallPrerequisitesResult;
        };
        step2: {
            status: string;
            message: string;
            details?: CreateGitHubRepoResult;
        };
        step3: {
            status: string;
            message: string;
            details?: SetupFoundationProjectResult;
        };
        step4: {
            status: string;
            message: string;
            details?: SetupGitHubSecretsResult;
        };
        step5?: {
            status: string;
            message: string;
            details?: {
                status: string;
                message: string;
                path?: string;
                error?: string;
            };
        };
    };
    summary?: {
        githubRepo?: string;
        gcpProject?: string;
        serviceAccount?: string;
        secretsCreated?: number;
        variablesCreated?: number;
        workflowCreated?: number;
        skeletonAppPath?: string;
    };
    error?: string;
};
