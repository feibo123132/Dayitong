import { spawn } from 'node:child_process';
import {
  createCloudflaredSpawnSpec,
  createMissingCloudflaredMessage,
  extractPublicEndpoint,
} from './wish-sync-public-tunnel-helpers.mjs';

const PORT = process.env.PORT ?? '8787';
const LOCAL_GATEWAY = `http://127.0.0.1:${PORT}`;

let isShuttingDown = false;
let tunnel = null;
const { server } = await import('./feishu-wish-sync-server.mjs');

const writePrefixed = (stream, name, chunk) => {
  const text = chunk.toString('utf8');
  stream.write(`[${name}] ${text}`);
  return text;
};

const printPublicEndpointIfPresent = (text) => {
  const endpointLine = extractPublicEndpoint(text);
  if (!endpointLine) return;

  console.log('');
  console.log('Use this GitHub Actions variable:');
  console.log(endpointLine);
  console.log('');
};

const stopAll = () => {
  isShuttingDown = true;
  if (tunnel) {
    tunnel.kill();
    tunnel = null;
  }
  server.close();
};

const failAndStop = (code = 1) => {
  stopAll();
  process.exitCode = code;
};

const startTunnel = (spec) => {
  try {
    tunnel = spawn(spec.command, spec.args, spec.options);
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : String(error);
    console.error(`[tunnel] failed to start: ${message}`);
    console.error(createMissingCloudflaredMessage());
    failAndStop(1);
    return;
  }

  tunnel.stdout.on('data', (chunk) => {
    const text = writePrefixed(process.stdout, 'tunnel', chunk);
    printPublicEndpointIfPresent(text);
  });

  tunnel.stderr.on('data', (chunk) => {
    const text = writePrefixed(process.stderr, 'tunnel', chunk);
    printPublicEndpointIfPresent(text);
  });

  tunnel.on('exit', (code, signal) => {
    tunnel = null;
    if (isShuttingDown) return;

    if (code && code !== 0) {
      console.error(`[tunnel] exited with code ${code}`);
      failAndStop(code);
      return;
    }

    if (signal) {
      console.error(`[tunnel] exited by signal ${signal}`);
      failAndStop(1);
    }
  });

  tunnel.on('error', (error) => {
    if (isShuttingDown) return;

    console.error(`[tunnel] failed to start: ${error.message}`);
    if (error.code === 'ENOENT') {
      console.error(createMissingCloudflaredMessage());
    }
    failAndStop(1);
  });
};

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});

console.log(`[wish-sync] local gateway is running at ${LOCAL_GATEWAY}`);
console.log('[tunnel] starting Cloudflare Tunnel...');
startTunnel(createCloudflaredSpawnSpec({ localGateway: LOCAL_GATEWAY }));

