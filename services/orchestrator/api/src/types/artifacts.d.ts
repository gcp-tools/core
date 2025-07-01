import type { z } from 'zod'
export declare const PlanArtifactSchema: z.ZodObject<
  {
    workflowId: z.ZodString
    steps: z.ZodArray<z.ZodString, 'many'>
    technologies: z.ZodArray<z.ZodString, 'many'>
    description: z.ZodString
  },
  'passthrough',
  z.ZodTypeAny,
  z.objectOutputType<
    {
      workflowId: z.ZodString
      steps: z.ZodArray<z.ZodString, 'many'>
      technologies: z.ZodArray<z.ZodString, 'many'>
      description: z.ZodString
    },
    z.ZodTypeAny,
    'passthrough'
  >,
  z.objectInputType<
    {
      workflowId: z.ZodString
      steps: z.ZodArray<z.ZodString, 'many'>
      technologies: z.ZodArray<z.ZodString, 'many'>
      description: z.ZodString
    },
    z.ZodTypeAny,
    'passthrough'
  >
>
export declare const CodegenArtifactSchema: z.ZodObject<
  {
    files: z.ZodArray<
      z.ZodObject<
        {
          path: z.ZodString
          content: z.ZodString
          language: z.ZodString
        },
        'strip',
        z.ZodTypeAny,
        {
          path: string
          content: string
          language: string
        },
        {
          path: string
          content: string
          language: string
        }
      >,
      'many'
    >
    summary: z.ZodOptional<z.ZodString>
  },
  'passthrough',
  z.ZodTypeAny,
  z.objectOutputType<
    {
      files: z.ZodArray<
        z.ZodObject<
          {
            path: z.ZodString
            content: z.ZodString
            language: z.ZodString
          },
          'strip',
          z.ZodTypeAny,
          {
            path: string
            content: string
            language: string
          },
          {
            path: string
            content: string
            language: string
          }
        >,
        'many'
      >
      summary: z.ZodOptional<z.ZodString>
    },
    z.ZodTypeAny,
    'passthrough'
  >,
  z.objectInputType<
    {
      files: z.ZodArray<
        z.ZodObject<
          {
            path: z.ZodString
            content: z.ZodString
            language: z.ZodString
          },
          'strip',
          z.ZodTypeAny,
          {
            path: string
            content: string
            language: string
          },
          {
            path: string
            content: string
            language: string
          }
        >,
        'many'
      >
      summary: z.ZodOptional<z.ZodString>
    },
    z.ZodTypeAny,
    'passthrough'
  >
>
export declare const TestResultsArtifactSchema: z.ZodObject<
  {
    passed: z.ZodBoolean
    results: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodString
          status: z.ZodEnum<['passed', 'failed']>
          message: z.ZodOptional<z.ZodString>
        },
        'strip',
        z.ZodTypeAny,
        {
          status: 'passed' | 'failed'
          name: string
          message?: string | undefined
        },
        {
          status: 'passed' | 'failed'
          name: string
          message?: string | undefined
        }
      >,
      'many'
    >
    logs: z.ZodOptional<z.ZodString>
  },
  'passthrough',
  z.ZodTypeAny,
  z.objectOutputType<
    {
      passed: z.ZodBoolean
      results: z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString
            status: z.ZodEnum<['passed', 'failed']>
            message: z.ZodOptional<z.ZodString>
          },
          'strip',
          z.ZodTypeAny,
          {
            status: 'passed' | 'failed'
            name: string
            message?: string | undefined
          },
          {
            status: 'passed' | 'failed'
            name: string
            message?: string | undefined
          }
        >,
        'many'
      >
      logs: z.ZodOptional<z.ZodString>
    },
    z.ZodTypeAny,
    'passthrough'
  >,
  z.objectInputType<
    {
      passed: z.ZodBoolean
      results: z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString
            status: z.ZodEnum<['passed', 'failed']>
            message: z.ZodOptional<z.ZodString>
          },
          'strip',
          z.ZodTypeAny,
          {
            status: 'passed' | 'failed'
            name: string
            message?: string | undefined
          },
          {
            status: 'passed' | 'failed'
            name: string
            message?: string | undefined
          }
        >,
        'many'
      >
      logs: z.ZodOptional<z.ZodString>
    },
    z.ZodTypeAny,
    'passthrough'
  >
