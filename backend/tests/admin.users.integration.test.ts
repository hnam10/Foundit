import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import adminUsersRouter from '../src/routes/admin/users';

const mocks = vi.hoisted(() => ({
  authUser: { user_id: 'admin-1', role: 'admin' } as {
    user_id: string;
    role: string;
  } | null,
}));

vi.mock('../src/middleware/authenticate', () => ({
  default: vi.fn((req, res, next) => {
    if (!mocks.authUser) {
      res.status(401).json({
        code: 'UNAUTHENTICATED',
        message: 'Authentication required',
      });
      return;
    }

    req.user = mocks.authUser;
    next();
  }),
}));

vi.mock('../src/middleware/requireRole', () => ({
  default: vi.fn((role: string) => (req, res, next) => {
    if (req.user?.role !== role) {
      res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  }),
}));

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/admin/users', adminUsersRouter);
  return app;
}

describe('admin users routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authUser = { user_id: 'admin-1', role: 'admin' };
  });

  test('GET /api/admin/users returns 401 if not authenticated', async () => {
    mocks.authUser = null;

    const app = createTestApp();

    const res = await request(app).get('/api/admin/users');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHENTICATED');
  });

  test('GET /api/admin/users returns 403 if user is not admin', async () => {
    mocks.authUser = { user_id: 'security-1', role: 'security' };

    const app = createTestApp();

    const res = await request(app).get('/api/admin/users');

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('GET /api/admin/users returns 400 for invalid query', async () => {
    const app = createTestApp();

    const res = await request(app).get('/api/admin/users?limit=100');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  test('GET /api/admin/users returns 501 because it is not implemented yet', async () => {
    const app = createTestApp();

    const res = await request(app).get(
      '/api/admin/users?role=student&limit=10'
    );

    expect(res.status).toBe(501);
    expect(res.body.code).toBe('NOT_IMPLEMENTED');
  });

  test('POST /api/admin/users returns 400 for invalid body', async () => {
    const app = createTestApp();

    const res = await request(app).post('/api/admin/users').send({
      email: 'student@gmail.com',
      firstName: '',
      lastName: 'Hsu',
      role: 'student',
      campusId: 'invalid-campus-id',
    });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/admin/users returns 501 for valid body', async () => {
    const app = createTestApp();

    const res = await request(app).post('/api/admin/users').send({
      email: 'student@myseneca.ca',
      firstName: 'Casey',
      lastName: 'Hsu',
      role: 'student',
      campusId: '550e8400-e29b-41d4-a716-446655440000',
      studentNumber: 123456789,
    });

    expect(res.status).toBe(501);
    expect(res.body.code).toBe('NOT_IMPLEMENTED');
  });

  test('PATCH /api/admin/users/:userId/deactivate returns 501', async () => {
    const app = createTestApp();

    const res = await request(app).patch(
      '/api/admin/users/550e8400-e29b-41d4-a716-446655440000/deactivate'
    );

    expect(res.status).toBe(501);
    expect(res.body.code).toBe('NOT_IMPLEMENTED');
  });

  test('PATCH /api/admin/users/:userId/activate returns 501', async () => {
    const app = createTestApp();

    const res = await request(app).patch(
      '/api/admin/users/550e8400-e29b-41d4-a716-446655440000/activate'
    );

    expect(res.status).toBe(501);
    expect(res.body.code).toBe('NOT_IMPLEMENTED');
  });
});
