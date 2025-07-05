import { z } from 'zod'

export const GetWorkflowStatusRequestSchema = z.object({
  id: z.string(),
})
export type GetWorkflowStatusRequest = z.infer<
  typeof GetWorkflowStatusRequestSchema
>

export const GetArtifactRequestSchema = z.object({
  id: z.string(),
  step: z.union([z.literal('plan'), z.literal('review')]),
})
export type GetArtifactRequest = z.infer<typeof GetArtifactRequestSchema>

export const SubmitReviewRequestSchema = z.object({
  id: z.string(),
  artifactPath: z.string(),
})
export type SubmitReviewRequest = z.infer<typeof SubmitReviewRequestSchema>

// HITL State type for workflow status and artifact fetch
export type HitlState = {
  status: string
  step: string
  artifactPath: string
  createdAt: string
  [key: string]: unknown
}
