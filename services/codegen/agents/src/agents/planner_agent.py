from crewai import Agent
from pydantic import BaseModel, ValidationError
from typing import List
import json

"""
Planner Agent: Generates a detailed project plan from requirements and conversation history.

Accepts conversation history in format:
[
  { "role": "user", "content": "I want to build a task app" },
  { "role": "agent", "content": "Here are the requirements: auth, tasks, UI" },
  { "role": "user", "content": "Perfect, now create a plan" }
]

Outputs:
{
  "plan": ["Step 1", "Step 2", "Step 3"]
}
"""

# Simple message format for conversation
class Message(BaseModel):
    role: str
    content: str

# Simple output model - just the plan
class PlanOutput(BaseModel):
    plan: List[str]

planner_agent = Agent(
    role="Project Planner",
    goal="Generate a detailed, actionable project plan from the user's requirements and conversation history.",
    backstory="You are an expert project planner with years of experience breaking down complex projects into actionable steps.",
    verbose=True,  # For debugging, can be set to False in prod
    max_iter=3,
    respect_context_window=True,
    response_format=PlanOutput,
    prompt_template=(
        "You are a project planner. Generate a detailed, actionable project plan from the conversation history. "
        "Output your response as a valid JSON object with the following structure:\n\n"
        "{\n"
        "  \"plan\": [\n"
        "    \"Step 1: Set up the development environment\",\n"
        "    \"Step 2: Create the database schema\",\n"
        "    \"Step 3: Build the authentication system\"\n"
        "  ]\n"
        "}\n\n"
        "Each step should be specific and actionable. Only output the JSON object, with no extra text."
    ),
)

def run_planner_agent(messages: List[Message]) -> PlanOutput:
    """Run the CrewAI Planner Agent on the provided conversation history. Returns a simple PlanOutput object."""
    system_prompt = {
        "role": "system",
        "content": (
            "You are a project planner. Generate a detailed, actionable project plan from the conversation history. "
            "Output your response as a valid JSON object with the following structure:\n\n"
            "{\n"
            "  \"plan\": [\n"
            "    \"Step 1: Set up the development environment\",\n"
            "    \"Step 2: Create the database schema\",\n"
            "    \"Step 3: Build the authentication system\"\n"
            "  ]\n"
            "}\n\n"
            "Each step should be specific and actionable. Only output the JSON object, with no extra text."
        ),
    }

    # Convert messages to format expected by CrewAI
    conversation_messages = [system_prompt] + [msg.model_dump() for msg in messages]

    raw_output = planner_agent.kickoff(conversation_messages)
    print('raw_output', raw_output)

    try:
        # Parse the output directly into PlanOutput format
        output_dict = json.loads(raw_output.raw)
        plan_output = PlanOutput.model_validate(output_dict)
        return plan_output

    except (json.JSONDecodeError, ValidationError) as e:
        raise ValueError(f"Agent output did not match expected schema: {e}")
