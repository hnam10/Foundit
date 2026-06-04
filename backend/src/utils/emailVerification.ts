import crypto from 'crypto';

// Random token generation
export function generateVerifyToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

//expire in 24 hours
export function getVerifyTokenExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}
