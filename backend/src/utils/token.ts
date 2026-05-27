import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRole } from '@prisma/client';

// Fields embedded in the access token payload.
// campus_id is nullable — users who self-register without selecting a campus
// will have null here until an admin assigns them one.
export interface AccessTokenPayload {
  user_id: string;
  role: UserRole;
  campus_id: string | null;
  email: string;
}

// Signs a short-lived access token (default 15m) used to authenticate API requests.
// The secret and expiry are read from env so they can be rotated without a code change.
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ??
      '15m') as jwt.SignOptions['expiresIn'],
  });
}

// Signs a long-lived refresh token (default 7d) that only contains the userId.
// A separate secret is used so that a leaked refresh secret cannot be used to
// forge access tokens.
export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ??
      '7d') as jwt.SignOptions['expiresIn'],
  });
}

// Returns the SHA-256 hex digest of a raw JWT string (always 64 hex chars).
// Only this hash is persisted in refresh_token_log — the raw token is never stored.
// On logout/refresh, the incoming token is hashed again and looked up in the table.
export function hashTokenForStorage(rawJwt: string): string {
  return crypto.createHash('sha256').update(rawJwt).digest('hex');
}

// Verifies a refresh token signature and expiry, then returns the decoded payload.
// Throws JsonWebTokenError or TokenExpiredError on failure — callers should catch.
export function verifyRefreshToken(rawJwt: string): { userId: string } {
  return jwt.verify(rawJwt, process.env.JWT_REFRESH_SECRET!) as {
    userId: string;
  };
}
