// import { deployOpsHandler } from '../handlers/tool/deploy-ops-handler.mjs'
// import { generateCodeHandler } from '../handlers/tool/generate-code-handler.mjs'
// import { generateInfraHandler } from '../handlers/tool/generate-infra-handler.mjs'
// import { generatePlanHandler } from '../handlers/tool/generate-plan-handler.mjs'
import { generateSpecHandler } from '../handlers/tool/generate-spec-handler.mjs'
import { runFullPipelineHandler } from '../handlers/tool/run-full-pipeline-handler.mjs'
// import { generateTestsHandler } from '../handlers/tool/generate-tests-handler.mjs'
// import { runTestsHandler } from '../handlers/tool/run-tests-handler.mjs'
// import { validateCodePlanHandler } from '../handlers/tool/validate-code-plan-handler.mjs'
// import { validateInfraPlanHandler } from '../handlers/tool/validate-infra-handler.mjs'
import {
  type OrchestratorEvent,
  type OrchestratorState,
  orchestratorTransition,
} from './orchestrator-state-machine.mjs'

// --- Handler type ---
type Handler = (state: OrchestratorState) => Promise<OrchestratorEvent>

// --- Handler map ---
const stateHandlers: Record<string, Handler> = {
  specGeneration: async (state) => {
    const result = await generateSpecHandler({
      project_description: state.context.projectDescription,
    })
    if (result.status === 'SUCCESS') {
      return {
        type: 'SPEC_DONE',
        result: result.data,
      }
    }
    return { type: 'SPEC_ERROR', error: result.message ?? 'Unknown error' }
  },
  fullPipeline: async (state) => {
    const result = await runFullPipelineHandler({
      project_description: state.context.projectDescription,
    })
    if (result.status === 'SUCCESS') {
      return { type: 'PIPELINE_DONE', result: result.data }
    }
    return { type: 'PIPELINE_ERROR', error: result.message ?? 'Unknown error' }
  },
  // planGeneration: async (state) => {
  //   const result = await generatePlanHandler({
  //     requirements: state.context.requirements,
  //   })
  //   if (result.status === 'success') {
  //     return { type: 'PLAN_DONE', result: { plan: result.data } }
  //   }
  //   return { type: 'PLAN_ERROR', error: result.error ?? 'Unknown error' }
  // },
  // codeGeneration: async (state) => {
  //   const result = await generateCodeHandler({
  //     plan: state.context.plan,
  //     language: state.context.language,
  //   })
  //   if (result.status === 'success') {
  //     return { type: 'CODE_DONE', result: { code: result.data } }
  //   }
  //   return { type: 'CODE_ERROR', error: result.error ?? 'Unknown error' }
  // },
  // validateCodePlan: async (state) => {
  //   const result = await validateCodePlanHandler({
  //     code: state.context.code,
  //     plan: state.context.plan,
  //   })
  //   if (result.status === 'success') {
  //     return { type: 'VALIDATE_CODE_DONE', result: { ok: true } }
  //   }
  //   return {
  //     type: 'VALIDATE_CODE_ERROR',
  //     error: result.error ?? 'Unknown error',
  //   }
  // },
  // testGeneration: async (state) => {
  //   const result = await generateTestsHandler({ code: state.context.code })
  //   if (result.status === 'success') {
  //     return { type: 'TESTS_DONE', result: { test_code: result.data } }
  //   }
  //   return { type: 'TESTS_ERROR', error: result.error ?? 'Unknown error' }
  // },
  // runTests: async (state) => {
  //   const result = await runTestsHandler({ code: state.context.code })
  //   if (result.status === 'success') {
  //     return {
  //       type: 'RUN_TESTS_DONE',
  //       result: { ok: true, test_code: result.data },
  //     }
  //   }
  //   return { type: 'RUN_TESTS_ERROR', error: result.error ?? 'Unknown error' }
  // },
  // infraGeneration: async (state) => {
  //   const result = await generateInfraHandler({ plan: state.context.plan })
  //   if (result.status === 'success') {
  //     return { type: 'INFRA_DONE', result: { iac_code: result.data } }
  //   }
  //   return { type: 'INFRA_ERROR', error: result.error ?? 'Unknown error' }
  // },
  // validateInfraPlan: async (state) => {
  //   const result = await validateInfraPlanHandler({
  //     iac: state.context.iac,
  //     plan: state.context.plan,
  //   })
  //   if (result.status === 'success') {
  //     return { type: 'VALIDATE_INFRA_DONE', result: { ok: true } }
  //   }
  //   return {
  //     type: 'VALIDATE_INFRA_ERROR',
  //     error: result.error ?? 'Unknown error',
  //   }
  // },
  // deployment: async (state) => {
  //   const result = await deployOpsHandler({ code: state.context.code })
  //   if (result.status === 'success') {
  //     return { type: 'DEPLOY_DONE', result: { ops_plan: result.data } }
  //   }
  //   return { type: 'DEPLOY_ERROR', error: result.error ?? 'Unknown error' }
  // },
}

// --- HITL/user input states ---
// const hitlStates = new Set([
  // 'specHITL',
  // 'planHITL',
  // 'updateCode',
  // 'updateTests',
  // 'updateInfra',
// ])

// --- Main runner ---
export async function runOrchestratorLoop(initialBrief: string) {
  let state: OrchestratorState = {
    state: 'idle',
    context: {
      messageHistory: [],
      // codeUpdateAttempts: 0,
      // testUpdateAttempts: 0,
      // infraUpdateAttempts: 0,
      metrics: {},
    },
  }
  let event: OrchestratorEvent = {
    type: 'SUBMIT_BRIEF',
    projectDescription: initialBrief,
  }

  while (true) {
    state = orchestratorTransition(state, event)
    if (state.state === 'done' || state.state === 'error') break

    // if (hitlStates.has(state.state)) {
    //   // In a real app, you would wait for user input here
    //   // For demo, break and return state
    //   break
    // }

    const handler = stateHandlers[state.state]
    if (!handler) throw new Error(`No handler for state: ${state.state}`)
    event = await handler(state)
  }
  return state
}

/**
 * Continue the orchestrator from a paused HITL state.
 * @param currentState The current OrchestratorState (paused in HITL)
 * @param userEvent The OrchestratorEvent from user input (e.g. SUBMIT_ANSWERS)
 * @returns The new OrchestratorState after applying the event and running automation until next HITL or terminal state.
 */
export async function continueOrchestrator(
  currentState: OrchestratorState,
  userEvent: OrchestratorEvent,
): Promise<OrchestratorState> {
  let state = orchestratorTransition(currentState, userEvent)
  let event: OrchestratorEvent | undefined = undefined

  while (true) {
    if (state.state === 'done' || state.state === 'error') break
    // if (hitlStates.has(state.state)) break
    const handler = stateHandlers[state.state]
    if (!handler) throw new Error(`No handler for state: ${state.state}`)
    event = await handler(state)
    state = orchestratorTransition(state, event)
  }
  return state
}