>
export declare const InfraArtifactSchema: z.ZodObject<
  {
    resources: z.ZodArray<
      z.ZodObject<
        {
          type: z.ZodString
          name: z.ZodString
          config: z.ZodRecord<z.ZodString, z.ZodUnknown>
        },
        'strip',
        z.ZodTypeAny,
        {
          type: string
          name: string
          config: Record<string, unknown>
        },
        {
          type: string
          name: string
          config: Record<string, unknown>
        }
      >,
      'many'
    >
    planSummary: z.ZodOptional<z.ZodString>
  },
  'passthrough',
  z.ZodTypeAny,
  z.objectOutputType<
    {
      resources: z.ZodArray<
        z.ZodObject<
          {
            type: z.ZodString
            name: z.ZodString
            config: z.ZodRecord<z.ZodString, z.ZodUnknown>
          },
          'strip',
          z.ZodTypeAny,
          {
            type: string
            name: string
            config: Record<string, unknown>
          },
          {
            type: string
            name: string
            config: Record<string, unknown>
          }
        >,
        'many'
      >
      planSummary: z.ZodOptional<z.ZodString>
    },
    z.ZodTypeAny,
    'passthrough'
  >,
  z.objectInputType<
    {
      resources: z.ZodArray<
        z.ZodObject<
          {
            type: z.ZodString
            name: z.ZodString
            config: z.ZodRecord<z.ZodString, z.ZodUnknown>
          },
          'strip',
          z.ZodTypeAny,
          {
            type: string
            name: string
            config: Record<string, unknown>
          },
          {
            type: string
            name: string
            config: Record<string, unknown>
          }
        >,
        'many'
      >
      planSummary: z.ZodOptional<z.ZodString>
    },
    z.ZodTypeAny,
    'passthrough'
  >
>
export declare const ReviewArtifactSchema: z.ZodObject<
  {
    issues: z.ZodArray<
      z.ZodObject<
        {
          severity: z.ZodEnum<['info', 'warning', 'error']>
          message: z.ZodString
          file: z.ZodOptional<z.ZodString>
          line: z.ZodOptional<z.ZodNumber>
        },
        'strip',
        z.ZodTypeAny,
        {
          message: string
          severity: 'info' | 'warning' | 'error'
          file?: string | undefined
          line?: number | undefined
        },
        {
          message: string
          severity: 'info' | 'warning' | 'error'
          file?: string | undefined
          line?: number | undefined
        }
      >,
      'many'
    >
    overallStatus: z.ZodEnum<['approved', 'changes_requested', 'rejected']>
  },
  'passthrough',
  z.ZodTypeAny,
  z.objectOutputType<
    {
      issues: z.ZodArray<
        z.ZodObject<
          {
            severity: z.ZodEnum<['info', 'warning', 'error']>
            message: z.ZodString
            file: z.ZodOptional<z.ZodString>
            line: z.ZodOptional<z.ZodNumber>
          },
          'strip',
          z.ZodTypeAny,
          {
            message: string
            severity: 'info' | 'warning' | 'error'
            file?: string | undefined
            line?: number | undefined
          },
          {
            message: string
            severity: 'info' | 'warning' | 'error'
            file?: string | undefined
            line?: number | undefined
          }
        >,
        'many'
      >
      overallStatus: z.ZodEnum<['approved', 'changes_requested', 'rejected']>
    },
    z.ZodTypeAny,
    'passthrough'
  >,
  z.objectInputType<
    {
      issues: z.ZodArray<
        z.ZodObject<
          {
            severity: z.ZodEnum<['info', 'warning', 'error']>
            message: z.ZodString
            file: z.ZodOptional<z.ZodString>
            line: z.ZodOptional<z.ZodNumber>
          },
          'strip',
          z.ZodTypeAny,
          {
            message: string
            severity: 'info' | 'warning' | 'error'
            file?: string | undefined
            line?: number | undefined
          },
          {
            message: string
            severity: 'info' | 'warning' | 'error'
            file?: string | undefined
            line?: number | undefined
          }
        >,
        'many'
      >
      overallStatus: z.ZodEnum<['approved', 'changes_requested', 'rejected']>
    },
    z.ZodTypeAny,
    'passthrough'
  >
