# services/orchestrator

This directory contains the TypeScript Temporal workflow/orchestrator logic.

- Implements the main workflow, activities, and state management using Temporal's TypeScript SDK.
- Orchestrates the overall process, including human-in-the-loop gates.
- Invokes Python CrewAI agents via HTTP/gRPC API or subprocess.
- Handles artifact passing, error handling, and integration with GitHub/IaC as needed. 