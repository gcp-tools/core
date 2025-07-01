# 03. Infrastructure Patterns

## Overview
This section details the infrastructure-as-code (IaC) patterns used to provision and manage GCP resources, following the multi-project architecture established by gcp-tools-cdktf and the example app. It also describes the required directory structure for iac/ and services/ and how bounded contexts are mapped to stacks and services.

---

## Multi-Project GCP Architecture
- **Three GCP Projects:**
  - `host`: Shared networking, ingress, and security resources
  - `app`: Application-level services (Cloud Run, Pub/Sub, etc.)
  - `data`: Database services (Cloud SQL, BigQuery, etc.)
- **Separation of concerns:** Each project has a clear responsibility and resource boundary.
- **Resource naming:** Use consistent, environment-aware naming conventions.

---

## Directory Structure (Required)

```
iac/
    projects/         # Instantiates project stacks from gcp-tools-cdktf
    infrastructure/   # Instantiates infra stacks from gcp-tools-cdktf
    app/
        stacks/
            stack-a/  # All constructs for service-a
            stack-b/  # All constructs for service-b
            stack-c/  # All constructs for service-c
    ingress/          # Stacks wiring up services in other stacks

services/
    service-a/
        backend/
            src/
        frontend/
            src/
        pubsub-handler/
            src/
    service-b/
        backend/
            src/
        agents/
            src/
    service-c/
        backend/
            src/
```

- **Each service has its own stack(s) and codebase.**
- **Bounded contexts**: If a brief describes multiple areas of functionality, the plan and code should split them into separate stacks/services as above.
- **Documentation**: Must reflect the mapping from requirements to stacks/services.

---

## gcp-tools-cdktf Usage
- **Stack Patterns:**
  - Use `BaseStack`, `BaseInfraStack`, `AppStack`, and `IngressStack` for consistency.
  - Organize stacks by project and resource type (see above structure).
- **Construct Patterns:**
  - Use reusable constructs for common resources (e.g., Cloud Run, API Gateway, VPC connectors).
  - Implement proper resource dependencies with `dependsOn`.
- **Environment Configuration:**
  - Use `envConfig` for region, project, and environment-specific settings.
  - Support multiple environments (dev, staging, prod) via configuration.

---

## IaC Organization
- **Directory Structure:** See above.
- **Remote State Management:**
  - Use GCS backend for Terraform state.
  - Use `DataTerraformRemoteStateGcs` for cross-stack dependencies (e.g., app stack reads outputs from infra stack).
- **Outputs:**
  - Export key resource attributes (URIs, service names, etc.) as Terraform outputs for use by other stacks and agents.

---

## Best Practices
- **Security:**
  - Use least-privilege IAM roles and service accounts.
  - Enable Workload Identity where possible.
  - Use private networking for sensitive resources.
- **Scalability:**
  - Use autoscaling for Cloud Run and other compute resources.
  - Design for multi-region where appropriate.
- **Maintainability:**
  - Use clear naming and tagging conventions.
  - Keep related files and resources together.
  - Document infrastructure decisions in `docs/`.
- **Testing:**
  - Use `make diff` and `make test` to validate IaC before deployment.
  - Review planned changes before applying.

---

## Artifacts
- `iac/` directory with organized stacks and constructs
- Terraform state in GCS
- `docs/infra.md` (optional: document infra decisions) 