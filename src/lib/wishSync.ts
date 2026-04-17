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

type WishSyncResult =
  | { status: 'ok' }
  | { status: 'skipped'; reason: string }
  | { status: 'error'; error: string };

interface SyncWishToFeishuOptions {
  env?: Partial<WishSyncEnv>;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 8000;

const getDefaultEnv = (): Partial<WishSyncEnv> => {
  const meta = import.meta as ImportMeta & { env?: Partial<WishSyncEnv> };
  return meta.env ?? {};
};

const normalizeOptionalText = (value: string | undefined): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
};

export const getWishSyncEndpoint = (env: Partial<WishSyncEnv> = getDefaultEnv()): string | null => {
  return normalizeOptionalText(env.VITE_JIEYOU_WISH_SYNC_ENDPOINT);
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

  const token = normalizeOptionalText(env.VITE_JIEYOU_WISH_SYNC_TOKEN);
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
      return { status: 'error', error: `HTTP ${response.status}` };
    }

    return { status: 'ok' };
  } catch (error: unknown) {
    const message = error instanceof Error && error.message ? error.message : '同步请求失败';
    return { status: 'error', error: message };
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
};
