import crypto from 'crypto';

export function generateReportLinkToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}
