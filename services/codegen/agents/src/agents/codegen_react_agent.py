from crewai import Agent

react_codegen_agent = Agent(
    role="React Code Generator",
    goal="Write clean, idiomatic React code for the user's project plan.",
    backstory="You are an expert React developer.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "You are a React code generator. Write clean, idiomatic React code for the user's project plan."
    ),
)

def run_react_codegen_agent(plan: str) -> str:
    """Run the CrewAI React Codegen Agent on the provided plan section."""
    messages = [
        {"role": "system", "content": "You are a React code generator. Write clean, idiomatic React code for the user's plan."},
        {"role": "user", "content": plan}
    ]
    return react_codegen_agent.kickoff(messages)
