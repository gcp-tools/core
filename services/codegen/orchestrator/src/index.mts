#!/usr/bin/env node

import { GcpToolsOrchestratorServer } from './server.mjs'
import type { MCPServerConfig } from './types.mjs'

// Default server configuration
const defaultConfig: MCPServerConfig = {
  name: 'gcp-tools-orchestrator-mcp-server',
  version: '1.0.0',
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
  },
}

// Create and run the MCP server
const server = new GcpToolsOrchestratorServer(defaultConfig)

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Shutting down GCP Tools Orchestrator MCP Server...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.error('Shutting down GCP Tools Orchestrator MCP Server...')
  process.exit(0)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the server
server.run().catch((error) => {
  console.error('Failed to start GCP Tools Orchestrator MCP Server:', error)
  process.exit(1)
})
