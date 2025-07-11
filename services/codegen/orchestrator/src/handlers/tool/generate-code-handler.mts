// // Handler temporarily commented out to prevent type errors during incremental pipeline integration.
// // Uncomment and fix types when re-enabling this handler.
// //
// // import { z } from 'zod'
// // import { AgentsMCPClient } from '../../lib/mcp-client.mjs'
// // import type { ToolResult } from '../../types.mts'

// export const GenerateCodeArgsSchema = z.object({
//   plan: z.string().min(1, 'Plan is required'),
//   language: z.string().min(1, 'Language is required'),
// })

// export type GenerateCodeArgs = z.infer<typeof GenerateCodeArgsSchema>

// export async function generateCodeHandler(input: unknown): Promise<ToolResult> {
//   const parsed = GenerateCodeArgsSchema.safeParse(input)
//   if (!parsed.success) {
//     return {
//       status: 'error',
//       data: 'Error Message from generateCodeHandler',
//       error: `Invalid input: ${parsed.error.message}`,
//     }
//   }
//   const { plan, language } = parsed.data
//   const client = new AgentsMCPClient()

//   try {
//     const result = await client.generateCode(
//       plan,
//       language as 'typescript' | 'python' | 'rust' | 'react',
//     )
//     return {
//       status: 'success',
//       data: result.code,
//     }
//   } catch (e) {
//     return {
//       status: 'error',
//       data: 'Error Message from generateCodeHandler',
//       error: String(e),
//     }
//   }
// }
