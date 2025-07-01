import { describe, expect, it } from 'vitest'
import {
  getValidationErrors,
  isAgentResponse,
  isArtifact,
  safeParseAgentResponse,
  safeParseArtifact,
  validateAgentResponse,
  validateAgentResponseFromJson,
  validateArtifact,
  validateArtifactFromJson,
} from '../../src/utils/validation.js'

describe('Validation Utils', () => {
  describe('validateArtifact', () => {
    it('validates valid artifacts', () => {
      const validArtifacts = [
        {
          workflowId: 'test-wf',
          steps: ['step1'],
          technologies: ['python'],
          description: 'test',
        },
        {
          files: [{ path: 'main.py', content: 'test', language: 'python' }],
        },
        {
          passed: true,
          results: [{ name: 'test', status: 'passed' }],
        },
      ]

      validArtifacts.forEach((artifact, index) => {
        expect(() => validateArtifact(artifact)).not.toThrow(
          `Artifact ${index} should be valid`,
        )
      })
    })

    it('throws for invalid artifacts', () => {
      const invalidArtifacts = [
        { invalid: 'data' },
        { workflowId: 'test' }, // missing required fields
        { files: [] }, // empty files
      ]

      invalidArtifacts.forEach((artifact, index) => {
        expect(() => validateArtifact(artifact)).toThrow()
      })
    })
  })

  describe('safeParseArtifact', () => {
    it('returns success for valid artifacts', () => {
      const validArtifact = {
        workflowId: 'test-wf',
        steps: ['step1'],
        technologies: ['python'],
        description: 'test',
      }

      const result = safeParseArtifact(validArtifact)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validArtifact)
      }
    })

    it('returns error for invalid artifacts', () => {
      const invalidArtifact = { invalid: 'data' }

      const result = safeParseArtifact(invalidArtifact)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error)
        expect(result.error.errors).toBeDefined()
      }
    })
  })

  describe('validateAgentResponse', () => {
    it('validates valid agent responses', () => {
      const validResponse = {
        result: 'success',
        input: { foo: 'bar' },
      }

      expect(() => validateAgentResponse(validResponse)).not.toThrow()
    })

    it('throws for invalid agent responses', () => {
      const invalidResponses = [
        { input: { foo: 'bar' } }, // missing result
        { result: '', input: { foo: 'bar' } }, // empty result
        { result: 123, input: { foo: 'bar' } }, // wrong type
      ]

      invalidResponses.forEach((response, index) => {
        expect(() => validateAgentResponse(response)).toThrow()
      })
    })
  })

  describe('safeParseAgentResponse', () => {
    it('returns success for valid agent responses', () => {
      const validResponse = {
        result: 'success',
        input: { foo: 'bar' },
      }

      const result = safeParseAgentResponse(validResponse)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validResponse)
      }
    })

    it('returns error for invalid agent responses', () => {
      const invalidResponse = { input: { foo: 'bar' } }

      const result = safeParseAgentResponse(invalidResponse)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error)
        expect(result.error.errors).toBeDefined()
      }
    })
  })

  describe('validateArtifactFromJson', () => {
    it('validates valid JSON artifacts', () => {
      const validArtifact = {
        workflowId: 'test-wf',
        steps: ['step1'],
        technologies: ['python'],
        description: 'test',
      }

      const jsonString = JSON.stringify(validArtifact)
      expect(() => validateArtifactFromJson(jsonString)).not.toThrow()
    })

    it('throws for invalid JSON', () => {
      expect(() => validateArtifactFromJson('invalid json')).toThrow()
    })

    it('throws for valid JSON but invalid artifact', () => {
      const invalidArtifact = { invalid: 'data' }
      const jsonString = JSON.stringify(invalidArtifact)
      expect(() => validateArtifactFromJson(jsonString)).toThrow()
    })
  })

  describe('validateAgentResponseFromJson', () => {
    it('validates valid JSON agent responses', () => {
      const validResponse = {
        result: 'success',
        input: { foo: 'bar' },
      }

      const jsonString = JSON.stringify(validResponse)
      expect(() => validateAgentResponseFromJson(jsonString)).not.toThrow()
    })

    it('throws for invalid JSON', () => {
      expect(() => validateAgentResponseFromJson('invalid json')).toThrow()
    })

    it('throws for valid JSON but invalid response', () => {
      const invalidResponse = { input: { foo: 'bar' } }
      const jsonString = JSON.stringify(invalidResponse)
      expect(() => validateAgentResponseFromJson(jsonString)).toThrow()
    })
  })

  describe('isArtifact', () => {
    it('returns true for valid artifacts', () => {
      const validArtifacts = [
        {
          workflowId: 'test-wf',
          steps: ['step1'],
          technologies: ['python'],
          description: 'test',
        },
        {
          files: [{ path: 'main.py', content: 'test', language: 'python' }],
        },
      ]

      validArtifacts.forEach((artifact, index) => {
        expect(isArtifact(artifact)).toBe(
          true,
          `Artifact ${index} should be valid`,
        )
      })
    })

    it('returns false for invalid artifacts', () => {
      const invalidArtifacts = [
        { invalid: 'data' },
        { workflowId: 'test' }, // missing required fields
        null,
        undefined,
        'string',
        123,
      ]

      invalidArtifacts.forEach((artifact, index) => {
        expect(isArtifact(artifact)).toBe(
          false,
          `Artifact ${index} should be invalid`,
        )
      })
    })
  })

  describe('isAgentResponse', () => {
    it('returns true for valid agent responses', () => {
      const validResponse = {
        result: 'success',
        input: { foo: 'bar' },
      }

      expect(isAgentResponse(validResponse)).toBe(true)
    })

    it('returns false for invalid agent responses', () => {
      const invalidResponses = [
        { input: { foo: 'bar' } }, // missing result
        { result: '', input: { foo: 'bar' } }, // empty result
        null,
        undefined,
        'string',
        123,
      ]

      invalidResponses.forEach((response, index) => {
        expect(isAgentResponse(response)).toBe(
          false,
          `Response ${index} should be invalid`,
        )
      })
    })
  })

  describe('getValidationErrors', () => {
    it('formats validation errors correctly', async () => {
      const { ZodError } = await import('zod')

      // Create a mock ZodError
      const mockError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['result'],
        },
        {
          code: 'invalid_string',
          validation: 'min',
          minimum: 1,
          path: ['input', 'name'],
        },
      ])

      const formatted = getValidationErrors(mockError)
      expect(formatted).toContain('result:')
      expect(formatted).toContain('input.name:')
    })
  })
})
