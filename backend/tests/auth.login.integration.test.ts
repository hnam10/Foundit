import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import authRouter from '../src/routes/auth';
import { UserRole } from '@prisma/client';

const activeVerifiedUser = {
  userId: 'user-1',
  email: 'student@myseneca.ca',
  username: 'student1',
  passwordHash: 'hashed-password',
  role: UserRole.student,
  firstName: 'Casey',
  lastName: 'Hsu',
  campusId: null,
  studentNumber: null,
  employeeId: null,

  phone: null,
  emailNotificationOptIn: false,

  isActive: true,
  isEmailVerified: true,
  emailVerifyToken: null,
  emailVerifyTokenExpiresAt: null,

  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock('../src/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    refreshTokenLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('../src/lib/email', () => ({
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('../src/utils/password', () => ({
  comparePassword: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock('../src/utils/token', () => ({
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
  hashTokenForStorage: vi.fn(),
  verifyRefreshToken: vi.fn(),
}));

vi.mock('../src/utils/auditLog', () => ({
  writeAuditLog: vi.fn(),
}));

import { prisma } from '../src/db';
import { comparePassword } from '../src/utils/password';
import {
  signAccessToken,
  signRefreshToken,
  hashTokenForStorage,
} from '../src/utils/token';
import { writeAuditLog } from '../src/utils/auditLog';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns 401 if user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const app = createTestApp();

    const res = await request(app).post('/api/auth/login').send({
      email: 'student@myseneca.ca',
      password: 'Password123',
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      code: 'INVALID_CREDENTIALS',
      message: 'Email or password is incorrect.',
    });
  });

  test('returns 403 if account is inactive', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      ...activeVerifiedUser,
      isActive: false,
    });

    const app = createTestApp();

    const res = await request(app).post('/api/auth/login').send({
      email: 'student@myseneca.ca',
      password: 'Password123',
    });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ACCOUNT_INACTIVE');
  });

  test('returns 401 if password is wrong', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(activeVerifiedUser);
    vi.mocked(comparePassword).mockResolvedValueOnce(false);

    const app = createTestApp();

    const res = await request(app).post('/api/auth/login').send({
      email: 'student@myseneca.ca',
      password: 'WrongPassword123',
    });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  test('returns 403 if email is not verified', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      ...activeVerifiedUser,
      isEmailVerified: false,
    });
    vi.mocked(comparePassword).mockResolvedValueOnce(true);

    const app = createTestApp();

    const res = await request(app).post('/api/auth/login').send({
      email: 'student@myseneca.ca',
      password: 'Password123',
    });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('EMAIL_NOT_VERIFIED');
  });

  test('returns 200 with tokens and user when login succeeds', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(activeVerifiedUser);
    vi.mocked(comparePassword).mockResolvedValueOnce(true);
    vi.mocked(signAccessToken).mockReturnValueOnce('fake-access-token');
    vi.mocked(signRefreshToken).mockReturnValueOnce('fake-refresh-token');
    vi.mocked(hashTokenForStorage).mockReturnValueOnce('fake-token-hash');
    vi.mocked(prisma.refreshTokenLog.create).mockResolvedValueOnce({
      logId: 'log-1',
      userId: 'user-1',
      tokenHash: 'fake-token-hash',
      expiresAt: new Date(),
      revoked: false,
      createdAt: new Date(),
    });

    const app = createTestApp();

    const res = await request(app).post('/api/auth/login').send({
      email: 'student@myseneca.ca',
      password: 'Password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('fake-access-token');
    expect(res.body.refreshToken).toBe('fake-refresh-token');

    expect(res.body.user).toEqual({
      userId: 'user-1',
      email: 'student@myseneca.ca',
      role: 'student',
      firstName: 'Casey',
      lastName: 'Hsu',
      campusId: null,
    });

    expect(prisma.refreshTokenLog.create).toHaveBeenCalled();
    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'user-1',
        action: 'user_login',
      })
    );
  });
});
