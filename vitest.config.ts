import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.mts',
      'src/**/__tests__/*.ts',
      'src/**/__tests__/*.mts',
      'tests/**/*.test.ts',
      'tests/**/*.test.mts',
    ],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
