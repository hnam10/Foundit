import imageCompression from 'browser-image-compression';

const MAX_SIZE_MB = 5;

export async function compressImage(file: File): Promise<File> {
  // 1st try, compressing image to 5MB, max at 1600px
  let compressedFile = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: file.type,
  });

  // 2nd try: if still too large, reduce resolution further
  if (compressedFile.size > MAX_SIZE_MB * 1024 * 1024) {
    compressedFile = await imageCompression(compressedFile, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: file.type,
    });
  }

  // Final check: if still too large, throw error
  if (compressedFile.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error('Image must be 5MB or smaller.');
  }

  return compressedFile;
}
