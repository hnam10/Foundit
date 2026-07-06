import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import itemsRouter from '../src/routes/items';
import { ItemStatus } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  authUser: { user_id: 'security-1', role: 'security' } as {
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

vi.mock('../src/utils/imageUrl', () => ({
  resolveImageUrl: vi.fn(async (url: string) => url),
}));

vi.mock('../src/utils/auditLog', () => ({
  writeAuditLog: vi.fn(),
}));

vi.mock('../src/db', () => ({
  prisma: {
    item: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      groupBy: vi.fn(),
    },
    campus: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from '../src/db';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', itemsRouter);
  return app;
}

const itemId = '550e8400-e29b-41d4-a716-446655440000';
const campusId = '550e8400-e29b-41d4-a716-446655440001';

const itemListRow = {
  itemId,
  campusId,
  category: 'Electronics',
  title: 'iPhone',
  descriptionPublic: 'Black iPhone',
  descriptionInternal: null,
  color: 'Black',
  brand: 'Apple',
  locationFound: 'Library',
  dateFound: new Date('2026-07-01'),
  status: ItemStatus.stored,
  foundItemReportId: null,
  registeredBy: 'security-1',
  retentionExpiryDate: new Date('2026-07-31'),
  createdAt: new Date('2026-07-01'),
  updatedAt: new Date('2026-07-01'),
  campus: {
    campusId,
    campusName: 'Newnham',
    address: null,
    retentionDays: 30,
  },
  images: [],
};

const itemDetailRow = {
  ...itemListRow,
  descriptionPublic: 'Black iPhone found near library',
  descriptionInternal: 'Has cracked case',
  color: 'Black',
  brand: 'Apple',
  locationFound: 'Library',
  foundItemReportId: null,
  registeredBy: 'security-1',
  createdAt: new Date('2026-07-01'),
  updatedAt: new Date('2026-07-01'),
  registrar: {
    userId: 'security-1',
    firstName: 'Security',
    lastName: 'User',
  },
  claims: [],
  foundItemReport: null,
};

describe('items routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authUser = { user_id: 'security-1', role: 'security' };
  });

  test('GET /api/public/items returns public stored items', async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValueOnce([itemListRow]);

    const app = createTestApp();

    const res = await request(app).get('/api/public/items');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('iPhone');

    expect(prisma.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: { in: [ItemStatus.stored] },
        },
      })
    );
  });

  test('GET /api/items/category-stats returns public category counts', async () => {
    vi.mocked(prisma.item.groupBy).mockResolvedValueOnce([
      {
        category: 'Electronics',
        _count: {
          category: 2,
        },
      },
    ] as never);

    const app = createTestApp();

    const res = await request(app).get('/api/items/category-stats');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        category: 'Electronics',
        count: 2,
      },
    ]);
  });

  test('GET /api/items returns 401 if user is not authenticated', async () => {
    mocks.authUser = null;

    const app = createTestApp();

    const res = await request(app).get('/api/items');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHENTICATED');
  });

  test('GET /api/items returns security item list', async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValueOnce([itemListRow]);

    const app = createTestApp();

    const res = await request(app).get('/api/items');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].itemId).toBe(itemId);
    expect(res.body.data[0].title).toBe('iPhone');
    expect(res.body.nextCursor).toBe(null);
  });

  test('GET /api/items/:itemId returns 404 if item does not exist', async () => {
    vi.mocked(prisma.item.findUnique).mockResolvedValueOnce(null);

    const app = createTestApp();

    const res = await request(app).get(`/api/items/${itemId}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('ITEM_NOT_FOUND');
  });

  test('GET /api/items/:itemId returns item detail', async () => {
    vi.mocked(prisma.item.findUnique).mockResolvedValueOnce(itemDetailRow);

    const app = createTestApp();

    const res = await request(app).get(`/api/items/${itemId}`);

    expect(res.status).toBe(200);
    expect(res.body.itemId).toBe(itemId);
    expect(res.body.title).toBe('iPhone');
    expect(res.body.campusName).toBe('Newnham');
    expect(res.body.registeredBy.userId).toBe('security-1');
  });
});
