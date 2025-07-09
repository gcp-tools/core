from agents.spec_agent import run_spec_agent

async def generate_spec(arguments):
    project_description = arguments["project_description"]
    try:
        requirements = run_spec_agent(project_description)
        print('requirements', requirements)
        return {"requirements": requirements}
    except Exception as e:
        return {"requirements": "", "error": str(e)}
