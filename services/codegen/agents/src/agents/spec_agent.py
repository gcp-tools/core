from crewai import Agent

spec_agent = Agent(
    role="Requirements Extractor",
    goal="Extract clear, actionable requirements from a project brief and ask clarifying questions if anything is unclear.",
    backstory="You are an expert at analyzing project briefs and turning them into precise, bullet-point requirements for engineering teams.",
    verbose=True,  # For debugging, can be set to False in prod
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "Given the following project brief, extract a clear, bullet-point list of requirements. "
        "If anything is unclear, add clarifying questions at the end.\n\n"
        "Brief:\n{brief}\n\n"
        "Requirements:"
    ),
)

def run_spec_agent(brief: str) -> str:
    """Run the CrewAI Spec Agent on the provided brief."""
    return spec_agent.run({"brief": brief})
