import type { WorkflowPhase } from './phases.mjs'
import { workflowPhaseOrder } from './phases.mjs'
import {
  type FeatureContext,
  loadWorkflowState,
  type PhaseStatus,
  type PhaseStatusRecord,
  type ProjectContext,
  type ServiceContext,
  saveWorkflowState,
} from './state.mjs'

const phaseIndex = new Map<WorkflowPhase, number>(
  workflowPhaseOrder.map((phase, index) => [phase, index]),
)

const assertPhaseExists = (phase: WorkflowPhase): void => {
  if (!phaseIndex.has(phase)) {
    throw new Error(`Unknown workflow phase: ${phase}`)
  }
}

export const getCurrentPhase = async (): Promise<WorkflowPhase> => {
  const state = await loadWorkflowState()
  return state.currentPhase
}

export const getProjectContext = async (): Promise<
  ProjectContext | undefined
> => {
  const state = await loadWorkflowState()
  return state.projectContext
}

export const requireProjectContext = async (): Promise<ProjectContext> => {
  const context = await getProjectContext()
  if (!context) {
    throw new Error(
      'Project context missing. Call set_project_context before continuing.',
    )
  }
  return context
}

export const setProjectContext = async (
  context: Pick<ProjectContext, 'root'> & {
    readonly description?: string
    readonly setBy?: string
  },
): Promise<ProjectContext> => {
  const state = await loadWorkflowState()
  const projectContext: ProjectContext = {
    root: context.root,
    description: context.description,
    setBy: context.setBy,
    setAt: new Date().toISOString(),
  }

  await saveWorkflowState({
    ...state,
    projectContext,
  })

  return projectContext
}

type ServiceContextInput = Pick<
  ServiceContext,
  'kind' | 'name' | 'component' | 'relativePath'
>

export const getServiceContext = async (): Promise<
  ServiceContext | undefined
> => {
  const state = await loadWorkflowState()
  return state.serviceContext
}

export const requireServiceContext = async (): Promise<ServiceContext> => {
  const context = await getServiceContext()
  if (!context) {
    throw new Error(
      'Service context missing. Call set_service_context before continuing.',
    )
  }
  return context
}

export const setServiceContext = async (
  context: ServiceContextInput,
): Promise<ServiceContext> => {
  const state = await loadWorkflowState()
  const record: ServiceContext = {
    ...context,
    setAt: new Date().toISOString(),
  }

  await saveWorkflowState({
    ...state,
    serviceContext: record,
  })

  return record
}

type FeatureContextInput = Pick<FeatureContext, 'feature' | 'docsRelativePath'>

export const getFeatureContext = async (): Promise<
  FeatureContext | undefined
> => {
  const state = await loadWorkflowState()
  return state.featureContext
}

export const requireFeatureContext = async (): Promise<FeatureContext> => {
  const context = await getFeatureContext()
  if (!context) {
    throw new Error(
      'Feature context missing. Call set_feature_context before continuing.',
    )
  }
  return context
}

export const setFeatureContext = async (
  context: FeatureContextInput,
): Promise<FeatureContext> => {
  const state = await loadWorkflowState()
  const record: FeatureContext = {
    ...context,
    setAt: new Date().toISOString(),
  }

  await saveWorkflowState({
    ...state,
    featureContext: record,
  })

  return record
}

export const setFeatureBrief = async (
  path: string,
): Promise<FeatureContext> => {
  const state = await loadWorkflowState()
  const context = state.featureContext
  if (!context) {
    throw new Error(
      'Feature context missing. Call set_feature_context before continuing.',
    )
  }

  const record: FeatureContext = {
    ...context,
    brief: {
      path,
      updatedAt: new Date().toISOString(),
    },
  }

  await saveWorkflowState({
    ...state,
    featureContext: record,
  })

  return record
}

export const setFeatureArchitecture = async (
  path: string,
): Promise<FeatureContext> => {
  const state = await loadWorkflowState()
  const context = state.featureContext
  if (!context) {
    throw new Error(
      'Feature context missing. Call set_feature_context before continuing.',
    )
  }

  const record: FeatureContext = {
    ...context,
    architecture: {
      path,
      updatedAt: new Date().toISOString(),
    },
  }

  await saveWorkflowState({
    ...state,
    featureContext: record,
  })

  return record
}

export const setFeatureEnvironmentVariables = async (
  environmentVariables: Record<string, string>,
): Promise<FeatureContext> => {
  const state = await loadWorkflowState()
  const context = state.featureContext
  if (!context) {
    throw new Error(
      'Feature context missing. Call set_feature_context before continuing.',
    )
  }

  const record: FeatureContext = {
    ...context,
    environmentVariables,
  }

  await saveWorkflowState({
    ...state,
    featureContext: record,
  })

  return record
}

export const getEnvironmentVariables = async (): Promise<
  Record<string, string>
> => {
  const state = await loadWorkflowState()
  return state.featureContext?.environmentVariables ?? {}
}

export const requireFeatureBrief = async (): Promise<FeatureContext> => {
  const context = await requireFeatureContext()
  if (!context.brief) {
    throw new Error(
      'Feature brief missing. Call write_feature_brief before continuing.',
    )
  }
  return context
}

const assertBriefComplete = (state: {
  readonly featureContext?: FeatureContext
}): void => {
  if (!state.featureContext) {
    throw new Error(
      'Feature context missing. Call set_feature_context before continuing.',
    )
  }
  if (!state.featureContext.brief) {
    throw new Error(
      'Cannot advance from brief-intake to specification without calling write_feature_brief first.',
    )
  }
}

