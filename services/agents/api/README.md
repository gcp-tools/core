# services/agents/api

This directory contains the Python FastAPI server for CrewAI agent endpoints.

- All source code is in `api/src/`.
- Exposes endpoints for planning, codegen, review, spec, test, infra, and ops.
- Endpoints accept and return JSON, and write artifacts to disk as needed.

## Endpoints

| Endpoint   | Description                                 |
|------------|---------------------------------------------|
| `/spec`    | Extracts/clarifies spec, returns artifact   |
| `/plan`    | Generates plan, returns artifact            |
| `/codegen` | Generates code, returns artifact            |
| `/infra`   | Generates infra, returns artifact           |
| `/test`    | Runs/tests code, returns artifact           |
| `/review`  | Reviews code/infra, returns artifact        |
| `/ops`     | Handles ops/deploy, returns artifact        |

All endpoints:
- Accept JSON input (see `src/agents.py` for schemas)
- Return JSON output with artifact URI and summary
- Save artifacts as JSON files in the `artifacts/` directory (default)

## Running the API (for E2E Integration)

To run the API server (required for orchestrator E2E tests):

```sh
cd services/agents/api
uvicorn src.main:app --reload
```

- The server will listen on `localhost:8000` by default.
- Artifacts will be saved in the `artifacts/` directory.

## E2E Integration

- The orchestrator (TypeScript/Temporal) will call these endpoints in sequence as part of the full workflow.
- Ensure this API server is running before running orchestrator E2E/integration tests.

## Artifact Conventions

- Artifacts are saved as JSON in `artifacts/{workflowId}/{step}/{step}.json`
- Each agent validates and saves its output as an artifact
- See `docs/artifact-formats.md` for details 
