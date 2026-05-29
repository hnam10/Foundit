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

export function validatePassword(password: string): string {
  if (!password) {
    return 'Please enter your password.';
  }

  if (password.length < 8) {
    return 'Must be at least 8 characters.';
  }

  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Include at least one uppercase letter and one number.';
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Must contain a special character.';
  }

  return '';
}

export function validateRequired(value: string, message: string): string {
  if (!value.trim()) return message;
  return '';
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): string {
  if (!confirmPassword) return 'Please confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return '';
}
