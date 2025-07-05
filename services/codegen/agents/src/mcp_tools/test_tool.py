from typing import Any
from mcp.server import tool
from agents.test_agent import run_test_agent


@tool("run_tests")
def run_tests(artifact: str) -> dict[str, Any]:
    """
    Generate test code for a given artifact.

    Args:
        artifact: The code or artifact to generate tests for

    Returns:
        A dictionary containing the generated test code
    """
    try:
        test_code = run_test_agent(artifact)
        return {
            "test_code": test_code,
            "status": "success"
        }
    except Exception as e:
        return {
            "test_code": "Error: Could not generate test code for artifact.",
            "status": "error",
            "error": str(e)
        }
