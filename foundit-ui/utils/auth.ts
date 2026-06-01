import { ROLE_HOME, type UserRole } from './routes';

export type { UserRole };
export { ROLE_HOME };

const ROLE_COOKIE = 'foundit_role';

export function setSessionRole(role: UserRole) {
  document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearSessionRole() {
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getSessionRole(): UserRole | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${ROLE_COOKIE}=`));

  if (!match) {
    return null;
  }

  const value = match.split('=')[1] as UserRole;
  if (value === 'student' || value === 'security' || value === 'admin') {
    return value;
  }

  return null;
}

export function getRoleHome(role: UserRole): string {
  return ROLE_HOME[role];
}

export interface LoggedInUser {
  userId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  campusId?: string | null;
}

export function getLoggedInUser(): LoggedInUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem('user');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LoggedInUser;
  } catch {
    return null;
  }
}

export function getLoggedInDisplayName(): string | null {
  const user = getLoggedInUser();
  if (!user?.firstName) {
    return null;
  }
  return `${user.firstName} ${user.lastName}`.trim();
}
