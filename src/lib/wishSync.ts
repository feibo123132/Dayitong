export type WishCategoryId = 'gift' | 'snack' | 'play' | 'song';

interface WishSyncEnv {
  VITE_JIEYOU_WISH_SYNC_ENDPOINT?: string;
  VITE_JIEYOU_WISH_SYNC_TOKEN?: string;
}

export interface WishSyncPayloadInput {
  categoryId: WishCategoryId;
  categoryLabel: string;
  message: string;
  userId?: string;
  userEmail?: string;
  submittedAt?: number;
}

export interface WishSyncPayload {
  source: 'jieyou-music-hub';
  category: {
    id: WishCategoryId;
    label: string;
  };
  message: string;
  submittedAt: number;
  user: {
    uid: string | null;
    email: string | null;
  };
}

export type WishSyncSkippedReason =
  | 'endpoint_not_configured'
  | 'endpoint_unreachable'
  | 'request_timeout';

type WishSyncResult =
  | { status: 'ok' }
  | { status: 'skipped'; reason: WishSyncSkippedReason }
  | { status: 'error'; error: string };

interface SyncWishToFeishuOptions {
  env?: Partial<WishSyncEnv>;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 8000;
const LOCAL_FALLBACK_ENDPOINT = 'http://127.0.0.1:8787/wish/submit';
const LOCAL_FALLBACK_TOKEN = 'jieyouyuzhou';

const getDefaultEnv = (): Partial<WishSyncEnv> => {
  const meta = import.meta as ImportMeta & { env?: Partial<WishSyncEnv> };
  return meta.env ?? {};
};

const normalizeOptionalText = (value: string | undefined): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
};

const isAbortError = (error: unknown): boolean => {
  return error instanceof DOMException && error.name === 'AbortError';
};

const isNetworkFetchError = (error: unknown): boolean => {
  if (error instanceof TypeError) return true;
  if (!(error instanceof Error)) return false;
  return /failed to fetch|networkerror|fetch failed|connection refused|err_connection_refused/i.test(error.message);
};

const isLoopbackEndpoint = (endpoint: string): boolean => {
  try {
    const { hostname } = new URL(endpoint);
    return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1';
  } catch {
    return /^https?:\/\/(127\.0\.0\.1|localhost|::1)(:\d+)?(?:\/|$)/i.test(endpoint);
  }
};

const readResponseErrorText = async (response: Response): Promise<string | null> => {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const data = (await response.json()) as { error?: unknown };
      if (typeof data?.error === 'string' && data.error.trim()) {
        return data.error.trim();
      }
    } catch {
      // Fall through and try plain text.
    }
  }

  try {
    const text = (await response.text()).trim();
    return text || null;
  } catch {
    return null;
  }
};

export const getWishSyncEndpoint = (env: Partial<WishSyncEnv> = getDefaultEnv()): string | null => {
  const endpoint = normalizeOptionalText(env.VITE_JIEYOU_WISH_SYNC_ENDPOINT);
  if (endpoint) return endpoint;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return LOCAL_FALLBACK_ENDPOINT;
    }
  }

  return null;
};

export const buildWishSyncPayload = (input: WishSyncPayloadInput): WishSyncPayload => ({
  source: 'jieyou-music-hub',
  category: {
    id: input.categoryId,
    label: input.categoryLabel,
  },
  message: input.message,
  submittedAt: input.submittedAt ?? Date.now(),
  user: {
    uid: normalizeOptionalText(input.userId),
    email: normalizeOptionalText(input.userEmail),
  },
});

export const syncWishToFeishu = async (
  payload: WishSyncPayload,
  options: SyncWishToFeishuOptions = {},
): Promise<WishSyncResult> => {
  const env = options.env ?? getDefaultEnv();
  const endpoint = getWishSyncEndpoint(env);
  if (!endpoint) {
    return { status: 'skipped', reason: 'endpoint_not_configured' };
  }

  const token =
    normalizeOptionalText(env.VITE_JIEYOU_WISH_SYNC_TOKEN) ??
    (endpoint === LOCAL_FALLBACK_ENDPOINT ? LOCAL_FALLBACK_TOKEN : null);
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (token) {
      headers['x-jieyou-sync-token'] = token;
    }

    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseError = await readResponseErrorText(response);
      if (responseError) {
        return { status: 'error', error: `HTTP ${response.status}: ${responseError}` };
      }
      return { status: 'error', error: `HTTP ${response.status}` };
    }

    return { status: 'ok' };
  } catch (error: unknown) {
    if (isAbortError(error)) {
      return { status: 'skipped', reason: 'request_timeout' };
    }

    if (isLoopbackEndpoint(endpoint) && isNetworkFetchError(error)) {
      return { status: 'skipped', reason: 'endpoint_unreachable' };
    }

    const message = error instanceof Error && error.message ? error.message : '同步请求失败';
    return { status: 'error', error: message };
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
};
