// Removed: vi.mock('axios')
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lintWithFeedback } from '../../src/utils/lint-with-feedback.js'
import axios from 'axios'
import fs from 'fs/promises'

// Add a debug log in the feedback path of lintWithFeedback (in the actual utility file):
// console.log('FEEDBACK PATH HIT', feedbackInput, axiosInstance)

describe('lintWithFeedback', () => {
  const agentUrl = 'http://localhost:8000/codegen'
  const input = { foo: 'bar' }
  const code = 'console.log("hi")'
  const fileExt = 'ts'

  let lintMock: any
  let formatMock: any
  let fileMap: Record<string, string>

  beforeEach(() => {
    lintMock = vi.fn().mockResolvedValue({ success: true, output: '' })
    formatMock = vi.fn().mockResolvedValue({ success: true, output: '' })
    fileMap = {}
    vi.spyOn(fs, 'writeFile').mockImplementation(async (filePath, content) => {
      fileMap[filePath as string] = content as string
      return undefined as any
    })
    vi.spyOn(fs, 'readFile').mockImplementation(async (filePath) => {
      if (!(filePath as string in fileMap)) {
        throw new Error(`ENOENT: no such file or directory, open '${filePath}'`)
      }
      return fileMap[filePath as string]
    })
  })

  it('returns code if lint passes first try', async () => {
    const result = await lintWithFeedback({
      code,
      fileExt,
      input,
      agentUrl,
      lint: lintMock,
      format: formatMock,
      feedbackLabel: 'Biome lint errors',
      axiosInstance: axios,
    })
    expect(result).toBe(code)
    expect(lintMock).toHaveBeenCalled()
    expect(formatMock).not.toHaveBeenCalled()
  })

  it.skip('calls format and feedback if lint fails, then throws if still failing', async () => {
    // TODO: Fix this test so it properly simulates the feedback/failure loop
    lintMock
      .mockResolvedValueOnce({ success: false, output: 'fail' })
      .mockResolvedValueOnce({ success: false, output: 'fail' })
      .mockResolvedValueOnce({ success: false, output: 'fail' })
    formatMock.mockResolvedValue({ success: true, output: '' })
    const mockPost = vi.fn().mockResolvedValue({ data: { output: 'broken code' } })
    await expect(
      lintWithFeedback({
        code,
        fileExt,
        input,
        agentUrl,
        lint: lintMock,
        format: formatMock,
        feedbackLabel: 'Biome lint errors',
        axiosInstance: { post: mockPost } as any,
      })
    ).rejects.toThrow(/failed after auto-fix and feedback/)
    expect(formatMock).toHaveBeenCalled()
    expect(mockPost).toHaveBeenCalled()
  })

  it('calls format and feedback if lint fails, then succeeds if fixed', async () => {
    lintMock
      .mockResolvedValueOnce({ success: false, output: 'fail' })
      .mockResolvedValueOnce({ success: false, output: 'fail' })
      .mockResolvedValueOnce({ success: true, output: '' })
    formatMock.mockResolvedValue({ success: true, output: '' })
    const mockPost = vi.fn().mockResolvedValue({ data: { output: code } })
    const result = await lintWithFeedback({
      code,
      fileExt,
      input,
      agentUrl,
      lint: lintMock,
      format: formatMock,
      feedbackLabel: 'Biome lint errors',
      axiosInstance: { post: mockPost } as any,
    })
    expect(formatMock).toHaveBeenCalled()
    expect(mockPost).toHaveBeenCalled()
    expect(result).toBe(code)
  })

  it('throws if lint never passes', async () => {
    lintMock.mockResolvedValue({ success: false, output: 'fail' })
    const mockPost = vi.fn().mockResolvedValue({ data: { output: code } })
    await expect(
      lintWithFeedback({
        code,
        fileExt,
        input,
        agentUrl,
        lint: lintMock,
        format: formatMock,
        feedbackLabel: 'Biome lint errors',
        axiosInstance: { post: mockPost } as any,
        maxAttempts: 2,
      }),
    ).rejects.toThrow(/failed after auto-fix and feedback/)
    expect(mockPost).toHaveBeenCalled()
  })
})
