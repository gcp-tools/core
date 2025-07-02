from fastapi import APIRouter, Request
from pydantic import BaseModel, ValidationError
from agents.infra_agent import run_infra_agent

router = APIRouter()

class InfraAgentInput(BaseModel):
    plan: str

@router.post("/agent/infra")
async def infra_agent_endpoint(request: Request):
    try:
        input_data = await request.json()
        parsed = InfraAgentInput(**input_data)
    except ValidationError as e:
        return {"error": "Invalid input", "details": e.errors()}

    try:
        code = run_infra_agent(parsed.plan)
        return {"iac_code": code}
    except Exception as e:
        return {
            "iac_code": "# [ERROR] Could not generate IaC code.",
            "error": str(e),
        }
