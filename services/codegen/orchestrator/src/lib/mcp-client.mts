import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import type {
  CodeResult,
  InfraResult,
  OpsResult,
  PlanResult,
  ReviewResult,
  SpecResult,
  TestResult,
} from '../types.mjs'

export class AgentsMCPClient {
  private client: Client

  constructor() {
    this.client = new Client(
      {
        name: 'agents-mcp-client',
        version: '1.0.0',
        endpoint: 'http://localhost:5000',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      },
    )
  }

  /**
   * Generate project specifications from a brief description
   */
  async generateSpec(projectDescription: string): Promise<SpecResult> {
    try {
      const result = await this.client.callTool({
        name: 'generate_spec',
        arguments: { project_description: projectDescription },
      })

      return {
        requirements:
          typeof result.requirements === 'string'
            ? result.requirements
            : JSON.stringify(result.requirements),
        status: 'success',
      }
    } catch (error) {
      return {
        requirements: '- [ ] Clarification needed: Could not process brief.',
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Generate a detailed project plan from requirements
   */
  async generatePlan(requirements: string): Promise<PlanResult> {
    try {
      const result = await this.client.callTool({
        name: 'generate_plan',
        arguments: { requirements },
      })

      return {
        plan:
          typeof result.plan === 'string'
            ? result.plan
            : JSON.stringify(result.plan),
        status: 'success',
      }
    } catch (error) {
      return {
        plan: 'Error: Could not generate plan from requirements.',
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Generate code based on a project plan for the specified language
   */
  async generateCode(
    plan: string,
    language: 'typescript' | 'python' | 'rust' | 'react' = 'typescript',
  ): Promise<CodeResult> {
    try {
      const result = await this.client.callTool({
        name: 'generate_code',
        arguments: { plan, language },
      })

      return {
        code:
          typeof result.code === 'string'
            ? result.code
            : JSON.stringify(result.code),
        language:
          typeof result.language === 'string' ? result.language : language,
        status: 'success',
      }
    } catch (error) {
      return {
        code: `Error: Could not generate ${language} code from plan.`,
        language,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Generate infrastructure as code based on a project plan
   */
  async generateInfra(plan: string): Promise<InfraResult> {
    try {
      const result = await this.client.callTool({
        name: 'generate_infra',
        arguments: { plan },
      })

      return {
        iac_code:
          typeof result.iac_code === 'string'
            ? result.iac_code
            : JSON.stringify(result.iac_code),
        status: 'success',
      }
    } catch (error) {
      return {
        iac_code: 'Error: Could not generate infrastructure code from plan.',
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Generate test code for a given artifact
   */
  async runTests(artifact: string): Promise<TestResult> {
    try {
      const result = await this.client.callTool({
        name: 'run_tests',
        arguments: { artifact },
      })

      return {
        test_code:
          typeof result.test_code === 'string'
            ? result.test_code
            : JSON.stringify(result.test_code),
        status: 'success',
      }
    } catch (error) {
      return {
        test_code: 'Error: Could not generate test code for artifact.',
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Review code and provide feedback
   */
  async reviewCode(artifact: string): Promise<ReviewResult> {
    try {
      const result = await this.client.callTool({
        name: 'review_code',
        arguments: { artifact },
      })

      return {
        review_feedback:
          typeof result.review_feedback === 'string'
            ? result.review_feedback
            : JSON.stringify(result.review_feedback),
        status: 'success',
      }
    } catch (error) {
      return {
        review_feedback: 'Error: Could not review artifact.',
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Generate deployment and operations plan for artifacts
   */
  async deployOps(artifacts: string): Promise<OpsResult> {
    try {
      const result = await this.client.callTool({
        name: 'deploy_ops',
        arguments: { artifacts },
      })

      return {
        ops_plan:
          typeof result.ops_plan === 'string'
            ? result.ops_plan
            : JSON.stringify(result.ops_plan),
        status: 'success',
      }
    } catch (error) {
      return {
        ops_plan: 'Error: Could not generate deployment plan for artifacts.',
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Test connection to the agents MCP server
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to list tools to test connection
      await this.client.listTools()
      return true
    } catch (error) {
      console.error('Failed to connect to agents MCP server:', error)
      return false
    }
  }
}
