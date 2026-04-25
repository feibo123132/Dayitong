export const createCloudflaredSpawnSpec = ({
  localGateway,
  cloudflaredBin = process.env.CLOUDFLARED_BIN ?? 'cloudflared',
  cwd = process.cwd(),
  env = process.env,
} = {}) => ({
  command: cloudflaredBin,
  args: ['tunnel', '--url', localGateway],
  options: {
    cwd,
    env,
    shell: false,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  },
});

export const extractTryCloudflareUrl = (text) => {
  const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
  return match?.[0] ?? null;
};

export const extractPublicEndpoint = (text) => {
  const url = extractTryCloudflareUrl(text);
  if (!url) return null;
  return `VITE_JIEYOU_WISH_SYNC_PUBLIC_ENDPOINT=${url}/wish/submit`;
};

export const createMissingCloudflaredMessage = (platform = process.platform) => {
  if (platform === 'win32') {
    return [
      '[tunnel] 没有检测到 cloudflared。',
      '[tunnel] 请先在 PowerShell 里运行：winget install --id Cloudflare.cloudflared',
      '[tunnel] 安装完成后重新打开终端，再运行：pnpm wish-sync:public',
    ].join('\n');
  }

  return [
    '[tunnel] cloudflared was not found.',
    '[tunnel] Install Cloudflare Tunnel first, then rerun: pnpm wish-sync:public',
  ].join('\n');
};
