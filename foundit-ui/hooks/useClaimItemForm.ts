'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api/client';
import { CLAIM_SUBMITTED_PATH } from '@/utils/routes';
import { debugError, debugLog, debugWarn } from '@/utils/debug';
import handleImageUpload from '@/utils/handleImageUpload';
import { getAccessToken } from '@/utils/auth';

// Backend caps (createClaimSchema): category ≤ 50, description ≤ 2000.
const DESCRIPTION_MAX = 2000;
// createClaimSchema has no itemName yet; capped to match Item.title
// (VarChar(100)) so the values line up once the backend adds the column.
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
  // ── STUB FIELDS ──────────────────────────────────────────────────────────
  // Item Name, Notification preferences and Additional Information are shown
  // for design parity but are NOT persisted: createClaimSchema only accepts
  // category, description, dateLost and locationLost. Item Name is validated
  // (required, ≤ ITEM_NAME_MAX) so it is ready to join the payload the moment
  // the backend grows the column; the other two are optional in the design,
  // so they are not validated either.
  // Defaults to 'email' — students are opted in to email notifications unless
  // they pick otherwise. The backend today only has the boolean
  // user.emailNotificationOptIn (and PATCH /api/users/me/notifications is
  // still 501), so nothing is persisted yet; phone options additionally need
  // a phone-opt-in column.
  const [notificationPreference, setNotificationPreference] =
    useState<NotificationPreference>('email');
  const [additionalInformation, setAdditionalInformation] = useState('');
  // Fed by the image gallery as raw Files; uploaded to R2 at submit time
  // (same handleImageUpload/presigned-url flow as useReportFoundItemForm).
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

    // Log shapes, not content — description/additionalInformation are
    // user-typed (see utils/debug.ts conventions). The stub-field values are
    // logged so "why didn't this reach the backend?" is answerable from the
    // console: they are dropped by design (no backend column yet).
    debugLog('claim-form', 'submitting claim', {
      category,
      descriptionLength: description.trim().length,
      imageFileCount: imageFiles.length,
      droppedStubFields: {
        itemNameLength: itemName.trim().length,
        notificationPreference,
        additionalInformationLength: additionalInformation.trim().length,
      },
    });

    setIsSubmitting(true);
    try {
      const uploadedImages: {
        imageUrl: string;
        fileType: string;
        fileSizeKb: number;
      }[] = [];

      const accessToken = getAccessToken();
      if (accessToken) {
        for (const file of imageFiles) {
          const result = await handleImageUpload(file, accessToken);
          uploadedImages.push({
            imageUrl: result.imageUrl,
            fileType: result.fileType,
            fileSizeKb: result.fileSizeKb,
          });
        }
      }

      const claim = await apiFetch<{ claimId?: string }>('/api/claims', {
        method: 'POST',
        body: JSON.stringify({
          category: category.trim(),
          description: description.trim(),
          images: uploadedImages,
          // NOTE: itemName, notificationPreference and additionalInformation
          // are intentionally omitted — they are stub fields with no backend
          // column (see state declarations).
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
      } else {
        // status 0 (config/network failure): apiFetch's message says which.
        // A plain Error here means handleImageUpload threw during the
        // presign/PUT-to-R2 step — fall back to the generic copy.
        debugError('claim-form', 'claim submit threw', err);
        setSubmitError(
          err instanceof ApiError ? err.message : messageForStatus(0)
        );
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
