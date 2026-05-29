export type UserRole = 'student' | 'security' | 'admin';

export const ROLE_HOME: Record<UserRole, string> = {
  student: '/student/dashboard',
  security: '/security/dashboard',
  admin: '/admin/dashboard',
};
