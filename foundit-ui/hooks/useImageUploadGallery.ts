import { useState, useRef, useEffect } from 'react';

const MAX_IMAGES = 3;

export interface UploadedImage {
  previewUrl: string;
  file: File;
  status: 'pending';
}

interface UseImageUploadGalleryProps {
  onChange?: (files: File[]) => void;
}

export function useImageUploadGallery({
  onChange,
}: UseImageUploadGalleryProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke any remaining object URLs when the component unmounts to avoid
  // memory leaks. handleRemove already revokes URLs for individually removed
  // images; this covers images still present at unmount time.
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  const notifyChange = (next: UploadedImage[]) => {
    onChange?.(next.map((img) => img.file));
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
      setImages((prev) => {
        const next = [
          ...prev,
          { previewUrl, file, status: 'pending' as const },
        ];

        notifyChange(next);
        return next;
      });
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
