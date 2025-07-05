"""
Agents API - MCP Server

This service exposes all agents as MCP (Model Context Protocol) tools,
providing standardized access to agent capabilities.
"""

import os
from mcp_server import run_mcp_server
from dotenv import load_dotenv

load_dotenv()

def main():
    """Start the MCP server."""
    # Get MCP server configuration from environment
    mcp_host = os.getenv("MCP_SERVER_HOST", "localhost")
    mcp_port = int(os.getenv("MCP_SERVER_PORT", 5000))

    print(f"Starting Agents MCP Server on {mcp_host}:{mcp_port}")
    print("Available tools:")
    print("- generate_spec: Generate project specifications")
    print("- generate_plan: Generate project plans")
    print("- generate_code: Generate code in various languages")
    print("- generate_infra: Generate infrastructure as code")
    print("- run_tests: Generate test code")
    print("- review_code: Review code and provide feedback")
    print("- deploy_ops: Generate deployment and operations plans")
    print("\nPress Ctrl+C to stop the server")

    try:
        run_mcp_server(host=mcp_host, port=mcp_port)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Server error: {e}")
        raise

if __name__ == "__main__":
    main()
