import { ToolSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type { Tool } from '../types.mts'
const ToolInputSchema = ToolSchema.shape.inputSchema
// ToolInput is the type expected for inputSchema
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ToolInput = z.infer<typeof ToolInputSchema>
import {
  ApprovePlanArgsSchema,
  DeployOpsArgsSchema,
  FullPipelineArgsSchema,
  GenerateCodeArgsSchema,
  GenerateInfraArgsSchema,
  GenerateTestsArgsSchema,
  GetWorkflowStatusArgsSchema,
  ReviewCodeArgsSchema,
} from '../handlers/tool/index.mjs'

// Define schemas inline for the tools that don't have them exported
const GenerateSpecArgsSchema = z
  .object({
    project_description: z.string().min(1, 'Project description is required'),
  })
  .strict()

const GeneratePlanArgsSchema = z
  .object({
    requirements: z.string().min(1, 'Requirements are required'),
  })
  .strict()

const ApproveDeploymentArgsSchema = z
  .object({
    approval_id: z.string().min(1, 'Approval ID is required'),
    approved: z.boolean(),
    feedback: z.string().optional(),
  })
  .strict()

export const tools: Tool[] = [
  {
    name: 'full_pipeline',
    description:
      'Execute a complete end-to-end workflow from project description to deployment, with human-in-the-loop approvals.',
    inputSchema: zodToJsonSchema(FullPipelineArgsSchema) as ToolInput,
  },
  {
    name: 'generate_spec',
    description: 'Generate project specifications from a brief description.',
    inputSchema: zodToJsonSchema(GenerateSpecArgsSchema) as ToolInput,
  },
  {
    name: 'generate_plan',
    description: 'Generate a detailed project plan from requirements.',
    inputSchema: zodToJsonSchema(GeneratePlanArgsSchema) as ToolInput,
  },
  {
    name: 'generate_code',
    description:
      'Generate code based on a project plan for the specified language.',
    inputSchema: zodToJsonSchema(GenerateCodeArgsSchema) as ToolInput,
  },
  {
    name: 'generate_infra',
    description: 'Generate infrastructure as code based on a project plan.',
    inputSchema: zodToJsonSchema(GenerateInfraArgsSchema) as ToolInput,
  },
  {
    name: 'generate_tests',
    description: 'Generate test code for a given artifact.',
    inputSchema: zodToJsonSchema(GenerateTestsArgsSchema) as ToolInput,
  },
  {
    name: 'review_code',
    description: 'Review code and provide feedback.',
    inputSchema: zodToJsonSchema(ReviewCodeArgsSchema) as ToolInput,
  },
  {
    name: 'deploy_ops',
    description: 'Generate deployment and operations plan for artifacts.',
    inputSchema: zodToJsonSchema(DeployOpsArgsSchema) as ToolInput,
  },
  {
    name: 'approve_plan',
    description: 'Approve or reject a generated plan (human-in-the-loop step).',
    inputSchema: zodToJsonSchema(ApprovePlanArgsSchema) as ToolInput,
  },
  {
    name: 'approve_deployment',
    description:
      'Approve or reject a deployment plan (human-in-the-loop step).',
    inputSchema: zodToJsonSchema(ApproveDeploymentArgsSchema) as ToolInput,
  },
  {
    name: 'get_workflow_status',
    description: 'Get the current status of a workflow.',
    inputSchema: zodToJsonSchema(GetWorkflowStatusArgsSchema) as ToolInput,
  },
]

// Create a registry for easy lookup
export const toolRegistry = new Map<string, Tool>()
for (const tool of tools) {
  toolRegistry.set(tool.name, tool)
}
