# gcp-tools-core

This repository is part of the **GCP Tools Automation Platform**, a multi-agent, multi-language system for automating Google Cloud Platform (GCP) infrastructure and application workflows.

## Overview

gcp-tools-core is a monorepo providing the agent and orchestrator services for the GCP Tools platform. It enables advanced, developer-centric automation for GCP projects using a hybrid architecture:

- **Multi-Agent Orchestration:** Supports complex, multi-step workflows for infrastructure and application delivery.
- **Multi-Language:** Combines TypeScript (Node.js) and Python for best-in-class orchestration and agent logic.
- **MCP Protocol:** Uses the Model Context Protocol (MCP) for agent-to-agent and agent-to-orchestrator communication.
- **LLM-Driven Automation:** Integrates with large language models for planning, code generation, review, and more.

## Setup

To get started with the gcp-tools-core monorepo:

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd gcp-tools-core
   ```

2. **Install dependencies:**

   ```bash
   make install
   ```

3. **Build all services:**

   ```bash
   make build
   ```

4. **Lint the codebase:**

   ```bash
   make lint
   ```

5. **Run all tests:**

   ```bash
   make test
   ```

You can find additional Makefile targets in the [Makefile](Makefile) and the [`scripts/make/`](scripts/make/) directory. Use `make help` to list all available commands.

## Configuring Cursor with MCP Servers

To use the MCP servers in Cursor, add the following configuration to your `.cursor/config.json` (or equivalent Cursor config file):

```json
{
  "mcpServers": {
    "gcp-tools-core-scaffold": {
      "args": ["<PATH_TO_REPO>/gcp-tools-core/services/scaffold/orchestrator/dist/index.mjs"],
      "command": "node",
      "name": "gcp-tools-core-scaffold",
      "enabled": true,
      "autoApprove": true
    },
    "gcp-tools-core-codegen": {
      "args": ["<PATH_TO_REPO>/gcp-tools-core/services/codegen/orchestrator/dist/index.mjs"],
      "command": "node",
      "name": "gcp-tools-core-codegen",
      "enabled": true,
      "autoApprove": true
    }
  }
}
```

- Replace `<PATH_TO_REPO>` with the absolute path to your local `gcp-tools-core` repository.
- This configuration will enable both the Scaffold and Codegen MCP servers in Cursor, allowing you to use their tools directly from the Cursor interface.
- The `autoApprove` flag allows Cursor to automatically approve tool invocations without manual confirmation.

## Key Services

- `services/scaffold/orchestrator/` — TypeScript MCP server for scaffolding GCP projects and GitHub repos
- `services/codegen/orchestrator/` — TypeScript MCP server for orchestrating codegen and workflow automation
- `services/codegen/agents/` — Python MCP agent server for spec, planning, codegen, infra, test, review, and ops

This separation enables scalable, language-agnostic, and extensible automation for GCP infrastructure and application delivery.

---

For more details, see the following service READMEs:

- [Scaffold Orchestrator](services/scaffold/orchestrator/README.md): Project and repo scaffolding MCP server
- [Codegen Orchestrator](services/codegen/orchestrator/README.md): Codegen and workflow automation MCP server
- [Codegen Agents](services/codegen/agents/README.md): Python MCP agent server for codegen, infra, and review 
