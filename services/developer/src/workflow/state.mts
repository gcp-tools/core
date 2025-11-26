import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, resolve } from 'node:path'

import type { WorkflowPhase } from './phases.mjs'
import { workflowPhaseOrder } from './phases.mjs'

const getStateFilePath = (): string => {
  const override = process.env.GCP_TOOLS_DEVELOPER_STATE_PATH?.trim()
  if (override && override.length > 0) {
    return resolve(override)
  }

  return resolve(homedir(), '.gcp-tools-developer', 'state.json')
}

export type PhaseStatus = 'pending' | 'in_progress' | 'complete' | 'blocked'

export type PhaseStatusRecord = {
  readonly status: PhaseStatus
  readonly updatedAt: string
  readonly notes?: string
}

export type ProjectContext = {
  readonly root: string
  readonly description?: string
  readonly setAt: string
  readonly setBy?: string
}

export type ServiceContext = {
  readonly kind: 'service' | 'app'
  readonly name: string
  readonly component: string
  readonly relativePath: string
  readonly setAt: string
}

export type FeatureContext = {
  readonly feature: string
  readonly docsRelativePath: string
  readonly setAt: string
  readonly environmentVariables?: Record<string, string>
  readonly brief?: {
    readonly path: string
    readonly updatedAt: string
  }
  readonly architecture?: {
    readonly path: string
    readonly updatedAt: string
  }
}

export type WorkflowState = {
  readonly currentPhase: WorkflowPhase
  readonly phaseStatuses: Record<WorkflowPhase, PhaseStatusRecord>
  readonly featureBranch?: string
  readonly pullRequestUrl?: string
  readonly lastGitSyncAt?: string
  readonly lastQualityRunAt?: string
  readonly lastCommitAt?: string
  readonly commitsCount?: number
  readonly activeStoryId?: string
  readonly projectContext?: ProjectContext
  readonly serviceContext?: ServiceContext
  readonly featureContext?: FeatureContext
}

const createDefaultState = (): WorkflowState => {
  const initialPhase = workflowPhaseOrder[0]
  const phaseStatuses: Record<WorkflowPhase, PhaseStatusRecord> = {} as Record<
    WorkflowPhase,
    PhaseStatusRecord
  >

  for (const phase of workflowPhaseOrder) {
    phaseStatuses[phase] = {
      status: phase === initialPhase ? 'in_progress' : 'pending',
      updatedAt: new Date(0).toISOString(),
    }
  }

  return {
    currentPhase: initialPhase,
    phaseStatuses,
  }
}

export const loadWorkflowState = async (): Promise<WorkflowState> => {
  const stateFilePath = getStateFilePath()
  try {
    const raw = await readFile(stateFilePath, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<WorkflowState>
    const base = createDefaultState()

    return {
      ...base,
      ...parsed,
      phaseStatuses: {
        ...base.phaseStatuses,
        ...(parsed.phaseStatuses ?? {}),
      },
    }
  } catch {
    return createDefaultState()
  }
}

export const saveWorkflowState = async (
  state: WorkflowState,
): Promise<void> => {
  const stateFilePath = getStateFilePath()
  await mkdir(dirname(stateFilePath), { recursive: true })
  const serialized = `${JSON.stringify(state, null, 2)}\n`
  const tempFilePath = `${stateFilePath}.${process.pid}.${Date.now()}.tmp`
  await writeFile(tempFilePath, serialized, 'utf-8')
  await rename(tempFilePath, stateFilePath)
}
