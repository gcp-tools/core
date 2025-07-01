import type { z } from 'zod'
export declare const AgentInputSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>
export declare const AgentResponseSchema: z.ZodObject<
  {
    result: z.ZodString
    input: z.ZodRecord<z.ZodString, z.ZodUnknown>
  },
  'passthrough',
  z.ZodTypeAny,
  z.objectOutputType<
    {
      result: z.ZodString
      input: z.ZodRecord<z.ZodString, z.ZodUnknown>
    },
    z.ZodTypeAny,
    'passthrough'
  >,
  z.objectInputType<
    {
      result: z.ZodString
      input: z.ZodRecord<z.ZodString, z.ZodUnknown>
    },
    z.ZodTypeAny,
    'passthrough'
  >
>
export declare const AgentKindSchema: z.ZodEnum<
  ['spec', 'plan', 'codegen', 'test', 'infra', 'review', 'ops']
>
export declare const AgentRequestSchema: z.ZodObject<
  {
    kind: z.ZodEnum<
      ['spec', 'plan', 'codegen', 'test', 'infra', 'review', 'ops']
    >
    input: z.ZodRecord<z.ZodString, z.ZodUnknown>
  },
  'strip',
  z.ZodTypeAny,
  {
    input: Record<string, unknown>
    kind: 'spec' | 'plan' | 'codegen' | 'test' | 'infra' | 'review' | 'ops'
  },
  {
    input: Record<string, unknown>
    kind: 'spec' | 'plan' | 'codegen' | 'test' | 'infra' | 'review' | 'ops'
  }
>
export type AgentInput = z.infer<typeof AgentInputSchema>
export type AgentResponse = z.infer<typeof AgentResponseSchema>
export type AgentKind = z.infer<typeof AgentKindSchema>
export type AgentRequest = z.infer<typeof AgentRequestSchema>
