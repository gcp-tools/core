# GCP Tools Codegen Agents (Python MCP Server)

## Overview

The Codegen Agents service is a Python-based MCP agent server for handling code generation, specification, planning, infrastructure, testing, review, and operations tasks as part of the GCP Tools platform. It exposes each workflow step as an MCP tool for use by orchestrators, LLMs, and developer automation tools.

## Tech Stack
- **Python 3.9+**
- **MCP SDK (Python)**
- **LLM Integration** (OpenAI, Anthropic, etc.)

## Features
- Agent endpoints for spec, planning, codegen, infra, test, review, and ops
- LLM-driven reasoning and workflow execution
- Designed for use with MCP orchestrators and developer automation platforms

## Usage

Run as part of the GCP Tools platform, or standalone for agent development and testing. Communicates with orchestrators via the MCP protocol.

## Tool Reference

### Available Tools & Parameters

- **generate_spec**
  - `project_description` (string): Brief description of the project
- **generate_plan**
  - `requirements` (string): Project requirements in text format
- **generate_code**
  - `plan` (string): The project plan to generate code from
  - `language` (string, optional): Programming language (typescript, python, rust, react). Default: typescript
- **generate_infra**
  - `plan` (string): The project plan to generate infrastructure from
- **run_tests**
  - `artifact` (string): The code or artifact to generate tests for
- **review_code**
  - `artifact` (string): The code or artifact to review
- **deploy_ops**
  - `artifacts` (string): The artifacts to generate deployment plan for

## Prerequisites
- Python 3.9+
- MCP SDK (Python)
- (Optional) LLM API keys for OpenAI, Anthropic, etc.

