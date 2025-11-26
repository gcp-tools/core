import { defineConfig } from 'vitest/config'

// Set environment variables before any modules are imported
process.env.FIRESTORE_PROJECT_ID = process.env.FIRESTORE_PROJECT_ID || 'test-project'
process.env.NODE_ENV = 'dev'
process.env.PORT = process.env.PORT || '8080'
process.env.SERVICE_NAME = process.env.SERVICE_NAME || 'cap-man-api-test'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 5000,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/unit',
      include: [
        'src/commands/**/*.mts',
        'src/io/services/**/*.mts',
      ],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.mts',
      ],
      all: true,
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})

