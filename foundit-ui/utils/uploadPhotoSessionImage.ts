import { compressImage } from './imageCompression';
import {
  registerPhotoSessionImage,
  requestPhotoSessionPresignedUrl,
} from '@/lib/api/photoSessions';

export async function uploadPhotoToSession(token: string, file: File) {
  const compressedFile = await compressImage(file);

  const { uploadUrl, imageUrl, fileType, fileSizeKb } =
    await requestPhotoSessionPresignedUrl(token, {
      fileName: compressedFile.name,
      contentType: compressedFile.type,
      fileSizeKb: Math.ceil(compressedFile.size / 1024),
      fileSizeBytes: compressedFile.size,
    });

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': compressedFile.type },
    body: compressedFile,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload image to storage.');
  }

  return registerPhotoSessionImage(token, { imageUrl, fileType, fileSizeKb });
}
