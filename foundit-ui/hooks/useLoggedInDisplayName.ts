'use client';

import { useSyncExternalStore } from 'react';
import { getLoggedInDisplayName } from '@/utils/auth';

export function useLoggedInDisplayName(fallback: string): string {
  return useSyncExternalStore(
    () => () => {},
    () => getLoggedInDisplayName() ?? fallback,
    () => fallback
  );
}
