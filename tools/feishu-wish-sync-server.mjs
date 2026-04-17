import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const PORT = Number.parseInt(process.env.PORT ?? '8787', 10);
const CLI_BIN = process.env.LARK_CLI_BIN ?? 'lark-cli';
const SYNC_TOKEN = process.env.JIEYOU_SYNC_TOKEN?.trim() ?? '';
const BASE_TOKEN = process.env.FEISHU_BASE_TOKEN?.trim() ?? '';
const BASE_TABLE_ID = process.env.FEISHU_BASE_TABLE_ID?.trim() ?? '';
const NOTIFY_CHAT_ID = process.env.FEISHU_NOTIFY_CHAT_ID?.trim() ?? '';

const fail = (res, statusCode, message) => {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ ok: false, error: message }));
};

const runCli = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(CLI_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });
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

  const categoryLabel = typeof category.label === 'string' ? category.label : '未知分类';
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

const formatDateTime = (timestamp) => new Date(timestamp).toISOString();

const upsertWishRecord = async ({ categoryLabel, message, submittedAt, userUid, userEmail }) => {
  if (!BASE_TOKEN || !BASE_TABLE_ID) {
    throw new Error('FEISHU_BASE_TOKEN / FEISHU_BASE_TABLE_ID not configured');
  }

  const fields = {
    分类: categoryLabel,
    愿望内容: message,
    提交时间: formatDateTime(submittedAt),
    提交用户UID: userUid,
    提交用户邮箱: userEmail,
  };

  await runCli([
    'base',
    '+record-upsert',
    '--base-token',
    BASE_TOKEN,
    '--table-id',
    BASE_TABLE_ID,
    '--fields',
    JSON.stringify(fields),
  ]);
};

const maybeNotify = async ({ categoryLabel, message, userEmail }) => {
  if (!NOTIFY_CHAT_ID) return;

  const text = `愿望池新提交\n分类：${categoryLabel}\n内容：${message}\n用户：${userEmail || '匿名用户'}`;
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
