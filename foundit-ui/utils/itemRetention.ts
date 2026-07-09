import type { ItemStatus } from '@/types/items';

export function getRetentionLabel(
  expiryDate: string | null,
  status: ItemStatus
): { label: string; color: string } | null {
  if (!expiryDate) return null;
  if (status === 'claimed' || status === 'disposed') return null;

  const days = Math.ceil(
    (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
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
