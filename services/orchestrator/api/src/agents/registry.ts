import axios from 'axios'
import {
  type AgentInput,
  type AgentResponse,
  AgentResponseSchema,
} from '../types/agent.js'

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
    const { data } = await axios.post(`${this.baseUrl}/codegen`, input)
    return this.validateResponse(data)
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
