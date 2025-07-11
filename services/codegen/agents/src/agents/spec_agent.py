from crewai import Agent
from pydantic import BaseModel, ValidationError
from typing import List, Literal
import json

"""
Spec Agent: Extracts requirements from a project brief and outputs them as a JSON object with the following structure:

{
  "requirements": [
    "Requirement 1",
    "Requirement 2"
  ],
  "clarifying_questions": [
    "Question 1",
    "Question 2"
  ]
}

Message format:
class Message(BaseModel):
    role: Literal['agent', 'user']
    content: str

If there are no clarifying questions, return an empty list for "clarifying_questions".
"""

class Message(BaseModel):
    role: Literal['agent', 'user']
    content: str

class SpecAgentOutput(BaseModel):
    requirements: List[str]
    clarifying_questions: List[str]


spec_agent = Agent(
    role="Requirements Extractor",
    goal="Extract clear, actionable requirements from a project brief and ask clarifying questions if anything is unclear.",
    backstory="You are an expert at analyzing project briefs and turning them into precise, bullet-point requirements for engineering teams.",
    verbose=True,  # For debugging, can be set to False in prod
    max_iter=3,
    respect_context_window=True,
    response_format=SpecAgentOutput,
    prompt_template=(
        "You are a requirements engineer. Extract clear, actionable requirements from the user's project brief. "
        "Output your response as a valid JSON object with the following structure:\n\n"
        "{\n"
        "  \"requirements\": [\n"
        "    \"Requirement 1\",\n"
        "    \"Requirement 2\"\n"
        "  ],\n"
        "  \"clarifying_questions\": [\n"
        "    \"Question 1\",\n"
        "    \"Question 2\"\n"
        "  ]\n"
        "}\n\n"
        "If there are no clarifying questions, return an empty list for 'clarifying_questions'. "
        "Only output the JSON object, with no extra text."
    ),
)

def run_spec_agent(messages: List[Message]) -> str:
    """Run the CrewAI Spec Agent on the provided messages. Prepends the system prompt as the first message. Output is validated as a SpecAgentOutput object. Messages must use role 'agent' or 'user'."""
    system_prompt = {
        "role": "system",
        "content": (
            "You are a requirements engineer. Extract clear, actionable requirements from the user's project brief. Output your response as a valid JSON object with the following structure:\n\n"
            "{\n  \"requirements\": [\n    \"Requirement 1\",\n    \"Requirement 2\"\n  ],\n  \"clarifying_questions\": [\n    \"Question 1\",\n    \"Question 2\"\n  ]\n}\n\n"
            "If there are no clarifying questions, return an empty list for 'clarifying_questions'. Only output the JSON object, with no extra text."
        ),
    }
    full_messages = [system_prompt] + [m.model_dump() for m in messages]
    raw_output = spec_agent.kickoff(full_messages)
    print('raw_output', raw_output)
    try:
        output_dict = json.loads(raw_output.raw)
        return output_dict
    except (json.JSONDecodeError, ValidationError) as e:
        raise ValueError(f"Agent output did not match expected schema: {e}")



