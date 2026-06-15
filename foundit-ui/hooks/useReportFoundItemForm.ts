'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/utils/auth';
import { ROLE_HOME } from '@/utils/routes';
import { CAMPUSES } from '@/constants/campuses';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

// Backend itemDescription cap (submitFoundItemReportSchema).
const DESCRIPTION_MAX = 1000;

// Default for the Campus stub (matches the design's "Newnham" default).
const DEFAULT_CAMPUS = CAMPUSES[0].name;

// Matches the Figma error copy: "{Field} is a required field".
function requiredMsg(label: string): string {
  return `${label} is a required field`;
}

// Local YYYY-MM-DD, used both for the date input `max` and the not-in-future check.
function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

interface ImageRef {
  imageUrl: string;
  fileType: string;
}

export function useReportFoundItemForm(token: string) {
  const router = useRouter();

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  // ── STUB FIELDS ──────────────────────────────────────────────────────────
  // Contact Information and Campus are shown for design parity but are NOT
  // persisted: the backend (submitFoundItemReportSchema) has no contact column,
  // and campus is fixed server-side by the report link. They are validated
  // client-side (the design marks them required) but excluded from the submit
  // body. Remove the stub note + wire into the payload once the backend grows
  // the columns. See plan.md.
  const [contactInformation, setContactInformation] = useState('');
  const [campus, setCampus] = useState(DEFAULT_CAMPUS);
  // Fed by the image gallery (uploaded to R2 on select). Intentionally NOT sent
  // in the submit body — the report-link submit schema has no image field yet
  // (see plan.md 🟠). Wiring is one line once the backend accepts image refs.
  const [imageRefs, setImageRefs] = useState<ImageRef[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // The backend has no item-name column, so Item Name is folded into
  // itemDescription as the first line (no data lost). See plan.md.
  function buildItemDescription(): string {
    return [itemName.trim(), description.trim()].filter(Boolean).join('\n\n');
  }

  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  // Mirrors submitFoundItemReportSchema so the client fails fast before the POST.
  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!itemName.trim()) {
      next.itemName = requiredMsg('Item Name');
    } else if (itemName.trim().length > 100) {
      next.itemName = 'Item Name must be 100 characters or fewer';
    }

    if (!category.trim()) {
      next.category = requiredMsg('Category');
    }

    if (!date.trim()) {
      next.date = requiredMsg('Date');
    } else if (date > todayISO()) {
      next.date = 'Date cannot be in the future';
    }

    if (!location.trim()) {
      next.location = requiredMsg('Location');
    } else if (location.trim().length > 100) {
      next.location = 'Location must be 100 characters or fewer';
    }

    // Stub fields — validated for design parity, not sent to the backend.
    if (!contactInformation.trim()) {
      next.contactInformation = requiredMsg('Contact Information');
    }

    if (!campus.trim()) {
      next.campus = requiredMsg('Campus');
    }

    if (!description.trim()) {
      next.description = requiredMsg('Description');
    } else if (buildItemDescription().length > DESCRIPTION_MAX) {
      next.description = `Item Name and Description together must be ${DESCRIPTION_MAX} characters or fewer`;
    }

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
    setSubmitError(null);
    if (!validate()) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      setSubmitError(messageForStatus(401));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/report-links/${token}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          itemDescription: buildItemDescription(),
          category: category.trim(),
          locationFound: location.trim(),
          dateFound: date,
          // NOTE: contactInformation + campus are intentionally omitted — they
          // are stub fields with no backend column (see state declaration).
        }),
      });

      if (res.ok) {
        router.push('/Report/report-submitted');
        return;
      }

      setSubmitError(messageForStatus(res.status));
    } catch {
      setSubmitError(messageForStatus(0));
    } finally {
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
    imageRefs,
    setImageRefs,
    errors,
    clearError,
    isSubmitting,
    submitError,
    todayISO,
    handleSubmit,
    handleCancel,
  };
}
