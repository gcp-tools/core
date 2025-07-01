import { PlanArtifactSchema } from '../types/artifacts.js'
export function parsePlanArtifact(plan) {
  return PlanArtifactSchema.parse(plan)
}
export function getTechnologiesFromPlan(plan) {
  return plan.technologies
}
export function validatePlanArtifact(plan) {
  PlanArtifactSchema.parse(plan)
}
export function safeParsePlanArtifact(plan) {
  return PlanArtifactSchema.safeParse(plan)
}
//# sourceMappingURL=planParser.js.map
