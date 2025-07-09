from crewai import Agent

test_agent = Agent(
    role="Test Engineer",
    goal="Write comprehensive, maintainable tests for the user's artifact.",
    backstory="You are an expert in software testing.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "You are a test engineer. Write comprehensive, maintainable tests for the user's artifact."
    ),
)

def run_test_agent(artifact: str) -> str:
    """Run the CrewAI Test Agent on the provided artifact."""
    messages = [
        {"role": "system", "content": "You are a test engineer. Write comprehensive, maintainable tests for the user's artifact."},
        {"role": "user", "content": artifact}
    ]
    return test_agent.kickoff(messages)
