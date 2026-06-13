import { S3Client } from '@aws-sdk/client-s3';

// Fail fast at startup if any required R2 environment variables are missing,
// instead of letting the S3Client be constructed with undefined values and
// failing with a cryptic error later when a presigned URL is requested.
const requiredEnvVars = [
  'R2_ENDPOINT',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    // Non-null assertions are safe here because the loop above guarantees
    // these variables are set, or the process has already exited.
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET;