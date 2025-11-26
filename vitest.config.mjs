import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        include: ['tests/**/*.test.mts', 'tests/**/*.integration.test.mts'],
        environment: 'node',
        globals: true,
        reporters: 'default',
    },
});
//# sourceMappingURL=vitest.config.mjs.map