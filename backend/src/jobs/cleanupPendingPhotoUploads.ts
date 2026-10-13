import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import cron from 'node-cron';
import { prisma } from '../db';
import { r2, R2_BUCKET } from '../lib/r2';

// Presigned URLs expire after one hour. The extra hour allows uploads that
// finished near expiry to complete registration before cleanup begins.
const PENDING_UPLOAD_RETENTION_MS = 2 * 60 * 60 * 1000;

/** Deletes never-completed uploads from R2 and the database; returns the count removed. */
export async function cleanupPendingPhotoUploads(): Promise<number> {
  const pendingImages = await prisma.photoSessionImage.findMany({
    where: {
      uploadedAt: null,
      createdAt: { lt: new Date(Date.now() - PENDING_UPLOAD_RETENTION_MS) },
    },
    select: { imageId: true, imageUrl: true },
  });

  let deletedCount = 0;
  for (const image of pendingImages) {
    try {
      // Claim the row before touching storage. Registration's uploadedAt
      // update waits on this row and then finds it gone, so it cannot mark an
      // image as uploaded after its object was removed. If the storage delete
      // throws, the transaction rolls back and the reservation is kept.
      const claimed = await prisma.$transaction(async (tx) => {
        const deleted = await tx.photoSessionImage.deleteMany({
          where: { imageId: image.imageId, uploadedAt: null },
        });
        if (deleted.count === 0) return 0;

        await r2.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET,
            Key: image.imageUrl,
          })
        );
        return deleted.count;
      });
      deletedCount += claimed;
    } catch (error) {
      // Keep the reservation so a later run can retry storage cleanup.
      console.error(`Failed to clean up pending photo ${image.imageId}`, error);
    }
  }

  return deletedCount;
}

export function startPendingPhotoUploadCleanupJob() {
  cron.schedule('15 * * * *', async () => {
    try {
      const count = await cleanupPendingPhotoUploads();
      if (count > 0) {
        console.log(`Cleaned up ${count} pending photo uploads`);
      }
    } catch (error) {
      console.error('Failed to clean up pending photo uploads', error);
    }
  });
}
