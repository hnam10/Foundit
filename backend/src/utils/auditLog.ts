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
// Fire-and-forget safe — callers may await or not depending on whether they
// need confirmation. Errors should be caught by the caller or global handler.
export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  await prisma.auditLog.create({
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
