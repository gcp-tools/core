import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

export const rootDir = resolve(here, '..', '..')
export const engineeringRulesDir = resolve(rootDir, '.engineering-rules', 'llm')
export const configDir = resolve(rootDir, 'config')
export const docsRoot = resolve(rootDir, 'docs')
