import { z } from 'zod';
import type { SetupFoundationProjectResult } from '../../types.mts';
export type RunFoundationProjectHandlerResult = SetupFoundationProjectResult;
export declare const RunFoundationProjectHandlerInputSchema: z.ZodObject<{
    projectName: z.ZodString;
    orgId: z.ZodString;
    billingAccount: z.ZodString;
    regions: z.ZodString;
    githubIdentity: z.ZodString;
    developerIdentity: z.ZodString;
    ownerEmails: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectName: string;
    githubIdentity: string;
    orgId: string;
    billingAccount: string;
    regions: string;
    developerIdentity: string;
    ownerEmails: string;
}, {
    projectName: string;
    githubIdentity: string;
    orgId: string;
    billingAccount: string;
    regions: string;
    developerIdentity: string;
    ownerEmails: string;
}>;
export type RunFoundationProjectHandlerInput = z.infer<typeof RunFoundationProjectHandlerInputSchema>;
export declare const SetupFoundationProjectInputSchema: z.ZodObject<{
    projectName: z.ZodString;
    orgId: z.ZodString;
    billingAccount: z.ZodString;
    region: z.ZodString;
    githubIdentity: z.ZodString;
    developerIdentity: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectName: string;
    githubIdentity: string;
    orgId: string;
    billingAccount: string;
    developerIdentity: string;
    region: string;
}, {
    projectName: string;
    githubIdentity: string;
    orgId: string;
    billingAccount: string;
    developerIdentity: string;
    region: string;
}>;
export declare function runFoundationProjectHandler(input: unknown): Promise<RunFoundationProjectHandlerResult>;
