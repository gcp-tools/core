import axios from 'axios'
import { AgentResponseSchema } from '../types/agent.js'
export class AgentRegistry {
  baseUrl
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }
  async validateResponse(data) {
    return AgentResponseSchema.parse(data)
  }
  async spec(input) {
    const { data } = await axios.post(`${this.baseUrl}/spec`, input)
    return this.validateResponse(data)
  }
  async plan(input) {
    const { data } = await axios.post(`${this.baseUrl}/plan`, input)
    return this.validateResponse(data)
  }
  async codegen(input) {
    const { data } = await axios.post(`${this.baseUrl}/codegen`, input)
    return this.validateResponse(data)
  }
  async test(input) {
    const { data } = await axios.post(`${this.baseUrl}/test`, input)
    return this.validateResponse(data)
  }
  async infra(input) {
    const { data } = await axios.post(`${this.baseUrl}/infra`, input)
    return this.validateResponse(data)
  }
  async review(input) {
    const { data } = await axios.post(`${this.baseUrl}/review`, input)
    return this.validateResponse(data)
  }
  async ops(input) {
    const { data } = await axios.post(`${this.baseUrl}/ops`, input)
    return this.validateResponse(data)
  }
}
//# sourceMappingURL=registry.js.map
