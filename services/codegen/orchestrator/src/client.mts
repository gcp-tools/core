import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

let connected = false

export const getClient = async () => {
  const client = new Client({
    name: 'agents-mcp-client',
    version: '1.0.0',
  })

  if (!connected) {
    const transport = new StreamableHTTPClientTransport(
      new URL('http://localhost:8080/mcp/'),
    )
    await client.connect(transport)
    connected = true
  }
  return client
}
