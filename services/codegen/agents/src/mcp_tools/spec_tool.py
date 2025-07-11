from agents.spec_agent import run_spec_agent, Message
from typing import List

async def generate_spec(messages: List[Message]):
    try:
        data = run_spec_agent(messages)
        print('data', data)
        return {"data": data}
    except Exception as e:
        return {"data": "", "error": str(e)}
