'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/utils/auth';
import { CAMPUSES } from '@/constants/campuses';
import handleImageUpload from '@/utils/handleImageUpload';
import { todayISO, validateFoundItemFields } from '@/utils/foundItemForm';

import { API_BASE } from '@/lib/api/client';

const DEFAULT_CAMPUS = CAMPUSES[0].name;

export function useReportFoundItemForm(token: string) {
  const router = useRouter();

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(todayISO);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactInformation, setContactInformation] = useState('');
  const [campus, setCampus] = useState(DEFAULT_CAMPUS);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate(): boolean {
    const next = validateFoundItemFields(
      { itemName, category, date, location, description },
      {
        requireContact: true,
        requireCampus: true,
        contactInformation,
        campus,
      }
    );

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function messageForStatus(status: number): string {
    switch (status) {
      case 401:
        return 'Please log in as a student to submit this report.';
      case 403:
        return 'Your account cannot submit reports for this campus.';
      case 404:
        return 'This report link no longer exists.';
      case 409:
        return 'This report link has already been used or has expired.';
      case 429:
        return 'Too many attempts. Please wait a moment and try again.';
      default:
        return 'Something went wrong submitting your report. Please try again.';
    }
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    setSubmitError(null);
    if (!validate()) return;

    const loginRedirect = `/login?redirect=${encodeURIComponent(`/report-found/${token}`)}`;

    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push(loginRedirect);
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedImages = [];

      for (const file of imageFiles) {
        const result = await handleImageUpload(file, accessToken);
        uploadedImages.push({
          imageUrl: result.imageUrl,
          fileType: result.fileType,
          fileSizeKb: result.fileSizeKb,
        });
      }

      const res = await fetch(`${API_BASE}/api/report-links/${token}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: itemName.trim(),
          description: description.trim(),
          category: category.trim(),
          locationFound: location.trim(),
          dateFound: date,
          images: uploadedImages,
        }),
      });

      if (res.ok) {
        router.push('/report-found/submitted');
        return;
      }

      if (res.status === 401) {
        router.push(loginRedirect);
        return;
      }

      if (res.status === 400) {
        try {
          const body = (await res.json()) as {
            details?: { message?: string }[];
          };
          const detail = body.details?.[0]?.message;
          setSubmitError(detail ?? 'Please check your form and try again.');
        } catch {
          setSubmitError('Please check your form and try again.');
        }
        setIsSubmitting(false);
        return;
      }

      setSubmitError(messageForStatus(res.status));
      setIsSubmitting(false);
    } catch {
      setSubmitError(messageForStatus(0));
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  return {
    itemName,
    setItemName,
    category,
    setCategory,
    date,
    setDate,
    location,
    setLocation,
    description,
    setDescription,
    contactInformation,
    setContactInformation,
    campus,
    setCampus,
    imageFiles,
    setImageFiles,
    errors,
    clearError,
    isSubmitting,
    submitError,
    todayISO,
    handleSubmit,
    handleCancel,
  };
}
