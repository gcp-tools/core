from typing import Any
from mcp.server import tool
from agents.spec_agent import run_spec_agent


@tool("generate_spec")
def generate_spec(project_description: str) -> dict[str, Any]:
    """
    Generate project specifications from a brief description.

    Args:
        project_description: A brief description of the project requirements

    Returns:
        A dictionary containing the generated requirements
    """
    try:
        requirements = run_spec_agent(project_description)
        return {
            "requirements": requirements,
            "status": "success"
        }
    except Exception as e:
        return {
            "requirements": "- [ ] Clarification needed: Could not process brief.",
            "clarifications": [str(e)],
            "status": "error",
            "error": str(e)
        }
