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

test('getWishSyncEndpoint returns null when endpoint is missing', () => {
  assert.equal(getWishSyncEndpoint({}), null);
});

test('getWishSyncEndpoint trims endpoint value', () => {
  assert.equal(getWishSyncEndpoint({ VITE_JIEYOU_WISH_SYNC_ENDPOINT: ' https://example.com/wish ' }), 'https://example.com/wish');
});

test('getWishSyncEndpoint falls back to local gateway when browser env is missing', () => {
  const globalWithWindow = globalThis as typeof globalThis & {
    window?: { location: { hostname: string } };
  };
  const originalWindow = globalWithWindow.window;

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { hostname: 'example.github.io' } },
  });

  try {
    assert.equal(getWishSyncEndpoint({}), 'http://127.0.0.1:8787/wish/submit');
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
