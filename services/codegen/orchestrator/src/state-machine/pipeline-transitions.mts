import { match } from 'ts-pattern'
import { generatePlanHandler } from '../handlers/spec-plan/generate-plan-handler.mjs'
import { generateSpecHandler } from '../handlers/spec-plan/generate-spec-handler.mjs'
import type { ToolAgentHandler } from '../lib/make-tool.mjs'

export type PipelineTransition =
  | {
      from: 'INITIAL'
      outcome: 'OK'
    }
  | {
      from: 'GENERATE_SPEC'
      outcome: 'OK' | 'HITL'
    }
  | {
      from: 'GENERATE_PLAN'
      outcome: 'HITL'
    }

export function getNextHandler(
  transition: PipelineTransition,
  // biome-ignore lint/suspicious/noExplicitAny: the handler registry does care about the type of the result
): ToolAgentHandler<any> {
  return match(transition)
    .with({ from: 'INITIAL', outcome: 'OK' }, () => generateSpecHandler)
    .with({ from: 'GENERATE_SPEC', outcome: 'HITL' }, () => generateSpecHandler)
    .with({ from: 'GENERATE_SPEC', outcome: 'OK' }, () => generatePlanHandler)
    .with({ from: 'GENERATE_PLAN', outcome: 'HITL' }, () => generatePlanHandler)
    .exhaustive()
}
