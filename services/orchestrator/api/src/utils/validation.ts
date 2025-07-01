import type { z } from 'zod'
import { type AgentResponse, AgentResponseSchema } from '../types/agent.js'
import { type Artifact, ArtifactSchema } from '../types/artifacts.js'

/**
 * Validate any artifact using the union schema
 */
export function validateArtifact(data: unknown): Artifact {
  return ArtifactSchema.parse(data)
}

/**
 * Safely parse any artifact without throwing
 */
export function safeParseArtifact(data: unknown) {
  return ArtifactSchema.safeParse(data)
}

/**
 * Validate agent response
 */
export function validateAgentResponse(data: unknown): AgentResponse {
  return AgentResponseSchema.parse(data)
}

/**
 * Safely parse agent response without throwing
 */
export function safeParseAgentResponse(data: unknown) {
  return AgentResponseSchema.safeParse(data)
}

/**
 * Validate JSON string as artifact
 */
export function validateArtifactFromJson(jsonString: string): Artifact {
  const parsed = JSON.parse(jsonString)
  return validateArtifact(parsed)
}

/**
 * Validate JSON string as agent response
 */
export function validateAgentResponseFromJson(
  jsonString: string,
): AgentResponse {
  const parsed = JSON.parse(jsonString)
  return validateAgentResponse(parsed)
}

/**
 * Type guard to check if data is a valid artifact
 */
export function isArtifact(data: unknown): data is Artifact {
  return ArtifactSchema.safeParse(data).success
}

/**
 * Type guard to check if data is a valid agent response
 */
export function isAgentResponse(data: unknown): data is AgentResponse {
  return AgentResponseSchema.safeParse(data).success
}

/**
 * Get validation errors as a formatted string
 */
export function getValidationErrors(error: z.ZodError): string {
  return error.errors
    .map((err) => `${err.path.join('.')}: ${err.message}`)
    .join(', ')
}
