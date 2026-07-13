'use client';

import { useSyncExternalStore } from 'react';
import { getLoggedInUser, type LoggedInUser } from '@/utils/auth';

const subscribe = () => () => {};

// getLoggedInUser() re-parses localStorage into a new object every call;
// useSyncExternalStore requires a referentially stable snapshot when nothing
// changed, or React reschedules a render every commit and loops forever.
let cachedRaw: string | null = null;
let cachedUser: LoggedInUser | null = null;

function getSnapshot(): LoggedInUser | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem('user');
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = getLoggedInUser();
  }
  return cachedUser;
}

/** Reads the stored user on the client after hydration; null on server/hydration. */
export function useLoggedInUser(): LoggedInUser | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
