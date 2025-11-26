import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { getResourceContent } from './handlers/resource/index.mjs';
import { completeProjectSetup, createGitHubRepo, createSkeletonApp, installPrerequisites, runFoundationProjectHandler, setupGitHubSecrets, } from './handlers/tool/index.mjs';
import { resourceRegistry } from './resources/index.mjs';
import { toolRegistry } from './tools/index.mjs';
export class GcpToolsMCPServer {
    server;
    constructor(config) {
        this.server = new Server({
            name: config.name,
            version: config.version,
        }, {
            capabilities: config.capabilities,
        });
        this.setupHandlers();
    }
    setupHandlers() {
        // Handle resource listing
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return {
                resources: Array.from(resourceRegistry.values()),
            };
        });
        // Handle resource reading
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const resource = resourceRegistry.get(request.params.uri);
            if (!resource) {
                throw new Error(`Resource ${request.params.uri} not found`);
            }
            const content = await getResourceContent(resource.uri);
            return {
                contents: [
                    {
                        uri: resource.uri,
                        mimeType: resource.mimeType,
                        text: content,
                    },
                ],
            };
        });
        // Handle tool listing
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: Array.from(toolRegistry.values()),
            };
        });
        // Handle tool execution
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const tool = toolRegistry.get(request.params.name);
            if (!tool) {
                throw new Error(`Tool ${request.params.name} not found`);
            }
            const result = await this.executeTool(request.params.name, request.params.arguments);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        });
    }
    async executeTool(name, args) {
        switch (name) {
            case 'setup_foundation_project':
                return await runFoundationProjectHandler(args);
            case 'install_prerequisites':
                return await installPrerequisites();
            case 'create_github_repo':
                return await createGitHubRepo(args);
            case 'setup_github_secrets':
                return await setupGitHubSecrets(args);
            case 'complete_project_setup':
                return await completeProjectSetup(args);
            case 'create_skeleton_app':
                return await createSkeletonApp(args);
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    async run() {
        try {
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            console.log('GCP Tools MCP Server started');
        }
        catch (error) {
            console.error('Error starting GCP Tools MCP Server:', error);
            process.exit(1);
        }
    }
}
//# sourceMappingURL=server.mjs.map