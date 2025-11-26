import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { configDir, engineeringRulesDir } from './paths.mjs'

export type RuleDescriptor = {
  readonly id: string
  readonly path: string
  readonly description: string
  readonly content?: string
}

export const loadRuleDescriptors = async (
  includeContent = false,
): Promise<readonly RuleDescriptor[]> => {
  const rulesMapPath = resolve(configDir, 'rules-map.json')
  const raw = await readFile(rulesMapPath, 'utf-8')
  const parsed = JSON.parse(raw) as Array<{
    readonly id: string
    readonly path: string
    readonly description: string
  }>

  if (!includeContent) {
    return parsed
  }

  const descriptors = await Promise.all(
    parsed.map(async (rule) => {
      try {
        const ruleFilePath = resolve(engineeringRulesDir, rule.path)
        const content = await readFile(ruleFilePath, 'utf-8')
        return {
          ...rule,
          content,
        }
      } catch {
        // If file doesn't exist or can't be read, return without content
        return rule
      }
    }),
  )

  return descriptors
}
