import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as workflow from '../../src/workflows/basic-agent-workflow.js'

// Mock proxyActivities to return stub activities
vi.mock('@temporalio/workflow', () => ({
  proxyActivities: () => ({
    planActivity: vi.fn(async (input) => ({ result: 'plan', input })),
    codegenActivity: vi.fn(async (input) => ({ result: 'codegen', input })),
    reviewActivity: vi.fn(async (input) => ({ result: 'review', input })),
  }),
}))

describe('basicAgentWorkflow', () => {
  it('calls plan, codegen, review in order and returns results', async () => {
    const input = { foo: 'bar' }
    const result = await workflow.basicAgentWorkflow(input)
    expect(result).toEqual([
      { result: 'plan', input },
      { result: 'codegen', input },
      { result: 'review', input },
    ])
  })
})
