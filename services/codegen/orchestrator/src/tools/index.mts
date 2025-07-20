import { ToolSchema } from '@modelcontextprotocol/sdk/types.js'
import type { z as z3 } from 'zod'
import { z } from 'zod/v4'
import type { Tool } from '../types.mts'
const ToolInputSchema = ToolSchema.shape.inputSchema
type ToolInput = z3.infer<typeof ToolInputSchema>

import { answerSpecQuestionArgsSchema } from './pipeline/answer-spec-questions.mjs'
import { runFullPipelineArgsSchema } from './pipeline/run-full-pipeline.mjs'

export const tools: Tool[] = [
  {
    name: 'full_pipeline',
    description:
      'Execute a complete end-to-end workflow from project description to deployment, with human-in-the-loop approvals.',
    inputSchema: z.toJSONSchema(runFullPipelineArgsSchema) as ToolInput,
  },
  {
    name: 'answer_spec_question',
    description: 'Answer questions about the project specifications.',
    inputSchema: z.toJSONSchema(answerSpecQuestionArgsSchema) as ToolInput,
  },
]

// Create a registry for easy lookup
export const toolRegistry = new Map<string, Tool>()
for (const tool of tools) {
  toolRegistry.set(tool.name, tool)
}
