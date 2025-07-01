# 01. Human Bootstrapping Phase

## Overview
This phase covers all manual steps required to initialize a new project and platform instance before automated agents take over. It ensures the environment, repositories, and cloud resources are ready for the multi-agent workflow.

---

## Steps

### 1. GCP Project and GitHub Setup
- Use `gcp-tools-mcp` to:
  - Create three GCP projects: `host`, `app`, and `data` (following the gcp-tools-cdktf pattern).
  - Set up billing, organization, and enable required APIs (Cloud Run, Cloud SQL, Artifact Registry, etc.).
  - Create and configure a new GitHub repository for the service/platform.
  - Set up GitHub secrets and environment variables for GCP credentials, project IDs, and other required values.
  - Optionally, generate a skeleton app and IaC structure using `gcp-tools-mcp`.

### 2. Platform Configuration
- Configure the new gcp-tools-agent platform:
  - Point it at the newly created GCP projects (host/app/data).
  - Connect it to the new GitHub repository.
  - Optionally, automate this step with `gcp-tools-mcp` if supported.

### 3. Initial Specification
- Write a clear, concise brief/specification for the desired service or workflow.
  - Save as `docs/brief.md` in the GitHub repository.
  - The spec should include:
    - High-level goals and requirements
    - Key features and endpoints
    - Data models and external dependencies
    - Any constraints or non-goals

---

## Artifacts
- GCP projects (host, app, data)
- GitHub repository with initial structure
- `docs/brief.md` (service specification)

## Human-in-the-Loop
- All steps in this phase are performed by a human user.
- The output of this phase is the input for the automated agent workflow. 