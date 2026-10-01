'use client';

import { useSyncExternalStore } from 'react';
import { getAccessToken } from '@/utils/auth';

import { subscribeAuth } from '@/utils/authEvents';

/** Reads access token on the client after hydration; null on server/hydration. */
export function useAccessToken() {
  return useSyncExternalStore(
    subscribeAuth,
    () => getAccessToken(),
    () => null
  );
}
