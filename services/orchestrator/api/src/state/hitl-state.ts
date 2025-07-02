import { promises as fs } from 'fs'
import { join } from 'path'

export type HitlStep = 'plan' | 'review'
export type HitlStatus = 'paused' | 'resumed'

export type HitlState = {
  id: string
  step: HitlStep
  artifactPath: string
  status: HitlStatus
  createdAt: string
}

const HITL_STATE_DIR = join(__dirname, '../hitl-state')

export async function saveHitlState(state: HitlState): Promise<void> {
  await fs.mkdir(HITL_STATE_DIR, { recursive: true })
  const file = join(HITL_STATE_DIR, `${state.id}.json`)
  await fs.writeFile(file, JSON.stringify(state, null, 2), 'utf8')
}

export async function loadHitlState(id: string): Promise<HitlState | null> {
  const file = join(HITL_STATE_DIR, `${id}.json`)
  try {
    const data = await fs.readFile(file, 'utf8')
    return JSON.parse(data) as HitlState
  } catch {
    return null
  }
}

export async function listHitlTasks(): Promise<HitlState[]> {
  await fs.mkdir(HITL_STATE_DIR, { recursive: true })
  const files = await fs.readdir(HITL_STATE_DIR)
  const states: HitlState[] = []
  for (const file of files) {
    if (file.endsWith('.json')) {
      const data = await fs.readFile(join(HITL_STATE_DIR, file), 'utf8')
      states.push(JSON.parse(data) as HitlState)
    }
  }
  return states
}

export async function removeHitlState(id: string): Promise<void> {
  const file = join(HITL_STATE_DIR, `${id}.json`)
  await fs.rm(file, { force: true })
}

export async function resumeHitlState(id: string, newArtifactPath: string): Promise<void> {
  const state = await loadHitlState(id)
  if (!state) return
  state.status = 'resumed'
  state.artifactPath = newArtifactPath
  await saveHitlState(state)
}
