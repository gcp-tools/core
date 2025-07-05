from typing import Any
from mcp.server import tool
from agents.ops_agent import run_ops_agent


@tool("deploy_ops")
def deploy_ops(artifacts: str) -> dict[str, Any]:
    """
    Generate deployment and operations plan for artifacts.

    Args:
        artifacts: The artifacts to generate deployment plan for

    Returns:
        A dictionary containing the deployment and operations plan
    """
    try:
        ops_plan = run_ops_agent(artifacts)
        return {
            "ops_plan": ops_plan,
            "status": "success"
        }
    except Exception as e:
        return {
            "ops_plan": "Error: Could not generate deployment plan for artifacts.",
            "status": "error",
            "error": str(e)
        }
