import bcrypt from 'bcryptjs';

// 12 rounds is the recommended minimum for production (balances security vs. latency).
// Each increment doubles the work factor — do not lower below 10.
const BCRYPT_ROUNDS = 12;

// Hashes a plaintext password. Always use this before storing a password in the DB.
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

// Compares a plaintext password against a stored bcrypt hash.
// Returns true if they match, false otherwise.
// Timing-safe — bcrypt.compare takes the same time regardless of match result.
export async function comparePassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
