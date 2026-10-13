'use client';

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAccessToken, getLoggedInUser, getSessionRole } from '@/utils/auth';
import { subscribeAuth } from '@/utils/authEvents';
import { ROLE_HOME, parseRole } from '@/utils/routes';

function getSessionSnapshot() {
  try {
    const role = getSessionRole();
    const userRole = parseRole(getLoggedInUser()?.role);
    return getAccessToken() && role && userRole === role ? role : '';
  } catch {
    // Storage can be blocked by the browser; treat that as signed out so
    // public pages still render.
    return '';
  }
}

function isRoute(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Client guard also runs when the browser restores a page without a server request. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = useSyncExternalStore(
    subscribeAuth,
    getSessionSnapshot,
    () => null
  );
  const publicPhotoSession = pathname.startsWith('/security/add-photos/');
  const protectedRoute =
    !publicPhotoSession &&
    ['/student', '/security', '/admin', '/profile', '/dashboard'].some((base) =>
      isRoute(pathname, base)
    );

  let destination: string | null = null;
  if (protectedRoute && role !== null) {
    if (!role) destination = '/login';
    else if (
      isRoute(pathname, '/dashboard') ||
      (isRoute(pathname, '/student') &&
        role !== 'student' &&
        role !== 'admin') ||
      (isRoute(pathname, '/security') &&
        role !== 'security' &&
        role !== 'admin') ||
      (isRoute(pathname, '/admin') && role !== 'admin')
    )
      destination = ROLE_HOME[role];
  }

  useEffect(() => {
    if (destination) router.replace(destination);
  }, [destination, pathname, router]);

  if (protectedRoute && (role === null || destination)) return null;
  return children;
}
