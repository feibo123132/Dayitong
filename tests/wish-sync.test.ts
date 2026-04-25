import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildWishSyncPayload,
  getWishSyncEndpoint,
  syncWishToFeishu,
  type WishCategoryId,
} from '../src/lib/wishSync.ts';

const createPayloadInput = (categoryId: WishCategoryId) => ({
  categoryId,
  categoryLabel: '礼品',
  message: '想要一个JIEYOU周边',
  userId: 'u_123',
  userEmail: 'member@example.com',
  submittedAt: 1713240000000,
});

const withBrowser = async <T>(
  browser: { location: { hostname: string }; navigator?: { userAgent?: string } },
  callback: () => T | Promise<T>,
): Promise<T> => {
  const globalWithBrowser = globalThis as typeof globalThis & {
    window?: typeof browser;
  };
  const originalWindow = globalWithBrowser.window;

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: browser,
  });

  try {
    return await callback();
  } finally {
    if (originalWindow === undefined) {
      Reflect.deleteProperty(globalThis, 'window');
    } else {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: originalWindow,
      });
    }
  }
};

test('getWishSyncEndpoint returns null when endpoint is missing', () => {
  assert.equal(getWishSyncEndpoint({}), null);
});

test('getWishSyncEndpoint trims endpoint value', () => {
  assert.equal(getWishSyncEndpoint({ VITE_JIEYOU_WISH_SYNC_ENDPOINT: ' https://example.com/wish ' }), 'https://example.com/wish');
});

test('getWishSyncEndpoint falls back to local gateway for desktop browser env without config', async () => {
  await withBrowser(
    {
      location: { hostname: 'example.github.io' },
      navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36' },
    },
    () => {
      assert.equal(getWishSyncEndpoint({}), 'http://127.0.0.1:8787/wish/submit');
    },
  );
});

test('getWishSyncEndpoint does not send remote mobile browsers to localhost', async () => {
  await withBrowser(
    {
      location: { hostname: 'example.github.io' },
      navigator: {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
      },
    },
    () => {
      assert.equal(getWishSyncEndpoint({}), null);
      assert.equal(
        getWishSyncEndpoint({ VITE_JIEYOU_WISH_SYNC_ENDPOINT: 'http://127.0.0.1:8787/wish/submit' }),
        null,
      );
    },
  );
});

test('getWishSyncEndpoint uses public endpoint for remote mobile browsers', async () => {
  await withBrowser(
    {
      location: { hostname: 'example.github.io' },
      navigator: {
        userAgent:
          'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/125 Mobile Safari/537.36',
      },
    },
    () => {
      assert.equal(
        getWishSyncEndpoint({
          VITE_JIEYOU_WISH_SYNC_ENDPOINT: 'http://127.0.0.1:8787/wish/submit',
          VITE_JIEYOU_WISH_SYNC_PUBLIC_ENDPOINT: 'https://jieyou-sync.example.com/wish/submit',
        }),
        'https://jieyou-sync.example.com/wish/submit',
      );
    },
  );
});

test('buildWishSyncPayload keeps structured fields for Feishu aggregation', () => {
  const payload = buildWishSyncPayload(createPayloadInput('gift'));

  assert.equal(payload.category.id, 'gift');
  assert.equal(payload.category.label, '礼品');
  assert.equal(payload.message, '想要一个JIEYOU周边');
  assert.equal(payload.user.uid, 'u_123');
  assert.equal(payload.user.email, 'member@example.com');
  assert.equal(payload.source, 'jieyou-music-hub');
});

test('syncWishToFeishu skips remote sync when endpoint is not configured', async () => {
  const result = await syncWishToFeishu(buildWishSyncPayload(createPayloadInput('song')), {
    env: {},
    fetchImpl: async () => {
      throw new Error('fetch should not be called without endpoint');
    },
  });

  assert.equal(result.status, 'skipped');
});

test('syncWishToFeishu explains missing public endpoint for remote mobile browsers', async () => {
  await withBrowser(
    {
      location: { hostname: 'example.github.io' },
      navigator: {
        userAgent:
          'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/125 Mobile Safari/537.36',
      },
    },
    async () => {
      const result = await syncWishToFeishu(buildWishSyncPayload(createPayloadInput('song')), {
        env: { VITE_JIEYOU_WISH_SYNC_ENDPOINT: 'http://127.0.0.1:8787/wish/submit' },
        fetchImpl: async () => {
          throw new Error('fetch should not be called for mobile localhost endpoint');
        },
      });

      assert.equal(result.status, 'skipped');
      assert.equal(result.reason, 'mobile_public_endpoint_not_configured');
    },
  );
});

test('syncWishToFeishu posts json payload to configured endpoint', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const result = await syncWishToFeishu(buildWishSyncPayload(createPayloadInput('snack')), {
    env: {
      VITE_JIEYOU_WISH_SYNC_ENDPOINT: 'https://example.com/wish-sync',
      VITE_JIEYOU_WISH_SYNC_TOKEN: 'abc123',
    },
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    },
  });

  assert.equal(result.status, 'ok');
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url, 'https://example.com/wish-sync');
  assert.equal((calls[0]?.init?.headers as Record<string, string>)['x-jieyou-sync-token'], 'abc123');
});

test('syncWishToFeishu surfaces non-2xx response as error', async () => {
  const result = await syncWishToFeishu(buildWishSyncPayload(createPayloadInput('play')), {
    env: { VITE_JIEYOU_WISH_SYNC_ENDPOINT: 'https://example.com/wish-sync' },
    fetchImpl: async () => new Response('bad gateway', { status: 502 }),
  });

  assert.equal(result.status, 'error');
  assert.match(result.error ?? '', /HTTP 502/);
});

test('syncWishToFeishu includes backend error details for JSON responses', async () => {
  const result = await syncWishToFeishu(buildWishSyncPayload(createPayloadInput('song')), {
    env: { VITE_JIEYOU_WISH_SYNC_ENDPOINT: 'https://example.com/wish-sync' },
    fetchImpl: async () =>
      new Response(JSON.stringify({ ok: false, error: 'missing_env:FEISHU_BASE_TOKEN' }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      }),
  });

  assert.equal(result.status, 'error');
  assert.match(result.error ?? '', /missing_env:FEISHU_BASE_TOKEN/);
});

test('syncWishToFeishu treats localhost connection failures as skipped', async () => {
  const result = await syncWishToFeishu(buildWishSyncPayload(createPayloadInput('gift')), {
    env: { VITE_JIEYOU_WISH_SYNC_ENDPOINT: 'http://127.0.0.1:8787/wish/submit' },
    fetchImpl: async () => {
      throw new TypeError('Failed to fetch');
    },
  });

  assert.equal(result.status, 'skipped');
  assert.equal(result.reason, 'endpoint_unreachable');
});
