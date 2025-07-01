import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.integration.test.ts'],
    environment: 'node',
    globals: true,
    reporters: 'default',
  },
})
