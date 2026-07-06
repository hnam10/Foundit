import cron from 'node-cron';
import { ClaimStatus, ItemStatus } from '@prisma/client';
import { prisma } from '../db';
import { writeAuditLog } from '../utils/auditLog';

const AUTO_EXPIRE_REJECTION_REASON = 'Item retention period ended.';

function getTodayUtcDate(): Date {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

export async function expireDueItems(): Promise<number> {
  const today = getTodayUtcDate();

  const candidates = await prisma.item.findMany({
    where: {
      status: ItemStatus.stored,
      retentionExpiryDate: { lte: today },
      claims: {
        none: { status: ClaimStatus.approved },
      },
    },
    select: {
      itemId: true,
      retentionExpiryDate: true,
    },
  });

  if (candidates.length === 0) {
    return 0;
  }

  const candidateItemIds = candidates.map((item) => item.itemId);

  const expiredCount = await prisma.$transaction(async (tx) => {
    const eligibleItems = await tx.item.findMany({
      where: {
        itemId: { in: candidateItemIds },
        status: ItemStatus.stored,
        retentionExpiryDate: { lte: today },
        claims: {
          none: { status: ClaimStatus.approved },
        },
      },
      select: {
        itemId: true,
        retentionExpiryDate: true,
      },
    });

    if (eligibleItems.length === 0) {
      return 0;
    }

    const eligibleItemIds = eligibleItems.map((item) => item.itemId);

    await tx.claim.updateMany({
      where: {
        itemId: { in: eligibleItemIds },
        status: {
          in: [ClaimStatus.submitted, ClaimStatus.under_review],
        },
      },
      data: {
        status: ClaimStatus.rejected,
        rejectionReason: AUTO_EXPIRE_REJECTION_REASON,
        reviewedAt: new Date(),
        reviewedBy: null,
      },
    });

    await tx.item.updateMany({
      where: {
        itemId: { in: eligibleItemIds },
        status: ItemStatus.stored,
        retentionExpiryDate: { lte: today },
        claims: {
          none: { status: ClaimStatus.approved },
        },
      },
      data: { status: ItemStatus.expired },
    });

    await Promise.all(
      eligibleItems.map((item) =>
        writeAuditLog(
          {
            action: 'item_auto_expired',
            entityType: 'item',
            entityId: item.itemId,
            details: {
              previousStatus: ItemStatus.stored,
              nextStatus: ItemStatus.expired,
              retentionExpiryDate:
                item.retentionExpiryDate?.toISOString() ?? null,
            },
          },
          tx
        )
      )
    );

    return eligibleItems.length;
  });

  return expiredCount;
}

export function startExpireRetainedItemsJob() {
  cron.schedule('0 0 * * *', async () => {
    try {
      const count = await expireDueItems();
      console.log(
        `Auto-expired ${count} retained item${count === 1 ? '' : 's'}`
      );
    } catch (error) {
      console.error('Failed to auto-expire retained items', error);
    }
  });
}
