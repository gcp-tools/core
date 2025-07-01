# Agent Contracts

## Overview
This document defines the API contracts for each agent in the workflow, specifying expected inputs, outputs, error/feedback handling, and example payloads/artifacts. Agents must generate artifacts in the correct iac/ and services/ subfolders, and split functionality into bounded contexts/stacks/services as appropriate.

---

## Hybrid Agent Implementation
- **Codegen, planning, and review agents** are implemented in Python using CrewAI.
- **Temporal workflow and agent registry** are implemented in TypeScript.
- **Invocation:**
  - TypeScript (Temporal) invokes Python agents via HTTP API, gRPC, or subprocess (e.g., CLI or container call).
  - Inputs are passed as JSON or files; outputs are returned as JSON or files.
- **Input/Output Conventions:**
  - All cross-language calls use JSON-serializable payloads.
  - Artifacts (code, plans, reviews) are written to disk or returned as file paths.
  - Errors are returned as structured JSON with error codes/messages.
- **Agent Registry:**
  - In TypeScript, the agent registry dispatches to Python agent endpoints (not in-process functions).

---

## Example Agent Call
```typescript
// TypeScript (Temporal activity)
const response = await fetch('http://localhost:8000/agent/codegen', {
  method: 'POST',
  body: JSON.stringify({ task }),
  headers: { 'Content-Type': 'application/json' },
})
const result = await response.json()
```

---

## Codegen Agents (by Language/Framework)
- **TypeScript Backend Agent**
  - Input: plan section for a TypeScript backend
  - Output: code in `services/service-x/backend-ts/src/`
- **Python Backend Agent**
  - Input: plan section for a Python backend
  - Output: code in `services/service-x/backend-py/src/`
- **Rust Backend Agent**
  - Input: plan section for a Rust backend
  - Output: code in `services/service-x/backend-rs/src/`
- **React Frontend Agent**
  - Input: plan section for a frontend
  - Output: code in `services/service-x/frontend/src/`

---

## Agent Registry and Dispatch
- The process runner (orchestrator) maintains a registry mapping technology/framework to the appropriate codegen agent.
- For each service/component, the runner reads the plan and dispatches codegen to the correct agent.
- Example mapping:
  ```typescript
  const agentRegistry = {
    'typescript-backend': typescriptBackendAgent,
    'python-backend': pythonBackendAgent,
    'rust-backend': rustBackendAgent,
    'react-frontend': reactFrontendAgent,
  };
  ```
- The plan must specify the technology for each service/component so the runner can select the agent.

---

## Example Output Paths
| Service/Component      | Technology   | Codegen Agent           | Output Path                                 |
|----------------------- |------------- |------------------------ |---------------------------------------------|
| Backend (Service A)    | TypeScript   | TypeScript Backend Agent| services/service-a/backend-ts/src/          |
| Backend (Service B)    | Python       | Python Backend Agent    | services/service-b/backend-py/src/          |
| Backend (Service C)    | Rust         | Rust Backend Agent      | services/service-c/backend-rs/src/          |
| Frontend (Any Service) | React        | React Frontend Agent    | services/service-x/frontend/src/            |

---

## 1. Spec Agent
- **Input:** `docs/brief.md` (Markdown)
- **Output:** `docs/requirements.md` (Markdown summary of requirements)
- **Errors/Feedback:** If spec is unclear, outputs `docs/requirements.md` with questions for human clarification.
- **Example Output:**
  ```markdown
  # Requirements
  - Service A: ...
  - Service B: ...
  - [ ] Clarification needed: ...
  ```

---

## 2. Planner Agent
- **Input:** `docs/requirements.md`
- **Output:** `docs/plan.md` (detailed plan)
- **Behavior:** Must map requirements to specific stacks/services in the iac/ and services/ structure. Plan should include a section like:
  ```markdown
  ## Service/Stack Mapping
  - Service A: iac/app/stacks/stack-a, services/service-a/backend
  - Service B: iac/app/stacks/stack-b, services/service-b/agents
  ```
- **Errors/Feedback:** If requirements are incomplete, requests clarification in `docs/plan.md`.

---

## 3. Codegen Agent
- **Input:** `docs/plan.md`
- **Output:**
  - `src/` in the correct `services/service-x/component/` subfolder(s)
  - Test files in the corresponding `tests/` subfolder(s)
- **Behavior:** Must split code into the correct bounded context/service/component folders as per the plan.
- **Errors/Feedback:** If plan is ambiguous, outputs `docs/codegen-feedback.md` with questions or issues.
- **Example Output:**
  - `services/service-a/backend/src/handler.ts`
  - `services/service-b/agents/src/agent.ts`

---

## 4. Test Agent
- **Input:** `src/`, `tests/`
- **Output:** `docs/test-results.md` (test results, coverage)
- **Behavior:** Runs tests in all relevant service/component folders.
- **Errors/Feedback:** If tests fail, outputs failure details in `docs/test-results.md`.

---

## 5. Infra Agent
- **Input:** `docs/plan.md`
- **Output:**
  - CDKTF code in the correct `iac/app/stacks/stack-x/` or other iac/ subfolders
  - `docs/infra-feedback.md` (if issues)
- **Behavior:** Must split infra code into the correct stacks for each bounded context/service.
- **Errors/Feedback:** If plan is incomplete for infra, outputs questions in `docs/infra-feedback.md`.

---

## 6. Reviewer Agent
- **Input:** All artifacts (plan, code, tests, IaC)
- **Output:** `docs/review.md` (review report)
- **Behavior:** Reviews that all code and infra are in the correct folders and follow the required structure.
- **Errors/Feedback:** If issues found, outputs actionable feedback in `docs/review.md`.

---

## 7. Ops Agent
- **Input:** All artifacts, CI/CD status
- **Output:** `docs/deployment-status.md` (deployment logs, status)
- **Errors/Feedback:** If deployment fails, outputs error details and remediation steps. 