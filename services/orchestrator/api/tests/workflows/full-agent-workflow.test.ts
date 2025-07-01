import { describe, expect, it, vi } from 'vitest'
import * as workflow from '../../src/workflows/full-agent-workflow.js'

// Mock proxyActivities to return stub activities
vi.mock('@temporalio/workflow', () => ({
  proxyActivities: () => ({
    specActivity: vi.fn(async (input) => ({ result: 'spec', input })),
    planActivity: vi.fn(async (input) => {
      const planResult = {
        workflowId: 'test-wf',
        steps: ['spec', 'plan', 'codegen', 'test', 'infra', 'review', 'ops'],
        technologies: ['typescript', 'python'],
        description: 'Test workflow plan',
      }
      console.log('Mock planActivity returning:', { result: planResult, input })
      return { result: planResult, input }
    }),
    codegenActivity: vi.fn(async (input) => ({ result: 'codegen', input })),
    testActivity: vi.fn(async (input) => ({ result: 'test', input })),
    infraActivity: vi.fn(async (input) => ({ result: 'infra', input })),
    reviewActivity: vi.fn(async (input) => ({ result: 'review', input })),
    opsActivity: vi.fn(async (input) => ({ result: 'ops', input })),
  }),
}))

describe('fullAgentWorkflow', () => {
  it('calls all 7 activities in order and returns results', async () => {
    const input = { foo: 'bar' }
    const result = await workflow.fullAgentWorkflow(input)
    expect(result).toEqual([
      { result: 'spec', input },
      {
        result: {
          workflowId: 'test-wf',
          steps: ['spec', 'plan', 'codegen', 'test', 'infra', 'review', 'ops'],
          technologies: ['typescript', 'python'],
          description: 'Test workflow plan',
        },
        input,
      },
      { result: 'codegen', input },
      { result: 'test', input },
      { result: 'infra', input },
      { result: 'review', input },
      { result: 'ops', input },
    ])
  })
})
