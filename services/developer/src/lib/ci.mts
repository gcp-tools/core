import type { WorkflowPhase } from '../workflow/phases.mjs'
import { workflowPhaseOrder } from '../workflow/phases.mjs'

export type StatusRollupConclusion =
  | 'SUCCESS'
  | 'FAILURE'
  | 'PENDING'
  | 'UNKNOWN'

export type PullRequestStatus = {
  readonly url?: string
  readonly mergeStateStatus?: string
  readonly statusCheckRollup?: {
    readonly conclusion?: string
    readonly state?: string
    readonly checks?: readonly StatusCheck[]
  }
}

export type StatusRollup = {
  readonly conclusion: StatusRollupConclusion
  readonly failingChecks: readonly StatusCheck[]
}

export type StatusCheck = {
  readonly name: string
  readonly conclusion?: string
  readonly status?: string
  readonly url?: string
}

const phaseOrder = new Map(
  workflowPhaseOrder.map((phase, index) => [phase, index] as const),
)

export const earliestPhaseFromStatus = (
  statusConclusion: StatusRollupConclusion,
): WorkflowPhase | undefined => {
  switch (statusConclusion) {
    case 'SUCCESS':
      return 'merge'
    case 'PENDING':
      return 'review'
    case 'FAILURE':
      return 'testing'
    default:
      return undefined
  }
}

export const parseStatusConclusion = (
  status?: PullRequestStatus,
): StatusRollup => {
  const rollup = status?.statusCheckRollup
  const checks = rollup?.checks ?? []

  if (!rollup) {
    return {
      conclusion: 'UNKNOWN',
      failingChecks: checks,
    }
  }

  const conclusion = rollup.conclusion?.toUpperCase()
  const state = rollup.state?.toUpperCase()

  if (conclusion === 'SUCCESS') {
    return {
      conclusion: 'SUCCESS',
      failingChecks: [],
    }
  }

  if (conclusion === 'FAILURE') {
    return {
      conclusion: 'FAILURE',
      failingChecks: checks,
    }
  }

  if (state === 'PENDING' || state === 'QUEUED' || state === 'IN_PROGRESS') {
    return {
      conclusion: 'PENDING',
      failingChecks: checks,
    }
  }

  return {
    conclusion: 'UNKNOWN',
    failingChecks: checks,
  }
}

export const isPhaseBefore = (
  first: WorkflowPhase,
  second: WorkflowPhase,
): boolean => {
  const firstIdx = phaseOrder.get(first) ?? -1
  const secondIdx = phaseOrder.get(second) ?? -1
  return firstIdx < secondIdx
}
