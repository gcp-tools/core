from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn
from agents import PlannerAgent, AdvancedPlannerAgent, AdvancedCodegenAgent, AdvancedInfraAgent, AdvancedTestAgent, AdvancedReviewerAgent, AdvancedOpsAgent
from handlers.spec_handler import router as spec_router
from handlers.planner_handler import router as planner_router
from handlers.codegen_handler import router as codegen_router
from handlers.infra_handler import router as infra_router
from handlers.test_handler import router as test_router
from handlers.review_handler import router as review_router
from handlers.ops_handler import router as ops_router

app = FastAPI(title="CrewAI Agent API")

# Include the /agent/spec, /agent/plan, /agent/codegen, /agent/infra, /agent/test, /agent/review, and /agent/ops endpoints from the new handlers
app.include_router(spec_router)
app.include_router(planner_router)
app.include_router(codegen_router)
app.include_router(infra_router)
app.include_router(test_router)
app.include_router(review_router)
app.include_router(ops_router)

@app.post("/codegen")
async def codegen_endpoint(request: Request):
    data = await request.json()
    agent = AdvancedCodegenAgent()
    result = agent.run(data)
    return JSONResponse(result)

@app.post("/test", tags=["agents"])
async def run_test_agent(request: Request):
    """Run the Test Agent. Accepts infra/codegen artifact, returns test artifact."""
    input_data = await request.json()
    agent = AdvancedTestAgent()
    result = agent.run(input_data)
    return result

@app.post("/infra", tags=["agents"])
async def run_infra_agent(request: Request):
    """Run the Infra Agent. Accepts plan/codegen artifact, returns infra artifact."""
    input_data = await request.json()
    agent = AdvancedInfraAgent()
    result = agent.run(input_data)
    return JSONResponse(result)

@app.post("/review")
async def review_endpoint(request: Request):
    data = await request.json()
    agent = AdvancedReviewerAgent()
    result = agent.run(data)
    return JSONResponse(result)

@app.post("/ops")
async def ops_endpoint(request: Request):
    data = await request.json()
    agent = AdvancedOpsAgent()
    result = agent.run(data)
    return JSONResponse(result)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