>
export declare const OpsArtifactSchema: z.ZodObject<
  {
    actions: z.ZodArray<
      z.ZodObject<
        {
          type: z.ZodString
          status: z.ZodEnum<['success', 'failure']>
          details: z.ZodOptional<z.ZodString>
        },
        'strip',
        z.ZodTypeAny,
        {
          type: string
          status: 'success' | 'failure'
          details?: string | undefined
        },
        {
          type: string
          status: 'success' | 'failure'
          details?: string | undefined
        }
      >,
      'many'
    >
    logs: z.ZodOptional<z.ZodString>
  },
  'passthrough',
  z.ZodTypeAny,
  z.objectOutputType<
    {
      actions: z.ZodArray<
        z.ZodObject<
          {
            type: z.ZodString
            status: z.ZodEnum<['success', 'failure']>
            details: z.ZodOptional<z.ZodString>
          },
          'strip',
          z.ZodTypeAny,
          {
            type: string
            status: 'success' | 'failure'
            details?: string | undefined
          },
          {
            type: string
            status: 'success' | 'failure'
            details?: string | undefined
          }
        >,
        'many'
      >
      logs: z.ZodOptional<z.ZodString>
    },
    z.ZodTypeAny,
    'passthrough'
  >,
  z.objectInputType<
    {
      actions: z.ZodArray<
        z.ZodObject<
          {
            type: z.ZodString
            status: z.ZodEnum<['success', 'failure']>
            details: z.ZodOptional<z.ZodString>
          },
          'strip',
          z.ZodTypeAny,
          {
            type: string
            status: 'success' | 'failure'
            details?: string | undefined
          },
          {
            type: string
            status: 'success' | 'failure'
            details?: string | undefined
          }
        >,
        'many'
      >
      logs: z.ZodOptional<z.ZodString>
    },
    z.ZodTypeAny,
    'passthrough'
  >
