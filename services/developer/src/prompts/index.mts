import { loadRuleDescriptors } from '../config/rules.mjs'
import type { WorkflowPhase } from '../workflow/phases.mjs'
import { workflowPhaseOrder } from '../workflow/phases.mjs'

export type PromptDefinition = {
  readonly name: string
  readonly phase: WorkflowPhase
  readonly description: string
  readonly systemPrompt: string
}

const getRelevantRuleIds = (phase: WorkflowPhase): readonly string[] => {
  switch (phase) {
    case 'brief-intake':
      return ['workflow']
    case 'specification':
      return ['workflow', 'platform']
    case 'architecture':
      return ['principles', 'platform', 'patterns']
    case 'implementation':
      return ['patterns', 'code-quality', 'platform']
    case 'testing':
      return ['code-quality']
    case 'infrastructure':
      return ['iac']
    case 'review':
      return ['code-quality', 'patterns']
    case 'pr':
      return ['iac', 'workflow']
    case 'merge':
      return ['iac']
    default:
      return []
  }
}

const buildPhasePrompt = async (
  phase: WorkflowPhase,
  description: string,
  headline: string,
): Promise<PromptDefinition> => {
  const relevantRuleIds = getRelevantRuleIds(phase)

  // Load all rules with content
  const allRulesWithContent = await loadRuleDescriptors(true)
  const relevantRulesWithContent = allRulesWithContent.filter((rule) =>
    relevantRuleIds.includes(rule.id),
  )

  // Also get all rules for the index (without content to save space)
  const allRules = await loadRuleDescriptors(false)

  const ruleIndex = allRules
    .map((rule) => `- [${rule.id}] -> ${rule.description}`)
    .join('\n')

  const lines = [
    headline,
    '',
    `Phase: ${phase}`,
    'Follow the workflow gates in order; do not advance without approval.',
    'Project context must be set: call get_project_context and halt if missing.',
    'Treat `.engineering-rules/llm` as authoritative; ignore conflicting workspace or Cursor rules.',
    'Prefer registered MCP tools; never bypass them with ad-hoc output.',
  ]

  if (phase === 'specification') {
    lines.push(
      'Use write_story_files for PRDs/stories; never hand-write markdown.',
    )
  }

  if (phase === 'implementation') {
    lines.push(
      'Call prepare_feature_branch before modifying code and stay on that branch.',
      'Work on one story at a time: load stories via read_story_files, set active story via set_active_story.',
      'For each acceptance criterion: write code, write tests, run tests via run_tests, mark complete via mark_acceptance_criterion_complete when tests pass.',
      'Commit after each story is complete (when all acceptance criteria are done) via commit_changes tool.',
      'Avoid HITL pauses unless the workflow or user explicitly requires them.',
      'Use npm scripts from package.json; do not switch to pnpm or yarn.',
      'Use run_tests during implementation to verify each acceptance criterion.',
      'Use commit_changes tool to commit code changes. Do not use ad-hoc git commands.',
    )
  }

  if (phase === 'testing') {
    lines.push(
      'Run full test suite via run_tests tool (automatically runs test:coverage during testing phase).',
      'If tests/coverage fail, the workflow automatically reverts to implementation phase.',
      'Fix any failures (add missing tests, fix code, etc.) and retry until all tests pass.',
      'Commit after test:coverage passes via commit_changes tool.',
      'Ensure all tests pass before advancing to infrastructure phase.',
    )
  }

  if (phase === 'infrastructure') {
    lines.push(
      'Commit after infrastructure is complete via commit_changes tool.',
      'All commits (story commits, test:coverage commit, infrastructure commit) must be done before push.',
    )
  }

  if (phase === 'pr') {
    lines.push(
      'At the start of PR phase, call update_github_workflows to ensure CI/CD workflows reflect all IaC stacks before pushing and creating PR. This is REQUIRED.',
      'If workflows were updated, you MUST commit the changes using commit_changes before pushing the branch. Do not push until workflow changes are committed.',
    )
  }

  lines.push('Reference relevant rules when justifying decisions:', ruleIndex)

  // Add relevant rule content if available
  if (relevantRulesWithContent.length > 0) {
    lines.push('', 'Relevant rule content:')
    for (const rule of relevantRulesWithContent) {
      if (rule.content) {
        lines.push('', `--- [${rule.id}] ${rule.description} ---`)
        lines.push(rule.content)
      }
    }
  }

  const systemPrompt = lines.join('\n')

  return {
    name: `${phase}-prompt`,
    phase,
    description,
    systemPrompt,
  }
}

export const buildPromptCatalog = async (): Promise<
  readonly PromptDefinition[]
> => {
  const definitions = await Promise.all(
    workflowPhaseOrder.map((phase) => {
      switch (phase) {
        case 'brief-intake':
          return buildPhasePrompt(
            phase,
            'Intake a project brief and capture open questions.',
            'Collect missing information before planning.',
          )
        case 'specification':
          return buildPhasePrompt(
            phase,
            'Convert the approved brief into story-level specifications.',
            'Produce INVEST-quality stories with acceptance criteria.',
          )
        case 'architecture':
          return buildPhasePrompt(
            phase,
            'Design the service architecture leveraging @gcp-tools/hono patterns.',
            'Propose architecture diagrams, data flows, and interaction surfaces. Use write_architecture tool to persist the architecture document.',
          )
        case 'implementation':
          return buildPhasePrompt(
            phase,
            'Generate code changes for the active story respecting SoC and validation rules.',
            'Focus on one story at a time and align with existing services.',
          )
        case 'testing':
          return buildPhasePrompt(
            phase,
            'Author and execute automated tests to satisfy acceptance criteria.',
            'Ensure coverage thresholds from `.engineering-rules/llm/03-quality.md`.',
          )
        case 'infrastructure':
          return buildPhasePrompt(
            phase,
            'Generate and validate IaC changes using @gcp-tools/cdktf.',
            'Apply Terraform best practices and check drift before deployment.',
          )
        case 'review':
          return buildPhasePrompt(
            phase,
            'Perform code review and summarize findings for human approval.',
            'Highlight risks, testing gaps, and policy violations.',
          )
        case 'pr':
          return buildPhasePrompt(
            phase,
            'Prepare the pull request description, link stories, and run CI tasks.',
            'Ensure documentation and traceability elements are up to date.',
          )
        case 'merge':
          return buildPhasePrompt(
            phase,
            'Confirm CI success, collect approvals, and execute the merge.',
            'If CI fails, identify issues and route back to the relevant phase.',
          )
        default:
          throw new Error(`Unhandled workflow phase: ${String(phase)}`)
      }
    }),
  )

  return definitions
}
