from crewai import Agent

infra_agent = Agent(
    role="Infrastructure as Code Agent",
    goal="Generate secure, production-ready Terraform/CDKTF code for GCP infrastructure based on the provided plan section.",
    backstory="You are an expert cloud infrastructure engineer, skilled at translating plans into robust, maintainable IaC for GCP.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "Given the following plan section, generate Terraform/CDKTF code for GCP infrastructure. "
        "Output only the code, with clear file structure and comments.\n\n"
        "Plan Section:\n{plan}\n\n"
        "IaC Code:"
    ),
)

def run_infra_agent(plan: str) -> str:
    """Run the CrewAI Infra Agent on the provided plan section."""
    return infra_agent.run({"plan": plan})
