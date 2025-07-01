# 04. CI/CD and Deployment

## Overview
This section describes how code and infrastructure changes are deployed to GCP using GitHub as the source of truth, and how agents interact with the CI/CD pipeline and monitor deployment status.

---

## Deployment Flow
- **Ops Agent** pushes code and IaC changes to the GitHub repository.
- **GitHub Actions** (or another CI/CD system) is triggered on push/PR merge.
- The pipeline runs:
  - Linting and formatting checks (biome, etc.)
  - Unit and integration tests (vitest, etc.)
  - Build steps for services and IaC
  - `make synth` and `make diff` for IaC validation
  - `make deploy` to apply infrastructure changes to GCP
  - Docker image builds and pushes (if needed)
  - Service deployment to Cloud Run, Cloud Functions, etc.

---

## Agent Interaction
- **Ops Agent**:
  - Monitors CI/CD pipeline status via GitHub API or webhook.
  - Waits for successful completion before reporting deployment as complete.
  - If deployment fails, collects logs and reports errors for remediation.
- **Monitor Agent** (optional/future):
  - Continuously checks service health, logs, and GCP resource status post-deployment.
  - Notifies human or triggers rollback/remediation if issues are detected.

---

## Human-in-the-Loop
- Human can review and approve PRs before merge/deploy.
- Human receives notifications on deployment status (to be defined: email, Slack, dashboard, etc.).

---

## Best Practices
- Use branch protection and required checks in GitHub.
- Keep CI/CD pipeline fast and reliable.
- Store secrets securely (GitHub Secrets, GCP Secret Manager).
- Use versioned Docker images and IaC modules.
- Monitor deployment logs and set up alerts for failures.

---

## Artifacts
- `.github/workflows/` (CI/CD pipeline definitions)
- Deployment logs and status reports
- Service URLs and endpoints (as outputs) 