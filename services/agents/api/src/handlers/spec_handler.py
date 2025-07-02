from fastapi import APIRouter, Request
from pydantic import BaseModel, ValidationError
from agents.spec_agent import run_spec_agent

router = APIRouter()

class SpecAgentInput(BaseModel):
    brief: str

@router.post("/agent/spec")
async def spec_agent_endpoint(request: Request):
    try:
        input_data = await request.json()
        parsed = SpecAgentInput(**input_data)
    except ValidationError as e:
        return {"error": "Invalid input", "details": e.errors()}

    try:
        result = run_spec_agent(parsed.brief)
        return {"requirements": result}
    except Exception as e:
        return {
            "requirements": "- [ ] Clarification needed: Could not process brief.",
            "clarifications": [str(e)],
        }
