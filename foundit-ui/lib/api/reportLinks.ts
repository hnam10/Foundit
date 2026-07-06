import { apiFetch } from '@/lib/api/client';

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

  return apiFetch<CreateReportLinkResponse>('/api/report-links', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
