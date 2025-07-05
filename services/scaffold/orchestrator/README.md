# GCP Tools Scaffold Orchestrator (MCP Server)

## Overview

The Scaffold Orchestrator is a TypeScript-based MCP server for automating Google Cloud Platform (GCP) project scaffolding and GitHub repository setup. It is a core part of the GCP Tools platform, enabling:

- Automated installation of prerequisites (Terraform, CDKTF, gcloud, GitHub CLI)
- Creation and configuration of new GitHub repositories
- GCP foundation project setup (service accounts, IAM, Workload Identity)
- Automated GitHub secrets and environment variable management for CI/CD
- Multi-region and multi-environment support
- Integration with AI-driven workflows via the MCP protocol

## Tech Stack
- **TypeScript (Node.js)**
- **MCP SDK** (Model Context Protocol)
- **CDKTF** (Cloud Development Kit for Terraform)
- **Google Cloud SDK**
- **GitHub CLI**

## Features
- One-command project and repo setup
- Modular tool-based architecture (each step is a tool)
- Secure, least-privilege IAM and secret management
- Designed for use with AI agents and developer automation platforms

## Usage

You can run the MCP server as part of the GCP Tools platform, or interact with it via Cursor, Warp, or other MCP-compatible clients. See the tool reference in this README for available commands and parameters.

## Tool Reference

- **install_prerequisites**: Check/install required dependencies
- **create_github_repo**: Create and configure a new GitHub repository
- **setup_foundation_project**: Set up a new GCP foundation project
- **setup_github_secrets**: Configure GitHub secrets and environment variables
- **complete_project_setup**: End-to-end setup for a new project and repo

## Prerequisites
- Node.js (v22+ recommended)
- Terraform (~> 1.9.0)
- CDKTF CLI (~> 0.21.0)
- Google Cloud SDK
- GitHub CLI
- Python 3.9+ and Rust (optional, for some workflows)

