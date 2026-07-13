import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import claimsRouter from '../src/routes/claims';
import { UserRole, ClaimStatus } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  authUser: { user_id: 'student-1' } as { user_id: string } | null,
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

vi.mock('../src/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    claim: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '../src/db';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/claims', claimsRouter);
  return app;
}

const activeStudent = {
  userId: 'student-1',
  campusId: 'campus-1',
  email: 'student@myseneca.ca',
  username: 'student1',
  passwordHash: 'hashed-password',
  role: UserRole.student,
  firstName: 'Casey',
  lastName: 'Hsu',
  studentNumber: null,
  employeeId: null,
  phone: null,
  emailNotificationOptIn: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  isEmailVerified: true,
  emailVerifyToken: null,
  emailVerifyTokenExpiresAt: null,
};

const activeSecurity = {
  userId: 'security-1',
  campusId: 'campus-1',
  email: 'security@myseneca.ca',
  username: 'security1',
  passwordHash: 'hashed-password',
  role: UserRole.security,
  firstName: 'Security',
  lastName: 'User',
  studentNumber: null,
  employeeId: 'E000000001',
  phone: null,
  emailNotificationOptIn: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  isEmailVerified: true,
  emailVerifyToken: null,
  emailVerifyTokenExpiresAt: null,
};

const claimRow = {
  claimId: '550e8400-e29b-41d4-a716-446655440000',
  studentId: 'student-1',
  itemId: null,
  category: 'Electronics',
  itemName: 'iPhone 15',
  campusId: 'campus-1',
  campus: {
    campusId: 'campus-1',
    campusName: 'Newnham',
    address: null,
    retentionDays: 30,
  },
  description: 'Lost my iPhone',
  additionalInfo: null,
  notificationPreference: 'email' as const,
  dateLost: new Date('2026-07-01'),
  locationLost: 'Library',
  status: ClaimStatus.submitted,
  reviewedAt: null,
  rejectionReason: null,
  pickedUpAt: null,
  createdAt: new Date('2026-07-01'),
  updatedAt: new Date('2026-07-01'),
  student: {
    userId: 'student-1',
    firstName: 'Casey',
    lastName: 'Hsu',
    email: 'student@myseneca.ca',
    studentNumber: null,
  },
  item: null,
  images: [],
  reviewedBy: null,
  verifiedBy: null,
  reviewer: null,
  verifier: null,
};

describe('claims routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authUser = { user_id: 'student-1' };
  });

  test('GET /api/claims returns 401 if user is not authenticated', async () => {
    mocks.authUser = null;

    const app = createTestApp();

    const res = await request(app).get('/api/claims');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHENTICATED');
  });

  test('GET /api/claims returns claims for student scope', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(activeStudent);
    vi.mocked(prisma.claim.findMany).mockResolvedValueOnce([claimRow]);

    const app = createTestApp();

    const res = await request(app).get('/api/claims');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].claimId).toBe(claimRow.claimId);
    expect(res.body.data[0].studentId).toBe('student-1');

    expect(prisma.claim.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [{ studentId: 'student-1' }, {}],
        },
      })
    );
  });

  test('GET /api/claims returns claims for security scope', async () => {
    mocks.authUser = { user_id: 'security-1' };

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(activeSecurity);
    vi.mocked(prisma.claim.findMany).mockResolvedValueOnce([claimRow]);

    const app = createTestApp();

    const res = await request(app).get('/api/claims?status=submitted');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);

    expect(prisma.claim.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [{ status: ClaimStatus.submitted }, {}],
        },
      })
    );
  });

  test('GET /api/claims/:claimId returns 404 if claim does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(activeStudent);
    vi.mocked(prisma.claim.findUnique).mockResolvedValueOnce(null);

    const app = createTestApp();

    const res = await request(app).get(
      '/api/claims/550e8400-e29b-41d4-a716-446655440000'
    );

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('CLAIM_NOT_FOUND');
  });

  test('GET /api/claims/:claimId returns 403 if student accesses another student claim', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(activeStudent);
    vi.mocked(prisma.claim.findUnique).mockResolvedValueOnce({
      ...claimRow,
      studentId: 'another-student',
    });

    const app = createTestApp();

    const res = await request(app).get(
      '/api/claims/550e8400-e29b-41d4-a716-446655440000'
    );

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  test('GET /api/claims/:claimId returns claim detail if user can access it', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(activeStudent);
    vi.mocked(prisma.claim.findUnique).mockResolvedValueOnce(claimRow);

    const app = createTestApp();

    const res = await request(app).get(
      '/api/claims/550e8400-e29b-41d4-a716-446655440000'
    );

    expect(res.status).toBe(200);
    expect(res.body.claimId).toBe(claimRow.claimId);
    expect(res.body.studentId).toBe('student-1');
    expect(res.body.category).toBe('Electronics');
  });
});
