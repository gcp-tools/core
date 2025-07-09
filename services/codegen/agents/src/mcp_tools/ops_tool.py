from agents.ops_agent import run_ops_agent

async def deploy_ops(arguments):
    artifacts = arguments["artifacts"]
    try:
        ops_plan = run_ops_agent(artifacts)
        return {"ops_plan": ops_plan}
    except Exception as e:
        return {"ops_plan": "", "error": str(e)}
