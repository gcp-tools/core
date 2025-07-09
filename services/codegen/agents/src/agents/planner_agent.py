from crewai import Agent

planner_agent = Agent(
    role="Project Planner",
    goal="Generate a detailed, actionable project plan from the user's requirements.",
    backstory="You are an expert project planner.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "You are a project planner. Generate a detailed, actionable project plan from the user's requirements."
    ),
)

def run_planner_agent(requirements: str) -> str:
    """Run the CrewAI Planner Agent on the provided requirements."""
    messages = [
        {"role": "system", "content": "You are a project planner. Generate a detailed, actionable project plan from the user's requirements."},
        {"role": "user", "content": requirements}
    ]
    return planner_agent.kickoff(messages)
