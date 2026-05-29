const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string {
  if (!email) {
    return 'Please enter your email.';
  }

  if (!emailRegex.test(email)) {
    return 'Invalid email format.';
  }

  return '';
}
