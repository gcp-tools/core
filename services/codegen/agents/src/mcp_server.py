"""
MCP Server for Agents API

This server exposes all agents as MCP tools, allowing standardized access
to the agent capabilities via the Model Context Protocol.
"""

import os
import logging
# from typing import Any  # Removed unused import
from mcp.server import MCPServer
from mcp.server.models import InitializationOptions

# Import all MCP tools
from mcp_tools.spec_tool import generate_spec
from mcp_tools.planner_tool import generate_plan
from mcp_tools.codegen_tool import generate_code
from mcp_tools.infra_tool import generate_infra
from mcp_tools.test_tool import run_tests
from mcp_tools.review_tool import review_code
from mcp_tools.ops_tool import deploy_ops

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AgentsMCPServer(MCPServer):
    """
    MCP Server that exposes all agents as tools.

    This server provides standardized access to:
    - generate_spec: Generate project specifications
    - generate_plan: Generate project plans
    - generate_code: Generate code in various languages
    - generate_infra: Generate infrastructure as code
    - run_tests: Generate test code
    - review_code: Review code and provide feedback
    - deploy_ops: Generate deployment and operations plans
    """

    def __init__(self):
        super().__init__(
            name="agents-api-mcp-server",
            version="1.0.0"
        )

        # Register all tools
        self.register_tool(generate_spec)
        self.register_tool(generate_plan)
        self.register_tool(generate_code)
        self.register_tool(generate_infra)
        self.register_tool(run_tests)
        self.register_tool(review_code)
        self.register_tool(deploy_ops)

        logger.info("Agents MCP Server initialized with all tools registered")

    async def initialize(self, options: InitializationOptions) -> None:
        """Initialize the MCP server."""
        logger.info("Initializing Agents MCP Server")
        await super().initialize(options)

    async def shutdown(self) -> None:
        """Shutdown the MCP server."""
        logger.info("Shutting down Agents MCP Server")
        await super().shutdown()


def create_mcp_server() -> AgentsMCPServer:
    """Create and return an MCP server instance."""
    return AgentsMCPServer()


def run_mcp_server(host: str = "localhost", port: int = 5000) -> None:
    """
    Run the MCP server.

    Args:
        host: The host to bind to
        port: The port to bind to
    """
    server = create_mcp_server()

    # Get port from environment or use default
    port = int(os.getenv("MCP_SERVER_PORT", port))
    host = os.getenv("MCP_SERVER_HOST", host)

    logger.info(f"Starting Agents MCP Server on {host}:{port}")

    try:
        server.serve(host=host, port=port)
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
        raise


if __name__ == "__main__":
    run_mcp_server()
