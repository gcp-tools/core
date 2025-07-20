import type { ToolResult } from '../../types.mts'
// import { deployOpsHandler } from './deploy-ops-handler.mjs';
// import { generateCodeHandler } from './generate-code-handler.mjs';
// import { generateInfraHandler } from './generate-infra-handler.mjs';
// import { generatePlanHandler } from './generate-plan-handler.mjs';
import { generateSpecHandler } from './generate-spec-handler.mjs'
// import { reviewCodeHandler } from './review-code-handler.mjs';
import { runFullPipelineHandler } from './run-full-pipeline-handler.mjs'
// import { runTestsHandler } from './run-tests-handler.mjs';
// import { validateCodePlanHandler } from './validate-code-plan-handler.mjs';
// import { validateInfraPlanHandler } from './validate-infra-plan-handler.mjs';
// import { continueOrchestratorHandler } from './continue-orchestrator-handler.mjs';
// import { approvePlanHandler } from './approve-plan-handler.mjs';
// import { approveDeploymentHandler } from './approve-deployment-handler.mjs';
// Add any additional handlers here

export const toolHandlers: Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: the handler registry does care about the type of the result
  (args: unknown) => Promise<ToolResult<any>>
> = {
  full_pipeline: runFullPipelineHandler,
  generate_spec: generateSpecHandler,
  // generate_plan: generatePlanHandler,
  // generate_code: generateCodeHandler,
  // generate_infra: generateInfraHandler,
  // run_tests: runTestsHandler,
  // review_code: reviewCodeHandler,
  // deploy_ops: deployOpsHandler,
  // validate_code_plan: validateCodePlanHandler,
  // validate_infra_plan: validateInfraPlanHandler,
  // continue_orchestrator: continueOrchestratorHandler,
  // approve_plan: approvePlanHandler,
  // approve_deployment: approveDeploymentHandler,
}
