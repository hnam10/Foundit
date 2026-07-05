const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface PhotoSessionImageRef {
  imageId: string;
  imageUrl: string;
  fileType: string;
  fileSizeKb: number;
  createdAt: string;
  previewUrl?: string;
}

export interface PhotoSessionValidateResult {
  valid: boolean;
  reason: 'available' | 'not_found' | 'expired';
  expiresAt: string | null;
  maxImages: number;
}

export interface PhotoSessionPollResult {
  valid: boolean;
  reason: 'available' | 'not_found' | 'expired';
  expiresAt: string;
  images: PhotoSessionImageRef[];
}

export type SubmitImageRef = Pick<
  PhotoSessionImageRef,
  'imageUrl' | 'fileType' | 'fileSizeKb'
>;

export async function createPhotoSession(): Promise<{
  token: string;
  expiresAt: string;
}> {
  const { authFetch, parseApiError } = await import('./client');

  const res = await authFetch(`${API_BASE}/api/photo-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresInMinutes: 30 }),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<{ token: string; expiresAt: string }>;
}

export async function validatePhotoSession(
  token: string
): Promise<PhotoSessionValidateResult> {
  const res = await fetch(`${API_BASE}/api/photo-sessions/${token}/validate`);

  if (!res.ok) {
    throw new Error('Could not validate photo session.');
  }

  return res.json() as Promise<PhotoSessionValidateResult>;
}

export async function pollPhotoSessionImages(
  token: string
): Promise<PhotoSessionPollResult> {
  const { authFetch, parseApiError } = await import('./client');

  const res = await authFetch(`${API_BASE}/api/photo-sessions/${token}/images`);

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<PhotoSessionPollResult>;
}

export async function deletePhotoSessionImage(
  token: string,
  imageId: string
): Promise<void> {
  const { authFetch, parseApiError } = await import('./client');

  const res = await authFetch(
    `${API_BASE}/api/photo-sessions/${token}/images/${imageId}`,
    { method: 'DELETE' }
  );

  if (!res.ok && res.status !== 204) {
    throw new Error(await parseApiError(res));
  }
}

export async function requestPhotoSessionPresignedUrl(
  token: string,
  body: { fileName: string; contentType: string; fileSizeKb: number }
) {
  const res = await fetch(
    `${API_BASE}/api/photo-sessions/${token}/presigned-url`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? 'Failed to get upload URL.');
  }

  return res.json() as Promise<{
    uploadUrl: string;
    imageUrl: string;
    fileType: string;
    fileSizeKb: number;
  }>;
}

export async function registerPhotoSessionImage(
  token: string,
  body: SubmitImageRef
): Promise<PhotoSessionImageRef> {
  const res = await fetch(`${API_BASE}/api/photo-sessions/${token}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? 'Failed to register image.');
  }

  return res.json() as Promise<PhotoSessionImageRef>;
}