>
export type PlanArtifact = z.infer<typeof PlanArtifactSchema>
export type CodegenArtifact = z.infer<typeof CodegenArtifactSchema>
export type TestResultsArtifact = z.infer<typeof TestResultsArtifactSchema>
export type InfraArtifact = z.infer<typeof InfraArtifactSchema>
export type ReviewArtifact = z.infer<typeof ReviewArtifactSchema>
export type OpsArtifact = z.infer<typeof OpsArtifactSchema>
export declare const ArtifactSchema: z.ZodUnion<
  [
    z.ZodObject<
      {
        workflowId: z.ZodString
        steps: z.ZodArray<z.ZodString, 'many'>
        technologies: z.ZodArray<z.ZodString, 'many'>
        description: z.ZodString
      },
      'passthrough',
      z.ZodTypeAny,
      z.objectOutputType<
        {
          workflowId: z.ZodString
          steps: z.ZodArray<z.ZodString, 'many'>
          technologies: z.ZodArray<z.ZodString, 'many'>
          description: z.ZodString
        },
        z.ZodTypeAny,
        'passthrough'
      >,
      z.objectInputType<
        {
          workflowId: z.ZodString
          steps: z.ZodArray<z.ZodString, 'many'>
          technologies: z.ZodArray<z.ZodString, 'many'>
          description: z.ZodString
        },
        z.ZodTypeAny,
        'passthrough'
      >
    >,
    z.ZodObject<
      {
        files: z.ZodArray<
          z.ZodObject<
            {
              path: z.ZodString
              content: z.ZodString
              language: z.ZodString
            },
            'strip',
            z.ZodTypeAny,
            {
              path: string
              content: string
              language: string
            },
            {
              path: string
              content: string
              language: string
            }
          >,
          'many'
        >
        summary: z.ZodOptional<z.ZodString>
      },
      'passthrough',
      z.ZodTypeAny,
      z.objectOutputType<
        {
          files: z.ZodArray<
            z.ZodObject<
              {
                path: z.ZodString
                content: z.ZodString
                language: z.ZodString
              },
              'strip',
              z.ZodTypeAny,
              {
                path: string
                content: string
                language: string
              },
              {
                path: string
                content: string
                language: string
              }
            >,
            'many'
          >
          summary: z.ZodOptional<z.ZodString>
        },
        z.ZodTypeAny,
        'passthrough'
      >,
      z.objectInputType<
        {
          files: z.ZodArray<
            z.ZodObject<
              {
                path: z.ZodString
                content: z.ZodString
                language: z.ZodString
              },
              'strip',
              z.ZodTypeAny,
              {
                path: string
                content: string
                language: string
              },
              {
                path: string
                content: string
                language: string
              }
            >,
            'many'
          >
          summary: z.ZodOptional<z.ZodString>
        },
        z.ZodTypeAny,
        'passthrough'
      >
    >,
    z.ZodObject<
      {
        passed: z.ZodBoolean
        results: z.ZodArray<
          z.ZodObject<
            {
              name: z.ZodString
              status: z.ZodEnum<['passed', 'failed']>
              message: z.ZodOptional<z.ZodString>
            },
            'strip',
            z.ZodTypeAny,
            {
              status: 'passed' | 'failed'
              name: string
              message?: string | undefined
            },
            {
              status: 'passed' | 'failed'
              name: string
              message?: string | undefined
            }
          >,
          'many'
        >
        logs: z.ZodOptional<z.ZodString>
      },
      'passthrough',
      z.ZodTypeAny,
      z.objectOutputType<
        {
          passed: z.ZodBoolean
          results: z.ZodArray<
            z.ZodObject<
              {
                name: z.ZodString
                status: z.ZodEnum<['passed', 'failed']>
                message: z.ZodOptional<z.ZodString>
              },
              'strip',
              z.ZodTypeAny,
              {
                status: 'passed' | 'failed'
                name: string
                message?: string | undefined
              },
              {
                status: 'passed' | 'failed'
                name: string
                message?: string | undefined
              }
            >,
            'many'
          >
          logs: z.ZodOptional<z.ZodString>
        },
        z.ZodTypeAny,
        'passthrough'
      >,
      z.objectInputType<
        {
          passed: z.ZodBoolean
          results: z.ZodArray<
            z.ZodObject<
              {
                name: z.ZodString
                status: z.ZodEnum<['passed', 'failed']>
                message: z.ZodOptional<z.ZodString>
              },
              'strip',
              z.ZodTypeAny,
              {
                status: 'passed' | 'failed'
                name: string
                message?: string | undefined
              },
              {
                status: 'passed' | 'failed'
                name: string
                message?: string | undefined
              }
            >,
            'many'
          >
          logs: z.ZodOptional<z.ZodString>
        },
        z.ZodTypeAny,
        'passthrough'
      >
    >,
    z.ZodObject<
      {
        resources: z.ZodArray<
          z.ZodObject<
            {
              type: z.ZodString
              name: z.ZodString
              config: z.ZodRecord<z.ZodString, z.ZodUnknown>
            },
            'strip',
            z.ZodTypeAny,
            {
              type: string
              name: string
              config: Record<string, unknown>
            },
            {
              type: string
              name: string
              config: Record<string, unknown>
            }
          >,
          'many'
        >
        planSummary: z.ZodOptional<z.ZodString>
      },
      'passthrough',
      z.ZodTypeAny,
      z.objectOutputType<
        {
          resources: z.ZodArray<
            z.ZodObject<
              {
                type: z.ZodString
                name: z.ZodString
                config: z.ZodRecord<z.ZodString, z.ZodUnknown>
              },
              'strip',
              z.ZodTypeAny,
              {
                type: string
                name: string
                config: Record<string, unknown>
              },
              {
                type: string
                name: string
                config: Record<string, unknown>
              }
            >,
            'many'
          >
          planSummary: z.ZodOptional<z.ZodString>
        },
        z.ZodTypeAny,
        'passthrough'
      >,
      z.objectInputType<
        {
          resources: z.ZodArray<
            z.ZodObject<
              {
                type: z.ZodString
                name: z.ZodString
                config: z.ZodRecord<z.ZodString, z.ZodUnknown>
              },
              'strip',
              z.ZodTypeAny,
              {
                type: string
                name: string
                config: Record<string, unknown>
              },
              {
                type: string
                name: string
                config: Record<string, unknown>
              }
            >,
            'many'
          >
          planSummary: z.ZodOptional<z.ZodString>
        },
        z.ZodTypeAny,
        'passthrough'
      >
    >,
    z.ZodObject<
      {
        issues: z.ZodArray<
          z.ZodObject<
            {
              severity: z.ZodEnum<['info', 'warning', 'error']>
              message: z.ZodString
              file: z.ZodOptional<z.ZodString>
              line: z.ZodOptional<z.ZodNumber>
            },
            'strip',
            z.ZodTypeAny,
            {
              message: string
              severity: 'info' | 'warning' | 'error'
              file?: string | undefined
              line?: number | undefined
            },
            {
              message: string
              severity: 'info' | 'warning' | 'error'
              file?: string | undefined
              line?: number | undefined
            }
          >,
          'many'
        >
        overallStatus: z.ZodEnum<['approved', 'changes_requested', 'rejected']>
      },
      'passthrough',
      z.ZodTypeAny,
      z.objectOutputType<
        {
          issues: z.ZodArray<
            z.ZodObject<
              {
                severity: z.ZodEnum<['info', 'warning', 'error']>
                message: z.ZodString
                file: z.ZodOptional<z.ZodString>
                line: z.ZodOptional<z.ZodNumber>
              },
              'strip',
              z.ZodTypeAny,
              {
                message: string
                severity: 'info' | 'warning' | 'error'
                file?: string | undefined
                line?: number | undefined
              },
              {
                message: string
                severity: 'info' | 'warning' | 'error'
                file?: string | undefined
                line?: number | undefined
              }
            >,
            'many'
          >
          overallStatus: z.ZodEnum<
            ['approved', 'changes_requested', 'rejected']
          >
        },
        z.ZodTypeAny,
        'passthrough'
      >,
      z.objectInputType<
        {
          issues: z.ZodArray<
            z.ZodObject<
              {
                severity: z.ZodEnum<['info', 'warning', 'error']>
                message: z.ZodString
                file: z.ZodOptional<z.ZodString>
                line: z.ZodOptional<z.ZodNumber>
              },
              'strip',
              z.ZodTypeAny,
              {
                message: string
                severity: 'info' | 'warning' | 'error'
                file?: string | undefined
                line?: number | undefined
              },
              {
                message: string
                severity: 'info' | 'warning' | 'error'
                file?: string | undefined
                line?: number | undefined
              }
            >,
            'many'
          >
          overallStatus: z.ZodEnum<
            ['approved', 'changes_requested', 'rejected']
          >
        },
        z.ZodTypeAny,
        'passthrough'
      >
    >,
    z.ZodObject<
      {
        actions: z.ZodArray<
          z.ZodObject<
            {
              type: z.ZodString
              status: z.ZodEnum<['success', 'failure']>
              details: z.ZodOptional<z.ZodString>
            },
            'strip',
            z.ZodTypeAny,
            {
              type: string
              status: 'success' | 'failure'
              details?: string | undefined
            },
            {
              type: string
              status: 'success' | 'failure'
              details?: string | undefined
            }
          >,
          'many'
        >
        logs: z.ZodOptional<z.ZodString>
      },
      'passthrough',
      z.ZodTypeAny,
      z.objectOutputType<
        {
          actions: z.ZodArray<
            z.ZodObject<
              {
                type: z.ZodString
                status: z.ZodEnum<['success', 'failure']>
                details: z.ZodOptional<z.ZodString>
              },
              'strip',
              z.ZodTypeAny,
              {
                type: string
                status: 'success' | 'failure'
                details?: string | undefined
              },
              {
                type: string
                status: 'success' | 'failure'
                details?: string | undefined
              }
            >,
            'many'
          >
          logs: z.ZodOptional<z.ZodString>
        },
        z.ZodTypeAny,
        'passthrough'
      >,
      z.objectInputType<
        {
          actions: z.ZodArray<
            z.ZodObject<
              {
                type: z.ZodString
                status: z.ZodEnum<['success', 'failure']>
                details: z.ZodOptional<z.ZodString>
              },
              'strip',
              z.ZodTypeAny,
              {
                type: string
                status: 'success' | 'failure'
                details?: string | undefined
              },
              {
                type: string
                status: 'success' | 'failure'
                details?: string | undefined
              }
            >,
            'many'
          >
          logs: z.ZodOptional<z.ZodString>
        },
        z.ZodTypeAny,
        'passthrough'
      >
    >,
  ]
>
export type Artifact = z.infer<typeof ArtifactSchema>
