# services/agents

This directory contains the Python CrewAI agent API server and all agent logic (planning, codegen, review, etc.).

- Implement the API server using FastAPI or Flask.
- Each agent (planner, codegen, reviewer, etc.) is implemented as a Python module/class.
- Expose endpoints for each agent task (e.g., /plan, /codegen, /review).
- All endpoints accept and return JSON, and write artifacts to disk as needed. 