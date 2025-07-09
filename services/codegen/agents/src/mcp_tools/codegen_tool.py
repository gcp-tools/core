from agents.codegen_typescript_agent import run_ts_codegen_agent
from agents.codegen_python_agent import run_python_codegen_agent
from agents.codegen_rust_agent import run_rust_codegen_agent
from agents.codegen_react_agent import run_react_codegen_agent

async def generate_code(arguments):
    plan = arguments["plan"]
    language = arguments.get("language", "typescript")
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
            return {"code": f"Error: Unsupported language: {language}", "error": f"Unsupported language: {language}"}
        return {"code": code, "language": language}
    except Exception as e:
        return {"code": f"Error: Could not generate {language} code from plan.", "language": language, "error": str(e)}
