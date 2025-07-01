import { type PlanArtifact, PlanArtifactSchema } from '../types/artifacts.js'

export function parsePlanArtifact(plan: unknown): PlanArtifact {
  return PlanArtifactSchema.parse(plan)
}

export function getTechnologiesFromPlan(plan: PlanArtifact): string[] {
  return plan.technologies
}

export function validatePlanArtifact(
  plan: unknown,
): asserts plan is PlanArtifact {
  PlanArtifactSchema.parse(plan)
}

export function safeParsePlanArtifact(plan: unknown) {
  return PlanArtifactSchema.safeParse(plan)
}
