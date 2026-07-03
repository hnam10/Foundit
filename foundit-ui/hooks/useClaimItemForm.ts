'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api/client';
import { ROLE_HOME } from '@/utils/routes';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

// Backend caps (createClaimSchema): category ≤ 50, description ≤ 2000.
const DESCRIPTION_MAX = 2000;

// Matches the Figma error copy: "{Field} is a required field".
function requiredMsg(label: string): string {
  return `${label} is a required field`;
}

export function useClaimItemForm() {
  const router = useRouter();

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  // ── STUB FIELDS ──────────────────────────────────────────────────────────
  // Notification preferences and Additional Information are shown for design
  // parity but are NOT persisted: createClaimSchema only accepts category,
  // description, dateLost and locationLost. Both are optional in the design,
  // so they are not validated either. Wire into the payload once the backend
  // grows the columns.
  const [notificationPreference, setNotificationPreference] = useState('');
  const [additionalInformation, setAdditionalInformation] = useState('');
  // Fed by the image gallery as raw Files (upload happens at submit time in
  // the report-found flow). Intentionally NOT uploaded or sent here —
  // POST /api/claims has no image field yet. Mirror useReportFoundItemForm's
  // handleImageUpload loop once the backend accepts claim images.
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

    if (!description.trim()) {
      next.description = requiredMsg('Description');
    } else if (description.trim().length > DESCRIPTION_MAX) {
      next.description = `Description must be ${DESCRIPTION_MAX} characters or fewer`;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
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
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE}/api/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category.trim(),
          description: description.trim(),
          // NOTE: notificationPreference, additionalInformation and
          // imageFiles are intentionally omitted — they are stub fields with
          // no backend column (see state declarations).
        }),
      });

      if (res.ok) {
        router.push(ROLE_HOME.student);
        return;
      }

      setSubmitError(messageForStatus(res.status));
    } catch {
      // authFetch throws when there is no session or the refresh fails.
      setSubmitError(messageForStatus(401));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  return {
    category,
    setCategory,
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
