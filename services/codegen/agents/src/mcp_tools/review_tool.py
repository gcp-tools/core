from agents.review_agent import run_review_agent


async def review_code(arguments):
    artifact = arguments["artifact"]
    try:
        review_feedback = run_review_agent(artifact)
        return {"review": review_feedback}
    except Exception as e:
        return {"review": "", "error": str(e)}