const assertArchitectureComplete = (state: {
  readonly featureContext?: FeatureContext
}): void => {
  if (!state.featureContext) {
    throw new Error(
      'Feature context missing. Call set_feature_context before continuing.',
    )
  }
  if (!state.featureContext.architecture) {
    throw new Error(
      'Cannot advance from architecture to implementation without calling write_architecture first.',
    )
  }
}

export const ensurePhase = async (phase: WorkflowPhase): Promise<void> => {
  assertPhaseExists(phase)
  const state = await loadWorkflowState()
  if (state.currentPhase !== phase) {
    throw new Error(
      `Operation requires phase "${phase}" but current phase is "${state.currentPhase}"`,
    )
  }
}

export const ensurePhaseAtLeast = async (
  phase: WorkflowPhase,
): Promise<void> => {
  assertPhaseExists(phase)
  const state = await loadWorkflowState()
  const currentIdx = phaseIndex.get(state.currentPhase) ?? -1
  const targetIdx = phaseIndex.get(phase) ?? -1
  if (currentIdx < targetIdx) {
    throw new Error(
      `Operation requires phase at least "${phase}" but current phase is "${state.currentPhase}"`,
    )
  }
}

export const setPhaseStatus = async (
  phase: WorkflowPhase,
  status: PhaseStatus,
  notes?: string,
): Promise<void> => {
  assertPhaseExists(phase)
  const state = await loadWorkflowState()
  const updated: PhaseStatusRecord = {
    status,
    updatedAt: new Date().toISOString(),
    ...(notes ? { notes } : {}),
  }

  const nextState = {
    ...state,
    phaseStatuses: {
      ...state.phaseStatuses,
      [phase]: updated,
    },
  }

  await saveWorkflowState(nextState)
}

export const advancePhase = async (
  nextPhase: WorkflowPhase,
  notes?: string,
): Promise<void> => {
  assertPhaseExists(nextPhase)
  const state = await loadWorkflowState()
  const currentIdx = phaseIndex.get(state.currentPhase) ?? -1
  const nextIdx = phaseIndex.get(nextPhase) ?? -1

  if (nextIdx === currentIdx) {
    return
  }

  if (nextIdx !== currentIdx + 1) {
    throw new Error(
      `Invalid transition from "${state.currentPhase}" to "${nextPhase}"`,
    )
  }

  if (!state.projectContext && nextIdx > 0) {
    throw new Error(
      'Project context missing. Call set_project_context before continuing.',
    )
  }

  if (!state.serviceContext && nextIdx > 0) {
    throw new Error(
      'Service context missing. Call set_service_context before continuing.',
    )
  }

  // Explicitly check for brief when transitioning from brief-intake to specification
  if (state.currentPhase === 'brief-intake' && nextPhase === 'specification') {
    assertBriefComplete(state)
  } else if (
    state.currentPhase === 'architecture' &&
    nextPhase === 'implementation'
  ) {
    // Check for architecture when transitioning from architecture to implementation
    assertArchitectureComplete(state)
  } else if (nextIdx > 0) {
    // For other transitions after brief-intake, ensure brief exists
    if (!state.featureContext || !state.featureContext.brief) {
      throw new Error(
        'Feature brief missing. Call set_feature_context and write_feature_brief.',
      )
    }
  }

  const timestamp = new Date().toISOString()

  const nextState = {
    ...state,
    currentPhase: nextPhase,
    phaseStatuses: {
      ...state.phaseStatuses,
      [state.currentPhase]: {
        status: 'complete',
        updatedAt: timestamp,
      },
      [nextPhase]: {
        status: 'in_progress',
        updatedAt: timestamp,
        ...(notes ? { notes } : {}),
      },
    },
  }

  await saveWorkflowState(nextState)
}

export const resetWorkflow = async (): Promise<void> => {
  const initialPhase = workflowPhaseOrder[0]
  const timestamp = new Date().toISOString()
  const phaseStatuses: Record<WorkflowPhase, PhaseStatusRecord> = {} as Record<
    WorkflowPhase,
    PhaseStatusRecord
  >

  for (const phase of workflowPhaseOrder) {
    phaseStatuses[phase] = {
      status: phase === initialPhase ? 'in_progress' : 'pending',
      updatedAt: timestamp,
    }
  }

  const state = await loadWorkflowState()

  await saveWorkflowState({
    currentPhase: initialPhase,
    phaseStatuses,
    ...(state.projectContext ? { projectContext: state.projectContext } : {}),
    ...(state.serviceContext ? { serviceContext: state.serviceContext } : {}),
    ...(state.featureContext ? { featureContext: state.featureContext } : {}),
  })
}

export const requirePhaseStatus = async (
  phase: WorkflowPhase,
  expected: PhaseStatus,
): Promise<void> => {
  assertPhaseExists(phase)
  const state = await loadWorkflowState()
  const status = state.phaseStatuses[phase].status
  if (status !== expected) {
    throw new Error(
      `Phase "${phase}" must be ${expected} but is currently ${status}`,
    )
  }
}

export const setActiveStoryId = async (
  storyId: string | undefined,
): Promise<void> => {
  const state = await loadWorkflowState()
  await saveWorkflowState({
    ...state,
    activeStoryId: storyId,
  })
}

export const getActiveStoryId = async (): Promise<string | undefined> => {
  const state = await loadWorkflowState()
  return state.activeStoryId
}

export { revertToPhase } from './transition.mjs'
