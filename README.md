# gcp-tools-agents

This repository is part of the **GCP Tools Automation Platform**, a multi-agent, multi-language system for automating Google Cloud Platform (GCP) infrastructure and application workflows.

## Purpose

gcp-tools-agents provides the **agent APIs** and logic for the platform. It is designed to work alongside the `gcp-tools-mcp` orchestrator, enabling advanced, developer-centric automation for GCP projects using a hybrid architecture:

- **CrewAI (Python)**: Implements agent logic, LLM-driven reasoning, and workflow steps.
- **APIs**: Exposes agent endpoints (e.g., Spec, Planner, Codegen, Infra, Test, Reviewer, Ops) for orchestration and integration.
- **Artifact Management**: Handles workflow artifacts (plans, specs, code, infra, test results, reviews, ops actions) in per-workflow directories.

## Key Directories

- `services/agents/api/` — Python FastAPI app exposing agent endpoints
- `services/agents/api/artifacts/` — Generated workflow artifacts (plans, specs, code, etc.)
- `services/orchestrator/api/artifacts/` — Orchestrator-side workflow artifacts

## How It Fits

- **gcp-tools-agents**: Handles agent logic, LLM calls, and artifact generation
- **gcp-tools-mcp**: Orchestrates workflows, coordinates agents, and manages end-to-end automation

This separation enables scalable, language-agnostic, and extensible automation for GCP infrastructure and application delivery.

---

For more details, see the platform documentation or the `gcp-tools-mcp` repository. 
