'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/utils/auth';
import handleImageUpload from '@/utils/handleImageUpload';
import { analyzeItemImage, createSecurityItem } from '@/lib/api/items';
import type { ItemImageSuggestion } from '@/types/items';
import type { SubmitImageRef } from '@/lib/api/photoSessions';
import { todayISO, validateFoundItemFields } from '@/utils/foundItemForm';

export function useSecurityFoundItemForm(defaultCampusId = '') {
  const router = useRouter();

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(todayISO);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [campusIdOverride, setCampusId] = useState<string | null>(null);
  const campusId = campusIdOverride ?? defaultCampusId;
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [sessionImages, setSessionImages] = useState<SubmitImageRef[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<
    'idle' | 'uploading' | 'analyzing' | 'applied' | 'failed'
  >('idle');
  const [analysisMessage, setAnalysisMessage] = useState<string | null>(null);
  const touchedFields = useRef({
    itemName: false,
    category: false,
    color: false,
    brand: false,
    description: false,
  });
  const uploadPromises = useRef(new Map<File, Promise<SubmitImageRef>>());
  const analyzedFiles = useRef(new Set<File>());
  const analyzedImages = useRef(new Set<string>());
  const analysisRequestId = useRef(0);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const getOrUploadImage = useCallback(
    (file: File, accessToken: string): Promise<SubmitImageRef> => {
      const existing = uploadPromises.current.get(file);
      if (existing) return existing;

      const upload = handleImageUpload(file, accessToken).catch((error) => {
        uploadPromises.current.delete(file);
        throw error;
      });
      uploadPromises.current.set(file, upload);
      return upload;
    },
    []
  );

  const applySuggestion = useCallback(
    (suggestion: ItemImageSuggestion) => {
      if (!touchedFields.current.itemName && suggestion.title) {
        setItemName(suggestion.title);
        clearError('itemName');
      }
      if (!touchedFields.current.category && suggestion.category) {
        setCategory(suggestion.category);
        clearError('category');
      }
      if (!touchedFields.current.color && suggestion.color) {
        setColor(suggestion.color);
      }
      if (!touchedFields.current.brand && suggestion.brand) {
        setBrand(suggestion.brand);
      }
      if (!touchedFields.current.description && suggestion.description) {
        setDescription(suggestion.description);
        clearError('description');
      }
    },
    [clearError]
  );

  const requestImageAnalysis = useCallback(
    async (imageUrl: string) => {
      if (analyzedImages.current.has(imageUrl)) return;
      analyzedImages.current.add(imageUrl);

      const requestId = ++analysisRequestId.current;
      setAnalysisStatus('analyzing');
      setAnalysisMessage(null);

      try {
        const suggestion = await analyzeItemImage(imageUrl);
        if (requestId !== analysisRequestId.current) return;
        applySuggestion(suggestion);
        setAnalysisStatus('applied');
        setAnalysisMessage(
          'AI draft added. Review the details before submitting.'
        );
      } catch {
        if (requestId !== analysisRequestId.current) return;
        setAnalysisStatus('failed');
        setAnalysisMessage(
          'AI suggestions are unavailable. You can continue filling the form manually.'
        );
      }
    },
    [applySuggestion]
  );

  const handleImageFilesChange = useCallback(
    (files: File[]) => {
      setImageFiles(files);
      clearError('images');
      const firstImage = files[0];
      if (!firstImage || analyzedFiles.current.has(firstImage)) return;

      const accessToken = getAccessToken();
      if (!accessToken) return;

      analyzedFiles.current.add(firstImage);
      setAnalysisStatus('uploading');
      setAnalysisMessage(null);
      void getOrUploadImage(firstImage, accessToken)
        .then((image) => requestImageAnalysis(image.imageUrl))
        .catch(() => {
          setAnalysisStatus('failed');
          setAnalysisMessage(
            'AI suggestions are unavailable. You can continue filling the form manually.'
          );
        });
    },
    [clearError, getOrUploadImage, requestImageAnalysis]
  );

  const handleSessionImagesChange = useCallback(
    (images: SubmitImageRef[]) => {
      setSessionImages(images);
      clearError('images');
      if (images[0]) {
        void requestImageAnalysis(images[0].imageUrl);
      }
    },
    [clearError, requestImageAnalysis]
  );

  function updateItemName(value: string) {
    touchedFields.current.itemName = true;
    setItemName(value);
  }

  function updateCategory(value: string) {
    touchedFields.current.category = true;
    setCategory(value);
  }

  function updateColor(value: string) {
    touchedFields.current.color = true;
    setColor(value);
  }

  function updateBrand(value: string) {
    touchedFields.current.brand = true;
    setBrand(value);
  }

  function updateDescription(value: string) {
    touchedFields.current.description = true;
    setDescription(value);
  }

  function validate(): boolean {
    const next = validateFoundItemFields(
      { itemName, category, date, location, description },
      {
        requireCampus: true,
        campus: campusId,
      }
    );

    if (!campusId.trim()) {
      next.campus = 'Storage campus is a required field';
    }

    if (imageFiles.length + sessionImages.length === 0) {
      next.images = 'At least one photo is required';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    setSubmitError(null);
    if (!validate()) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push('/login?redirect=/security/report-found');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedImages: SubmitImageRef[] = [...sessionImages];

      for (const file of imageFiles) {
        const result = await getOrUploadImage(file, accessToken);
        uploadedImages.push({
          imageUrl: result.imageUrl,
          fileType: result.fileType,
          fileSizeKb: result.fileSizeKb,
        });
      }

      await createSecurityItem({
        campusId,
        title: itemName.trim(),
        description: description.trim(),
        color: color.trim() || undefined,
        brand: brand.trim() || undefined,
        category: category.trim(),
        locationFound: location.trim(),
        dateFound: date,
        images: uploadedImages,
      });

      router.push('/security/items');
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Something went wrong submitting your report. Please try again.'
      );
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.push('/security/items');
  }

  return {
    itemName,
    setItemName: updateItemName,
    category,
    setCategory: updateCategory,
    color,
    setColor: updateColor,
    brand,
    setBrand: updateBrand,
    date,
    setDate,
    location,
    setLocation,
    description,
    setDescription: updateDescription,
    campusId,
    setCampusId,
    imageFiles,
    setImageFiles: handleImageFilesChange,
    sessionImages,
    setSessionImages: handleSessionImagesChange,
    analysisStatus,
    analysisMessage,
    errors,
    clearError,
    isSubmitting,
    submitError,
    todayISO,
    handleSubmit,
    handleCancel,
  };
}
