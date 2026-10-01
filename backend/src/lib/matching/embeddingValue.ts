import { Prisma } from '@prisma/client';

export function parseEmbedding(
  value: Prisma.JsonValue | null
): number[] | null {
  if (!value || !Array.isArray(value)) {
    return null;
  }

  if (!value.every((entry) => typeof entry === 'number')) {
    return null;
  }

  return value as number[];
}
