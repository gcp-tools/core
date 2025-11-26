# Workflow Guide

> **PHASE:** All phases
> **PRIORITY:** REQUIRED

## Quick Reference

- [ ] Brief-Intake: Set contexts, write feature brief (HITL)
- [ ] Specification: Write story files (HITL)
- [ ] Architecture: Design architecture, write architecture document (HITL)
- [ ] Implementation: Create branch, implement code, commit changes
- [ ] Testing: Run tests, ensure all pass
- [ ] Infrastructure: Create/update IaC, synth and verify
- [ ] Review: Code review, quality checks (HITL)
- [ ] PR: Create pull request, monitor status
- [ ] Merge: Merge after approvals and CI passes
- [ ] Measure Twice: Read instructions twice, verify all requirements

**HITL (Human-In-The-Loop) Pauses:** Only brief-intake, specification, architecture, and review phases require human approval before advancing. All other phases are automated.

## REQUIRED Patterns

### Brief-Intake Phase

**When to use:** Start of every feature

**Steps:**
1. Set project context via `set_project_context`
2. Set service context via `set_service_context`
3. Set feature context via `set_feature_context`
4. Write feature brief via `write_feature_brief`
5. Advance to specification phase

**Brief Structure:**
- Title
- Problem summary
- Goals
- Non-goals
- Personas and scenarios
- Constraints
- Dependencies

**Rules:**
- MUST: Set all contexts before brief
- MUST: Call write_feature_brief before advancing
- MUST NOT: Skip brief or advance without it
- MUST: Include problem, goals, constraints

### Specification Phase

**When to use:** After brief completion

**Steps:**
1. Write story files via `write_story_files`
2. Advance to architecture phase

**Story Format:**
- ID, title, summary
- Acceptance criteria
- Command/service tables
- Test strategy
- Dependencies

**Rules:**
- MUST: Use write_story_files tool (not hand-written)
- MUST: Include PRD and stories
- MUST: Include acceptance criteria
- MUST NOT: Skip specification

### Architecture Phase

**When to use:** After specification

**Steps:**
1. Design service architecture
2. Propose architecture diagrams
3. Write architecture document via `write_architecture`
4. Advance to implementation phase

**Architecture Content:**
- Design decisions
- Data flows
- Interaction surfaces
- Pattern selection
- Layer responsibilities

**Rules:**
- MUST: Call write_architecture to persist document
- MUST: Include design decisions and patterns
- MUST: Show data flows and interactions
- MUST NOT: Skip architecture step

### Implementation Phase

**When to use:** After architecture

**Workflow (Iterative per story):**
1. Prepare feature branch via `prepare_feature_branch` (once at start)
2. Load stories via `read_story_files`
3. For each story:
   a. Set active story via `set_active_story`
   b. For each acceptance criterion:
      - Write code to satisfy criterion
      - Write tests for criterion
      - Run tests via `run_tests` (allowed in implementation phase)
      - If tests pass: mark acceptance criterion complete via `mark_acceptance_criterion_complete`
      - If tests fail: fix code/tests and repeat from step c
   c. When all acceptance criteria complete: commit changes via `commit_changes` (one commit per story)
   d. Move to next story
4. When all stories complete: advance to testing phase

**Implementation Rules:**
- MUST: Call prepare_feature_branch before coding
- MUST: Stay on feature branch
- MUST: Work on one story at a time using `set_active_story`
- MUST: Use `run_tests` during implementation to verify each acceptance criterion
- MUST: Mark acceptance criteria complete after code and tests pass
- MUST: Use commit_changes tool for commits (not ad-hoc git)
- MUST: Follow TypeScript standards and patterns
- MUST: Use registered MCP tools

### Testing Phase

**When to use:** After all stories are implemented and acceptance criteria marked complete

**Steps:**
1. Run full test suite via `run_tests` tool (automatically runs `test:coverage` during testing phase)
2. Ensure all tests pass and coverage meets requirements
3. If tests/coverage fail: workflow automatically reverts to implementation phase
4. Fix any failures (add missing tests, fix code, etc.)
5. Retry tests via `run_tests` until all pass
6. Commit changes via `commit_changes` after test:coverage passes
7. Advance to infrastructure phase

**Rules:**
- MUST: Run full test suite via `run_tests` tool (automatically runs `test:coverage` during testing phase)
- MUST: Ensure all tests pass and coverage thresholds are met before advancing
- MUST: If tests fail, workflow automatically reverts to implementation phase - fix issues and retry
- MUST: Commit after test:coverage passes
- MUST NOT: Skip testing phase
- MUST NOT: Advance to infrastructure phase if tests/coverage fail

