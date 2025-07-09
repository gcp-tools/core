from fastmcp import FastMCP
from mcp_tools.spec_tool import generate_spec
from mcp_tools.planner_tool import generate_plan
from mcp_tools.codegen_tool import generate_code
from mcp_tools.infra_tool import generate_infra
from mcp_tools.test_tool import run_tests
from mcp_tools.review_tool import review_code
from mcp_tools.ops_tool import deploy_ops

mcp = FastMCP("Agents MCP Server")

mcp.tool(generate_spec)
mcp.tool(generate_plan)
mcp.tool(generate_code)
mcp.tool(generate_infra)
mcp.tool(run_tests)
mcp.tool(review_code)
mcp.tool(deploy_ops)

if __name__ == "__main__":
    mcp.run(transport="http", host="0.0.0.0", port=8080, path="/mcp")
