import { realpath, stat } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'

import type { FastMCP } from 'fastmcp'
import { z } from 'zod'

import {
  advancePhase,
  ensurePhase,
  ensurePhaseAtLeast,
  getCurrentPhase,
  getProjectContext,
  resetWorkflow,
  setPhaseStatus,
  setProjectContext,
} from '../workflow/engine.mjs'
import type { WorkflowPhase } from '../workflow/phases.mjs'
import { workflowPhaseOrder } from '../workflow/phases.mjs'
import { loadWorkflowState } from '../workflow/state.mjs'

const workflowPhaseValues = [...workflowPhaseOrder] as [
  WorkflowPhase,
  ...WorkflowPhase[],
]
const phaseSchema = z.enum(workflowPhaseValues)
const statusSchema = z.enum(['pending', 'in_progress', 'complete', 'blocked'])

export const registerWorkflowTools = (server: FastMCP): void => {
  const setContextSchema = z
    .object({
      root: z.string().min(1, 'Project root path is required.'),
      description: z.string().trim().optional(),
      user: z.string().trim().optional(),
    })
    .describe('Set the repository root where workflow commands should execute.')

  server.addTool({
    name: 'set_project_context',
    description: 'Configure the target project root for all workflow actions.',
    parameters: setContextSchema,
    execute: async (input) => {
      const { root, description, user } = setContextSchema.parse(input)
      const candidate = isAbsolute(root) ? root : resolve(root)

      let actualRoot = candidate
      try {
        const canonical = await realpath(candidate)
        const stats = await stat(canonical)
        if (!stats.isDirectory()) {
          throw new Error(`Project root must be a directory: ${canonical}`)
        }
        actualRoot = canonical
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(`Unable to access project root "${root}": ${message}`)
      }

      const context = await setProjectContext({
        root: actualRoot,
        description,
        setBy: user,
      })

      return JSON.stringify({ status: 'ok', context })
    },
  })

  server.addTool({
    name: 'get_project_context',
    description: 'Retrieve the currently configured project root.',
    parameters: z.object({}).describe('No parameters required.'),
    execute: async () => {
      const context = await getProjectContext()
      if (!context) {
        return JSON.stringify({ status: 'unset' })
      }
      return JSON.stringify({ status: 'ok', context })
    },
  })

  server.addTool({
    name: 'get_workflow_state',
    description: 'Return the current workflow phase and status metadata.',
    parameters: z.object({}).describe('No parameters required.'),
    execute: async () => {
      const state = await loadWorkflowState()
      return JSON.stringify(state)
    },
  })

  server.addTool({
    name: 'advance_workflow_phase',
    description: 'Advance the workflow to the specified next phase.',
    parameters: z
      .object({
        phase: phaseSchema,
        notes: z.string().optional(),
      })
      .describe('Next phase must immediately follow the current phase.'),
    execute: async (input) => {
      const { phase, notes } = z
        .object({
          phase: phaseSchema,
          notes: z.string().optional(),
        })
        .parse(input)

      await advancePhase(phase, notes)
      const state = await loadWorkflowState()
      return JSON.stringify(state)
    },
  })

  server.addTool({
    name: 'set_phase_status',
    description:
      'Update the status of a workflow phase without changing order.',
    parameters: z
      .object({
        phase: phaseSchema,
        status: statusSchema,
        notes: z.string().optional(),
      })
      .describe('Typically used to mark phases as blocked or complete.'),
    execute: async (input) => {
      const { phase, status, notes } = z
        .object({
          phase: phaseSchema,
          status: statusSchema,
          notes: z.string().optional(),
        })
        .parse(input)

      await setPhaseStatus(phase, status, notes)
      const state = await loadWorkflowState()
      return JSON.stringify(state)
    },
  })

  server.addTool({
    name: 'reset_workflow',
    description: 'Reset workflow state back to the initial phase.',
    parameters: z.object({}).describe('No parameters required.'),
    execute: async () => {
      await resetWorkflow()
      const state = await loadWorkflowState()
      return JSON.stringify(state)
    },
  })

  server.addTool({
    name: 'assert_workflow_phase',
    description: 'Verify that the current phase matches the expected value.',
    parameters: z
      .object({
        phase: phaseSchema,
        atLeast: z.boolean().default(false),
      })
      .describe(
        'Use atLeast=true to allow operations in later phases, false for exact match.',
      ),
    execute: async (input) => {
      const { phase, atLeast } = z
        .object({
          phase: phaseSchema,
          atLeast: z.boolean().default(false),
        })
        .parse(input)

      if (atLeast) {
        await ensurePhaseAtLeast(phase)
      } else {
        await ensurePhase(phase)
      }

      const current = await getCurrentPhase()
      return JSON.stringify({ current })
    },
  })
}
