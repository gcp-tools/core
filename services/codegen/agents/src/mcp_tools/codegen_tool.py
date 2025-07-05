from typing import Any, Literal
from mcp.server import tool
from agents.codegen_typescript_agent import run_ts_codegen_agent
from agents.codegen_python_agent import run_python_codegen_agent
from agents.codegen_rust_agent import run_rust_codegen_agent
from agents.codegen_react_agent import run_react_codegen_agent


@tool("generate_code")
def generate_code(
    plan: str,
    language: Literal["typescript", "python", "rust", "react"] = "typescript"
) -> dict[str, Any]:
    """
    Generate code based on a project plan for the specified language.

    Args:
        plan: The project plan to generate code from
        language: The programming language to generate code for

    Returns:
        A dictionary containing the generated code
    """
    try:
        if language == "typescript":
            code = run_ts_codegen_agent(plan)
        elif language == "python":
            code = run_python_codegen_agent(plan)
        elif language == "rust":
            code = run_rust_codegen_agent(plan)
        elif language == "react":
            code = run_react_codegen_agent(plan)
        else:
            return {
                "code": f"Error: Unsupported language: {language}",
                "status": "error",
                "error": f"Unsupported language: {language}"
            }

        return {
            "code": code,
            "language": language,
            "status": "success"
        }
    except Exception as e:
        return {
            "code": f"Error: Could not generate {language} code from plan.",
            "language": language,
            "status": "error",
            "error": str(e)
        }
