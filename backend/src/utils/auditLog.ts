import { Prisma } from '@prisma/client';
import { prisma } from '../db';

interface AuditLogParams {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Prisma.InputJsonObject;
  ipAddress?: string;
}

// Writes a single audit log entry to the database.
// Pass a transaction client to include the insert in an existing transaction.
export async function writeAuditLog(
  params: AuditLogParams,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma;
  await client.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
      ipAddress: params.ipAddress,
    },
  });
}
