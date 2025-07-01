# Orchestrator API

This project is a Temporal TypeScript worker for orchestrating multi-agent, multi-language GCP automation workflows. It calls Python CrewAI agents via HTTP, manages artifact passing, and coordinates the overall workflow.

## Features
- Temporal workflow orchestration (TypeScript)
- Agent Registry for dispatching to Python CrewAI agent API endpoints
- Type-safe artifact and plan handling
- Ready for cross-language, hybrid automation

## Artifact Management

Artifacts are the JSON or file-based outputs of each workflow step (plan, codegen, test, etc.).

- **Local mode:** Artifacts are saved to the local `artifacts/` directory (default).
- **Cloud mode:** Artifacts are saved to a GCP Cloud Storage bucket (set `ARTIFACT_MODE=gcs` and `ARTIFACT_BUCKET=your-bucket`).
- **Structure:**
  - Artifacts are organized by `artifacts/{workflowId}/{step}/{name}` (local) or `gs://{bucket}/{workflowId}/{step}/{name}` (GCS).
  - Example: `artifacts/abc123/plan/plan.json` or `gs://my-bucket/abc123/plan/plan.json`
- **Naming:** Each step saves its output as `{step}.json` (e.g., `plan.json`, `codegen.json`).
- **URIs:** Artifact URIs (file or GCS) are passed between workflow steps and returned at the end for traceability.
- **Retention:**
  - Local: Clean up manually or with a script.
  - GCS: Use bucket lifecycle rules for retention/cleanup.

## Setup

```sh
cd services/orchestrator/api
npm install
```

## Build

```sh
npm run build
```

## Test

```sh
npm test
```

## End-to-End (E2E) Integration Test

To run the full end-to-end workflow test (TypeScript orchestrator calling all Python CrewAI agent endpoints):

**Prerequisites:**
- The Python CrewAI agent API server must be running on `localhost:8000` (see `services/agents/api/` for instructions).
- All dependencies installed (`npm install`).

**Run the E2E test:**

```sh
npm test -- tests/integration/full-agent-workflow.integration.test.ts
```

**What this does:**
- Starts a Temporal worker and runs the full agent workflow: spec → plan → codegen → test → infra → review → ops.
- Each step calls the corresponding Python agent endpoint and saves an artifact.
- The test asserts that all steps complete and artifacts are created.

**Troubleshooting:**
- If the test fails to connect to the Python API, ensure it is running and accessible at `localhost:8000`.
- Artifacts are saved in the `artifacts/` directory by default.

## Run (after build)

```sh
npm start
```

## Development

- Workflows: `src/workflows/`
- Activities: `src/activities/`
- Agent Registry: `src/agents/`
- Types: `src/types/`
- Artifact Management: `src/artifacts/`

See the docs/ directory in the repo root for architecture and design details. 
