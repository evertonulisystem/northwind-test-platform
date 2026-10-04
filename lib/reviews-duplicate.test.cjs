const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { normalizeApiBody } = require('./api-envelope');

function load(file, dependencies, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, Response, TextEncoder, console: { log() {}, error() {} },
    require(name) { assert.ok(Object.hasOwn(dependencies, name), name); return dependencies[name]; }, ...globals });
  return exports;
}

async function setup() {
  const jose = await import('jose');
  const jwt = load('jwt.js', { jose }, { process: { env: { JWT_SECRET: 'reviews-duplicate-isolated-test' } } });
  const rows = [], writes = [];
  let lookupError = false;
  const supabase = { from(table) {
    const filters = {};
    let values;
    const matches = () => rows.filter(row => Object.entries(filters).every(([key, value]) => row[key] === value));
    return {
      select() { return this; }, eq(key, value) { filters[key] = value; return this; }, limit() { return this; },
      insert(data) { values = data; writes.push(['insert', table]); return this; },
      update(data) { writes.push(['update', table]); return this; },
      async maybeSingle() {
        if (table === 'products') return { data: [1, 2].includes(filters.id) ? { id: filters.id } : null, error: null };
        return { data: matches()[0] || null, error: lookupError ? new Error('lookup failed') : null };
      },
      async single() { const row = { id: rows.length + 1, ...values }; rows.push(row); return { data: row, error: null }; },
      then(resolve, reject) { return Promise.resolve({ data: table === 'reviews' ? matches() : null, error: null }).then(resolve, reject); }
    };
  } };
  const { POST } = load('../app/api/v1/reviews/route.js', {
    '@/lib/api-envelope': { normalizeApiBody }, '@/lib/supabase': { supabase }, '@/lib/jwt': jwt,
    '@/lib/auth': { requireAuth: handler => handler }, 'next/server': { NextResponse: Response }
  });
  async function post(user, body) {
    const token = user ? await jwt.generateToken({ id: user, email: `${user}@example.test`, role: 'customer' }) : null;
    const request = { headers: new Headers(token ? { authorization: `Bearer ${token}` } : {}), cookies: { get() {} }, json: async () => body };
    const response = await POST(request);
    return { status: response.status, body: await response.json() };
  }
  return { post, rows, writes, failLookup() { lookupError = true; } };
}

test('POST reviews: first review, duplicate without writes, other user/product, body owner ignored and missing token', async () => {
  const ctx = await setup();
  const body = { product_id: 1, rating: 5, title: 'Teste', comment: 'Produto de teste' };
  const first = await ctx.post('A', { ...body, user_id: 'B' });
  assert.equal(first.status, 201);
  assert.equal(first.body.data.user_id, 'A');
  assert.equal(ctx.rows.length, 1);
  const writesBefore = ctx.writes.length;
  const duplicate = await ctx.post('A', { ...body, user_id: 'B' });
  assert.equal(duplicate.status, 409);
  assert.deepEqual(duplicate.body, { data: null, mensagens: ['Voc\u00ea j\u00e1 avaliou este produto.'] });
  assert.equal(ctx.rows.length, 1);
  assert.equal(ctx.writes.length, writesBefore, 'No review insert or product counter update on conflict');
  const otherUser = await ctx.post('B', { ...body, user_id: 'A' });
  assert.equal(otherUser.status, 201);
  assert.equal(otherUser.body.data.user_id, 'B');
  assert.equal((await ctx.post('A', { ...body, product_id: 2 })).status, 201);
  assert.equal(ctx.rows.length, 3);
  const beforeUnauthenticated = ctx.writes.length;
  assert.equal((await ctx.post(null, body)).status, 401);
  assert.equal(ctx.writes.length, beforeUnauthenticated);
  assert.equal(ctx.rows.length, 3);
});

test('POST reviews preserves rating/product validation and fails closed when duplicate lookup fails', async () => {
  const ctx = await setup();
  assert.equal((await ctx.post('A', { product_id: 1, rating: 6 })).status, 400);
  assert.equal((await ctx.post('A', { product_id: 999, rating: 5 })).status, 404);
  ctx.failLookup();
  assert.equal((await ctx.post('A', { product_id: 1, rating: 5 })).status, 500);
  assert.equal(ctx.rows.length, 0);
  assert.equal(ctx.writes.length, 0);
});

test('POST reviews Swagger documents the exact 409 response', () => {
  const response = require('./swagger').paths['/api/v1/reviews'].post.responses[409];
  assert.deepEqual(response.content['application/json'].example,
    { data: null, mensagens: ['Voc\u00ea j\u00e1 avaliou este produto.'] });
});
