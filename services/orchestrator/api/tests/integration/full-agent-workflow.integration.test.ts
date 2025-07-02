import path from 'node:path'
import { Connection, WorkflowClient } from '@temporalio/client'
import { Worker } from '@temporalio/worker'
import { describe, expect, it } from 'vitest'
import * as activities from '../../src/activities/agent-activities.js'
import { fullAgentWorkflow } from '../../src/workflows/full-agent-workflow.js'

// NOTE: The Python agent API server must be running on localhost:8000 for this test to pass.

const testInputs = [
  { name: 'default', input: { foo: 'bar' } },
  { name: 'empty', input: {} },
  { name: 'extra fields', input: { foo: 'bar', extra: 123 } },
  {
    name: 'explicit workflowId',
    input: { workflowId: 'wf-test-1', foo: 'bar' },
  },
  { name: 'special characters', input: { foo: '特殊字符' } },
  { name: 'large input', input: { foo: 'x'.repeat(10000) } },
]

describe.skip('fullAgentWorkflow (integration)', () => {
  let worker: Worker
  let client: WorkflowClient

  beforeAll(async () => {
    worker = await Worker.create({
      workflowsPath: path.resolve(
        __dirname,
        '../../src/workflows/full-agent-workflow',
      ),
      activities,
      taskQueue: 'integration-test-agent-orchestrator',
    })
    worker.run() // run in background
    client = new WorkflowClient()
  })

  afterAll(async () => {
    await worker.shutdown()
  })

  for (const { name, input } of testInputs) {
    it(`runs the full agent workflow end-to-end (${name})`, async () => {
      const handle = await client.start(fullAgentWorkflow, {
        args: [input],
        taskQueue: 'integration-test-agent-orchestrator',
        workflowId: `full-agent-integration-${name}-${Date.now()}`,
      })
      const result = await handle.result()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(7)
      for (const step of result) {
        expect(step).toHaveProperty('result')
        expect(step).toHaveProperty('input')
        expect(step.input).toEqual(input) // All stubs echo the input
      }
    }, 20000) // 20s timeout
  }
})
