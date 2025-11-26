# Developer MCP Server

This service orchestrates the end-to-end workflow from product brief intake to
merge. It leverages [`fastmcp`](https://github.com/punkpeye/fastmcp) and the
local `.engineering-rules/llm` corpus to enforce architectural, testing, and IaC guidance.

## Rule Precedence

- `.engineering-rules/llm` documents are authoritative and override workspace or Cursor
  defaults when conflicts arise.
- MCP prompts and instructions reference the mapped rule identifiers; do not
  load alternative rule sets unless explicitly requested.
- Architecture, implementation, and testing phases must cite the relevant
  rules while reasoning about plans or code changes.

## Automation Expectations

- Use registered MCP tools instead of manual output for artefacts and gates.
- Create a feature branch with `prepare_feature_branch` before writing code.
- In specification, call `write_story_files` and sync story todos via `todo_write`
  without asking for confirmation.
- During implementation, avoid pausing for HITL feedback unless the workflow
  or user demands it.

## Cursor Rules

- Load `.cursor/rules/developer-mcp.mdc` when working with the Developer MCP.
- The rule enforces tool usage, npm-only workflows, and Firestore env checks.

## Project Layout

- `src/server.mts` – MCP entry point, registers tools and instructions
- `src/workflow/` – Phase definitions, state persistence, and gating engine
- `src/tools/` – Tool registrations (planner, workflow, stories, git, quality,
  tests, IaC)
- `src/prompts/` – Prompt catalog generation for each workflow phase
- `src/lib/` – Shared utilities (`exec` for shell commands, instructions loader)
- `config/rules-map.json` – Maps `.engineering-rules/llm` documents to instruction metadata
- `story-template.md` – Markdown template used for story files under
  `docs/{feature}`

## Available Tools

| Tool | Purpose |
| --- | --- |
| `list_workflow_prompts` | Inspect prompts and rule references per workflow phase |
| `get_workflow_state` / `advance_workflow_phase` / `set_phase_status` | Manage workflow gating and state transitions |
| `write_story_files` | Generate story markdown files from structured input |
| `prepare_feature_branch` | Checkout development, sync with origin, create feature branch |
| `push_feature_branch` | Push the tracked feature branch to a remote |
| `create_pull_request` | Create a PR via GitHub CLI and record URL |
| `check_pr_status` / `merge_pull_request` | Sync CI status, auto-advance gates, and merge when ready |
| `monitor_pr_until_complete` | Poll PR status until completion, returning CI history |
| `fetch_deployment_logs` | Pull recent deployment logs from Cloud Logging |
| `sync_feature_branch` | Fast-forward feature branch to latest remote state |
| `monitor_pr_until_complete` | Poll PR status until completion, returning CI history |
| `check_pr_status` | Fetch PR status + check rollup via GitHub CLI |
| `merge_pull_request` | Merge PR (auto + delete branch) once CI succeeds |
| `run_lint` / `run_build` | Execute lint/build gates and update phase status |
| `run_tests` | Run Vitest suites, updating testing phase status |
| `synth_iac` | Invoke `make synth` (requires testing complete; CI handles plan/apply) |

Each tool returns structured JSON so higher-level orchestration can branch on
outcomes (e.g., re-run lint when blocked).

## Scripts

```bash
npm run dev       # Start the server in watch mode (stdio transport)
npm run build     # Bundle sources into dist/server.js via tsup
npm run lint      # ESLint (strict type-checked config)
npm run typecheck # TypeScript compiler with --noEmit
npm run test      # Placeholder for Vitest suites
```

## Workflow State

Workflow metadata is persisted to `~/.gcp-tools-developer/state.json` (override
with `GCP_TOOLS_DEVELOPER_STATE_PATH`). The engine records:

- `currentPhase` – Active workflow phase (`brief-intake` → `merge`)
- `phaseStatuses` – Status (`pending`, `in_progress`, `complete`, `blocked`) per
  phase with timestamps/notes
- `featureBranch`, `pullRequestUrl`, `lastGitSyncAt`, `lastQualityRunAt`

State writes are atomic to avoid corruption. Delete the state file (or call the
`reset_workflow` tool) to start from a clean slate.

## Phase Gates

`src/workflow/engine.mts` enforces:

- Sequential phase advancement (`advancePhase`)
- Status overrides (`setPhaseStatus`) for human-in-the-loop corrections
- Assertions (`ensurePhase`, `ensurePhaseAtLeast`, `requirePhaseStatus`) used by
tools to block premature actions (e.g., `synth_iac` requires testing complete)

## Next Steps

Future work will extend git tooling to cover CI polling/automatic retries,
expand IaC helpers (plan/apply), and add story/test generation hooks that call
external MCP services (context7, code-reasoner, GitHub, memory).
