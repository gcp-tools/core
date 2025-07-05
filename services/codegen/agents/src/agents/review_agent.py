from crewai import Agent

review_agent = Agent(
    role="Review Agent",
    goal="Review provided artifacts (plan, code, infra, test) and provide actionable, constructive feedback for improvement.",
    backstory="You are an expert reviewer, skilled at identifying issues and suggesting improvements in cloud and software projects.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "Given the following artifact (plan, code, infra, or test), review it for correctness, completeness, and best practices. "
        "Provide actionable feedback and suggestions for improvement.\n\n"
        "Artifact:\n{artifact}\n\n"
        "Review Feedback:"
    ),
)

def run_review_agent(artifact: str) -> str:
    """Run the CrewAI Review Agent on the provided artifact."""
    return review_agent.run({"artifact": artifact})
