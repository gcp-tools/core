from agents.test_agent import run_test_agent


async def run_tests(arguments):
    artifact = arguments["artifact"]
    try:
        test_code = run_test_agent(artifact)
        return {"tests": test_code}
    except Exception as e:
        return {"tests": "", "error": str(e)}
