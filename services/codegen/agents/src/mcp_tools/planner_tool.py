from typing import Any
from mcp.server import tool
from agents.planner_agent import run_planner_agent


@tool("generate_plan")
def generate_plan(requirements: str) -> dict[str, Any]:
    """
    Generate a detailed project plan from requirements.

    Args:
        requirements: Project requirements in text format

    Returns:
        A dictionary containing the generated plan
    """
    try:
        plan = run_planner_agent(requirements)
        return {
            "plan": plan,
            "status": "success"
        }
    except Exception as e:
        return {
            "plan": "Error: Could not generate plan from requirements.",
            "status": "error",
            "error": str(e)
        }
