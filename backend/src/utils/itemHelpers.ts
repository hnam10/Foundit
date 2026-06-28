export function itemTitleFromDescription(
  description: string,
  category: string
): string {
  const firstLine = description.split(/\r?\n/)[0]?.trim() || description.trim();
  const title = firstLine || category;
  return title.slice(0, 100);
}

export function buildDescriptionInternal(
  itemDescription: string,
  additionalNotes?: string
): string {
  if (additionalNotes) {
    return `${itemDescription}\n\n${additionalNotes}`;
  }
  return itemDescription;
}

export function computeRetentionExpiryDate(
  dateFound: Date,
  retentionDays: number
): Date {
  const expiry = new Date(dateFound);
  expiry.setUTCDate(expiry.getUTCDate() + retentionDays);
  return expiry;
}
