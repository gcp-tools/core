import { z } from 'zod'
import { AgentResponseSchema } from '../types/agent.js'
import { ArtifactSchema } from '../types/artifacts.js'
/**
 * Validate any artifact using the union schema
 */
export function validateArtifact(data) {
  return ArtifactSchema.parse(data)
}
/**
 * Safely parse any artifact without throwing
 */
export function safeParseArtifact(data) {
  return ArtifactSchema.safeParse(data)
}
/**
 * Validate agent response
 */
export function validateAgentResponse(data) {
  return AgentResponseSchema.parse(data)
}
/**
 * Safely parse agent response without throwing
 */
export function safeParseAgentResponse(data) {
  return AgentResponseSchema.safeParse(data)
}
/**
 * Validate JSON string as artifact
 */
export function validateArtifactFromJson(jsonString) {
  const parsed = JSON.parse(jsonString)
  return validateArtifact(parsed)
}
/**
 * Validate JSON string as agent response
 */
export function validateAgentResponseFromJson(jsonString) {
  const parsed = JSON.parse(jsonString)
  return validateAgentResponse(parsed)
}
/**
 * Type guard to check if data is a valid artifact
 */
export function isArtifact(data) {
  return ArtifactSchema.safeParse(data).success
}
/**
 * Type guard to check if data is a valid agent response
 */
export function isAgentResponse(data) {
  return AgentResponseSchema.safeParse(data).success
}
/**
 * Get validation errors as a formatted string
 */
export function getValidationErrors(error) {
  return error.errors
    .map((err) => `${err.path.join('.')}: ${err.message}`)
    .join(', ')
}
//# sourceMappingURL=validation.js.map
