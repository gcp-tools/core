from fastapi import APIRouter, Request
from pydantic import BaseModel, ValidationError
from agents.codegen_typescript_agent import run_ts_codegen_agent
from agents.codegen_python_agent import run_python_codegen_agent
from agents.codegen_rust_agent import run_rust_codegen_agent
from agents.codegen_react_agent import run_react_codegen_agent

router = APIRouter()

class CodegenAgentInput(BaseModel):
    plan: str
    language: str  # 'typescript', 'python', 'rust', 'react'

@router.post("/agent/codegen")
async def codegen_agent_endpoint(request: Request):
    try:
        input_data = await request.json()
        parsed = CodegenAgentInput(**input_data)
    except ValidationError as e:
        return {"error": "Invalid input", "details": e.errors()}

    try:
        if parsed.language == "typescript":
            code = run_ts_codegen_agent(parsed.plan)
        elif parsed.language == "python":
            code = run_python_codegen_agent(parsed.plan)
        elif parsed.language == "rust":
            code = run_rust_codegen_agent(parsed.plan)
        elif parsed.language == "react":
            code = run_react_codegen_agent(parsed.plan)
        else:
            return {"error": f"Unsupported language: {parsed.language}"}
        return {"code": code}
    except Exception as e:
        return {
            "code": "// [ERROR] Could not generate code.",
            "error": str(e),
        }
