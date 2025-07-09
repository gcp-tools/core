from crewai import Agent

spec_agent = Agent(
    role="Requirements Extractor",
    goal="Extract clear, actionable requirements from a project brief and ask clarifying questions if anything is unclear.",
    backstory="You are an expert at analyzing project briefs and turning them into precise, bullet-point requirements for engineering teams.",
    verbose=True,  # For debugging, can be set to False in prod
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "You are a requirements engineer. Extract clear, actionable requirements from the user's project brief. If anything is unclear, add clarifying questions at the end."
    ),
)

def run_spec_agent(brief: str) -> str:
    """Run the CrewAI Spec Agent on the provided brief."""
    messages = [
        {"role": "system", "content": "You are a requirements engineer. Extract clear, actionable requirements from the user's project brief. If anything is unclear, add clarifying questions at the end."},
        {"role": "user", "content": brief}
    ]
    return spec_agent.kickoff(messages)
