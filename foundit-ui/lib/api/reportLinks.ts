import { authFetch, parseApiError } from '@/lib/api/client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface CreateReportLinkResponse {
  linkId: string;
  token: string;
  campusId: string;
  expiresAt: string;
  createdAt: string;
  reportUrl?: string;
}

export interface CreateReportLinkParams {
  campusId?: string;
  expiresInMinutes?: number;
}

export async function createReportLink(
  params: CreateReportLinkParams = {}
): Promise<CreateReportLinkResponse> {
  const body: CreateReportLinkParams = {};
  if (params.campusId) body.campusId = params.campusId;
  if (params.expiresInMinutes !== undefined) {
    body.expiresInMinutes = params.expiresInMinutes;
  }

  const res = await authFetch(`${API_BASE}/api/report-links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json() as Promise<CreateReportLinkResponse>;
}
