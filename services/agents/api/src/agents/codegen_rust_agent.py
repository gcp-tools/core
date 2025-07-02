from crewai import Agent

rust_codegen_agent = Agent(
    role="Rust Backend Codegen Agent",
    goal="Generate robust, idiomatic Rust backend code for cloud-native services based on the provided plan section.",
    backstory="You are an expert Rust backend engineer, skilled at building high-performance APIs and services for GCP.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "Given the following plan section, generate Rust backend code. "
        "Output only the code, with clear file structure and comments.\n\n"
        "Plan Section:\n{plan}\n\n"
        "Code:"
    ),
)

def run_rust_codegen_agent(plan: str) -> str:
    """Run the CrewAI Rust Codegen Agent on the provided plan section."""
    return rust_codegen_agent.run({"plan": plan})
