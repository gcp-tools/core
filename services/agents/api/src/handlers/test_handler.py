from fastapi import APIRouter, Request
from pydantic import BaseModel, ValidationError
from agents.test_agent import run_test_agent

router = APIRouter()

class TestAgentInput(BaseModel):
    artifact: str

@router.post("/agent/test")
async def test_agent_endpoint(request: Request):
    try:
        input_data = await request.json()
        parsed = TestAgentInput(**input_data)
    except ValidationError as e:
        return {"error": "Invalid input", "details": e.errors()}

    try:
        code = run_test_agent(parsed.artifact)
        return {"test_code": code}
    except Exception as e:
        return {
            "test_code": "# [ERROR] Could not generate test code.",
            "error": str(e),
        }
