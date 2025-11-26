import type { MCPServerConfig } from './types.mjs';
export declare class GcpToolsMCPServer {
    private server;
    constructor(config: MCPServerConfig);
    private setupHandlers;
    private executeTool;
    run(): Promise<void>;
}
