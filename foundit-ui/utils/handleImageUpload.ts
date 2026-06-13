import { compressImage } from './imageCompression';
import type { PresignedUrlResponse } from '../types/uploads';

async function handleImageUpload(file: File, accessToken: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  // Compress the image before uploading (target: 5MB, max 1600px)
  const compressedFile = await compressImage(file);

  // Request a presigned URL from the backend to upload directly to R2/S3

  const presignedUrlResponse = await fetch(
    `${API_URL}/api/uploads/presigned-url`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        fileName: compressedFile.name,
        contentType: compressedFile.type,
        fileSizeKb: Math.ceil(compressedFile.size / 1024),
      }),
    }
  );

  if (!presignedUrlResponse.ok) {
    throw new Error(
      `Failed to get presigned URL: ${presignedUrlResponse.status} ${presignedUrlResponse.statusText}`
    );
  }

  const { uploadUrl, imageUrl, fileType, fileSizeKb } =
    (await presignedUrlResponse.json()) as PresignedUrlResponse;

  // Upload the compressed file directly to the presigned URL (bucket storage)
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': compressedFile.type,
    },
    body: compressedFile,
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `Failed to upload image: ${uploadResponse.status} ${uploadResponse.statusText}`
    );
  }

  // Return metadata needed by the caller (e.g. to save in the DB)
  return { imageUrl, fileType, fileSizeKb };
}

export default handleImageUpload;
