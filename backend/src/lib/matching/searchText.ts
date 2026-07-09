function cleanPart(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function append(
  parts: string[],
  label: string,
  value: string | null | undefined
) {
  const cleaned = cleanPart(value);
  if (cleaned) {
    parts.push(`${label}:${cleaned}`);
  }
}

export interface ClaimSearchInput {
  category: string;
  itemName?: string | null;
  description: string;
  additionalInfo?: string | null;
  locationLost?: string | null;
}

export interface ItemSearchInput {
  category: string;
  title: string;
  descriptionPublic?: string | null;
  descriptionInternal?: string | null;
  brand?: string | null;
  color?: string | null;
  locationFound?: string | null;
}

export function buildClaimSearchText(claim: ClaimSearchInput): string {
  const parts: string[] = [];
  append(parts, 'category', claim.category);
  append(parts, 'name', claim.itemName);
  append(parts, 'desc', claim.description);
  append(parts, 'info', claim.additionalInfo);
  append(parts, 'location', claim.locationLost);
  return parts.join(' | ');
}

export function buildItemSearchText(item: ItemSearchInput): string {
  const parts: string[] = [];
  append(parts, 'category', item.category);
  append(parts, 'title', item.title);
  append(parts, 'brand', item.brand);
  append(parts, 'color', item.color);
  append(parts, 'desc', item.descriptionPublic ?? item.descriptionInternal);
  append(parts, 'location', item.locationFound);
  return parts.join(' | ');
}
