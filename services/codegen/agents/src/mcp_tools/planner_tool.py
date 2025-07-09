from agents.planner_agent import run_planner_agent


async def generate_plan(arguments):
    requirements = arguments["requirements"]
    try:
        plan = run_planner_agent(requirements)
        return {"plan": plan}
    except Exception as e:
        return {"plan": "", "error": str(e)}
