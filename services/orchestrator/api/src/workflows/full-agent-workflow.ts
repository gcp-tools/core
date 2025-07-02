import { proxyActivities } from '@temporalio/workflow'
import type { AgentInput, AgentResponse } from '../types/agent.js'
import { saveHitlState, type HitlState } from '../state/hitl-state.js'
import { promises as fs } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

const activities = proxyActivities<{
  specActivity(input: AgentInput): Promise<AgentResponse>
  planActivity(input: AgentInput): Promise<AgentResponse>
  codegenActivity(input: AgentInput): Promise<AgentResponse>
  testActivity(input: AgentInput): Promise<AgentResponse>
  infraActivity(input: AgentInput): Promise<AgentResponse>
  reviewActivity(input: AgentInput): Promise<AgentResponse>
  opsActivity(input: AgentInput): Promise<AgentResponse>
}>({
  startToCloseTimeout: '2 minutes',
})

/**
 * Full agent workflow: spec -> plan -> codegen -> test -> infra -> review -> ops
 * Each step calls the next agent and returns the results.
 * Returns an array of agent responses for all steps, or a HITL pause object if paused.
 */
export async function fullAgentWorkflow(
  input: AgentInput,
): Promise<AgentResponse[] | { status: 'paused'; hitl: HitlState }> {
  // Step 1: spec
  const spec = await activities.specActivity(input)

  // Step 2: plan
  const plan = await activities.planActivity(spec.input)

  // HITL pause after plan
  const planTaskId = `plan-${randomUUID()}`
  const planArtifactPath = join(__dirname, '../../artifacts', `plan-${planTaskId}.json`)
  await fs.mkdir(join(__dirname, '../../artifacts'), { recursive: true })
  await fs.writeFile(planArtifactPath, JSON.stringify(plan, null, 2), 'utf8')
  const planHitl: HitlState = {
    id: planTaskId,
    step: 'plan',
    artifactPath: planArtifactPath,
    status: 'paused',
    createdAt: new Date().toISOString(),
  }
  await saveHitlState(planHitl)
  // Return pause status for HITL review
  return { status: 'paused', hitl: planHitl }

  // --- Workflow resumes here after user approval of plan ---
  // The following code would be called after resuming with the reviewed plan artifact

  // Step 3: codegen
  // const code = await activities.codegenActivity(plan.input)

  // Step 4: test
  // const test = await activities.testActivity(code.input)

  // Step 5: infra
  // const infra = await activities.infraActivity(test.input)

  // Step 6: review
  // const review = await activities.reviewActivity(infra.input)

  // HITL pause after review
  // const reviewTaskId = `review-${randomUUID()}`
  // const reviewArtifactPath = join(__dirname, '../../artifacts', `review-${reviewTaskId}.json`)
  // await fs.writeFile(reviewArtifactPath, JSON.stringify(review, null, 2), 'utf8')
  // const reviewHitl: HitlState = {
  //   id: reviewTaskId,
  //   step: 'review',
  //   artifactPath: reviewArtifactPath,
  //   status: 'paused',
  //   createdAt: new Date().toISOString(),
  // }
  // await saveHitlState(reviewHitl)
  // return { status: 'paused', hitl: reviewHitl }

  // --- Workflow resumes here after user approval of review ---

  // Step 7: ops
  // const ops = await activities.opsActivity(review.input)

  // return [spec, plan, code, test, infra, review, ops]
}

export async function resumeAgentWorkflow(
  hitlId: string,
  reviewedArtifactPath: string,
): Promise<AgentResponse[] | { status: 'paused'; hitl: HitlState }> {
  const hitlState = await import('../state/hitl-state.js')
  const { loadHitlState, removeHitlState, saveHitlState } = hitlState
  const state = await loadHitlState(hitlId)
  if (!state) throw new Error(`No paused HITL state for id ${hitlId}`)
  const reviewedData = JSON.parse(await fs.readFile(reviewedArtifactPath, 'utf8'))
  if (state.step === 'plan') {
    // Resume from codegen step
    // Step 3: codegen
    const code = await activities.codegenActivity(reviewedData.input)
    // Step 4: test
    const test = await activities.testActivity(code.input)
    // Step 5: infra
    const infra = await activities.infraActivity(test.input)
    // Step 6: review
    const review = await activities.reviewActivity(infra.input)
    // HITL pause after review
    const reviewTaskId = `review-${randomUUID()}`
    const reviewArtifactPath = join(__dirname, '../../artifacts', `review-${reviewTaskId}.json`)
    await fs.writeFile(reviewArtifactPath, JSON.stringify(review, null, 2), 'utf8')
    const reviewHitl: HitlState = {
      id: reviewTaskId,
      step: 'review',
      artifactPath: reviewArtifactPath,
      status: 'paused',
      createdAt: new Date().toISOString(),
    }
    await saveHitlState(reviewHitl)
    await removeHitlState(hitlId)
    return { status: 'paused', hitl: reviewHitl }
  } else if (state.step === 'review') {
    // Resume from ops step
    const ops = await activities.opsActivity(reviewedData.input)
    await removeHitlState(hitlId)
    // For simplicity, return just the ops result; could return full trace if needed
    return [ops]
  } else {
    throw new Error(`Unknown HITL step: ${state.step}`)
  }
}
