import { describe, it, expect, vi } from 'vitest'
import { runRuff } from '../../src/utils/ruff.js'
import { exec } from 'child_process'

vi.mock('child_process')

describe('ruff utils', () => {
  it('runRuff returns success', async () => {
    (exec as any).mockImplementation((cmd, cb) => cb(null, 'ok', ''))
    const result = await runRuff('file.py')
    expect(result.success).toBe(true)
  })

  it('runRuff returns failure', async () => {
    (exec as any).mockImplementation((cmd, cb) => cb(new Error('fail'), '', 'fail'))
    const result = await runRuff('file.py')
    expect(result.success).toBe(false)
  })
})
