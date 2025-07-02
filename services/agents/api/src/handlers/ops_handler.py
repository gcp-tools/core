from fastapi import APIRouter, Request
from pydantic import BaseModel, ValidationError
from agents.ops_agent import run_ops_agent

router = APIRouter()

class OpsAgentInput(BaseModel):
    artifacts: str

@router.post("/agent/ops")
async def ops_agent_endpoint(request: Request):
    try:
        input_data = await request.json()
        parsed = OpsAgentInput(**input_data)
    except ValidationError as e:
        return {"error": "Invalid input", "details": e.errors()}

    try:
        plan = run_ops_agent(parsed.artifacts)
        return {"ops_plan": plan}
    except Exception as e:
        return {
            "ops_plan": "# [ERROR] Could not generate ops plan.",
            "error": str(e),
        }