### Infrastructure Phase

**When to use:** After testing

**Steps:**
1. Create/update IaC stacks
2. Run synth_iac to verify
3. Mark infrastructure complete
4. Commit changes via `commit_changes` after infrastructure is complete
5. Advance to review phase

**Rules:**
- MUST: Complete infrastructure before pushing
- MUST: Run synth_iac to verify
- MUST: Mark phase complete when done
- MUST: Commit after infrastructure is complete
- MUST NOT: Push before infrastructure complete and committed

### Review Phase

**When to use:** After infrastructure

**Steps:**
1. Review code against quality checklist
2. Verify all requirements met
3. Record review summary
4. Advance to PR phase

**Review Checklist:**
- Types explicit (no any)
- Layer separation correct
- Result types used
- Validation at boundaries
- Tests complete
- Security checks passed

**Rules:**
- MUST: Complete review checklist
- MUST: Verify all requirements met
- MUST: Record review outcome

### PR Phase

**When to use:** After review

**Steps:**
1. **Run `update_github_workflows` to sync workflows with IaC** (REQUIRED - at start)
2. **Commit workflow changes via `commit_changes` if workflows were updated** (REQUIRED before push)
3. Push feature branch via `push_feature_branch`
4. Create PR via `create_pull_request`
5. Monitor PR status via `check_pr_status`
6. Wait for approvals and CI
7. Advance to merge phase

**Rules:**
- MUST: Run `update_github_workflows` at the start of PR phase (before push) - REQUIRED step
- MUST: Commit workflow changes if they were updated - REQUIRED before push
- MUST: Ensure workflows reflect all current IaC stacks before CI runs
- MUST: Push branch before creating PR
- MUST: Use create_pull_request tool
- MUST: Monitor PR until complete
- MUST NOT: Push branch until workflow updates are committed (if any were made)
- MUST NOT: Merge before approvals

### Merge Phase

**When to use:** After PR approval

**Steps:**
1. Verify CI passes
2. Verify approvals received
3. Merge PR via `merge_pull_request`
4. Complete workflow

**Rules:**
- MUST: Wait for CI to pass
- MUST: Wait for required approvals
- MUST: Use merge_pull_request tool

### Measure Twice, Cut Once

**When to use:** Before marking any phase complete

**Principle:** Always double check you have covered everything asked of you by reading the instructions a second time, after completing your implementation, and updating it if you have missed something.

**Verification Steps:**
1. Read original instructions/requirements
2. Complete implementation
3. Read instructions again
4. Verify all requirements met
5. Update implementation if anything missed

**Rules:**
- MUST: Read instructions twice (before and after)
- MUST: Verify all requirements met
- MUST: Update if requirements missed
- MUST NOT: Mark complete without verification

## REFERENCE Patterns

### Phase Transitions

**Sequential Order:**
```
brief-intake → specification → architecture → implementation → 
testing → infrastructure → review → pr → merge
```

**Rules:**
- MUST: Advance phases sequentially
- MUST NOT: Skip phases
- MUST: Complete prerequisites before advancing

### Tool Usage

**Required Tools:**
- `set_project_context` - Before brief
- `set_service_context` - Before brief
- `set_feature_context` - Before brief
- `write_feature_brief` - In brief-intake
- `write_story_files` - In specification
- `write_architecture` - In architecture
- `prepare_feature_branch` - Before implementation
- `commit_changes` - During implementation/testing/infrastructure
- `run_tests` - Only in testing phase
- `synth_iac` - In infrastructure phase
- `push_feature_branch` - Before PR
- `create_pull_request` - In PR phase
- `merge_pull_request` - In merge phase

**Rules:**
- MUST: Use registered MCP tools
- MUST NOT: Use ad-hoc commands
- MUST: Follow tool-specific rules

## Decision Trees

**Q: What phase should I be in?**

- Starting feature → brief-intake
- After brief → specification
- After stories → architecture
- After architecture → implementation
- After code → testing
- After tests → infrastructure
- After IaC → review
- After review → pr
- After PR → merge

**Q: Can I skip this phase?**

- No → All phases are required
- Exception → User explicitly requests skip

**Q: How do I verify work is complete?**

- Read instructions first → Implement → Read instructions again → Verify all requirements → Update if needed

