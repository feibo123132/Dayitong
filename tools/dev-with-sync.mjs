import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const children = [];
let shuttingDown = false;

const launch = (name, args) => {
  const child = spawn('pnpm', args, {
    stdio: 'inherit',
    shell: isWindows,
    windowsHide: true,
  });

  child.on('error', (error) => {
    console.error(`[dev-with-sync] ${name} failed to start:`, error);
    shutdown(1);
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;

    if (code === 0 && !signal) {
      console.log(`[dev-with-sync] ${name} exited cleanly, stopping all processes.`);
      shutdown(0);
      return;
    }

    console.error(`[dev-with-sync] ${name} exited unexpectedly (code=${code ?? 'null'}, signal=${signal ?? 'null'}).`);
    shutdown(code ?? 1);
  });

  children.push(child);
};

const shutdown = (exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  setTimeout(() => process.exit(exitCode), 200);
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('[dev-with-sync] starting: pnpm dev + pnpm wish-sync:server');
launch('dev', ['dev']);
launch('wish-sync:server', ['wish-sync:server']);
