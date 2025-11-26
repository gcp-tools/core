import type { FastMCP } from 'fastmcp'
import { z } from 'zod'

import { buildPromptCatalog } from '../prompts/index.mjs'
import { workflowPhaseOrder } from '../workflow/phases.mjs'

const noParams = z.object({}).describe('No parameters required.')

export const registerPlannerTools = async (server: FastMCP): Promise<void> => {
  const catalog = await buildPromptCatalog()

  server.addTool({
    name: 'list_workflow_prompts',
    description: 'List available workflow prompts and their metadata.',
    parameters: noParams,
    execute: async () => {
      return await Promise.resolve(
        JSON.stringify({
          phases: workflowPhaseOrder,
          prompts: catalog,
        }),
      )
    },
  })
}
