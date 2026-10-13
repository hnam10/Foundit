import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname) },
  },
  test: {
    environment: 'jsdom',
    // Baked into lib/api/client.ts at import time, like Next.js inlining.
    env: { NEXT_PUBLIC_API_URL: 'http://api.test' },
    // Tests live in tests/, mirroring the source tree (tests/utils/… ↔ utils/…).
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      reportsDirectory: 'coverage',
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'hooks/**/*.ts',
        'lib/**/*.ts',
        'utils/**/*.ts',
      ],
      exclude: ['app/**/layout.tsx', 'app/**/loading.tsx'],
    },
  },
});
