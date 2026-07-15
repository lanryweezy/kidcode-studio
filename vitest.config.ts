import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/services/**/*.ts'],
      exclude: [
        'src/services/**/*.test.ts',
        'src/services/**/__tests__/**',
        'src/services/ai/**',
        'src/services/collaboration/**',
      ],
      thresholds: {
        statements: 35,
        branches: 30,
        functions: 35,
        lines: 35,
      },
    },
  },
});
