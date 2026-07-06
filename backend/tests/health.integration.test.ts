import express from 'express';
import request from 'supertest';
import { describe, expect, test, vi } from 'vitest';
import healthRouter from '../src/routes/health';

vi.mock('../src/db', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { prisma } from '../src/db';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/health', healthRouter);
  return app;
}

describe('GET /api/health', () => {
  test('returns ok when database is connected', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ '?column?': 1 }]);

    const app = createTestApp();

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe(true);
    expect(res.body.timestamp).toBeDefined();
  });
});