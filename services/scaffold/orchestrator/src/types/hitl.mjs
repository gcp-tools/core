import { z } from 'zod';
export const GetWorkflowStatusRequestSchema = z.object({
    id: z.string(),
});
export const GetArtifactRequestSchema = z.object({
    id: z.string(),
    step: z.union([z.literal('plan'), z.literal('review')]),
});
export const SubmitReviewRequestSchema = z.object({
    id: z.string(),
    artifactPath: z.string(),
});
//# sourceMappingURL=hitl.mjs.map