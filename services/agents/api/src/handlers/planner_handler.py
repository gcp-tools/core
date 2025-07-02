from fastapi import APIRouter, Request
from pydantic import BaseModel, ValidationError
from agents.planner_agent import run_planner_agent

router = APIRouter()

class PlannerAgentInput(BaseModel):
    requirements: str

@router.post("/agent/plan")
async def planner_agent_endpoint(request: Request):
    try:
        input_data = await request.json()
        parsed = PlannerAgentInput(**input_data)
    except ValidationError as e:
        return {"error": "Invalid input", "details": e.errors()}

    try:
        result = run_planner_agent(parsed.requirements)
        return {"plan": result}
    except Exception as e:
        return {
            "plan": "- [ ] Clarification needed: Could not process requirements.",
            "clarifications": [str(e)],
        }
