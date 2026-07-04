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
  },
});
