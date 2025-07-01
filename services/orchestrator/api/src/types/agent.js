import { z } from 'zod'
// Types for agent requests and responses
export const AgentInputSchema = z.record(z.unknown())
export const AgentResponseSchema = z
  .object({
    result: z.string().min(1, 'Result is required'),
    input: AgentInputSchema,
  })
  .passthrough() // Allow additional properties
export const AgentKindSchema = z.enum([
  'spec',
  'plan',
  'codegen',
  'test',
  'infra',
  'review',
  'ops',
])
export const AgentRequestSchema = z.object({
  kind: AgentKindSchema,
  input: AgentInputSchema,
})
//# sourceMappingURL=agent.js.map
