import { describe, it, expect, vi } from 'vitest'
import { runRustfmt, runRustfmtFormat } from '../../src/utils/rustfmt.js'
import { exec } from 'child_process'

vi.mock('child_process')

describe('rustfmt utils', () => {
  it('runRustfmt returns success', async () => {
    (exec as any).mockImplementation((cmd, cb) => cb(null, 'ok', ''))
    const result = await runRustfmt('file.rs')
    expect(result.success).toBe(true)
  })

  it('runRustfmt returns failure', async () => {
    (exec as any).mockImplementation((cmd, cb) => cb(new Error('fail'), '', 'fail'))
    const result = await runRustfmt('file.rs')
    expect(result.success).toBe(false)
  })

  it('runRustfmtFormat returns success', async () => {
    (exec as any).mockImplementation((cmd, cb) => cb(null, 'ok', ''))
    const result = await runRustfmtFormat('file.rs')
    expect(result.success).toBe(true)
  })
})
