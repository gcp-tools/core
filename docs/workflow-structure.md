# Workflow Structure

## Overview
This document describes the structure of the hybrid workflow: Temporal (TypeScript) orchestrates the process, and CrewAI (Python) agents perform LLM-powered tasks. Artifacts and data are passed via JSON, files, or API calls between the orchestrator and agents.

---

## Hybrid Workflow Activities
- **Temporal (TypeScript)** orchestrates the workflow, manages state, and handles human-in-the-loop logic.
- **CrewAI (Python)** implements planning, codegen, review, and other LLM-powered agents.
- **Invocation:**
  - Temporal activities invoke Python agents via HTTP API, gRPC, or subprocess.
  - Inputs/outputs are passed as JSON or files.
- **Artifact Passing:**
  - Artifacts (plans, code, reviews) are written to disk or passed as file paths.
  - All cross-language data is JSON-serializable.
- **Error Handling:**
  - Python agents return structured error responses (JSON) on failure.
  - Temporal workflow handles retries, error reporting, and human intervention as needed.

---

## Example Activity Flow
1. Temporal activity prepares input JSON and calls Python agent (e.g., via HTTP POST).
2. Python agent processes the request, writes artifacts, and returns result JSON (with file paths or inline data).
3. Temporal workflow reads outputs, updates state, and proceeds to next activity.

---

## Workflow Activities
- **Spec Extraction**: Spec Agent reads `docs/brief.md`, outputs `docs/requirements.md`.
- **Planning**: Planner Agent reads `docs/requirements.md`, outputs `docs/plan.md`.
  - Must map requirements to specific stacks/services in the iac/ and services/ structure.
  - **Technology Selection:** Planner Agent must recommend a technology for each service/component (e.g., TypeScript, Python, Rust, React) based on the brief, requirements, and best-fit analysis. This mapping is included in the plan.
  - Technology selection can be manual (specified in the brief), automated (LLM-based reasoning), or human-approved at the plan approval stage.
- **Human Approval (Plan)**: Workflow pauses for human review of `docs/plan.md`.
- **Code Generation**: For each service/component, the process runner reads the plan, selects the correct codegen agent based on the technology mapping, and dispatches codegen to that agent. Code is output to the correct `services/service-x/component/` subfolder(s).
- **Testing**: Test Agent runs tests in all relevant service/component folders, outputs `docs/test-results.md`.
- **Infra Generation**: Infra Agent reads `docs/plan.md`, outputs IaC to the correct `iac/app/stacks/stack-x/` or other iac/ subfolders.
- **Review**: Reviewer Agent reviews all artifacts, outputs `docs/review.md`.
  - Checks that all code and infra are in the correct folders and follow the required structure.
- **Human Approval (Review)**: Workflow pauses for human review of `docs/review.md`.
- **Deployment**: Ops Agent pushes to GitHub, monitors CI/CD, outputs `docs/deployment-status.md`.

---

## Signals & Pauses
- **Human Approval Signals**: Workflow waits for explicit signal (file edit, CLI, or API call) before resuming after plan/review.
- **Error/Feedback Signals**: Agents can signal workflow to pause and await human or upstream agent intervention if blocked.

---

## Artifact Passing
- Artifacts are always written to the correct subfolders in the iac/ and services/ structure.
- Each activity reads the required input artifact(s) and writes its output artifact(s) in the correct location.
- Artifacts are versioned in GitHub for traceability.
- Multi-service/multi-stack workflows are supported by splitting artifacts as needed.

---

## Resuming Workflow
- Workflow resumes automatically when approval or required artifact is present.
- Temporal ensures durability and auditability of all steps and signals. 