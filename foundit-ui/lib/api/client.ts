import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  signOut,
} from '@/utils/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

let refreshInFlight: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        return null;
      }

      const data = (await res.json()) as {
        accessToken: string;
        refreshToken: string;
      };

      setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function parseErrorBody(
  res: Response
): Promise<{ code?: string; message?: string }> {
  try {
    return (await res.json()) as { code?: string; message?: string };
  } catch {
    return {};
  }
}

export async function authFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const withAuth = (accessToken: string) =>
    fetch(url, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

  let res = await withAuth(token);

  if (res.status === 401) {
    const body = await parseErrorBody(res.clone());

    if (body.code === 'TOKEN_EXPIRED') {
      if (!getRefreshToken()) {
        signOut();
        throw new Error('Session expired. Please log in again.');
      }

      const newToken = await refreshAccessToken();
      if (newToken) {
        res = await withAuth(newToken);
      } else {
        signOut();
        throw new Error('Session expired. Please log in again.');
      }
    }
  }

  return res;
}

export async function parseApiError(res: Response): Promise<string> {
  const body = await parseErrorBody(res);
  return body.message ?? `Request failed (${res.status})`;
}
