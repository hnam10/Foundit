import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  r2Send: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock('../src/lib/r2', () => ({
  r2: { send: mocks.r2Send },
  R2_BUCKET: 'test-bucket',
}));

vi.mock('../src/db', () => ({
  prisma: {
    photoSessionImage: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(async (callback) =>
      callback({ photoSessionImage: { deleteMany: mocks.deleteMany } })
    ),
  },
}));

import { prisma } from '../src/db';
import { cleanupPendingPhotoUploads } from '../src/jobs/cleanupPendingPhotoUploads';

describe('cleanupPendingPhotoUploads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.photoSessionImage.findMany).mockResolvedValue([
      { imageId: 'image-1', imageUrl: 'reports/image-1.png' },
    ] as never);
  });

  test('claims the reservation before deleting the stored object', async () => {
    mocks.deleteMany.mockResolvedValueOnce({ count: 1 });
    mocks.r2Send.mockResolvedValueOnce({});

    await expect(cleanupPendingPhotoUploads()).resolves.toBe(1);

    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { imageId: 'image-1', uploadedAt: null },
    });
    expect(mocks.r2Send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: 'test-bucket',
          Key: 'reports/image-1.png',
        },
      })
    );
    expect(mocks.deleteMany.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.r2Send.mock.invocationCallOrder[0]
    );
  });

  test('keeps the stored object when registration completed first', async () => {
    mocks.deleteMany.mockResolvedValueOnce({ count: 0 });

    await expect(cleanupPendingPhotoUploads()).resolves.toBe(0);

    expect(mocks.r2Send).not.toHaveBeenCalled();
  });

  test('does not count an image whose storage delete failed', async () => {
    mocks.deleteMany.mockResolvedValueOnce({ count: 1 });
    mocks.r2Send.mockRejectedValueOnce(new Error('r2 unavailable'));
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    await expect(cleanupPendingPhotoUploads()).resolves.toBe(0);

    consoleError.mockRestore();
  });
});
