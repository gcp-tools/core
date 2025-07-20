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
import { toolHandlers } from './tools/handler-registry.mjs'
import { toolRegistry } from './tools/index.mjs'
import type { MCPServerConfig } from './types.mjs'

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
        const handler = toolHandlers[request.params.name]
        if (!handler) {
          throw new Error(`Tool ${request.params.name} not found`)
        }
        const result = await handler(request.params.arguments)
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
