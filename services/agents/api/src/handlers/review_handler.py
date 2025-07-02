from fastapi import APIRouter, Request
from pydantic import BaseModel, ValidationError
from agents.review_agent import run_review_agent

router = APIRouter()

class ReviewAgentInput(BaseModel):
    artifact: str

@router.post("/agent/review")
async def review_agent_endpoint(request: Request):
    try:
        input_data = await request.json()
        parsed = ReviewAgentInput(**input_data)
    except ValidationError as e:
        return {"error": "Invalid input", "details": e.errors()}

    try:
        feedback = run_review_agent(parsed.artifact)
        return {"review_feedback": feedback}
    except Exception as e:
        return {
            "review_feedback": "# [ERROR] Could not generate review feedback.",
            "error": str(e),
        }
