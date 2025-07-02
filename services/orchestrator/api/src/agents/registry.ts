import axios from 'axios'
import {
  type AgentInput,
  type AgentResponse,
  AgentResponseSchema,
} from '../types/agent.js'
import { runBiomeLint, runBiomeFormat } from '../utils/biome.js'
import { lintWithFeedback } from '../utils/lint-with-feedback.js'
import { runBlack, runBlackFormat } from '../utils/black.js'
import { runRuff } from '../utils/ruff.js'
import { runRustfmt, runRustfmtFormat } from '../utils/rustfmt.js'

export class AgentRegistry {
  private readonly baseUrl: string

  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }

  private async validateResponse(data: unknown): Promise<AgentResponse> {
    return AgentResponseSchema.parse(data)
  }

  async spec(input: AgentInput): Promise<AgentResponse> {
    const { data } = await axios.post(`${this.baseUrl}/spec`, input)
    return this.validateResponse(data)
  }

  async plan(input: AgentInput): Promise<AgentResponse> {
    const { data } = await axios.post(`${this.baseUrl}/plan`, input)
    return this.validateResponse(data)
  }

  async codegen(input: AgentInput): Promise<AgentResponse> {
    const type: string = (input.language || input.kind || 'typescript') as string
    const agentUrl = this.getAgentUrl(type)
    let { data } = await axios.post(agentUrl, input)
    let code = data.output
    if (type === 'typescript') {
      code = await lintWithFeedback({
        code,
        fileExt: 'ts',
        input,
        agentUrl,
        lint: runBiomeLint,
        format: runBiomeFormat,
        feedbackLabel: 'Biome lint errors',
        axiosInstance: axios,
      })
      data.output = code
    } else if (type === 'python') {
      code = await lintWithFeedback({
        code,
        fileExt: 'py',
        input,
        agentUrl,
        lint: runBlack,
        format: runBlackFormat,
        feedbackLabel: 'Black errors',
        axiosInstance: axios,
      })
      // Optionally, run ruff for additional linting
      const { promises: fs } = await import('fs')
      const { join } = await import('path')
      const { randomUUID } = await import('crypto')
      const ruffFilePath = join('/tmp', `codegen-${randomUUID()}.py`)
      await fs.writeFile(ruffFilePath, code, 'utf8')
      let ruffResult = await runRuff(ruffFilePath)
      if (!ruffResult.success) {
        const feedbackInput = { ...input, feedback: `Ruff errors:\n${ruffResult.output}` }
        const { data: newData } = await axios.post(agentUrl, feedbackInput)
        code = newData.output
        await fs.writeFile(ruffFilePath, code, 'utf8')
        ruffResult = await runRuff(ruffFilePath)
        if (!ruffResult.success) {
          throw new Error(`Python codegen failed ruff lint after feedback.\n${ruffResult.output}`)
        }
      }
      data.output = code
    } else if (type === 'rust') {
      code = await lintWithFeedback({
        code,
        fileExt: 'rs',
        input,
        agentUrl,
        lint: runRustfmt,
        format: runRustfmtFormat,
        feedbackLabel: 'rustfmt errors',
        axiosInstance: axios,
      })
      data.output = code
    }
    return this.validateResponse(data)
  }

  getAgentUrl(type: string): string {
    if (type === 'typescript') return `${this.baseUrl}/codegen`
    if (type === 'python') return `${this.baseUrl}/codegen-python`
    if (type === 'rust') return `${this.baseUrl}/codegen-rust`
    return `${this.baseUrl}/codegen`
  }

  async test(input: AgentInput): Promise<AgentResponse> {
    const { data } = await axios.post(`${this.baseUrl}/test`, input)
    return this.validateResponse(data)
  }

  async infra(input: AgentInput): Promise<AgentResponse> {
    const { data } = await axios.post(`${this.baseUrl}/infra`, input)
    return this.validateResponse(data)
  }

  async review(input: AgentInput): Promise<AgentResponse> {
    const { data } = await axios.post(`${this.baseUrl}/review`, input)
    return this.validateResponse(data)
  }

  async ops(input: AgentInput): Promise<AgentResponse> {
    const { data } = await axios.post(`${this.baseUrl}/ops`, input)
    return this.validateResponse(data)
  }
}
