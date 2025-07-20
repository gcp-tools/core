import { z } from 'zod'
import { runOrchestratorLoop } from '../../state-machine/orchestrator-state-machine-runner.mjs'
import type { ToolHandler } from '../../types.mts'

export const RunFullPipelineArgsSchema = z.object({
  project_description: z.string().min(1, 'Project description is required'),
})
export type RunFullPipelineArgs = z.infer<typeof RunFullPipelineArgsSchema>

export const RunFullPipelineResultSchema = z.object({
  state: z.string(),
})
export type RunFullPipelineResult = z.infer<typeof RunFullPipelineResultSchema>

export const runFullPipelineHandler: ToolHandler<
  RunFullPipelineResult
> = async (input) => {
  const parsed = RunFullPipelineArgsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      cause: parsed.error.issues,
      data: input,
      message: 'Invalid input data',
      status: 'TOOL_REQUEST_ERROR',
    }
  }
  const { project_description } = parsed.data

  try {
    const finalState = await runOrchestratorLoop(project_description)
    if (finalState.state === 'done') {
      return {
        status: 'SUCCESS',
        data: { state: finalState.state },
      }
    }
    return {
      status: 'TOOL_AGENT_ERROR',
      message: 'Pipeline did not complete successfully',
    }
  } catch (e) {
    return {
      status: 'TOOL_AGENT_ERROR',
      message: 'Error Message from runFullPipelineHandler',
      cause: e,
    }
  }
}
