import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentRegistry } from '../../src/agents/registry.js'
import { AgentResponseSchema } from '../../src/types/agent.js'

vi.mock('axios')

const validResponse = {
  data: {
    result: 'stub result',
    input: { foo: 'bar' },
  },
}

const invalidResponse = {
  data: {
    // Missing required 'result' field
    input: { foo: 'bar' },
  },
}

const endpoints = [
  ['spec', '/spec'],
  ['plan', '/plan'],
  ['codegen', '/codegen'],
  ['test', '/test'],
  ['infra', '/infra'],
  ['review', '/review'],
  ['ops', '/ops'],
] as const

describe('AgentRegistry', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    ;(axios.post as jest.MockedFunction<typeof axios.post>).mockResolvedValue(
      validResponse,
    )
  })

  describe('valid responses', () => {
    for (const [method, path] of endpoints) {
      it(`calls ${path} and returns validated data for ${method}`, async () => {
        const registry = new AgentRegistry('http://localhost:8000')
        // @ts-expect-error: dynamic method
        const result = await registry[method]({ foo: 'bar' })

        expect(axios.post).toHaveBeenCalledWith(
          `http://localhost:8000${path}`,
          { foo: 'bar' },
        )
        expect(result).toEqual(validResponse.data)

        // Verify the result passes Zod validation
        expect(() => AgentResponseSchema.parse(result)).not.toThrow()
      })
    }
  })

  describe('invalid responses', () => {
    for (const [method, path] of endpoints) {
      it(`throws validation error for invalid ${method} response`, async () => {
        ;(
          axios.post as jest.MockedFunction<typeof axios.post>
        ).mockResolvedValue(invalidResponse)
        const registry = new AgentRegistry('http://localhost:8000')

        // @ts-expect-error: dynamic method
        await expect(registry[method]({ foo: 'bar' })).rejects.toThrow()
      })
    }
  })

  describe('validation', () => {
    it('validates response structure', () => {
      expect(() => AgentResponseSchema.parse(validResponse.data)).not.toThrow()
      expect(() => AgentResponseSchema.parse(invalidResponse.data)).toThrow()
    })

    it('allows additional properties', () => {
      const responseWithExtra = {
        ...validResponse.data,
        extraField: 'extra value',
        nested: { foo: 'bar' },
      }
      expect(() => AgentResponseSchema.parse(responseWithExtra)).not.toThrow()
    })

    it('requires result to be non-empty string', () => {
      const invalidResults = [
        { result: '', input: { foo: 'bar' } },
        { result: 123, input: { foo: 'bar' } },
        { result: null, input: { foo: 'bar' } },
        { input: { foo: 'bar' } }, // missing result
      ]

      for (const invalid of invalidResults) {
        expect(() => AgentResponseSchema.parse(invalid)).toThrow()
      }
    })
  })
})
