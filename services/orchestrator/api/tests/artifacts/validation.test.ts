import { describe, expect, it } from 'vitest'
import {
  ArtifactSchema,
  CodegenArtifactSchema,
  InfraArtifactSchema,
  OpsArtifactSchema,
  PlanArtifactSchema,
  ReviewArtifactSchema,
  TestResultsArtifactSchema,
} from '../../src/types/artifacts.js'

describe('Artifact Schemas', () => {
  describe('PlanArtifactSchema', () => {
    const validPlan = {
      workflowId: 'test-wf-123',
      steps: ['step1', 'step2', 'step3'],
      technologies: ['python', 'fastapi'],
      description: 'Test plan description',
    }

    it('validates valid plan artifact', () => {
      expect(() => PlanArtifactSchema.parse(validPlan)).not.toThrow()
    })

    it('allows additional properties', () => {
      const planWithExtra = {
        ...validPlan,
        extraField: 'extra value',
        metadata: { created: '2024-01-01' },
      }
      expect(() => PlanArtifactSchema.parse(planWithExtra)).not.toThrow()
    })

    it('rejects invalid plan artifacts', () => {
      const invalidPlans = [
        {
          workflowId: '',
          steps: ['step1'],
          technologies: ['python'],
          description: 'test',
        },
        {
          workflowId: 'test',
          steps: [],
          technologies: ['python'],
          description: 'test',
        },
        {
          workflowId: 'test',
          steps: ['step1'],
          technologies: [],
          description: 'test',
        },
        {
          workflowId: 'test',
          steps: ['step1'],
          technologies: ['python'],
          description: '',
        },
        { workflowId: 'test', steps: ['step1'], technologies: ['python'] }, // missing description
        { workflowId: 'test', steps: ['step1'], description: 'test' }, // missing technologies
        { workflowId: 'test', technologies: ['python'], description: 'test' }, // missing steps
        { technologies: ['python'], description: 'test' }, // missing workflowId
      ]

      invalidPlans.forEach((invalid, index) => {
        expect(() => PlanArtifactSchema.parse(invalid)).toThrow()
      })
    })
  })

  describe('CodegenArtifactSchema', () => {
    const validCodegen = {
      files: [
        { path: 'main.py', content: 'print("hello")', language: 'python' },
        { path: 'test.py', content: 'def test(): pass', language: 'python' },
      ],
      summary: 'Generated Python code',
    }

    it('validates valid codegen artifact', () => {
      expect(() => CodegenArtifactSchema.parse(validCodegen)).not.toThrow()
    })

    it('allows optional summary', () => {
      const codegenWithoutSummary = { files: validCodegen.files }
      expect(() =>
        CodegenArtifactSchema.parse(codegenWithoutSummary),
      ).not.toThrow()
    })

    it('rejects invalid codegen artifacts', () => {
      const invalidCodegens = [
        { files: [] }, // empty files array
        { files: [{ path: '', content: 'test', language: 'python' }] }, // empty path
        { files: [{ path: 'test.py', content: 'test', language: '' }] }, // empty language
        { files: [{ path: 'test.py', language: 'python' }] }, // missing content
        { files: [{ content: 'test', language: 'python' }] }, // missing path
        { files: [{ path: 'test.py', content: 'test' }] }, // missing language
      ]

      invalidCodegens.forEach((invalid, index) => {
        expect(() => CodegenArtifactSchema.parse(invalid)).toThrow()
      })
    })
  })

  describe('TestResultsArtifactSchema', () => {
    const validTestResults = {
      passed: true,
      results: [
        { name: 'test1', status: 'passed' },
        { name: 'test2', status: 'failed', message: 'Assertion failed' },
      ],
      logs: 'Test execution logs',
    }

    it('validates valid test results artifact', () => {
      expect(() =>
        TestResultsArtifactSchema.parse(validTestResults),
      ).not.toThrow()
    })

    it('allows optional logs', () => {
      const resultsWithoutLogs = {
        passed: true,
        results: validTestResults.results,
      }
      expect(() =>
        TestResultsArtifactSchema.parse(resultsWithoutLogs),
      ).not.toThrow()
    })

    it('rejects invalid test results artifacts', () => {
      const invalidResults = [
        { passed: true, results: [] }, // empty results array
        { passed: true, results: [{ name: '', status: 'passed' }] }, // empty name
        { passed: true, results: [{ name: 'test', status: 'invalid' }] }, // invalid status
        { results: [{ name: 'test', status: 'passed' }] }, // missing passed
        { passed: true }, // missing results
      ]

      invalidResults.forEach((invalid, index) => {
        expect(() => TestResultsArtifactSchema.parse(invalid)).toThrow()
      })
    })
  })

  describe('InfraArtifactSchema', () => {
    const validInfra = {
      resources: [
        {
          type: 'cloudrun',
          name: 'api',
          config: { image: 'gcr.io/project/api' },
        },
        { type: 'cloudsql', name: 'db', config: { tier: 'db-f1-micro' } },
      ],
      planSummary: 'Infrastructure plan summary',
    }

    it('validates valid infra artifact', () => {
      expect(() => InfraArtifactSchema.parse(validInfra)).not.toThrow()
    })

    it('allows optional planSummary', () => {
      const infraWithoutSummary = { resources: validInfra.resources }
      expect(() => InfraArtifactSchema.parse(infraWithoutSummary)).not.toThrow()
    })

    it('rejects invalid infra artifacts', () => {
      const invalidInfras = [
        { resources: [] }, // empty resources array
        { resources: [{ type: '', name: 'api', config: {} }] }, // empty type
        { resources: [{ type: 'cloudrun', name: '', config: {} }] }, // empty name
        { resources: [{ type: 'cloudrun', name: 'api' }] }, // missing config
        { resources: [{ type: 'cloudrun', config: {} }] }, // missing name
        { resources: [{ name: 'api', config: {} }] }, // missing type
      ]

      invalidInfras.forEach((invalid, index) => {
        expect(() => InfraArtifactSchema.parse(invalid)).toThrow()
      })
    })
  })

  describe('ReviewArtifactSchema', () => {
    const validReview = {
      issues: [
        { severity: 'info', message: 'Info message' },
        {
          severity: 'warning',
          message: 'Warning message',
          file: 'main.py',
          line: 10,
        },
        {
          severity: 'error',
          message: 'Error message',
          file: 'test.py',
          line: 5,
        },
      ],
      overallStatus: 'approved',
    }

    it('validates valid review artifact', () => {
      expect(() => ReviewArtifactSchema.parse(validReview)).not.toThrow()
    })

    it('allows optional file and line in issues', () => {
      const reviewWithOptional = {
        issues: [
          { severity: 'info', message: 'Info message' },
          { severity: 'warning', message: 'Warning message' },
        ],
        overallStatus: 'changes_requested',
      }
      expect(() => ReviewArtifactSchema.parse(reviewWithOptional)).not.toThrow()
    })

    it('rejects invalid review artifacts', () => {
      const invalidReviews = [
        { issues: [], overallStatus: 'approved' }, // empty issues array
        {
          issues: [{ severity: 'invalid', message: 'test' }],
          overallStatus: 'approved',
        }, // invalid severity
        {
          issues: [{ severity: 'info', message: '' }],
          overallStatus: 'approved',
        }, // empty message
        {
          issues: [{ severity: 'info', message: 'test', line: -1 }],
          overallStatus: 'approved',
        }, // negative line
        {
          issues: [{ severity: 'info', message: 'test' }],
          overallStatus: 'invalid',
        }, // invalid status
        { issues: [{ severity: 'info', message: 'test' }] }, // missing overallStatus
        { overallStatus: 'approved' }, // missing issues
      ]

      invalidReviews.forEach((invalid, index) => {
        expect(() => ReviewArtifactSchema.parse(invalid)).toThrow()
      })
    })
  })

  describe('OpsArtifactSchema', () => {
    const validOps = {
      actions: [
        { type: 'deploy', status: 'success' },
        { type: 'migrate', status: 'failure', details: 'Migration failed' },
      ],
      logs: 'Operations logs',
    }

    it('validates valid ops artifact', () => {
      expect(() => OpsArtifactSchema.parse(validOps)).not.toThrow()
    })

    it('allows optional logs', () => {
      const opsWithoutLogs = { actions: validOps.actions }
      expect(() => OpsArtifactSchema.parse(opsWithoutLogs)).not.toThrow()
    })

    it('rejects invalid ops artifacts', () => {
      const invalidOps = [
        { actions: [] }, // empty actions array
        { actions: [{ type: '', status: 'success' }] }, // empty type
        { actions: [{ type: 'deploy', status: 'invalid' }] }, // invalid status
        { actions: [{ type: 'deploy' }] }, // missing status
        { actions: [{ status: 'success' }] }, // missing type
      ]

      invalidOps.forEach((invalid, index) => {
        expect(() => OpsArtifactSchema.parse(invalid)).toThrow()
      })
    })
  })

  describe('ArtifactSchema (Union)', () => {
    it('validates any valid artifact type', () => {
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
        {
          resources: [{ type: 'cloudrun', name: 'api', config: {} }],
        },
        {
          issues: [{ severity: 'info', message: 'test' }],
          overallStatus: 'approved',
        },
        {
          actions: [{ type: 'deploy', status: 'success' }],
        },
      ]

      validArtifacts.forEach((artifact, index) => {
        expect(() => ArtifactSchema.parse(artifact)).not.toThrow(
          `Artifact ${index} should be valid`,
        )
      })
    })

    it('rejects invalid artifacts', () => {
      const invalidArtifacts = [
        { invalid: 'data' },
        { workflowId: 'test' }, // missing required fields
        { files: [] }, // empty files
        { passed: true }, // missing results
        { resources: [] }, // empty resources
        { issues: [] }, // missing overallStatus
        { actions: [] }, // empty actions
      ]

      invalidArtifacts.forEach((artifact, index) => {
        expect(() => ArtifactSchema.parse(artifact)).toThrow()
      })
    })
  })
})
