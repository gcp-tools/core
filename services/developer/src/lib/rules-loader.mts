import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { rootDir } from '../config/paths.mjs'
import { loadRuleDescriptors, type RuleDescriptor } from '../config/rules.mjs'

export type RuleContent = RuleDescriptor & {
  readonly contents: string
}

export const loadAllRuleContent = async (): Promise<readonly RuleContent[]> => {
  const descriptors = await loadRuleDescriptors()

  const entries = await Promise.all(
    descriptors.map(async (descriptor: RuleDescriptor) => {
      const absolutePath = resolve(rootDir, descriptor.path)
      const contents = await readFile(absolutePath, 'utf-8')
      return {
        ...descriptor,
        contents,
      } satisfies RuleContent
    }),
  )

  return entries
}
