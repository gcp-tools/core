import { z } from 'zod';
export declare const GetWorkflowStatusRequestSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type GetWorkflowStatusRequest = z.infer<typeof GetWorkflowStatusRequestSchema>;
export declare const GetArtifactRequestSchema: z.ZodObject<{
    id: z.ZodString;
    step: z.ZodUnion<[z.ZodLiteral<"plan">, z.ZodLiteral<"review">]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    step: "plan" | "review";
}, {
    id: string;
    step: "plan" | "review";
}>;
export type GetArtifactRequest = z.infer<typeof GetArtifactRequestSchema>;
export declare const SubmitReviewRequestSchema: z.ZodObject<{
    id: z.ZodString;
    artifactPath: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    artifactPath: string;
}, {
    id: string;
    artifactPath: string;
}>;
export type SubmitReviewRequest = z.infer<typeof SubmitReviewRequestSchema>;
export type HitlState = {
    status: string;
    step: string;
    artifactPath: string;
    createdAt: string;
    [key: string]: unknown;
};
