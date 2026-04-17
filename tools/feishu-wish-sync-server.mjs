import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PORT = Number.parseInt(process.env.PORT ?? '8787', 10);
const DEFAULT_CLI_BIN = 'lark-cli';
const CLI_BIN = process.env.LARK_CLI_BIN ?? DEFAULT_CLI_BIN;
const IS_WINDOWS = process.platform === 'win32';
const SYNC_TOKEN = process.env.JIEYOU_SYNC_TOKEN?.trim() ?? '';
const BASE_TOKEN = process.env.FEISHU_BASE_TOKEN?.trim() ?? '';
const BASE_TABLE_ID = process.env.FEISHU_BASE_TABLE_ID?.trim() ?? '';
const NOTIFY_CHAT_ID = process.env.FEISHU_NOTIFY_CHAT_ID?.trim() ?? '';

const CATEGORY_OPTION_MAP = {
  礼品: '🎁礼品',
  零食: '🍿零食',
  玩法: '💡Idea',
  点歌: '🎶点歌',
};

const fail = (res, statusCode, message) => {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ ok: false, error: message }));
};

const setCorsHeaders = (req, res) => {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, x-jieyou-sync-token');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
};

const runCli = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(CLI_BIN, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      shell: IS_WINDOWS,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(stderr || stdout || `lark-cli exited with code ${code}`));
    });
  });

const parseJsonBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk));
    });
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8') || '{}';
        resolve(JSON.parse(text));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });

const hasValidToken = (req) => {
  if (!SYNC_TOKEN) return true;
  const incoming = req.headers['x-jieyou-sync-token'];
  return typeof incoming === 'string' && incoming === SYNC_TOKEN;
};

const normalizeWishPayload = (raw) => {
  const payload = typeof raw === 'object' && raw !== null ? raw : {};
  const category = typeof payload.category === 'object' && payload.category !== null ? payload.category : {};
  const user = typeof payload.user === 'object' && payload.user !== null ? payload.user : {};

  const categoryLabel =
    typeof payload.category === 'string'
      ? payload.category.trim()
      : typeof category.label === 'string'
        ? category.label.trim()
        : '';
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  const submittedAt = Number.isFinite(payload.submittedAt) ? Number(payload.submittedAt) : Date.now();
  const userUid = typeof user.uid === 'string' ? user.uid : '';
  const userEmail = typeof user.email === 'string' ? user.email : '';

  return {
    categoryLabel,
    message,
    submittedAt,
    userUid,
    userEmail,
  };
};

const resolveCategoryOption = (categoryLabel) => {
  if (!categoryLabel) return null;
  if (Object.values(CATEGORY_OPTION_MAP).includes(categoryLabel)) {
    return categoryLabel;
  }
  return CATEGORY_OPTION_MAP[categoryLabel] ?? null;
};

const createRelativeJsonPayload = (fields) => {
  const payloadDir = '.codex-temp';
  mkdirSync(payloadDir, { recursive: true });
  const fileName = `wish-fields-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
  const relativePath = join(payloadDir, fileName).replace(/\\/g, '/');
  writeFileSync(relativePath, JSON.stringify(fields), 'utf8');
  return relativePath;
};

const upsertWishRecord = async ({ categoryLabel, message, submittedAt, userUid, userEmail }) => {
  if (!BASE_TOKEN || !BASE_TABLE_ID) {
    throw new Error('FEISHU_BASE_TOKEN / FEISHU_BASE_TABLE_ID not configured');
  }

  const categoryOption = resolveCategoryOption(categoryLabel);
  const remarkParts = [];
  if (userUid) remarkParts.push(`uid=${userUid}`);
  if (userEmail) remarkParts.push(`email=${userEmail}`);

  const fields = {
    许愿人: userEmail || userUid || '匿名用户',
    许愿时间: submittedAt,
    愿望内容: message,
    备注: remarkParts.join('; ') || '来自愿望池提交',
  };

  if (categoryOption) {
    fields['愿望类别'] = categoryOption;
  }

  const payloadRelativePath = createRelativeJsonPayload(fields);

  try {
    await runCli([
      'base',
      '+record-upsert',
      '--base-token',
      BASE_TOKEN,
      '--table-id',
      BASE_TABLE_ID,
      '--json',
      `@${payloadRelativePath}`,
    ]);
  } finally {
    rmSync(payloadRelativePath, { force: true });
  }
};

const maybeNotify = async ({ categoryLabel, message, userEmail }) => {
  if (!NOTIFY_CHAT_ID) return;

  const text = `愿望池新提交\n分类：${categoryLabel || '未分类'}\n内容：${message}\n用户：${userEmail || '匿名用户'}`;
  await runCli([
    'im',
    '+messages-send',
    '--chat-id',
    NOTIFY_CHAT_ID,
    '--text',
    text,
    '--as',
    'bot',
  ]);
};

const server = createServer(async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS' && req.url === '/wish/submit') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method !== 'POST' || req.url !== '/wish/submit') {
    fail(res, 404, 'Not found');
    return;
  }

  if (!hasValidToken(req)) {
    fail(res, 401, 'Invalid sync token');
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const wish = normalizeWishPayload(body);
    if (!wish.message) {
      fail(res, 400, 'message is required');
      return;
    }

    await upsertWishRecord(wish);
    await maybeNotify(wish);

    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true }));
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : 'Sync failed';
    fail(res, 500, message);
  }
});

server.listen(PORT, () => {
  console.log(`[wish-sync] listening on http://127.0.0.1:${PORT}`);
});
