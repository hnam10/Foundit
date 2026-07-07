'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api/client';
import { CLAIM_SUBMITTED_PATH } from '@/utils/routes';
import { getAccessToken } from '@/utils/auth';
import handleImageUpload from '@/utils/handleImageUpload';
import { debugError, debugLog, debugWarn } from '@/utils/debug';

// Backend caps (createClaimSchema): category ≤ 50, description ≤ 2000.
const DESCRIPTION_MAX = 2000;
// Matches Item.title (VarChar(100)) — createClaimSchema.itemName shares the cap.
const ITEM_NAME_MAX = 100;

// What the student wants to be notified through when their claim advances.
// Phone-based options are only selectable when the profile has a phone number.
export type NotificationPreference = 'email' | 'phone' | 'email_and_phone';

// Matches the Figma error copy: "{Field} is a required field".
function requiredMsg(label: string): string {
  return `${label} is a required field`;
}

export function useClaimItemForm() {
  const router = useRouter();

  const [category, setCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  // Defaults to 'email' — students are opted in to email notifications unless
  // they pick otherwise.
  const [notificationPreference, setNotificationPreference] =
    useState<NotificationPreference>('email');
  const [additionalInformation, setAdditionalInformation] = useState('');
  // Fed by the image gallery as raw Files; uploaded to R2 at submit time
  // (mirrors useReportFoundItemForm's handleImageUpload loop) and attached
  // to the claim via the `images` field on POST /api/claims.
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

  // Mirrors createClaimSchema so the client fails fast before the POST.
  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!category.trim()) {
      next.category = requiredMsg('Category');
    }

    if (!itemName.trim()) {
      next.itemName = requiredMsg('Item Name');
    } else if (itemName.trim().length > ITEM_NAME_MAX) {
      next.itemName = `Item Name must be ${ITEM_NAME_MAX} characters or fewer`;
    }

    if (!description.trim()) {
      next.description = requiredMsg('Description');
    } else if (description.trim().length > DESCRIPTION_MAX) {
      next.description = `Description must be ${DESCRIPTION_MAX} characters or fewer`;
    }

    setErrors(next);
    const failedFields = Object.keys(next);
    if (failedFields.length > 0) {
      debugLog('claim-form', 'client validation failed', {
        fields: failedFields,
      });
    }
    return failedFields.length === 0;
  }

  function messageForStatus(status: number): string {
    switch (status) {
      case 401:
        return 'Please log in as a student to submit a claim.';
      case 403:
        return 'Only student accounts can submit claims.';
      case 409:
        return 'A campus must be assigned to your account before you can submit a claim.';
      case 429:
        return 'Too many attempts. Please wait a moment and try again.';
      default:
        return 'Something went wrong submitting your claim. Please try again.';
    }
  }

  async function handleSubmit() {
    // Re-entry guard: Enter or a rapid second click can fire before the
    // button's loading state re-renders (same fix as report-found, c745b2c).
    if (isSubmitting) return;

    setSubmitError(null);
    if (!validate()) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      setSubmitError(messageForStatus(401));
      return;
    }

    // Log shapes, not content — description/additionalInformation are
    // user-typed (see utils/debug.ts conventions).
    debugLog('claim-form', 'submitting claim', {
      category,
      itemNameLength: itemName.trim().length,
      descriptionLength: description.trim().length,
      notificationPreference,
      additionalInformationLength: additionalInformation.trim().length,
      imageFileCount: imageFiles.length,
    });

    setIsSubmitting(true);
    try {
      const uploadedImages: {
        imageUrl: string;
        fileType: string;
        fileSizeKb: number;
      }[] = [];
      for (const file of imageFiles) {
        const result = await handleImageUpload(file, accessToken);
        uploadedImages.push({
          imageUrl: result.imageUrl,
          fileType: result.fileType,
          fileSizeKb: result.fileSizeKb,
        });
      }

      const claim = await apiFetch<{ claimId?: string }>('/api/claims', {
        method: 'POST',
        body: JSON.stringify({
          category: category.trim(),
          itemName: itemName.trim(),
          description: description.trim(),
          additionalInfo: additionalInformation.trim() || undefined,
          notificationPreference,
          images: uploadedImages,
        }),
      });

      debugLog('claim-form', 'claim created', { claimId: claim.claimId });
      // isSubmitting deliberately stays true: router.push isn't awaited,
      // and re-enabling the button during the transition would allow a
      // duplicate claim. The component unmounts on navigation.
      router.push(CLAIM_SUBMITTED_PATH);
    } catch (err) {
      if (err instanceof ApiError && err.status > 0) {
        debugWarn('claim-form', `claim rejected by backend (${err.status})`);
        setSubmitError(messageForStatus(err.status));
      } else if (err instanceof ApiError) {
        // status 0: config/network failure — apiFetch's message says which.
        debugError('claim-form', 'claim submit threw', err);
        setSubmitError(err.message);
      } else {
        // Not an ApiError — e.g. handleImageUpload (the R2 presigned-URL
        // upload) threw a plain Error before the request ever reached
        // POST /api/claims. Use the generic fallback, not the 401 copy.
        debugError('claim-form', 'claim submit threw', err);
        setSubmitError(messageForStatus(0));
      }
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  return {
    category,
    setCategory,
    itemName,
    setItemName,
    description,
    setDescription,
    notificationPreference,
    setNotificationPreference,
    additionalInformation,
    setAdditionalInformation,
    imageFiles,
    setImageFiles,
    errors,
    clearError,
    isSubmitting,
    submitError,
    handleSubmit,
    handleCancel,
  };
}
