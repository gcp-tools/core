from crewai import Agent

react_codegen_agent = Agent(
    role="React Frontend Codegen Agent",
    goal="Generate clean, idiomatic React frontend code for cloud-native services based on the provided plan section.",
    backstory="You are an expert React frontend engineer, skilled at building robust, user-friendly UIs for GCP projects.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "Given the following plan section, generate React frontend code. "
        "Output only the code, with clear file structure and comments.\n\n"
        "Plan Section:\n{plan}\n\n"
        "Code:"
    ),
)

def run_react_codegen_agent(plan: str) -> str:
    """Run the CrewAI React Codegen Agent on the provided plan section."""
    return react_codegen_agent.run({"plan": plan})
