import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setupEnv.ts'],
    testTimeout: 60000,
    hookTimeout: 120000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/db/**'],
      reporter: ['text-summary', 'lcov'],
    },
  },
});
