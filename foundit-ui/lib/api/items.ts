import { authFetch, parseApiError } from '@/lib/api/client';
import type {
  Campus,
  CategoryStat,
  ItemStatus,
  PublicItem,
  SecurityItemDetail,
  SecurityItemListResponse,
} from '@/types/items';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function fetchCampuses(): Promise<Campus[]> {
  const res = await fetch(`${API_BASE}/api/campuses`);
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json() as Promise<Campus[]>;
}

export async function fetchCategoryStats(
  campusId?: string
): Promise<CategoryStat[]> {
  const search = new URLSearchParams();
  if (campusId) search.set('campusId', campusId);

  const query = search.toString();
  const res = await fetch(
    `${API_BASE}/api/items/category-stats${query ? `?${query}` : ''}`
  );

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<CategoryStat[]>;
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
  const res = await fetch(
    `${API_BASE}/api/public/items${query ? `?${query}` : ''}`
  );

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<PublicItem[]>;
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
  const res = await authFetch(
    `${API_BASE}/api/items${query ? `?${query}` : ''}`
  );

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<SecurityItemListResponse>;
}

export async function fetchSecurityItem(
  itemId: string
): Promise<SecurityItemDetail> {
  const res = await authFetch(`${API_BASE}/api/items/${itemId}`);

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<SecurityItemDetail>;
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
  const res = await authFetch(`${API_BASE}/api/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<SecurityItemDetail>;
}

export interface CreateSecurityItemInput {
  campusId: string;
  itemDescription: string;
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
  const res = await authFetch(`${API_BASE}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<SecurityItemDetail>;
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
  const res = await authFetch(
    `${API_BASE}/api/items/${itemId}/walk-in-release`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }
  );

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<SecurityItemDetail>;
}
