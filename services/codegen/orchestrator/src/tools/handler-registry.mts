import { answerSpecQuestionHandler } from './pipeline/answer-spec-questions.mjs'
import { runFullPipelineHandler } from './pipeline/run-full-pipeline.mjs'

export const toolHandlers: Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: the handler registry does care about the type of the result
  (args: any) => Promise<any>
> = {
  full_pipeline: runFullPipelineHandler,
  answer_spec_question: answerSpecQuestionHandler,
}
