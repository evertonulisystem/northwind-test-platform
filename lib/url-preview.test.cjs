const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { normalizeApiBody } = require('./api-envelope');
const URL_ALLOWED = 'https://northwind-test-platform.vercel.app/api/v1/health';

function load(file, dependencies, globals = {}) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, require(name) { assert.ok(Object.hasOwn(dependencies, name), name); return dependencies[name]; },
    Response, TextEncoder, AbortController, setTimeout, clearTimeout, ...globals
  });
  return exports;
}

async function setup(fetchMock = async () => Response.json({ data: { status: 'ok' } }), active = true, timers = {}) {
  const jose = await import('jose');
  const logs = [];
  const console = Object.fromEntries(['log', 'error', 'warn'].map(key => [key, (...args) => logs.push(args)]));
  const jwt = load('jwt.js', { jose }, { console, process: { env: { JWT_SECRET: 'url-preview-test-secret' } } });
  const query = { select() { return this; }, eq() { return this; }, async single() {
    return { data: { id: 'test-user', is_active: active }, error: null };
  } };
  const auth = load('auth.js', {
    '@/lib/api-envelope': { normalizeApiBody }, './jwt': jwt,
    './supabase': { supabase: { from() { return query; } } },
    'next/headers': { cookies() { throw new Error('Unexpected cookies helper'); } }
  });
  const calls = [];
  const { POST } = load('../app/api/v1/integrations/url-preview/route.js', {
    '@/lib/auth': auth, '@/lib/api-envelope': { normalizeApiBody }
  }, { fetch: (...args) => { calls.push(args); return fetchMock(...args); }, ...timers });
  const token = await jwt.generateToken({ id: 'test-user' });
  async function call(url = URL_ALLOWED, credential = token, malformed = false) {
    const response = await POST({ headers: new Headers(credential ? { authorization: `Bearer ${credential}` } : {}),
      async json() { if (malformed) throw new SyntaxError(); return { url }; } });
    return { status: response.status, body: await response.json() };
  }
  return { call, calls, logs, token };
}

test('authorized URL returns 200, normalizes status and strips all other external fields', async () => {
  const ctx = await setup(async () => Response.json({ data: { status: ' OK ', credentials: 'secret', metrics: { uptime: 1 } }, headers: { cookie: 'secret' } }));
  const result = await ctx.call();
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { data: { status: 'ok' }, mensagens: ['Integração consultada com segurança.'] });
  assert.equal(ctx.calls.length, 1);
  assert.equal(ctx.calls[0][1].redirect, 'manual');
  assert.equal(ctx.calls[0][1].signal.aborted, false);
  assert.equal(Object.hasOwn(ctx.calls[0][1], 'headers'), false);
  assert.equal(JSON.stringify(ctx.logs).includes(ctx.token), false);
});

for (const url of [
  'http://169.254.169.254/latest/meta-data/', 'http://localhost', 'http://127.0.0.1', 'file:///etc/passwd',
  'https://northwind-test-platform.vercel.app/api/v1/debug/token', 'https://example.com',
  URL_ALLOWED.replace('https:', 'http:'), URL_ALLOWED.replace('.app/', '.app:443/'),
  `${URL_ALLOWED}/`, `${URL_ALLOWED}?`, `${URL_ALLOWED}#`, ` ${URL_ALLOWED}`,
  URL_ALLOWED.replace('https://', 'https://user:password@'), URL_ALLOWED.replace('northwind', 'NORTHWIND'),
  null, 123
]) {
  test(`blocked URL never invokes fetch: ${url}`, async () => {
    const ctx = await setup();
    assert.deepEqual(await ctx.call(url), { status: 400, body: { data: null, mensagens: ['URL de integração não permitida.'] } });
    assert.equal(ctx.calls.length, 0);
  });
}

const failure = { status: 502, body: { data: null, mensagens: ['Não foi possível consultar o serviço externo.'] } };
for (const [name, fetchMock] of [
  ['redirect', async () => new Response(null, { status: 302, headers: { location: 'http://localhost' } })],
  ['unsuccessful HTTP', async () => Response.json({ data: { status: 'ok' } }, { status: 503 })],
  ['non-JSON content', async () => new Response('text', { headers: { 'content-type': 'text/plain' } })],
  ['invalid JSON', async () => new Response('{', { headers: { 'content-type': 'application/json' } })],
  ['missing data.status', async () => Response.json({ data: {} })],
  ['unexpected status type', async () => Response.json({ data: { status: {} } })],
  ['unexpected health status', async () => Response.json({ data: { status: 'secret' } })],
  ['network error', async () => { throw new Error('internal details'); }]
]) {
  test(`${name} returns sanitized 502`, async () => {
    assert.deepEqual(await (await setup(fetchMock)).call(), failure);
  });
}

for (const phase of ['fetch', 'json']) {
  test(`timeout during ${phase} aborts after at most 3000ms and returns 502`, async () => {
    const ctx = await setup(async () => phase === 'fetch' ? new Promise(() => {}) : {
      ok: true, headers: new Headers({ 'content-type': 'application/json' }), json: () => new Promise(() => {})
    }, true, { setTimeout(fn, ms) { assert.equal(ms, 3000); return setTimeout(fn, 0); } });
    assert.deepEqual(await ctx.call(), failure);
    assert.equal(ctx.calls[0][1].signal.aborted, true);
  });
}

test('missing or invalid JWT and inactive users return 401 without fetch', async () => {
  const ctx = await setup();
  for (const credential of [null, 'invalid-token']) assert.equal((await ctx.call(URL_ALLOWED, credential)).status, 401);
  assert.equal(ctx.calls.length, 0);
  const inactive = await setup(undefined, false);
  assert.equal((await inactive.call()).status, 401);
  assert.equal(inactive.calls.length, 0);
});

test('invalid request JSON returns 400 without fetch', async () => {
  const ctx = await setup();
  assert.equal((await ctx.call(URL_ALLOWED, ctx.token, true)).status, 400);
  assert.equal(ctx.calls.length, 0);
});

test('Swagger documents body, literal URL, authentication, tag and every response', () => {
  const spec = require('./swagger');
  const operation = spec.paths['/api/v1/integrations/url-preview'].post;
  assert.deepEqual(operation.tags, ['Integrações']);
  assert.deepEqual(operation.security, [{ bearerAuth: [] }]);
  assert.deepEqual(operation.requestBody.content['application/json'].schema.properties.url.enum, [URL_ALLOWED]);
  assert.deepEqual(Object.keys(operation.responses), ['200', '400', '401', '502']);
});
