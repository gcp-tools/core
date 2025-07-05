from crewai import Agent

planner_agent = Agent(
    role="Project Planner",
    goal="Transform requirements into a detailed, actionable project plan, mapping requirements to services, stacks, and technologies.",
    backstory="You are an expert at breaking down requirements into concrete plans for cloud and software projects.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "Given the following requirements, produce a detailed project plan. "
        "Map each requirement to a service, stack, or technology as appropriate. "
        "If anything is unclear, add clarifying questions at the end.\n\n"
        "Requirements:\n{requirements}\n\n"
        "Plan:"
    ),
)

def run_planner_agent(requirements: str) -> str:
    """Run the CrewAI Planner Agent on the provided requirements."""
    return planner_agent.run({"requirements": requirements})
