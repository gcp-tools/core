import { describe, it, expect, vi } from 'vitest'
import { runBlack, runBlackFormat } from '../../src/utils/black.js'
import { exec } from 'child_process'

vi.mock('child_process')

describe('black utils', () => {
  it('runBlack returns success', async () => {
    (exec as any).mockImplementation((cmd, cb) => cb(null, 'ok', ''))
    const result = await runBlack('file.py')
    expect(result.success).toBe(true)
  })

  it('runBlack returns failure', async () => {
    (exec as any).mockImplementation((cmd, cb) => cb(new Error('fail'), '', 'fail'))
    const result = await runBlack('file.py')
    expect(result.success).toBe(false)
  })

  it('runBlackFormat returns success', async () => {
    (exec as any).mockImplementation((cmd, cb) => cb(null, 'ok', ''))
    const result = await runBlackFormat('file.py')
    expect(result.success).toBe(true)
  })
})
