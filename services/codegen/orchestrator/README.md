# GCP Tools Codegen Orchestrator (MCP Server)

## Overview

The Codegen Orchestrator is a TypeScript-based MCP server for orchestrating code generation, planning, review, and deployment workflows for GCP applications. It is a core part of the GCP Tools platform, enabling:

- Multi-step, agent-driven codegen and infrastructure workflows
- LLM-powered planning, code generation, review, and testing
- Integration with AI agents and developer automation tools via the MCP protocol

## Tech Stack
- **TypeScript (Node.js)**
- **MCP SDK** (Model Context Protocol)
- **LLM Integration** (OpenAI, Anthropic, etc.)
- **CDKTF** (Cloud Development Kit for Terraform)

## Features
- Orchestrates multi-agent codegen and deployment workflows
- Modular tool-based architecture (each step is a tool)
- Designed for use with AI agents and developer automation platforms

## Usage

You can run the MCP server as part of the GCP Tools platform, or interact with it via Cursor, Warp, or other MCP-compatible clients. See the tool reference in this README for available commands and parameters.

## Tool Reference

- **generate_spec**: Generate project specifications from a brief description
- **generate_plan**: Generate a detailed project plan from requirements
- **generate_code**: Generate code based on a project plan
- **generate_infra**: Generate infrastructure as code
- **run_tests**: Generate and run test code
- **review_code**: Review code and provide feedback
- **deploy_ops**: Generate deployment and operations plan
- **full_pipeline**: Execute a complete end-to-end workflow

## Prerequisites
- Node.js (v22+ recommended)
- CDKTF CLI (~> 0.21.0)
- Google Cloud SDK
- Python 3.9+ and Rust (optional, for some workflows)
