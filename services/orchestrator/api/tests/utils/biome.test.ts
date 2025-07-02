import { describe, it, expect, vi } from 'vitest'
import { runBiomeLint, runBiomeFormat } from '../../src/utils/biome.js'
import { exec } from 'child_process'

vi.mock('child_process')

describe('biome utils', () => {
  it('runBiomeLint returns success', async () => {
    (exec as any).mockImplementation((cmd, cb) => cb(null, 'ok', ''))
    const result = await runBiomeLint('file.ts')
    expect(result.success).toBe(true)
  })

  it('runBiomeLint returns failure', async () => {
    (exec as any).mockImplementation((cmd, cb) => cb(new Error('fail'), '', 'fail'))
    const result = await runBiomeLint('file.ts')
    expect(result.success).toBe(false)
  })

  it('runBiomeFormat returns success', async () => {
    (exec as any).mockImplementation((cmd, cb) => cb(null, 'ok', ''))
    const result = await runBiomeFormat('file.ts')
    expect(result.success).toBe(true)
  })
})
