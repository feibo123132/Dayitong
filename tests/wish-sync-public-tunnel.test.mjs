import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createCloudflaredSpawnSpec,
  createMissingCloudflaredMessage,
  extractPublicEndpoint,
} from '../tools/wish-sync-public-tunnel-helpers.mjs';

test('cloudflared spawn spec starts a tunnel to the local gateway without shell parsing', () => {
  const spec = createCloudflaredSpawnSpec({
    localGateway: 'http://127.0.0.1:8787',
  });

  assert.equal(spec.command, 'cloudflared');
  assert.deepEqual(spec.args, ['tunnel', '--url', 'http://127.0.0.1:8787']);
  assert.equal(spec.options.shell, false);
});

test('extractPublicEndpoint formats the GitHub variable value from tunnel output', () => {
  assert.equal(
    extractPublicEndpoint('Your quick Tunnel has been created! https://kind-river-123.trycloudflare.com'),
    'VITE_JIEYOU_WISH_SYNC_PUBLIC_ENDPOINT=https://kind-river-123.trycloudflare.com/wish/submit',
  );
});

test('missing cloudflared message gives a concrete Windows install command', () => {
  const message = createMissingCloudflaredMessage('win32');

  assert.match(message, /winget install --id Cloudflare\.cloudflared/);
  assert.match(message, /pnpm wish-sync:public/);
});
