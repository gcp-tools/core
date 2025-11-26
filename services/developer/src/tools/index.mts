import type { FastMCP } from 'fastmcp'

import { registerArchitectureTools } from './architecture.mjs'
import { registerContextTools } from './context.mjs'
import { registerGitTools } from './git.mjs'
import { registerIacTools } from './iac.mjs'
import { registerLogTools } from './logs.mjs'
import { registerMonitorTools } from './monitor.mjs'
import { registerPlannerTools } from './planner.mjs'
import { registerQualityTools } from './quality.mjs'
import { registerReviewTools } from './review.mjs'
import { registerStoryTools } from './stories.mjs'
import { registerSyncTools } from './sync.mjs'
import { registerTestTools } from './tests.mjs'
import { registerWorkflowTools } from './workflow.mjs'
import { registerWorkflowGenerationTools } from './workflows.mjs'

export const registerTools = async (server: FastMCP): Promise<void> => {
  await registerPlannerTools(server)
  registerWorkflowTools(server)
  registerContextTools(server)
  registerStoryTools(server)
  registerArchitectureTools(server)
  registerGitTools(server)
  registerSyncTools(server)
  registerQualityTools(server)
  registerTestTools(server)
  registerIacTools(server)
  registerWorkflowGenerationTools(server)
  registerReviewTools(server)
  registerMonitorTools(server)
  registerLogTools(server)
}
