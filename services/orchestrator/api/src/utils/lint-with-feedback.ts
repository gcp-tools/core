import type { AgentInput } from '../types/agent.js'
import type axiosType from 'axios'

type LintResult = { success: boolean; output: string }

export async function lintWithFeedback({
  code,
  fileExt,
  input,
  agentUrl,
  lint,
  format,
  feedbackLabel,
  axiosInstance,
  maxAttempts = 2,
}: {
  code: string
  fileExt: string
  input: AgentInput
  agentUrl: string
  lint: (filePath: string) => Promise<LintResult>
  format: (filePath: string) => Promise<LintResult>
  feedbackLabel: string
  axiosInstance: typeof axiosType
  maxAttempts?: number
}): Promise<string> {
  const { promises: fs } = await import('fs')
  const { join } = await import('path')
  const { randomUUID } = await import('crypto')
  let attempts = 0
  let filePath = join('/tmp', `codegen-${randomUUID()}.${fileExt}`)
  let currentCode = code
  await fs.writeFile(filePath, currentCode, 'utf8')
  let lintResult = await lint(filePath)
  while (!lintResult.success && attempts < maxAttempts) {
    await format(filePath)
    lintResult = await lint(filePath)
    if (!lintResult.success) {
      // Feedback to agent
      const feedbackInput = { ...input, feedback: `${feedbackLabel}:\n${lintResult.output}` }
      const { data: newData } = await axiosInstance.post(agentUrl, feedbackInput)
      currentCode = newData.output
      await fs.writeFile(filePath, currentCode, 'utf8')
      lintResult = await lint(filePath)
    }
    attempts++
  }
  if (!lintResult.success) {
    throw new Error(`${feedbackLabel} failed after auto-fix and feedback.\n${lintResult.output}`)
  }
  return await fs.readFile(filePath, 'utf8')
}
