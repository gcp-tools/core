from crewai import Agent

infra_agent = Agent(
    role="Infrastructure Architect",
    goal="Generate a clear, production-ready infrastructure plan from a project plan.",
    backstory="You are an expert in cloud and on-premises infrastructure design.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "You are an infrastructure architect. Generate a clear, production-ready infrastructure plan from the user's project plan."
    ),
)

def run_infra_agent(plan: str) -> str:
    """Run the CrewAI Infra Agent on the provided plan section."""
    messages = [
        {"role": "system", "content": "You are an infrastructure architect. Generate a clear, production-ready infrastructure plan from the user's project plan."},
        {"role": "user", "content": plan}
    ]
    return infra_agent.kickoff(messages)
