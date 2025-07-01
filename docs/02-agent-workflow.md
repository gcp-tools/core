# 02. Automated Multi-Agent Workflow

## Overview
This phase describes the end-to-end automated workflow, orchestrated by Temporal, where CrewAI agents collaborate to deliver a production-ready service. The workflow enforces quality gates and supports human approval at key stages.

---

## Workflow Orchestration
- **Temporal** is used to orchestrate the workflow as a series of durable activities.
- Each major step is a Temporal activity, typically implemented as a CrewAI agent.
- The workflow is resilient to failures and supports retries, pausing, and human intervention.

---

## CrewAI Agent Roles

### 1. Spec Agent
- Reads the initial spec (`docs/brief.md`).
- Extracts requirements, clarifies ambiguities, and prepares a requirements summary.

### 2. Planner Agent
- Proposes architecture, API design, data models, and test strategy.
- Outputs a detailed plan (`docs/plan.md`).
- **Human-in-the-loop:**
  - Human reviews and approves/edits the plan before proceeding.

### 3. Codegen Agent
- Generates code for handlers, IO, transforms, types, etc., following the plan.
- Writes code to the appropriate directories in the repo.

### 4. Test Agent
- Writes and runs tests for the generated code.
- Reports test results and coverage.
- If tests fail, returns to Codegen Agent for fixes.

### 5. Infra Agent
- Generates/updates IaC using `gcp-tools-cdktf`, following the multi-project pattern.
- Uses `gcp-tools-mcp` for project/secret automation as needed.
- Writes IaC to the correct subdirectories.

### 6. Reviewer Agent
- Reviews code and IaC for style, correctness, and best practices.
- Outputs a review report (`docs/review.md`).
- **Human-in-the-loop:**
  - Human reviews and approves/edits the review before proceeding.
- If review fails, returns to Codegen Agent for fixes.

### 7. Ops Agent
- Pushes changes to GitHub, triggering CI/CD.
- Monitors deployment status and reports back.

---

## Artifact Handoff
- Artifacts (plan, code, tests, IaC, review) are written to the repo.
- Each agent validates the previous step before proceeding.
- Human approval is required at the planning and review stages.

---

## Human-in-the-Loop Gates
- **After Planning:** Human must approve or edit the plan before codegen starts.
- **After Review:** Human must approve or edit the review before deployment.

---

## Error Handling & Retries
- Temporal handles retries for failed activities.
- If an agent fails or a gate is not passed, the workflow can return to the appropriate agent for fixes.

---

## Artifacts
- `docs/plan.md` (detailed plan)
- `src/` (service code)
- `tests/` (test code)
- `iac/` (infrastructure code)
- `docs/review.md` (review report) 