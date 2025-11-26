# Workflow Guide

## Overview

This document provides comprehensive guidance for the end-to-end development workflow from feature brief to merge. It covers each phase in detail, including required tools, verification steps, and common pitfalls.

The workflow is designed to ensure quality, consistency, and traceability throughout the development process. Each phase has specific gates and requirements that must be met before advancing.

## Table of Contents

- [Quick Start](#quick-start)
- [Workflow Phases](#workflow-phases)
- [Phase Details](#phase-details)
- [Verification Checklist](#verification-checklist)
- [Common Mistakes](#common-mistakes)
- [Troubleshooting](#troubleshooting)

## Quick Start

The workflow consists of nine sequential phases:

1. **Brief-Intake**: Collect requirements and set context (HITL)
2. **Specification**: Create PRD and stories (HITL)
3. **Architecture**: Design system architecture (HITL)
4. **Implementation**: Write code following patterns
5. **Testing**: Write and run tests
6. **Infrastructure**: Create/update IaC
7. **Review**: Code review and quality checks (HITL)
8. **PR**: Create and monitor pull request
9. **Merge**: Merge after approvals

Each phase must be completed before advancing to the next.

**HITL (Human-In-The-Loop) Pauses:** Only brief-intake, specification, architecture, and review phases require human approval before advancing. All other phases (implementation, testing, infrastructure, pr, merge) are automated.

## Workflow Phases

### Brief-Intake Phase

**Purpose**: Collect and document feature requirements

**Required Actions**:
1. Set project context via `set_project_context`
2. Set service context via `set_service_context`
3. Set feature context via `set_feature_context`
4. Write feature brief via `write_feature_brief`
5. Advance to specification phase

**Brief Structure**:
- Title
- Problem summary
- Goals (array)
- Non-goals (array, optional)
- Personas and scenarios (optional)
- Constraints (optional)
- Dependencies (optional)

**Why**: The brief serves as the foundation for all subsequent work. It ensures everyone understands the problem, goals, and constraints before design and implementation begin.

### Specification Phase

**Purpose**: Convert brief into actionable stories

**Required Actions**:
1. Write story files via `write_story_files` (includes PRD and stories)
2. Advance to architecture phase

**Story Format**:
- ID, title, summary
- Acceptance criteria (array)
- Command/service tables
- Test strategy
- Dependencies (upstream/downstream)

**Why**: Stories break down the feature into implementable units with clear acceptance criteria. The PRD provides the overall context and design decisions.

### Architecture Phase

**Purpose**: Design the system architecture

**Required Actions**:
1. Design service architecture
2. Propose architecture diagrams
3. Write architecture document via `write_architecture` tool
4. Advance to implementation phase

**Architecture Content**:
- Design decisions and rationale
- Data flows and interactions
- Pattern selection
- Layer responsibilities
- Integration points

**Why**: Architecture ensures the implementation follows platform patterns and can scale. The architecture document serves as a reference for implementation and future maintenance.

### Implementation Phase

**Purpose**: Implement the feature code story-by-story with iterative testing

**Required Actions (Iterative per story)**:
1. Prepare feature branch via `prepare_feature_branch` (once at start)
2. Load stories via `read_story_files`
3. For each story:
   a. Set active story via `set_active_story`
   b. For each acceptance criterion:
      - Write code to satisfy criterion
      - Write tests for criterion
      - Run tests via `run_tests` (allowed in implementation phase)
      - If tests pass: mark acceptance criterion complete via `mark_acceptance_criterion_complete`
      - If tests fail: fix code/tests and repeat
   c. When all acceptance criteria complete: commit changes via `commit_changes` (one commit per story)
   d. Move to next story
4. When all stories complete: advance to testing phase

**Implementation Rules**:
- Must call `prepare_feature_branch` before coding
- Must stay on feature branch
- Must work on one story at a time using `set_active_story`
- Must use `run_tests` during implementation to verify each acceptance criterion
- Must mark acceptance criteria complete after code and tests pass
- Must use `commit_changes` tool for commits (not ad-hoc git commands)
- Must follow TypeScript standards and patterns
- Must use registered MCP tools

**Why**: Iterative implementation with immediate testing ensures each acceptance criterion is verified before moving on. This prevents accumulating technical debt and ensures stories are truly complete.

### Testing Phase

**Purpose**: Run full test suite to verify all stories

**Required Actions**:
1. Run full test suite via `run_tests` tool (automatically runs `test:coverage` during testing phase)
2. Ensure all tests pass and coverage meets requirements
3. If tests/coverage fail: workflow automatically reverts to implementation phase
4. Fix any failures (add missing tests, fix code, etc.)
5. Retry tests via `run_tests` until all pass
6. Commit changes via `commit_changes` after test:coverage passes
7. Advance to infrastructure phase

**Testing Rules**:
- Must run full test suite via `run_tests` tool (automatically runs `test:coverage` during testing phase)
- Must ensure all tests pass and coverage thresholds are met before advancing
- If tests fail, workflow automatically reverts to implementation phase - fix issues and retry
- Must NOT skip testing phase
- Must NOT advance to infrastructure phase if tests/coverage fail

**Why**: Final test run ensures all stories work together and no regressions were introduced. This is the final quality gate before infrastructure work. Automatic reversion to implementation phase when tests fail creates a feedback loop to fix issues before proceeding.

### Infrastructure Phase

**Purpose**: Create/update infrastructure as code

**Required Actions**:
1. Create/update IaC stacks
2. Run `synth_iac` to verify
3. Mark infrastructure complete
4. Commit changes via `commit_changes` after infrastructure is complete
5. Advance to review phase

**Infrastructure Rules**:
- Must complete infrastructure before pushing
- Must run `synth_iac` to verify
- Must mark phase complete when done
- Must NOT push before infrastructure complete

**Why**: Infrastructure must be defined and verified before code can be deployed. This ensures the deployment target is ready.

### Review Phase

**Purpose**: Code review and quality verification

**Required Actions**:
1. Review code against quality checklist
2. Verify all requirements met
3. Record review summary via `record_review_summary`
4. Advance to PR phase

**Review Checklist**:
- Types explicit (no `any`)
- Layer separation correct
- Result types used
- Validation at boundaries
- Tests complete
- Security checks passed

**Why**: Code review catches issues before merge and ensures quality standards are met.

### PR Phase

**Purpose**: Create and monitor pull request

**Required Actions**:
1. Run `update_github_workflows` to sync workflows with IaC (REQUIRED - at start)
2. Commit workflow changes via `commit_changes` if workflows were updated (REQUIRED before push)
3. Push feature branch via `push_feature_branch`
4. Create PR via `create_pull_request`
5. Monitor PR status via `check_pr_status` or `monitor_pr_until_complete`
6. Wait for approvals and CI
7. Advance to merge phase

**PR Rules**:
- Must run `update_github_workflows` at the start of PR phase (before push) - REQUIRED
- Must commit workflow changes if they were updated - REQUIRED before push
- Must ensure workflows reflect all current IaC stacks before CI runs
- Must push branch before creating PR
- Must use `create_pull_request` tool
- Must monitor PR until complete
- Must NOT push branch until workflow updates are committed (if any were made)
- Must NOT merge before approvals

**Why**: Pull requests enable code review, CI validation, and collaboration before merge.

### Merge Phase

**Purpose**: Merge approved pull request

**Required Actions**:
1. Verify CI passes
2. Verify approvals received
3. Merge PR via `merge_pull_request`
4. Complete workflow

**Merge Rules**:
- Must wait for CI to pass
- Must wait for required approvals
- Must use `merge_pull_request` tool

**Why**: Merging only after CI and approvals ensures code quality and team consensus.

## Verification Checklist

### Measure Twice, Cut Once

Before marking any phase complete, verify:

1. **Read Instructions**: Read original instructions/requirements
2. **Complete Work**: Implement all required actions
3. **Read Again**: Read instructions a second time
4. **Verify Requirements**: Check all requirements met
5. **Update if Needed**: Fix anything missed

**Why**: This principle ensures nothing is overlooked. Reading instructions twice catches missed requirements.

### Phase-Specific Verification

**Brief-Intake**:
- [ ] All contexts set
- [ ] Brief written and persisted
- [ ] Brief includes problem, goals, constraints

**Specification**:
- [ ] Stories written via tool
- [ ] Acceptance criteria defined

**Architecture**:
- [ ] Architecture document written via tool
- [ ] Design decisions documented
- [ ] Patterns selected

**Implementation**:
- [ ] Branch created
- [ ] Code follows patterns
- [ ] Commits made via tool
- [ ] No tests run

**Testing**:
- [ ] Tests run via tool
- [ ] All tests pass
- [ ] Coverage meets requirements

**Infrastructure**:
- [ ] IaC created/updated
- [ ] Synth successful
- [ ] Phase marked complete

**Review**:
- [ ] Checklist completed
- [ ] Review summary recorded

**PR**:
- [ ] Branch pushed
- [ ] PR created
- [ ] Status monitored

**Merge**:
- [ ] CI passed
- [ ] Approvals received
- [ ] PR merged

## Common Mistakes

1. **Skipping Brief**: Always write brief before specification
2. **Skipping Architecture**: Always write architecture document
3. **Running Tests in Implementation**: Tests belong to testing phase only
4. **Pushing Before Infrastructure**: Complete infrastructure first
5. **Ad-hoc Git Commands**: Use registered MCP tools
6. **Skipping Verification**: Always measure twice before marking complete

## Troubleshooting

**Issue**: Cannot advance phase
**Solution**: Check that all required actions completed and prerequisites met

**Issue**: Tool not available
**Solution**: Ensure you're in the correct phase and context is set

**Issue**: Tests failing
**Solution**: Fix failures in testing phase before advancing

**Issue**: Infrastructure synth fails
**Solution**: Fix IaC issues before marking infrastructure complete

## See Also

- [Core Principles](./00-principles.md) - Architectural foundation
- [Implementation Patterns](./02-patterns.md) - Code patterns
- [Quality Standards](./03-quality.md) - Testing and quality

