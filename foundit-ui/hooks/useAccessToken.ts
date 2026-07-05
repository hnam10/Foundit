'use client';

import { useSyncExternalStore } from 'react';
import { getAccessToken } from '@/utils/auth';

const subscribe = () => () => {};

/** Reads access token on the client after hydration; null on server/hydration. */
export function useAccessToken() {
  return useSyncExternalStore(
    subscribe,
    () => getAccessToken(),
    () => null
  );
}
