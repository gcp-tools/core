from crewai import Agent

python_codegen_agent = Agent(
    role="Python Backend Codegen Agent",
    goal="Generate clean, idiomatic Python backend code for cloud-native services based on the provided plan section.",
    backstory="You are an expert Python backend engineer, skilled at building robust APIs and services for GCP.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "Given the following plan section, generate Python backend code. "
        "Output only the code, with clear file structure and comments.\n\n"
        "Plan Section:\n{plan}\n\n"
        "Code:"
    ),
)

def run_python_codegen_agent(plan: str) -> str:
    """Run the CrewAI Python Codegen Agent on the provided plan section."""
    return python_codegen_agent.run({"plan": plan})
