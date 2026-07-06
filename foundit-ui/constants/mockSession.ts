/**
 * Placeholder session data until auth API provides the logged-in user.
 * Replace usages with session/context from login response.
 */
export const MOCK_SECURITY_USER = {
  firstName: 'Rendell',
  lastName: 'Velasco',
};

export function formatDisplayName(user: {
  firstName: string;
  lastName: string;
}): string {
  return `${user.firstName} ${user.lastName}`;
}

export const MOCK_SECURITY_DISPLAY_NAME = formatDisplayName(MOCK_SECURITY_USER);

export const MOCK_STUDENT_USER = {
  firstName: 'Alice',
  lastName: 'Smith',
};

export const MOCK_STUDENT_DISPLAY_NAME = formatDisplayName(MOCK_STUDENT_USER);
