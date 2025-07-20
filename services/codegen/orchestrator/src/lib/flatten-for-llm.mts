import type { LLMMessage } from '../types.mjs'

type LLMState = {
  role: 'user' | 'agent'
  content: string[]
}

export function flattenForLLM(specState: LLMState[]): LLMMessage[] {
  return specState.map((message) => ({
    role: message.role,
    content: message.content.join('\n'),
  }))
}
