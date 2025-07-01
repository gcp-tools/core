# Artifact Formats

## Overview
This document describes the formats and conventions for workflow artifacts, including plans, reviews, feedback, code, and infrastructure as code (IaC). All cross-language (TypeScript <-> Python) artifact/data exchange must use JSON-serializable formats and/or file paths. Errors must be returned as structured JSON.

---

## Cross-Language Data Exchange
- **Inputs:** JSON objects or file paths (for large artifacts)
- **Outputs:** JSON objects or file paths
- **Errors:** Structured JSON with error code, message, and optional details

---

## Example Error Response (Python Agent)
```json
{
  "error": {
    "code": "AGENT_FAILURE",
    "message": "Failed to generate code for service-a",
    "details": { "traceback": "..." }
  }
}
```

---

## Plan (`docs/plan.md`)
- **Format:** Markdown
- **Sections:**
  - Architecture
  - API Endpoints
  - Data Models
  - Test Strategy
  - Service/Stack Mapping (shows which requirements map to which stacks/services)
  - **Technology Mapping** (shows which technology/agent is used for each service/component)
- **Example:**
  ```markdown
  # Plan
  ## Architecture
  ...
  ## API Endpoints
  ...
  ## Data Models
  ...
  ## Test Strategy
  ...
  ## Service/Stack Mapping
  - Service A: iac/app/stacks/stack-a, services/service-a/backend-ts
  - Service B: iac/app/stacks/stack-b, services/service-b/backend-py
  - Service C: iac/app/stacks/stack-c, services/service-c/frontend
  ## Technology Mapping
  - Service A backend: TypeScript (TypeScript Backend Agent)
  - Service B backend: Python (Python Backend Agent)
  - Service C frontend: React (React Frontend Agent)
  ```

---

## Review (`docs/review.md`)
- **Format:** Markdown
- **Sections:**
  - Summary
  - Issues Found
  - Recommendations
  - Structure Compliance (checks that all code/infra is in the correct folders)
- **Example:**
  ```markdown
  # Review
  ## Summary
  ...
  ## Issues Found
  - ...
  ## Recommendations
  - ...
  ## Structure Compliance
  - All code and infra are in the correct subfolders.
  ```

---

## Feedback (`docs/*-feedback.md`)
- **Format:** Markdown
- **Sections:**
  - Questions
  - Blockers
  - Suggestions
- **Example:**
  ```markdown
  # Codegen Feedback
  - Unclear API spec for ...
  ```

---

## Test Results (`docs/test-results.md`)
- **Format:** Markdown or JSON
- **Sections:**
  - Passed
  - Failed
  - Coverage
  - Service/Component (shows which service/component each result relates to)
- **Example:**
  ```markdown
  # Test Results
  - Service: service-a/backend-ts
    - Passed: ...
    - Failed: ...
    - Coverage: ...
  - Service: service-b/backend-py
    - Passed: ...
    - Failed: ...
    - Coverage: ...
  ```

---

## Code (`src/`, `tests/`)
- **Format:** TypeScript, Python, Rust, or React, following project conventions
- **Conventions:**
  - 2-space indentation
  - Strict typing (where applicable)
  - Separation of concerns (handlers, IO, transforms, types)
  - Placed in the correct `services/service-x/component/` subfolder, with language/framework-specific naming

---

## IaC (`iac/`)
- **Format:** TypeScript (CDKTF), following gcp-tools-cdktf patterns
- **Conventions:**
  - Organized by project (infra, app, ingress, projects)
  - Each service/stack has its own subfolder (e.g., `iac/app/stacks/stack-a/`)
  - Use of base stacks and constructs
  - Outputs for cross-stack dependencies 