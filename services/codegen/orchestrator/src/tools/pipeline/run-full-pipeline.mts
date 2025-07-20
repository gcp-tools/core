import { z } from 'zod/v4'
import { runPipeline } from '../../state-machine/pipeline-runner.mjs'
import type { State } from '../../types.mjs'

export const runFullPipelineArgsSchema = z.object({
  brief: z.string().min(1, 'Brief is required'),
  githubIdentifier: z.string().min(1, 'GitHub identifier is required'),
  projectName: z.string().min(1, 'Project name is required'),
  codePath: z.string().min(1, 'Code path is required'),
})
export type RunFullPipelineArgs = z.infer<typeof runFullPipelineArgsSchema>

export const runFullPipelineHandler = async (input: RunFullPipelineArgs) => {
  const { brief, githubIdentifier, projectName, codePath } = input

  try {
    const state: State = {
      META: {
        githubIdentifier,
        projectName,
        codePath,
        version: 0,
        timestamp: new Date().toISOString(),
        outcome: 'OK',
      },
      GENERATE_SPEC: [
        {
          role: 'user',
          context: 'brief',
          content: [brief],
        },
      ],
      GENERATE_PLAN: [],
    }

    return await runPipeline(state, { from: 'INITIAL', outcome: 'OK' })
  } catch (e) {
    return {
      cause: e,
      data: input,
      message: 'Error Message from runFullPipelineHandler',
      status: 'TOOL_REQUEST_ERROR',
    }
  }
}
