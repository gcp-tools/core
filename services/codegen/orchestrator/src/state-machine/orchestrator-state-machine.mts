// Type-safe, generic orchestrator state machine (no XState/Robot3)
// Core types and transition logic for orchestrator

// --- Context and Tool Output Types ---
export type OrchestratorContext = {
  projectDescription?: string
  requirements?: { requirements: string[]; clarifyingQuestions: string[] }
  clarifyingQuestions?: string[]
  // userAnswers?: string
  // plan?: string
  // planFeedback?: string
  // language?: string
  // code?: string
  // codeValidationResult?: unknown
  // codeUpdateAttempts?: number
  // testResults?: string
  // testUpdateAttempts?: number
  // iac?: string
  // infraValidationResult?: unknown
  // infraUpdateAttempts?: number
  // opsPlan?: string
  error?: string
  messageHistory: Array<{ role: string; content: string }>
  metrics: Record<string, unknown>
}

// --- Events ---
export type OrchestratorEvent =
  | { type: 'SUBMIT_BRIEF'; projectDescription: string }
  | {
      type: 'SPEC_DONE'
      result: { requirements: string[]; clarifyingQuestions: string[] }
    }
  | { type: 'SPEC_ERROR'; error: string }
  | { type: 'PIPELINE_DONE'; result: unknown }
  | { type: 'PIPELINE_ERROR'; error: string }
// | { type: 'SUBMIT_ANSWERS'; answers: string }
// | { type: 'REVIEW_SPEC_DONE'; result: { requirements: string[]; clarifyingQuestions: string[] } }
// | { type: 'REVIEW_SPEC_ERROR'; error: string }
// | { type: 'PLAN_DONE'; result: { plan: string } }
// | { type: 'PLAN_ERROR'; error: string }
// | { type: 'SUBMIT_PLAN_FEEDBACK'; feedback: string }
// | { type: 'SUBMIT_LANGUAGE'; language: string }
// | { type: 'REVIEW_PLAN_DONE'; result: { plan: string } }
// | { type: 'REVIEW_PLAN_ERROR'; error: string }
// | { type: 'CODE_DONE'; result: { code: string } }
// | { type: 'CODE_ERROR'; error: string }
// | { type: 'VALIDATE_CODE_DONE'; result: { ok: boolean } }
// | { type: 'VALIDATE_CODE_ERROR'; error: string }
// | { type: 'TESTS_DONE'; result: { test_code: string } }
// | { type: 'TESTS_ERROR'; error: string }
// | { type: 'RUN_TESTS_DONE'; result: { ok: boolean; test_code: string } }
// | { type: 'RUN_TESTS_ERROR'; error: string }
// | { type: 'INFRA_DONE'; result: { iac_code: string } }
// | { type: 'INFRA_ERROR'; error: string }
// | { type: 'VALIDATE_INFRA_DONE'; result: { ok: boolean } }
// | { type: 'VALIDATE_INFRA_ERROR'; error: string }
// | { type: 'DEPLOY_DONE'; result: { ops_plan: string } }
// | { type: 'DEPLOY_ERROR'; error: string }
// | { type: 'RETRY' }
// | { type: 'CANCEL' }

// --- States ---
export type OrchestratorState =
  | { state: 'idle'; context: OrchestratorContext }
  | { state: 'specGeneration'; context: OrchestratorContext }
  | { state: 'fullPipeline'; context: OrchestratorContext }
  // | { state: 'specHITL'; context: OrchestratorContext }
  // | { state: 'specReview'; context: OrchestratorContext }
  // | { state: 'planGeneration'; context: OrchestratorContext }
  // | { state: 'planHITL'; context: OrchestratorContext }
  // | { state: 'planReview'; context: OrchestratorContext }
  // | { state: 'codeGeneration'; context: OrchestratorContext }
  // | { state: 'validateCodePlan'; context: OrchestratorContext }
  // | { state: 'updateCode'; context: OrchestratorContext }
  // | { state: 'testGeneration'; context: OrchestratorContext }
  // | { state: 'runTests'; context: OrchestratorContext }
  // | { state: 'updateTests'; context: OrchestratorContext }
  // | { state: 'infraGeneration'; context: OrchestratorContext }
  // | { state: 'validateInfraPlan'; context: OrchestratorContext }
  // | { state: 'updateInfra'; context: OrchestratorContext }
  // | { state: 'deployment'; context: OrchestratorContext }
  | { state: 'done'; context: OrchestratorContext }
  | { state: 'error'; context: OrchestratorContext }

// --- Pure Transition Function ---
export function orchestratorTransition(
  state: OrchestratorState,
  event: OrchestratorEvent,
): OrchestratorState {
  switch (state.state) {
    case 'idle':
      if (event.type === 'SUBMIT_BRIEF') {
        return {
          state: 'specGeneration',
          context: {
            ...state.context,
            projectDescription: event.projectDescription,
            messageHistory: [
              { role: 'user', content: event.projectDescription },
            ],
            // metrics: { ...state.context.metrics, start: Date.now() },
          },
        }
      }
      break
    case 'specGeneration':
      if (event.type === 'SPEC_DONE') {
        return {
          state: 'done',
          context: {
            ...state.context,
            requirements: event.result,
            metrics: { ...state.context.metrics, specGenerated: Date.now() },
          },
        }
      }
      if (event.type === 'SPEC_ERROR') {
        return {
          state: 'error',
          context: { ...state.context, error: event.error },
        }
      }
      break
    case 'fullPipeline':
      // Add full pipeline transitions here as needed
      break
    case 'done':
    case 'error':
      // No transitions
      break
    // case 'specHITL':
    // case 'specReview':
    // case 'planGeneration':
    // case 'planHITL':
    // case 'planReview':
    // case 'codeGeneration':
    // case 'validateCodePlan':
    // case 'updateCode':
    // case 'testGeneration':
    // case 'runTests':
    // case 'updateTests':
    // case 'infraGeneration':
    // case 'validateInfraPlan':
    // case 'updateInfra':
    // case 'deployment':
  }
  return state
}
