from crewai import Agent

test_agent = Agent(
    role="Test Generation Agent",
    goal="Generate comprehensive, maintainable test cases and test code for cloud-native services based on the provided code or infra artifact.",
    backstory="You are an expert in software testing, skilled at writing robust tests for APIs, infrastructure, and cloud services.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=(
        "Given the following code or infra artifact, generate a suite of test cases and the corresponding test code. "
        "Output only the test code, with clear file structure and comments.\n\n"
        "Artifact:\n{artifact}\n\n"
        "Test Code:"
    ),
)

def run_test_agent(artifact: str) -> str:
    """Run the CrewAI Test Agent on the provided artifact."""
    return test_agent.run({"artifact": artifact})
