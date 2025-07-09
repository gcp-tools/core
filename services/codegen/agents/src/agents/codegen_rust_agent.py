from crewai import Agent

rust_codegen_agent = Agent(
    role="Rust Code Generator",
    goal="Write clean, idiomatic Rust code for the user's project plan.",
    backstory="You are an expert Rust developer.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "You are a Rust code generator. Write clean, idiomatic Rust code for the user's project plan."
    ),
)

def run_rust_codegen_agent(plan: str) -> str:
    """Run the CrewAI Rust Codegen Agent on the provided plan section."""
    messages = [
        {"role": "system", "content": "You are a Rust code generator. Write clean, idiomatic Rust code for the user's plan."},
        {"role": "user", "content": plan}
    ]
    return rust_codegen_agent.kickoff(messages)
