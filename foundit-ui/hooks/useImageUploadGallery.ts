import { useState, useRef } from 'react';
import { compressImage } from '../utils/imageCompression';
import handleImageUpload from '../utils/handleImageUpload';

const MAX_IMAGES = 3;

export interface UploadedImage {
  // Local preview URL (object URL) for immediate display before upload finishes
  previewUrl: string;
  // Key returned from the backend after successful upload to R2
  imageUrl?: string;
  fileType?: string;
  fileSizeKb?: number;
  // Upload status for this slot
  status: 'uploading' | 'done' | 'error';
}

interface UseImageUploadGalleryProps {
  accessToken: string;
  // Called whenever the list of successfully uploaded images changes
  onChange?: (images: { imageUrl: string; fileType: string }[]) => void;
}

export function useImageUploadGallery({
  accessToken,
  onChange,
}: UseImageUploadGalleryProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const notifyChange = (next: UploadedImage[]) => {
    const completed = next
      .filter((img) => img.status === 'done' && img.imageUrl && img.fileType)
      .map((img) => ({
        imageUrl: img.imageUrl as string,
        fileType: img.fileType as string,
      }));
    onChange?.(completed);
  };

  const handleFilesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    for (const file of filesToProcess) {
      const previewUrl = URL.createObjectURL(file);

      // Add a placeholder entry immediately so the user sees progress
      setImages((prev) => [
        ...prev,
        { previewUrl, status: 'uploading' as const },
      ]);

      try {
        const compressedFile = await compressImage(file);
        const result = await handleImageUpload(compressedFile, accessToken);

        setImages((prev) => {
          const next = prev.map((img) =>
            img.previewUrl === previewUrl
              ? {
                  ...img,
                  status: 'done' as const,
                  imageUrl: result.imageUrl,
                  fileType: result.fileType,
                  fileSizeKb: result.fileSizeKb,
                }
              : img
          );
          notifyChange(next);
          return next;
        });
      } catch (err) {
        console.error(err);
        setImages((prev) =>
          prev.map((img) =>
            img.previewUrl === previewUrl
              ? { ...img, status: 'error' as const }
              : img
          )
        );
      }
    }

    // Reset input so the same file can be re-selected if needed
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (previewUrl: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.previewUrl === previewUrl);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      const next = prev.filter((img) => img.previewUrl !== previewUrl);
      notifyChange(next);
      return next;
    });
  };

  return {
    images,
    inputRef,
    canAddMore: images.length < MAX_IMAGES,
    hasImages: images.length > 0,
    maxImages: MAX_IMAGES,
    handleFilesSelected,
    handleRemove,
  };
}
