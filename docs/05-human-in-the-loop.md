# 05. Human-in-the-Loop Gates

## Overview
This section details the points in the workflow where human approval or intervention is required, how feedback is incorporated, and how the workflow resumes after human input.

---

## Human Approval Points

### 1. After Planning (Planner Agent)
- The Planner Agent produces a detailed plan (`docs/plan.md`).
- The workflow pauses and notifies the human user for review.
- Human can:
  - Approve the plan (workflow proceeds to codegen)
  - Edit or comment on the plan (agent incorporates feedback)
  - Reject the plan (workflow returns to Planner Agent for revision)

### 2. After Review (Reviewer Agent)
- The Reviewer Agent produces a review report (`docs/review.md`).
- The workflow pauses and notifies the human user for review.
- Human can:
  - Approve the review (workflow proceeds to deployment)
  - Edit or comment on the review (agent incorporates feedback)
  - Reject the review (workflow returns to Codegen Agent for fixes)

---

## Feedback Incorporation
- Human feedback is captured as edits or comments in the relevant artifact (plan, review, or code).
- Agents are responsible for reading and incorporating feedback before resuming the workflow.
- The workflow only proceeds when explicit human approval is given.

---

## Notification & UX (To Be Defined)
- Notification channels (email, Slack, dashboard, etc.) are to be determined.
- Approval can be given via UI, CLI, or GitHub PR comments.
- The system should provide clear instructions and status updates to the human user.

---

## Resuming the Workflow
- Once human approval is received, the Temporal workflow resumes at the next step.
- If feedback requires changes, the responsible agent is re-invoked with the updated artifact.
- All actions and approvals are logged for traceability.

---

## Artifacts
- `docs/plan.md` (plan with human feedback)
- `docs/review.md` (review with human feedback)
- Workflow logs and approval records 