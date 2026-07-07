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

    let next = images;
    for (const file of filesToProcess) {
      const previewUrl = URL.createObjectURL(file);
      next = [...next, { previewUrl, file, status: 'pending' as const }];
    }

    setImages(next);
    notifyChange(next);

    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (previewUrl: string) => {
    const removed = images.find((img) => img.previewUrl === previewUrl);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    const next = images.filter((img) => img.previewUrl !== previewUrl);

    setImages(next);
    notifyChange(next);
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
