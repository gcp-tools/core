import { writeFile } from 'node:fs/promises'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { State } from '../types.mjs'

export async function writeStateToFile(state: State) {
  const filename = `pipeline-state-step-${state.META.version}.json`
  const filepath = join(process.cwd(), 'pipeline-states', filename)

  await mkdir(join(process.cwd(), 'pipeline-states'), { recursive: true })

  await writeFile(filepath, JSON.stringify(state, null, 2), 'utf8')
  console.log(`State written to: ${filepath}`)
}
