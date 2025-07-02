import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AgentRegistry } from '../../src/agents/registry.js'
import * as lintUtils from '../../src/utils/lint-with-feedback.js'
import * as ruffUtils from '../../src/utils/ruff.js'
import axios from 'axios'

vi.mock('axios')
vi.mock('../../src/utils/lint-with-feedback.js')
vi.mock('../../src/utils/ruff.js')

describe('AgentRegistry codegen lint/feedback', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    ;(lintUtils.lintWithFeedback as any).mockResolvedValue('print("hi")')
    ;(ruffUtils.runRuff as any).mockResolvedValue({ success: true, output: '' })
    ;(axios.post as any).mockResolvedValue({
      data: { result: 'stub result', input: { foo: 'bar' }, output: 'print("hi")' },
    })
  })

  it('calls lintWithFeedback for typescript', async () => {
    const registry = new AgentRegistry('http://localhost:8000')
    const result = await registry.codegen({ language: 'typescript', foo: 'bar' })
    expect(lintUtils.lintWithFeedback).toHaveBeenCalled()
    expect(result.output).toBe('print("hi")')
  })

  it('calls lintWithFeedback for python', async () => {
    const registry = new AgentRegistry('http://localhost:8000')
    const result = await registry.codegen({ language: 'python', foo: 'bar' })
    expect(lintUtils.lintWithFeedback).toHaveBeenCalled()
    expect(ruffUtils.runRuff).toHaveBeenCalled()
    expect(result.output).toBe('print("hi")')
  })

  it('calls lintWithFeedback for rust', async () => {
    const registry = new AgentRegistry('http://localhost:8000')
    const result = await registry.codegen({ language: 'rust', foo: 'bar' })
    expect(lintUtils.lintWithFeedback).toHaveBeenCalled()
    expect(result.output).toBe('print("hi")')
  })
})
