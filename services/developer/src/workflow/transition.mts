import type { WorkflowPhase } from './phases.mjs'
import { workflowPhaseOrder } from './phases.mjs'
import {
  loadWorkflowState,
  type PhaseStatusRecord,
  saveWorkflowState,
} from './state.mjs'

const phaseOrder = new Map(
  workflowPhaseOrder.map((phase, index) => [phase, index] as const),
)

export const revertToPhase = async (
  targetPhase: WorkflowPhase,
  options: {
    readonly reason?: string
  } = {},
): Promise<void> => {
  const state = await loadWorkflowState()
  const currentIdx = phaseOrder.get(state.currentPhase) ?? -1
  const targetIdx = phaseOrder.get(targetPhase) ?? -1

  if (targetIdx === -1) {
    throw new Error(`Unknown workflow phase: ${targetPhase}`)
  }
  if (targetIdx >= currentIdx) {
    return
  }

  const timestamp = new Date().toISOString()
  const originalStatuses: Partial<Record<WorkflowPhase, PhaseStatusRecord>> = {
    ...state.phaseStatuses,
  }
  const phaseStatuses: Record<WorkflowPhase, PhaseStatusRecord> = {
    ...state.phaseStatuses,
  }

  workflowPhaseOrder.forEach((phase, index) => {
    if (index < targetIdx) {
      phaseStatuses[phase] = {
        status: 'complete',
        updatedAt: timestamp,
      }
    } else if (index === targetIdx) {
      phaseStatuses[phase] = {
        status: 'in_progress',
        updatedAt: timestamp,
        ...(options.reason ? { notes: options.reason } : {}),
      }
    } else {
      const existing = originalStatuses[phase]
      phaseStatuses[phase] = {
        status: 'pending',
        updatedAt: existing ? existing.updatedAt : timestamp,
      }
    }
  })

  await saveWorkflowState({
    ...state,
    currentPhase: targetPhase,
    phaseStatuses,
  })
}
