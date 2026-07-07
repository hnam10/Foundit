import { authFetch, parseApiError } from '@/lib/api/client';
import type {
  ApiClaimStatus,
  MatchSuggestion,
  SecurityClaimDetail,
  SecurityClaimListResponse,
} from '@/types/claims';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface FetchClaimsParams {
  status?: ApiClaimStatus;
  campusId?: string;
  cursor?: string;
  limit?: number;
}

export async function fetchClaims(
  params: FetchClaimsParams = {}
): Promise<SecurityClaimListResponse> {
  const search = new URLSearchParams();

  if (params.status) search.set('status', params.status);
  if (params.campusId) search.set('campusId', params.campusId);
  if (params.cursor) search.set('cursor', params.cursor);
  if (params.limit) search.set('limit', String(params.limit));

  const query = search.toString();
  const res = await authFetch(
    `${API_BASE}/api/claims${query ? `?${query}` : ''}`
  );

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<SecurityClaimListResponse>;
}

export async function fetchAllClaims(
  params: Omit<FetchClaimsParams, 'cursor' | 'limit'> = {}
) {
  const all: SecurityClaimListResponse['data'] = [];
  let cursor: string | undefined;

  do {
    const page = await fetchClaims({ ...params, cursor, limit: 50 });
    all.push(...page.data);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  return all;
}

export async function fetchClaimById(
  claimId: string
): Promise<SecurityClaimDetail> {
  const res = await authFetch(`${API_BASE}/api/claims/${claimId}`);

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<SecurityClaimDetail>;
}

export async function fetchMatchSuggestions(
  claimId: string
): Promise<MatchSuggestion[]> {
  const res = await authFetch(
    `${API_BASE}/api/claims/${claimId}/match-suggestions`
  );

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<MatchSuggestion[]>;
}

export interface UpdateClaimStatusInput {
  status: ApiClaimStatus;
  rejectionReason?: string;
}

export async function updateClaimStatus(
  claimId: string,
  input: UpdateClaimStatusInput
): Promise<SecurityClaimDetail> {
  const res = await authFetch(`${API_BASE}/api/claims/${claimId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<SecurityClaimDetail>;
}

/** Cancels a submitted claim. Only the owning student can cancel, and only
 * while the claim is still `submitted` — the backend rejects (409) once a
 * claim has moved to under_review or beyond. */
export async function deleteClaim(
  claimId: string
): Promise<{ deleted: boolean; claimId: string }> {
  const res = await authFetch(`${API_BASE}/api/claims/${claimId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<{ deleted: boolean; claimId: string }>;
}
