import type { z } from 'zod'
import type { AgentResponse } from '../types/agent.js'
import type { Artifact } from '../types/artifacts.js'
/**
 * Validate any artifact using the union schema
 */
export declare function validateArtifact(data: unknown): Artifact
/**
 * Safely parse any artifact without throwing
 */
export declare function safeParseArtifact(data: unknown): z.SafeParseReturnType<
  | z.objectInputType<
      {
        workflowId: z.ZodString
        steps: z.ZodArray<z.ZodString, 'many'>
        technologies: z.ZodArray<z.ZodString, 'many'>
        description: z.ZodString
      },
      z.ZodTypeAny,
      'passthrough'
    >
  | z.objectInputType<
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
  | z.objectInputType<
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
  | z.objectInputType<
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
  | z.objectInputType<
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
  | z.objectInputType<
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
  | z.objectOutputType<
      {
        workflowId: z.ZodString
        steps: z.ZodArray<z.ZodString, 'many'>
        technologies: z.ZodArray<z.ZodString, 'many'>
        description: z.ZodString
      },
      z.ZodTypeAny,
      'passthrough'
    >
  | z.objectOutputType<
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
  | z.objectOutputType<
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
  | z.objectOutputType<
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
  | z.objectOutputType<
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
  | z.objectOutputType<
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
/**
 * Validate agent response
 */
export declare function validateAgentResponse(data: unknown): AgentResponse
/**
 * Safely parse agent response without throwing
 */
export declare function safeParseAgentResponse(
  data: unknown,
): z.SafeParseReturnType<
  z.objectInputType<
    {
      result: z.ZodString
      input: z.ZodRecord<z.ZodString, z.ZodUnknown>
    },
    z.ZodTypeAny,
    'passthrough'
  >,
  z.objectOutputType<
    {
      result: z.ZodString
      input: z.ZodRecord<z.ZodString, z.ZodUnknown>
    },
    z.ZodTypeAny,
    'passthrough'
  >
>
/**
 * Validate JSON string as artifact
 */
export declare function validateArtifactFromJson(jsonString: string): Artifact
/**
 * Validate JSON string as agent response
 */
export declare function validateAgentResponseFromJson(
  jsonString: string,
): AgentResponse
/**
 * Type guard to check if data is a valid artifact
 */
export declare function isArtifact(data: unknown): data is Artifact
/**
 * Type guard to check if data is a valid agent response
 */
export declare function isAgentResponse(data: unknown): data is AgentResponse
/**
 * Get validation errors as a formatted string
 */
export declare function getValidationErrors(error: z.ZodError): string
