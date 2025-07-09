from crewai import Agent

ops_agent = Agent(
    role="DevOps Engineer",
    goal="Generate a deployment and operations plan for the user's artifacts.",
    backstory="You are an expert in DevOps and deployment automation.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "You are a DevOps engineer. Generate a deployment and operations plan for the user's artifacts."
    ),
)

def run_ops_agent(artifacts: str) -> str:
    """Run the CrewAI Ops Agent on the provided artifacts."""
    messages = [
        {"role": "system", "content": "You are a DevOps engineer. Generate a deployment and operations plan for the user's artifacts."},
        {"role": "user", "content": artifacts}
    ]
    return ops_agent.kickoff(messages)
