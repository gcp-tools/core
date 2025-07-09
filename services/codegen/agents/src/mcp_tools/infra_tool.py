from agents.infra_agent import run_infra_agent


async def generate_infra(arguments):
    plan = arguments["plan"]
    try:
        iac_code = run_infra_agent(plan)
        return {"infra": iac_code}
    except Exception as e:
        return {"infra": "", "error": str(e)}
