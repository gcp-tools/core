# Sequence Diagrams

## Overview
This document provides Mermaid sequence diagrams for key flows in the multi-agent workflow, including human-in-the-loop pauses.

---

## 1. End-to-End Workflow

```mermaid
sequenceDiagram
    participant Human
    participant Temporal
    participant SpecAgent
    participant PlannerAgent
    participant CodegenAgent
    participant TestAgent
    participant InfraAgent
    participant ReviewerAgent
    participant OpsAgent
    participant GitHub

    Human->>Temporal: Start workflow
    Temporal->>SpecAgent: Extract requirements
    SpecAgent-->>Temporal: requirements.md
    Temporal->>PlannerAgent: Plan architecture
    PlannerAgent-->>Temporal: plan.md
    Temporal->>Human: Request plan approval
    Human-->>Temporal: Approve plan
    Temporal->>CodegenAgent: Generate code
    CodegenAgent-->>Temporal: src/, tests/
    Temporal->>TestAgent: Run tests
    TestAgent-->>Temporal: test-results.md
    Temporal->>InfraAgent: Generate IaC
    InfraAgent-->>Temporal: iac/
    Temporal->>ReviewerAgent: Review artifacts
    ReviewerAgent-->>Temporal: review.md
    Temporal->>Human: Request review approval
    Human-->>Temporal: Approve review
    Temporal->>OpsAgent: Deploy
    OpsAgent->>GitHub: Push changes
    GitHub-->>OpsAgent: CI/CD status
    OpsAgent-->>Temporal: deployment-status.md
```

---

## 2. Human-in-the-Loop Pause Example

```mermaid
sequenceDiagram
    participant Temporal
    participant PlannerAgent
    participant Human

    Temporal->>PlannerAgent: Plan architecture
    PlannerAgent-->>Temporal: plan.md
    Temporal->>Human: Request plan approval
    Human-->>Temporal: Approve or edit plan
    Temporal->>CodegenAgent: Continue workflow
``` 