from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn
from agents import SpecAgent, PlannerAgent, AdvancedSpecAgent, AdvancedPlannerAgent, AdvancedCodegenAgent, AdvancedInfraAgent, AdvancedTestAgent, AdvancedReviewerAgent, AdvancedOpsAgent

app = FastAPI(title="CrewAI Agent API")

@app.post("/spec")
async def spec_endpoint(request: Request):
    data = await request.json()
    if data.get('advanced'):
        agent = AdvancedSpecAgent()
    else:
        agent = SpecAgent()
    result = agent.run(data)
    return JSONResponse(result)

@app.post("/plan")
async def plan_endpoint(request: Request):
    data = await request.json()
    if data.get('advanced'):
        agent = AdvancedPlannerAgent()
    else:
        agent = PlannerAgent()
    result = agent.run(data)
    return JSONResponse(result)

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
