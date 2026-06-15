import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2, R2_BUCKET } from '../lib/r2';

const PUBLIC_BASE = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '');

export async function resolveImageUrl(stored: string): Promise<string> {
  if (/^https?:\/\//i.test(stored)) {
    return stored;
  }

  if (PUBLIC_BASE) {
    return `${PUBLIC_BASE}/${stored}`;
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET!,
    Key: stored,
  });

  return getSignedUrl(r2, command, { expiresIn: 3600 });
}
