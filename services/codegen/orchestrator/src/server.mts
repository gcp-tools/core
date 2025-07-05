// orchestrator_server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  type CallToolRequest,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  type ReadResourceRequest,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import {
  approveDeploymentHandler,
  approvePlanHandler,
  deployOpsHandler,
  generateCodeHandler,
  generateInfraHandler,
  generatePlanHandler,
  generateSpecHandler,
  getWorkflowStatusHandler,
  reviewCodeHandler,
  runFullPipelineHandler,
  runTestsHandler,
} from './handlers/tool/index.mjs'
import type { GetWorkflowStatusResult } from './handlers/tool/workflow.mjs'
import { toolRegistry } from './tools/index.mjs'
import type { MCPServerConfig } from './types.mjs'
import type {
  ApprovePlanResult,
  DeployOpsResult,
  FullPipelineResult,
  GenerateCodeResult,
  GenerateInfraResult,
  GenerateTestsResult,
  PlanResult,
  ReviewCodeResult,
  SpecResult,
} from './types.mts'

export class GcpToolsOrchestratorServer {
  private server: Server

  constructor(config: MCPServerConfig) {
    this.server = new Server(
      {
        name: config.name,
        version: config.version,
      },
      {
        capabilities: config.capabilities,
      },
    )

    this.setupHandlers()
  }

  private setupHandlers() {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: Array.from(toolRegistry.values()),
      }
    })

    // Handle tool execution
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest) => {
        const tool = toolRegistry.get(request.params.name)
        if (!tool) {
          throw new Error(`Tool ${request.params.name} not found`)
        }

        const result = await this.executeTool(
          request.params.name,
          request.params.arguments,
        )
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      },
    )

    // Handle resource listing (empty for now)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [],
      }
    })

    // Handle resource reading (empty for now)
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request: ReadResourceRequest) => {
        throw new Error(`Resource ${request.params.uri} not found`)
      },
    )
  }

  private async executeTool(
    name: string,
    args: unknown,
  ): Promise<
    | FullPipelineResult
    | SpecResult
    | PlanResult
    | GenerateCodeResult
    | GenerateInfraResult
    | GenerateTestsResult
    | ReviewCodeResult
    | DeployOpsResult
    | ApprovePlanResult
    | GetWorkflowStatusResult
  > {
    switch (name) {
      case 'full_pipeline':
        return await runFullPipelineHandler(
          args as {
            project_description: string
            language?: 'typescript' | 'python' | 'rust' | 'react'
            auto_approve?: boolean
          },
        )
      case 'generate_spec':
        return await generateSpecHandler(
          args as {
            project_description: string
          },
        )
      case 'generate_plan':
        return await generatePlanHandler(
          args as {
            requirements: string
          },
        )
      case 'generate_code':
        return await generateCodeHandler(
          args as {
            plan: string
            language: 'typescript' | 'python' | 'rust' | 'react'
          },
        )
      case 'generate_infra':
        return await generateInfraHandler(
          args as {
            plan: string
          },
        )
      case 'run_tests':
        return await runTestsHandler(
          args as {
            artifact: string
          },
        )
      case 'review_code':
        return await reviewCodeHandler(
          args as {
            artifact: string
          },
        )
      case 'deploy_ops':
        return await deployOpsHandler(
          args as {
            artifacts: string
          },
        )
      case 'approve_plan':
        return await approvePlanHandler(
          args as {
            approval_id: string
            approved: boolean
            feedback?: string
          },
        )
      case 'approve_deployment':
        return await approveDeploymentHandler(
          args as {
            approval_id: string
            approved: boolean
            feedback?: string
          },
        )
      case 'get_workflow_status':
        return await getWorkflowStatusHandler(
          args as {
            workflow_id: string
          },
        )
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  }

  async run() {
    try {
      const transport = new StdioServerTransport()
      await this.server.connect(transport)
      console.log('GCP Tools Orchestrator MCP Server started')
    } catch (error) {
      console.error('Error starting GCP Tools Orchestrator MCP Server:', error)
      process.exit(1)
    }
  }
}
