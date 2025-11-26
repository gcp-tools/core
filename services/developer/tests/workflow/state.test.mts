import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { describe, expect, it, afterEach, beforeEach } from 'vitest'

import {
  loadWorkflowState,
  saveWorkflowState,
  type WorkflowState,
} from '../../src/workflow/state.mjs'
import {
  workflowPhaseOrder,
  type WorkflowPhase,
} from '../../src/workflow/phases.mjs'

const buildPhaseStatuses = (
  currentPhase: WorkflowPhase,
  timestamp: string,
): WorkflowState['phaseStatuses'] => {
  const entries: Array<
    [WorkflowPhase, WorkflowState['phaseStatuses'][WorkflowPhase]]
  > = workflowPhaseOrder.map((phase) => [
    phase,
    {
      status: phase === currentPhase ? 'in_progress' : 'pending',
      updatedAt: timestamp,
    },
  ])

  return Object.fromEntries(entries) as WorkflowState['phaseStatuses']
}

describe('workflow state persistence', () => {
  let tempDir: string
  let statePath: string

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'developer-state-'))
    statePath = join(tempDir, 'state.json')
    process.env.GCP_TOOLS_DEVELOPER_STATE_PATH = statePath
  })

  afterEach(async () => {
    delete process.env.GCP_TOOLS_DEVELOPER_STATE_PATH
    await rm(tempDir, { recursive: true, force: true })
  })

  it('returns default state when no state file exists', async () => {
    const state = await loadWorkflowState()
    expect(state.currentPhase).toBe(workflowPhaseOrder[0])
    for (const phase of workflowPhaseOrder) {
      const phaseState = state.phaseStatuses[phase]
      expect(phaseState).toBeDefined()
    }
  })

  it('persists state to the configured file path', async () => {
    const targetPhase = workflowPhaseOrder[1] ?? workflowPhaseOrder[0]
    const timestamp = new Date().toISOString()

    const state: WorkflowState = {
      currentPhase: targetPhase,
      phaseStatuses: buildPhaseStatuses(targetPhase, timestamp),
      projectContext: {
        root: '/tmp/project',
        description: 'test project',
        setAt: timestamp,
        setBy: 'vitest',
      },
    }

    await saveWorkflowState(state)

    const diskContents = JSON.parse(
      await readFile(statePath, 'utf-8'),
    ) as WorkflowState

    expect(diskContents.currentPhase).toBe(targetPhase)
    expect(diskContents.projectContext?.root).toBe('/tmp/project')

    const reloaded = await loadWorkflowState()
    expect(reloaded.currentPhase).toBe(targetPhase)
    expect(reloaded.projectContext?.setBy).toBe('vitest')
    expect(reloaded.phaseStatuses[targetPhase].status).toBe('in_progress')
  })
})

