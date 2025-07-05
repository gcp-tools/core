from typing import Any
from mcp.server import tool
from agents.infra_agent import run_infra_agent


@tool("generate_infra")
def generate_infra(plan: str) -> dict[str, Any]:
    """
    Generate infrastructure as code based on a project plan.

    Args:
        plan: The project plan to generate infrastructure from

    Returns:
        A dictionary containing the generated infrastructure code
    """
    try:
        iac_code = run_infra_agent(plan)
        return {
            "iac_code": iac_code,
            "status": "success"
        }
    except Exception as e:
        return {
            "iac_code": "Error: Could not generate infrastructure code from plan.",
            "status": "error",
            "error": str(e)
        }
