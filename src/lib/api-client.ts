// Single entry point for every call to the Express API.
//
// - Calls go to /api/v1/... on this same origin; next.config.ts proxies them to
//   the backend, so the httpOnly auth cookies are sent automatically.
// - Unwraps the backend's { success, data } envelope and turns failures into a
//   typed ApiError with the backend's error code and message.
// - When the access token has expired (401 TOKEN_EXPIRED) it refreshes the
//   session once and retries the request, so users aren't logged out every
//   15 minutes.
//
// Browser-only: relative URLs and cookies need a browser context.

const API_BASE = '/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: { path: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Envelope<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: { path: string; message: string }[] } };

type QueryValue = string | number | boolean | null | undefined | readonly (string | number)[];

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options);

  if (response.status === 401 && !NO_REFRESH_PATHS.has(path)) {
    const body = await readEnvelope<T>(response.clone());
    if (body && !body.success && body.error.code === 'TOKEN_EXPIRED' && (await refreshSession())) {
      return unwrap<T>(await send(path, options));
    }
  }

  return unwrap<T>(response);
}

// ─── Silent refresh ──────────────────────────────────────────────────────────

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Gets a fresh access token using the refresh cookie. If several requests
 * expire at the same moment (e.g. a dashboard firing 4 queries), they all
 * await the SAME refresh call instead of each starting their own.
 */
export function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch(`${API_BASE}/auth/refresh`, { method: 'POST' })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

// ─── Internals ───────────────────────────────────────────────────────────────

// A 401 from these means "wrong credentials" or "session over" — refreshing
// would be pointless or loop. (/auth/me is NOT here: it must refresh too.)
const NO_REFRESH_PATHS = new Set(['/auth/login', '/auth/refresh', '/auth/logout']);

async function send(path: string, { method = 'GET', body, query, signal }: RequestOptions) {
  try {
    return await fetch(API_BASE + path + toQueryString(query), {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection and try again.');
  }
}

async function unwrap<T>(response: Response): Promise<T> {
  const body = await readEnvelope<T>(response);

  if (!body) {
    // Not our JSON — typically the proxy's 502/504 while the free-tier API is waking up.
    throw new ApiError(response.status, 'SERVER_UNAVAILABLE', 'The server is starting up or unavailable. Please try again shortly.');
  }
  if (!body.success) throw new ApiError(response.status, body.error.code, body.error.message, body.error.details);
  return body.data;
}

async function readEnvelope<T>(response: Response): Promise<Envelope<T> | null> {
  try {
    const json = await response.json();
    return json && typeof json === 'object' && 'success' in json ? (json as Envelope<T>) : null;
  } catch {
    return null;
  }
}

/** { page: 2, condition: ['Asthma', 'Diabetes'], search: '' } → "?page=2&condition=Asthma,Diabetes" */
function toQueryString(query?: Record<string, QueryValue>) {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(','));
    } else {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
