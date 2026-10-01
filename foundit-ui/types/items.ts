export type ItemStatus =
  | 'pending_report'
  | 'stored'
  | 'claimed'
  | 'expired'
  | 'disposed';

export interface Campus {
  campusId: string;
  campusName: string;
}

export interface CategoryStat {
  category: string;
  count: number;
}

export interface PublicItem {
  itemId: string;
  campusId: string;
  category: string;
  title: string;
  descriptionPublic: string | null;
  color: string | null;
  brand: string | null;
  locationFound: string | null;
  dateFound: string;
  status: ItemStatus;
}

/** AI draft for the found-item form — POST /api/items/analyze-image. */
export interface ItemImageSuggestion {
  title: string | null;
  category: string | null;
  color: string | null;
  brand: string | null;
  description: string | null;
}

export interface SecurityItemListItem {
  itemId: string;
  campusId: string;
  campusName: string;
  category: string;
  title: string;
  descriptionPublic: string | null;
  descriptionInternal: string | null;
  color: string | null;
  brand: string | null;
  dateFound: string;
  createdAt: string;
  status: ItemStatus;
  retentionExpiryDate: string | null;
  imageUrl: string | null;
}

export interface SecurityItemListResponse {
  data: SecurityItemListItem[];
  nextCursor: string | null;
}

export interface SecurityItemImage {
  imageId: string;
  imageUrl: string;
}

export interface SecurityItemClaimSummary {
  claimId: string;
  status: string;
  studentName: string;
}

export interface SecurityItemFinder {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export interface SecurityItemDetail extends SecurityItemListItem {
  descriptionPublic: string | null;
  descriptionInternal: string | null;
  color: string | null;
  brand: string | null;
  locationFound: string | null;
  foundItemReportId: string | null;
  updatedAt: string;
  images: SecurityItemImage[];
  registeredBy: {
    userId: string;
    firstName: string;
    lastName: string;
  };
  finder: SecurityItemFinder | null;
  claims: SecurityItemClaimSummary[];
}

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  pending_report: 'Pending report',
  stored: 'In storage',
  claimed: 'Released',
  expired: 'Expired',
  disposed: 'Disposed',
};

export const ITEM_STATUS_COLORS: Record<ItemStatus, { colorPalette: string }> =
  {
    pending_report: { colorPalette: 'orange' },
    stored: { colorPalette: 'blue' },
    claimed: { colorPalette: 'green' },
    expired: { colorPalette: 'gray' },
    disposed: { colorPalette: 'gray' },
  };
