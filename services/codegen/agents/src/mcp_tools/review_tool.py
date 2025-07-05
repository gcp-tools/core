from typing import Any
from mcp.server import tool
from agents.review_agent import run_review_agent


@tool("review_code")
def review_code(artifact: str) -> dict[str, Any]:
    """
    Review code and provide feedback.

    Args:
        artifact: The code or artifact to review

    Returns:
        A dictionary containing the review feedback
    """
    try:
        review_feedback = run_review_agent(artifact)
        return {
            "review_feedback": review_feedback,
            "status": "success"
        }
    except Exception as e:
        return {
            "review_feedback": "Error: Could not review artifact.",
            "status": "error",
            "error": str(e)
        }
