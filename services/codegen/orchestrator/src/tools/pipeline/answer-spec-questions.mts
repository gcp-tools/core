import { z } from 'zod/v4'
import { readStateFromFile } from '../../lib/read-state.mjs'
import { runPipeline } from '../../state-machine/pipeline-runner.mjs'

export const answerSpecQuestionArgsSchema = z.object({
  answers: z.array(z.string()).min(1, 'Answers are required'),
})
export type AnswerSpecQuestionArgs = z.infer<
  typeof answerSpecQuestionArgsSchema
>

export const answerSpecQuestionHandler = async (
  input: AnswerSpecQuestionArgs,
) => {
  const { answers } = input

  try {
    const state = await readStateFromFile()

    if (!state) {
      return {
        cause: new Error('No state file found'),
        data: input,
        message: 'No state file found',
        status: 'TOOL_REQUEST_ERROR',
      }
    }

    state.GENERATE_SPEC.push({
      role: 'user',
      context: 'answers',
      content: answers,
    })

    return await runPipeline(state, { from: 'GENERATE_SPEC', outcome: 'HITL' })
  } catch (e) {
    return {
      cause: e,
      data: input,
      message: 'Error Message from answerSpecQuestionHandler',
      status: 'TOOL_REQUEST_ERROR',
    }
  }
}
