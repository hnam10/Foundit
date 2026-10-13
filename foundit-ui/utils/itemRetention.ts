import type { ItemStatus } from '@/types/items';

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export function getStorageDurationLabel(
  createdAt: string,
  status: ItemStatus,
  now = Date.now()
): string | null {
  if (status !== 'stored' && status !== 'expired') return null;

  const createdAtMs = new Date(createdAt).getTime();
  if (!Number.isFinite(createdAtMs)) return null;

  const days = Math.max(
    0,
    Math.floor((now - createdAtMs) / MILLISECONDS_PER_DAY)
  );
  if (days === 0) return 'Stored today';
  return `Stored for ${days} day${days === 1 ? '' : 's'}`;
}

export function getRetentionLabel(
  expiryDate: string | null,
  status: ItemStatus
): { label: string; color: string } | null {
  if (!expiryDate) return null;
  if (status === 'claimed' || status === 'disposed') return null;

  const days = Math.ceil(
    (new Date(expiryDate).getTime() - Date.now()) / MILLISECONDS_PER_DAY
  );

  if (days < 0) {
    return { label: 'Expired', color: 'gray.500' };
  }
  if (days <= 7) {
    return {
      label: `${days} day${days === 1 ? '' : 's'} left`,
      color: 'orange.600',
    };
  }
  return { label: `${days} days left`, color: 'gray.600' };
}
