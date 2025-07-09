from crewai import Agent

python_codegen_agent = Agent(
    role="Python Code Generator",
    goal="Write clean, idiomatic Python code for the user's project plan.",
    backstory="You are an expert Python developer.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "You are a Python code generator. Write clean, idiomatic Python code for the user's project plan."
    ),
)

def run_python_codegen_agent(plan: str) -> str:
    """Run the CrewAI Python Codegen Agent on the provided plan section."""
    messages = [
        {"role": "system", "content": "You are a Python code generator. Write clean, idiomatic Python code for the user's plan."},
        {"role": "user", "content": plan}
    ]
    return python_codegen_agent.kickoff(messages)
