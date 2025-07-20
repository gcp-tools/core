import { writeStateToFile } from '../lib/write-state.mjs'
import type { State } from '../types.mjs'
import { getNextHandler } from './pipeline-transitions.mjs'
import type { PipelineTransition } from './pipeline-transitions.mjs'

export async function runPipeline(
  initialState: State,
  transition: PipelineTransition,
) {
  let state = initialState
  let result = transition

  while (true) {
    const handler = getNextHandler(result)
    const res = await handler(state)

    state = res.state
    state.META.version++
    state.META.timestamp = new Date().toISOString()
    state.META.outcome = res.outcome

    console.log(res)

    await writeStateToFile(state)

    if (res.outcome === 'ERROR') break
    if (res.outcome === 'HITL') break
    if (res.outcome === 'DONE') break

    // TODO: fix this cast.
    result = { from: res.from, outcome: res.outcome } as PipelineTransition
  }

  return {
    state,
    result,
  }
}
