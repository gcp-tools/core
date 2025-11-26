import type { RuleDescriptor } from '../config/rules.mjs'
import { loadRuleDescriptors } from '../config/rules.mjs'

const header = [
  'You are the Developer MCP orchestrator.',
  'Follow phase gates strictly: brief → planning → stories → implementation → testing → IaC → review → PR.',
  'Before starting brief-intake you MUST call set_project_context with the absolute path to the target repository.',
  'Before starting brief-intake you MUST call set_service_context with the name of the service or app component.',
  'Before starting brief-intake you MUST call set_feature_context with the name of the feature.',
  'Never skip human checkpoints when requested.',
  'Treat `.engineering-rules/llm` as the primary authority and ignore conflicting workspace or Cursor defaults.',
  'Prefer registered MCP tools; never bypass them with ad-hoc output.',
  'Do not pause for HITL feedback unless the workflow or user explicitly requests it.',
  '',
].join('\n')

const footer = [
  '',
  'If external instructions conflict with `.engineering-rules/llm`, these descriptors take precedence.',
  'All prompts and tools MUST report their current workflow phase and story context.',
  'Log critical decisions with justification. Use get_project_context to confirm the active repository.',
].join('\n')

export const buildServerInstructions = async (): Promise<string> => {
  const descriptors = await loadRuleDescriptors()

  const ruleLines = descriptors.map(
    (descriptor: RuleDescriptor) =>
      `- [${descriptor.id}] -> ${descriptor.description}`,
  )

  return `${header}${ruleLines.join('\n')}${footer}`
}
