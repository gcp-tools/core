import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { FastMCP } from 'fastmcp'
import { z } from 'zod'

import { buildIacInventory } from '../lib/iac-discovery.mjs'
import {
  generateCiWorkflow,
  generateDeployWorkflow,
} from '../lib/workflow-generator.mjs'
import {
  ensurePhaseAtLeast,
  requireProjectContext,
} from '../workflow/engine.mjs'

export const registerWorkflowGenerationTools = (server: FastMCP): void => {
  server.addTool({
    name: 'update_github_workflows',
    description:
      'Update GitHub Actions workflow files (ci.yml, deploy.yml) to reflect all discovered IaC stacks. Must be called at the start of PR phase before push.',
    parameters: z.object({}),
    execute: async () => {
      await ensurePhaseAtLeast('pr')
      const { root: projectRoot } = await requireProjectContext()

      // Discover IaC inventory
      const inventory = buildIacInventory(projectRoot)

      const filesChanged: string[] = []
      let workflowsUpdated = false

      // Update ci.yml
      const ciWorkflowPath = resolve(projectRoot, '.github/workflows/ci.yml')
      if (existsSync(ciWorkflowPath)) {
        const existingCi = readFileSync(ciWorkflowPath, 'utf-8')
        const newCi = generateCiWorkflow(inventory, existingCi)
        if (newCi !== existingCi) {
          writeFileSync(ciWorkflowPath, newCi, 'utf-8')
          filesChanged.push('.github/workflows/ci.yml')
          workflowsUpdated = true
        }
      }

      // Update deploy.yml
      const deployWorkflowPath = resolve(
        projectRoot,
        '.github/workflows/deploy.yml',
      )
      if (existsSync(deployWorkflowPath)) {
        const existingDeploy = readFileSync(deployWorkflowPath, 'utf-8')
        const newDeploy = generateDeployWorkflow(inventory, existingDeploy)
        if (newDeploy !== existingDeploy) {
          writeFileSync(deployWorkflowPath, newDeploy, 'utf-8')
          filesChanged.push('.github/workflows/deploy.yml')
          workflowsUpdated = true
        }
      }

      return JSON.stringify({
        status: 'ok',
        workflowsUpdated,
        filesChanged,
        message: workflowsUpdated
          ? `Updated ${filesChanged.length} workflow file(s). Commit these changes before pushing.`
          : 'No workflow changes needed.',
      })
    },
  })
}
