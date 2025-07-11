import { ToolSchema } from '@modelcontextprotocol/sdk/types.js'
import type { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type { Tool } from '../types.mts'
const ToolInputSchema = ToolSchema.shape.inputSchema
// ToolInput is the type expected for inputSchema
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ToolInput = z.infer<typeof ToolInputSchema>

// import { GenerateCodeArgsSchema } from '../handlers/tool/generate-code-handler.mjs'
// import { GenerateInfraArgsSchema } from '../handlers/tool/generate-infra-handler.mjs'
// import { GenerateTestsArgsSchema } from '../handlers/tool/generate-tests-handler.mjs'
// import { ReviewCodeArgsSchema } from '../handlers/tool/review-code-handler.mjs'
import { GenerateSpecArgsSchema } from '../handlers/tool/generate-spec-handler.mjs'
// import { ApprovePlanArgsSchema } from '../handlers/tool/approve-plan-handler.mjs'
// import { ApproveDeploymentArgsSchema } from '../handlers/tool/approve-deployment-handler.mjs'
// import { DeployOpsArgsSchema } from '../handlers/tool/deploy-ops-handler.mjs'
import { RunFullPipelineArgsSchema } from '../handlers/tool/run-full-pipeline-handler.mjs'
// import { ContinueOrchestratorArgsSchema } from '../handlers/tool/continue-orchestrator-handler.mjs'
// import { ValidateCodePlanArgsSchema } from '../handlers/tool/validate-code-plan-handler.mjs'
// import { ValidateInfraPlanArgsSchema } from '../handlers/tool/validate-infra-plan-handler.mjs'

// Define schemas inline for the tools that don't have them exported
// const GeneratePlanArgsSchema = z
//   .object({
//     requirements: z.string().min(1, 'Requirements are required'),
//   })
//   .strict()

// const GenerateCodeArgsSchema = z
//   .object({
//     language: z.string().min(1, 'Language is required'),
//     plan: z.string().min(1, 'Plan is required'),
//   })
//   .strict()

// const GenerateInfraArgsSchema = z
//   .object({
//     language: z.string().min(1, 'Language is required'),
//     plan: z.string().min(1, 'Plan is required'),
//   })
//   .strict()

// const GenerateTestsArgsSchema = z
//   .object({
//     artifact: z.string().min(1, 'Artifact is required'),
//   })
//   .strict()

// const ReviewCodeArgsSchema = z
//   .object({
//     code: z.string().min(1, 'Code is required'),
//   })
//   .strict()

// const DeployOpsArgsSchema = z
//   .object({
//     plan: z.string().min(1, 'Plan is required'),
//   })
//   .strict()

// const ApprovePlanArgsSchema = z
//   .object({
//     plan: z.string().min(1, 'Plan is required'),
//     approved: z.boolean(),
//   })
//   .strict()

// const ApproveDeploymentArgsSchema = z
//   .object({
//     deployment_plan: z.string().min(1, 'Deployment plan is required'),
//     approved: z.boolean(),
//   })
//   .strict()

// const ContinueOrchestratorArgsSchema = z
//   .object({
//     user_input: z.string().min(1, 'User input is required'),
//   })
//   .strict()

// const ValidateCodePlanArgsSchema = z
//   .object({
//     code_plan: z.string().min(1, 'Code plan is required'),
//   })
//   .strict()

// const ValidateInfraPlanArgsSchema = z
//   .object({
//     infra_plan: z.string().min(1, 'Infrastructure plan is required'),
//   })
//   .strict()

export const tools: Tool[] = [
  {
    name: 'full_pipeline',
    description:
      'Execute a complete end-to-end workflow from project description to deployment, with human-in-the-loop approvals.',
    inputSchema: zodToJsonSchema(RunFullPipelineArgsSchema) as ToolInput,
  },
  {
    name: 'generate_spec',
    description: 'Generate project specifications from a brief description.',
    inputSchema: zodToJsonSchema(GenerateSpecArgsSchema) as ToolInput,
  },
  // {
  //   name: 'generate_plan',
  //   description: 'Generate a detailed project plan from requirements.',
  //   inputSchema: zodToJsonSchema(GeneratePlanArgsSchema) as ToolInput,
  // },
  // {
  //   name: 'generate_code',
  //   description:
  //     'Generate code based on a project plan for the specified language.',
  //   inputSchema: zodToJsonSchema(GenerateCodeArgsSchema) as ToolInput,
  // },
  // {
  //   name: 'generate_infra',
  //   description: 'Generate infrastructure as code based on a project plan.',
  //   inputSchema: zodToJsonSchema(GenerateInfraArgsSchema) as ToolInput,
  // },
  // {
  //   name: 'generate_tests',
  //   description: 'Generate test code for a given artifact.',
  //   inputSchema: zodToJsonSchema(GenerateTestsArgsSchema) as ToolInput,
  // },
  // {
  //   name: 'review_code',
  //   description: 'Review code and provide feedback.',
  //   inputSchema: zodToJsonSchema(ReviewCodeArgsSchema) as ToolInput,
  // },
  // {
  //   name: 'deploy_ops',
  //   description: 'Generate deployment and operations plan for artifacts.',
  //   inputSchema: zodToJsonSchema(DeployOpsArgsSchema) as ToolInput,
  // },
  // {
  //   name: 'approve_plan',
  //   description: 'Approve or reject a generated plan (human-in-the-loop step).',
  //   inputSchema: zodToJsonSchema(ApprovePlanArgsSchema) as ToolInput,
  // },
  // {
  //   name: 'approve_deployment',
  //   description:
  //     'Approve or reject a deployment plan (human-in-the-loop step).',
  //   inputSchema: zodToJsonSchema(ApproveDeploymentArgsSchema) as ToolInput,
  // },
  // {
  //   name: 'validate_code_plan',
  //   description: 'Validate generated code against the project plan.',
  //   inputSchema: zodToJsonSchema(ValidateCodePlanArgsSchema) as ToolInput,
  // },
  // {
  //   name: 'validate_infra_plan',
  //   description: 'Validate generated infrastructure against the project plan.',
  //   inputSchema: zodToJsonSchema(ValidateInfraPlanArgsSchema) as ToolInput,
  // },
  // {
  //   name: 'continue_orchestrator',
  //   description:
  //     'Continue the orchestrator from a paused HITL state with user input.',
  //   inputSchema: zodToJsonSchema(ContinueOrchestratorArgsSchema) as ToolInput,
  // },
]

// Create a registry for easy lookup
export const toolRegistry = new Map<string, Tool>()
for (const tool of tools) {
  toolRegistry.set(tool.name, tool)
}
