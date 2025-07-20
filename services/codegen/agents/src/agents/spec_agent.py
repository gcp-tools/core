from crewai import Agent
from pydantic import BaseModel, ValidationError
from typing import List
import json

"""
Spec Agent: Extracts requirements from a project brief and outputs them as a simple JSON object.

Accepts conversation history in format:
[
  { "role": "user", "content": "Make me some stuff?" },
  { "role": "agent", "content": "What type of app? What features?" },
  { "role": "user", "content": "Web app with user auth and tasks" }
]

Outputs:
{
  "requirements": ["Requirement 1", "Requirement 2"],
  "questions": ["Question 1", "Question 2"]
}

If there are no clarifying questions, return an empty array for questions.
"""

# Simple message format for conversation
class Message(BaseModel):
    role: str
    content: str

# Simple output model - no optionals, no nested complexity
class SpecOutput(BaseModel):
    requirements: List[str]
    questions: List[str]

spec_agent = Agent(
    role="Requirements Extractor",
    goal="Extract clear, actionable requirements from a project brief and ask clarifying questions if anything is unclear.",
    backstory="You are an expert at analyzing project briefs and turning them into precise, bullet-point requirements for engineering teams.",
    verbose=True,  # For debugging, can be set to False in prod
    max_iter=3,
    respect_context_window=True,
    response_format=SpecOutput,
    prompt_template=(
        "You are a requirements engineer. Extract clear, actionable requirements from the conversation history. "
        "Output your response as a valid JSON object with the following structure:\n\n"
        "{\n"
        "  \"requirements\": [\n"
        "    \"Requirement 1\",\n"
        "    \"Requirement 2\"\n"
        "  ],\n"
        "  \"questions\": [\n"
        "    \"Question 1\",\n"
        "    \"Question 2\"\n"
        "  ]\n"
        "}\n\n"
        "If there are no clarifying questions, return an empty array for 'questions'. "
        "Only output the JSON object, with no extra text."
    ),
)

def run_spec_agent(messages: List[Message]) -> SpecOutput:
    """Run the CrewAI Spec Agent on the provided conversation history. Returns a simple SpecOutput object."""
    system_prompt = {
        "role": "system",
        "content": (
            "You are a requirements engineer. Extract clear, actionable requirements from the conversation history. "
            "Output your response as a valid JSON object with the following structure:\n\n"
            "{\n"
            "  \"requirements\": [\n"
            "    \"Requirement 1\",\n"
            "    \"Requirement 2\"\n"
            "  ],\n"
            "  \"questions\": [\n"
            "    \"Question 1\",\n"
            "    \"Question 2\"\n"
            "  ]\n"
            "}\n\n"
            "If there are no clarifying questions, return an empty array for 'questions'. "
            "Only output the JSON object, with no extra text."
        ),
    }

    # Convert messages to format expected by CrewAI
    conversation_messages = [system_prompt] + [msg.model_dump() for msg in messages]

    raw_output = spec_agent.kickoff(conversation_messages)
    print('raw_output', raw_output)

    try:
        # Parse the output directly into SpecOutput format
        output_dict = json.loads(raw_output.raw)
        spec_output = SpecOutput.model_validate(output_dict)
        return spec_output

    except (json.JSONDecodeError, ValidationError) as e:
        raise ValueError(f"Agent output did not match expected schema: {e}")



