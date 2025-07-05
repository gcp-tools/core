from crewai import Agent

ops_agent = Agent(
    role="Ops Agent",
    goal="Generate CI/CD and operational plans or scripts for cloud-native projects based on the provided artifacts (plan, code, infra, test, review).",
    backstory="You are an expert in DevOps and cloud operations, skilled at automating deployment, monitoring, and operational tasks for GCP projects.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "Given the following project artifacts (plan, code, infra, test, review), generate a CI/CD pipeline or operational plan. "
        "Output only the scripts or configuration, with clear file structure and comments.\n\n"
        "Artifacts:\n{artifacts}\n\n"
        "Ops Plan:"
    ),
)

def run_ops_agent(artifacts: str) -> str:
    """Run the CrewAI Ops Agent on the provided artifacts."""
    return ops_agent.run({"artifacts": artifacts})
