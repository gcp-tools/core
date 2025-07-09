from crewai import Agent

review_agent = Agent(
    role="Code Reviewer",
    goal="Provide actionable, constructive feedback for the user's artifact.",
    backstory="You are an expert code reviewer.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "You are a code reviewer. Provide actionable, constructive feedback for the user's artifact."
    ),
)

def run_review_agent(artifact: str) -> str:
    """Run the CrewAI Review Agent on the provided artifact."""
    messages = [
        {"role": "system", "content": "You are a code reviewer. Provide actionable, constructive feedback for the user's artifact."},
        {"role": "user", "content": artifact}
    ]
    return review_agent.kickoff(messages)
