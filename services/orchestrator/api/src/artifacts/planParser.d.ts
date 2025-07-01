import type { PlanArtifact } from '../types/artifacts.js'
export declare function parsePlanArtifact(plan: unknown): PlanArtifact
export declare function getTechnologiesFromPlan(plan: PlanArtifact): string[]
export declare function validatePlanArtifact(
  plan: unknown,
): asserts plan is PlanArtifact
export declare function safeParsePlanArtifact(plan: unknown): import(
  'zod',
).SafeParseReturnType<
  import('zod').objectInputType<
    {
      workflowId: import('zod').ZodString
      steps: import('zod').ZodArray<import('zod').ZodString, 'many'>
      technologies: import('zod').ZodArray<import('zod').ZodString, 'many'>
      description: import('zod').ZodString
    },
    import('zod').ZodTypeAny,
    'passthrough'
  >,
  import('zod').objectOutputType<
    {
      workflowId: import('zod').ZodString
      steps: import('zod').ZodArray<import('zod').ZodString, 'many'>
      technologies: import('zod').ZodArray<import('zod').ZodString, 'many'>
      description: import('zod').ZodString
    },
    import('zod').ZodTypeAny,
    'passthrough'
  >
>
