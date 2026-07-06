export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 1000;

export function requiredMsg(label: string): string {
  return `${label} is a required field`;
}

export function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export interface FoundItemFieldValues {
  itemName: string;
  category: string;
  date: string;
  location: string;
  description: string;
}

export interface FoundItemValidationOptions {
  requireContact?: boolean;
  requireCampus?: boolean;
  contactInformation?: string;
  campus?: string;
}

export function validateFoundItemFields(
  values: FoundItemFieldValues,
  options: FoundItemValidationOptions = {}
): Record<string, string> {
  const next: Record<string, string> = {};

  if (!values.itemName.trim()) {
    next.itemName = requiredMsg('Item Name');
  } else if (values.itemName.trim().length > TITLE_MAX) {
    next.itemName = `Item Name must be ${TITLE_MAX} characters or fewer`;
  }

  if (!values.category.trim()) {
    next.category = requiredMsg('Category');
  }

  if (!values.date.trim()) {
    next.date = requiredMsg('Date');
  } else if (values.date > todayISO()) {
    next.date = 'Date cannot be in the future';
  }

  if (!values.location.trim()) {
    next.location = requiredMsg('Where was the item found?');
  } else if (values.location.trim().length > 100) {
    next.location = 'Location must be 100 characters or fewer';
  }

  if (options.requireContact && !options.contactInformation?.trim()) {
    next.contactInformation = requiredMsg('Contact Information');
  }

  if (options.requireCampus && !options.campus?.trim()) {
    next.campus = requiredMsg('Storage campus');
  }

  if (!values.description.trim()) {
    next.description = requiredMsg('Description');
  } else if (values.description.trim().length > DESCRIPTION_MAX) {
    next.description = `Description must be ${DESCRIPTION_MAX} characters or fewer`;
  }

  return next;
}
