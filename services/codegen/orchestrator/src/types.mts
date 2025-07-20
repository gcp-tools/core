import type { Tool as MCPTool } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod/v4'

export type Tool = MCPTool
export interface MCPServerConfig {
  name: string
  version: string
  capabilities: {
    resources: Record<string, unknown>
    tools: Record<string, unknown>
    prompts: Record<string, unknown>
  }
}

export const llmMessageSchema = z.object({
  role: z.union([z.literal('user'), z.literal('agent')]),
  content: z.string(),
})
export type LLMMessage = z.infer<typeof llmMessageSchema>

export const llmSpecResponseSchema = z.object({
  role: z.literal('agent'),
  requirements: z.array(z.string()),
  questions: z.array(z.string()),
})
export type LLMSpecResponse = z.infer<typeof llmSpecResponseSchema>

export const llmPlanResponseSchema = z.object({
  role: z.literal('agent'),
  plan: z.array(z.string()),
})
export type LLMPlanResponse = z.infer<typeof llmPlanResponseSchema>

export const specStateSchema = z.array(
  z.object({
    role: z.union([z.literal('user'), z.literal('agent')]),
    context: z.union([
      z.literal('brief'),
      z.literal('answers'),
      z.literal('requirements'),
      z.literal('questions'),
    ]),
    content: z.array(z.string()),
  }),
)
export type SpecState = z.infer<typeof specStateSchema>

export const planStateSchema = z.array(
  z.object({
    role: z.union([z.literal('user'), z.literal('agent')]),
    context: z.union([z.literal('plan'), z.literal('feedback')]),
    content: z.array(z.string()),
  }),
)
export type PlanState = z.infer<typeof planStateSchema>

// Simplified state schema - no optionals, clear structure
export const stateSchema = z.object({
  META: z.object({
    githubIdentifier: z.string(),
    projectName: z.string(),
    codePath: z.string(),
    version: z.number(),
    timestamp: z.string(),
    outcome: z.string(),
  }),
  GENERATE_SPEC: specStateSchema,
  GENERATE_PLAN: planStateSchema,
})

export type State = z.infer<typeof stateSchema>

// // Legacy schemas for backward compatibility (can be removed later)
// export const specMessageSchema = z.object({
//   content: z.array(
//     z.object({
//       text: z.array(z.string()),
//       context: z.union([
//         z.literal('brief'),
//         z.literal('answers'),
//       ]),
//     }),
//   ),
//   role: z.literal('user'),
// })
// export type SpecMessage = z.infer<typeof specMessageSchema>

// export const specResponseSchema = z.object({
//   content: z.array(
//     z.object({
//       text: z.array(z.string()),
//       context: z.union([
//         z.literal('requirements'),
//         z.literal('questions'),
//       ]),
//     }),
//   ),
//   role: z.literal('agent'),
// })
// export type SpecResponse = z.infer<typeof specResponseSchema>

// export const planMessageSchema = z.object({
//   content: z.array(
//     z.object({
//       text: z.array(z.string()),
//       context: z.union([
//         z.literal('requirements'),
//         z.literal('feedback'),
//       ]),
//     }),
//   ),
//   role: z.literal('user'),
// })
// export type PlanMessage = z.infer<typeof planMessageSchema>

// export const planResponseSchema = z.object({
//   content: z.array(
//     z.object({
//       text: z.array(z.string()),
//       context: z.union([
//         z.literal('plan'),
//       ]),
//     }),
//   ),
//   role: z.literal('agent'),
// })
// export type PlanResponse = z.infer<typeof planResponseSchema>

// export const codeSchemaLegacy = z.object({
//   content: z.object({
//     code: z.array(z.object({
//       code: z.string(),
//       filename: z.string(),
//       language: z.string(),
//     })),
//     context: 'code',
//   }),
//   role: z.literal('agent'),
// })

// export const testSchemaLegacy = z.object({
//   content: z.object({
//     tests: z.array(z.object({
//       code: z.string(),
//       filename: z.string(),
//       language: z.string(),
//     })),
//     context: 'tests',
//   }),
//   role: z.literal('agent'),
// })

// export const componentSchema = z.object({
//   name: z.string(),
//   description: z.string(),
//   code: z.array(codeSchemaLegacy),
//   tests: z.array(testSchemaLegacy),
// })

// export const serviceSchema = z.object({
//   name: z.string(),
//   description: z.string(),
//   components: z.array(componentSchema),
// })

// export type Outcome =
//   | 'ERROR'
//   | 'OK'
//   | 'HITL'
//   | 'PASS'
//   | 'FAIL'
//   | 'TESTS'
//   | 'CODE'

// export type ToolSuccess<
//   S extends keyof State,
//   O extends Outcome,
// > = {
//   result: O,
//   state: State[S]
//   type: string,
// }

// export type ToolError<
//   S extends keyof State,
// > = {
//   cause: string | any[]
//   error?: Error
//   message: string
//   state: State[S]
//   result: 'ERROR',
//   type: string,
// }

// export type ToolResult<
//   S extends keyof State,
//   O extends Outcome,
// > = ToolSuccess<S, O> | ToolError<S>

// export type ToolHandler<
//   S extends keyof State,
//   R,
//   O extends Outcome,
// > = (
//   state: State[S],
//   stateSchema: ZodType<State[S]>,
//   agentResonseSchema: ZodType<R>,
// ) => Promise<ToolResult<S, O>>

// type ToolAgentFn<R> = (state: State, stateSchema: ZodType<State>, agentResponseSchema: ZodType<R>) => State
// type ToolAgentHandler = (state: State) => State
// type MakeToolAgentHandler = <R>(fn: ToolAgentFn<R>, stateSchema: ZodType<State>, agentResponseSchema: ZodType<R>) => ToolAgentHandler

// export const makeToolAgentHandler: MakeToolAgentHandler = (fn, stateSchema, agentResponseSchema) => {
//   return (state: State) => {
//     return fn(state, stateSchema, agentResponseSchema)
//   }
// }
