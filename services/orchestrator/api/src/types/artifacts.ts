import { z } from 'zod'

// Zod schemas for artifact type definitions for cross-language, JSON-safe exchange

export const PlanArtifactSchema = z
  .object({
    workflowId: z.string().min(1, 'workflowId is required'),
    steps: z.array(z.string()).min(1, 'At least one step is required'),
    technologies: z
      .array(z.string())
      .min(1, 'At least one technology is required'),
    description: z.string().min(1, 'Description is required'),
  })
  .passthrough() // Allow additional properties

export const CodegenArtifactSchema = z
  .object({
    files: z
      .array(
        z.object({
          path: z.string().min(1, 'File path is required'),
          content: z.string(),
          language: z.string().min(1, 'Language is required'),
        }),
      )
      .min(1, 'At least one file is required'),
    summary: z.string().optional(),
  })
  .passthrough()

export const TestResultsArtifactSchema = z
  .object({
    passed: z.boolean(),
    results: z
      .array(
        z.object({
          name: z.string().min(1, 'Test name is required'),
          status: z.enum(['passed', 'failed']),
          message: z.string().optional(),
        }),
      )
      .min(1, 'At least one test result is required'),
    logs: z.string().optional(),
  })
  .passthrough()

export const InfraArtifactSchema = z
  .object({
    resources: z
      .array(
        z.object({
          type: z.string().min(1, 'Resource type is required'),
          name: z.string().min(1, 'Resource name is required'),
          config: z.record(z.unknown()),
        }),
      )
      .min(1, 'At least one resource is required'),
    planSummary: z.string().optional(),
  })
  .passthrough()

export const ReviewArtifactSchema = z
  .object({
    issues: z
      .array(
        z.object({
          severity: z.enum(['info', 'warning', 'error']),
          message: z.string().min(1, 'Issue message is required'),
          file: z.string().optional(),
          line: z.number().int().min(1).optional(),
        }),
      )
      .min(1, 'At least one issue is required'),
    overallStatus: z.enum(['approved', 'changes_requested', 'rejected']),
  })
  .passthrough()

export const OpsArtifactSchema = z
  .object({
    actions: z
      .array(
        z.object({
          type: z.string().min(1, 'Action type is required'),
          status: z.enum(['success', 'failure']),
          details: z.string().optional(),
        }),
      )
      .min(1, 'At least one action is required'),
    logs: z.string().optional(),
  })
  .passthrough()

// Type exports derived from schemas
export type PlanArtifact = z.infer<typeof PlanArtifactSchema>
export type CodegenArtifact = z.infer<typeof CodegenArtifactSchema>
export type TestResultsArtifact = z.infer<typeof TestResultsArtifactSchema>
export type InfraArtifact = z.infer<typeof InfraArtifactSchema>
export type ReviewArtifact = z.infer<typeof ReviewArtifactSchema>
export type OpsArtifact = z.infer<typeof OpsArtifactSchema>

// Union type for all artifacts
export const ArtifactSchema = z.union([
  PlanArtifactSchema,
  CodegenArtifactSchema,
  TestResultsArtifactSchema,
  InfraArtifactSchema,
  ReviewArtifactSchema,
  OpsArtifactSchema,
])

export type Artifact = z.infer<typeof ArtifactSchema>
