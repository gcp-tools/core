# Design Decisions

## Overview
This document records the rationale for key technology and architecture choices in the cp-tools-agents platform. It serves as an audit trail for future contributors and stakeholders.

---

## Technology Choices

### Temporal (Workflow Orchestration)
- Chosen for: Durable, reliable, and auditable orchestration of complex, multi-step workflows.
- Alternatives considered: Airflow, Argo, Step Functions, custom orchestrator.
- Rationale: Temporal supports human-in-the-loop, retries, and long-running processes. It is cloud-agnostic and has strong TypeScript/Node.js support.

### CrewAI (Agent Framework)
- Chosen for: Modern, multi-agent LLM orchestration with clear agent/task abstractions.
- Alternatives considered: smol-ai, custom agent scripts, LangChain (for Python).
- Rationale: CrewAI is actively developed, supports TypeScript, and is designed for collaborative agent workflows.

### gcp-tools-cdktf (Infrastructure as Code)
- Chosen for: Battle-tested, opinionated IaC patterns for GCP, with multi-project support and reusable constructs.
- Alternatives considered: Raw Terraform, Pulumi, Google Cloud Deployment Manager.
- Rationale: gcp-tools-cdktf enforces best practices, supports modularity, and integrates with the rest of the GCP tools ecosystem.

### gcp-tools-mcp (Project Bootstrap & Helper)
- Chosen for: Automated GCP project setup, secret management, and integration with GitHub.
- Rationale: Reduces manual toil, ensures consistency, and provides helper tools for CDKTF workflows.

### GitHub (Artifact Storage & CI/CD)
- Chosen for: Source of truth for code, IaC, and documentation. Triggers CI/CD pipelines and stores workflow artifacts.
- Rationale: Ubiquitous, integrates with GCP and Temporal, supports branch protection and audit trails.

---

## Architectural Patterns
- **Multi-project GCP architecture** for separation of concerns and security.
- **Human-in-the-loop gates** for critical approvals and feedback.
- **Artifact-driven workflow**: All outputs are versioned and auditable in GitHub.
- **Automated quality gates**: Lint, test, and review enforced by agents and CI/CD.

---

## Project Structure Constraint
- The required directory structure for iac/ and services/ (see Infrastructure Patterns) is a core architectural constraint.
- All planning, codegen, and infra agents must generate artifacts in the correct subfolders, splitting functionality into bounded contexts/stacks/services as appropriate.
- This ensures maintainability, clarity, and alignment with gcp-tools-cdktf best practices.

---

## Trade-offs & Open Questions
- Some agent/LLM frameworks are still evolving; CrewAI chosen for its balance of features and stability.
- Notification and secret management strategies may evolve as requirements become clearer.
- Human-in-the-loop UX and feedback channels are to be refined during prototyping.

---

## Hybrid Orchestration and Agent Architecture
- **Temporal (TypeScript)** will be used for workflow orchestration, state management, and human-in-the-loop logic.
- **CrewAI (Python)** will be used for all LLM-powered agent logic (planning, codegen, review, etc.).
- **Rationale:**
  - Temporal's TypeScript SDK is robust and integrates well with GCP and modern CI/CD.
  - CrewAI's Python implementation is significantly more mature, feature-rich, and better supported than the TypeScript version.
  - This hybrid approach allows leveraging the best of both ecosystems.
- **Integration:**
  - Temporal activities (TypeScript) will call CrewAI agents (Python) via local HTTP/gRPC API, subprocess, or container interface.
  - Artifacts and data will be passed via files, APIs, or message queues as needed.
- **Implications:**
  - Requires local Python runtime for agent execution.
  - Enables future migration to distributed/microservice architecture if needed.

---

## LLM Connectivity and Provider Support
- **CrewAI (Python) does not run its own LLMs.** It orchestrates agent logic and sends prompts to LLM APIs or local LLM servers.
- **Supported LLMs:**
  - **OpenAI (GPT-3.5, GPT-4, etc.):** Use your OpenAI API key and specify the model name.
  - **Anthropic (Claude):** Use your Anthropic API key.
  - **Google Gemini, Cohere, etc.:** If supported by CrewAI or your code, configure with the appropriate API key.
  - **Local LLMs (Ollama, LM Studio, Hugging Face, etc.):** Run a local LLM server and configure CrewAI to send requests to its API endpoint.
- **Configuration Example (Python):**
  ```python
  import os
  from crewai import Agent

  os.environ['OPENAI_API_KEY'] = 'sk-...'

  agent = Agent(
      name='Codegen Agent',
      instructions='Write Python code.',
      llm_provider='openai',  # or 'anthropic', 'ollama', etc.
      model='gpt-4',          # or 'gpt-3.5-turbo', etc.
  )
  ```
- **Cursor LLMs:**
  - CrewAI cannot use the LLMs built into Cursor (the IDE), as they are not exposed as a public API.
- **Summary Table:**

  | LLM Source         | Can CrewAI Use? | How to Connect                |
  |--------------------|-----------------|-------------------------------|
  | OpenAI (GPT-4/3.5) | Yes             | API key, model name           |
  | Anthropic (Claude) | Yes             | API key, model name           |
  | Local LLM (Ollama) | Yes             | Point to local API endpoint   |
  | Hugging Face Hub   | Yes (if supported) | API key, endpoint           |
  | Cursor LLM         | No              | Not exposed as public API     |

- **Best Practice:**
  - For local development, use your own OpenAI/Anthropic key, or run a local LLM server (like Ollama) and configure CrewAI to use it. 