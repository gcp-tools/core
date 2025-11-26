export type WorkflowPhase =
  | 'brief-intake'
  | 'specification'
  | 'architecture'
  | 'implementation'
  | 'testing'
  | 'infrastructure'
  | 'review'
  | 'pr'
  | 'merge'

export const workflowPhaseOrder: readonly WorkflowPhase[] = [
  'brief-intake',
  'specification',
  'architecture',
  'implementation',
  'testing',
  'infrastructure',
  'review',
  'pr',
  'merge',
]

export const requiresHumanApproval: readonly WorkflowPhase[] = [
  'brief-intake',
  'specification',
  'architecture',
  'review',
]
