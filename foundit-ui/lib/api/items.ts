import { apiFetch } from '@/lib/api/client';
import type {
  Campus,
  CategoryStat,
  ItemStatus,
  PublicItem,
  SecurityItemDetail,
  SecurityItemListResponse,
} from '@/types/items';

export type { CategoryStat } from '@/types/items';

export async function fetchCampuses(): Promise<Campus[]> {
  return apiFetch<Campus[]>('/api/campuses', { auth: false });
}

// Public counts of claimable (status=stored) items grouped by category —
// backend GET /api/items/category-stats.
export async function fetchCategoryStats(
  campusId?: string
): Promise<CategoryStat[]> {
  const query = campusId ? `?campusId=${encodeURIComponent(campusId)}` : '';
  return apiFetch<CategoryStat[]>(`/api/items/category-stats${query}`, {
    auth: false,
  });
}

export interface FetchPublicItemsParams {
  category?: string;
  campusId?: string;
}

export async function fetchPublicItems(
  params: FetchPublicItemsParams = {}
): Promise<PublicItem[]> {
  const search = new URLSearchParams();

  if (params.category) search.set('category', params.category);
  if (params.campusId) search.set('campusId', params.campusId);

  const query = search.toString();
  return apiFetch<PublicItem[]>(
    `/api/public/items${query ? `?${query}` : ''}`,
    {
      auth: false,
    }
  );
}

export interface FetchSecurityItemsParams {
  status?: ItemStatus;
  campusId?: string;
  category?: string;
  cursor?: string;
  limit?: number;
}

export async function fetchSecurityItems(
  params: FetchSecurityItemsParams = {}
): Promise<SecurityItemListResponse> {
  const search = new URLSearchParams();

  if (params.status) search.set('status', params.status);
  if (params.campusId) search.set('campusId', params.campusId);
  if (params.category) search.set('category', params.category);
  if (params.cursor) search.set('cursor', params.cursor);
  if (params.limit) search.set('limit', String(params.limit));

  const query = search.toString();
  return apiFetch<SecurityItemListResponse>(
    `/api/items${query ? `?${query}` : ''}`
  );
}

export async function fetchSecurityItem(
  itemId: string
): Promise<SecurityItemDetail> {
  return apiFetch<SecurityItemDetail>(`/api/items/${itemId}`);
}

export interface UpdateSecurityItemInput {
  title: string;
  category: string;
  dateFound: string;
  locationFound: string | null;
  descriptionInternal: string | null;
}

export async function updateSecurityItem(
  itemId: string,
  input: UpdateSecurityItemInput
): Promise<SecurityItemDetail> {
  return apiFetch<SecurityItemDetail>(`/api/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export interface CreateSecurityItemInput {
  campusId: string;
  title: string;
  description: string;
  category: string;
  locationFound: string;
  dateFound: string;
  images?: {
    imageUrl: string;
    fileType: string;
    fileSizeKb: number;
  }[];
}

export async function createSecurityItem(
  input: CreateSecurityItemInput
): Promise<SecurityItemDetail> {
  return apiFetch<SecurityItemDetail>('/api/items', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export interface WalkInReleaseInput {
  studentFullName: string;
  idVerified: string;
  contactNumber?: string | null;
  verificationNote?: string | null;
}

export async function walkInReleaseItem(
  itemId: string,
  input: WalkInReleaseInput
): Promise<SecurityItemDetail> {
  return apiFetch<SecurityItemDetail>(`/api/items/${itemId}/walk-in-release`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
