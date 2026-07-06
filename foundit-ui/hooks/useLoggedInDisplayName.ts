'use client';

import { useSyncExternalStore } from 'react';
import { getLoggedInDisplayName } from '@/utils/auth';

/**
 * Display name of the logged-in user, or `fallback` (default: empty string)
 * when no user is stored. Don't pass fake names here — an honest empty state
 * beats showing a wrong name.
 */
export function useLoggedInDisplayName(fallback = ''): string {
  return useSyncExternalStore(
    () => () => {},
    () => getLoggedInDisplayName() ?? fallback,
    () => fallback
  );
}
