import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  r2Send: vi.fn(),
}));

vi.mock('../src/lib/r2', () => ({
  r2: { send: mocks.r2Send },
  R2_BUCKET: 'test-bucket',
}));

vi.mock('../src/db', () => ({
  prisma: {
    photoSessionImage: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { prisma } from '../src/db';
import { cleanupPendingPhotoUploads } from '../src/jobs/cleanupPendingPhotoUploads';

describe('cleanupPendingPhotoUploads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('deletes expired pending objects and reservations', async () => {
    vi.mocked(prisma.photoSessionImage.findMany).mockResolvedValueOnce([
      { imageId: 'image-1', imageUrl: 'reports/image-1.png' },
    ]);
    mocks.r2Send.mockResolvedValueOnce({});
    vi.mocked(prisma.photoSessionImage.deleteMany).mockResolvedValueOnce({
      count: 1,
    });

    await expect(cleanupPendingPhotoUploads()).resolves.toBe(1);

    expect(mocks.r2Send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: 'test-bucket',
          Key: 'reports/image-1.png',
        },
      })
    );
    expect(prisma.photoSessionImage.deleteMany).toHaveBeenCalledWith({
      where: { imageId: 'image-1', uploadedAt: null },
    });
  });
});
