const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { normalizeApiBody } = require('./api-envelope');

function load(file, dependencies, globals = {}) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, Response, TextEncoder, URL,
    console: { log() {}, error() {}, warn() {} },
    require(name) { assert.ok(Object.hasOwn(dependencies, name), name); return dependencies[name]; },
    ...globals
  });
  return exports;
}

async function setup() {
  const jose = await import('jose');
  const secret = 'aula87-test-only';
  const users = {
    admin: { id: 'admin', role: 'admin', is_active: true },
    A: { id: 'A', role: 'customer', is_active: true },
    B: { id: 'B', role: 'customer', is_active: true }
  };
  const calls = [];
  const supabase = { from(table) {
    calls.push(['from', table]);
    const filters = {};
    let operation = 'read', values;
    return {
      select() { return this; },
      eq(key, value) { filters[key] = value; calls.push(['eq', table, key, value]); return this; },
      update(value) { operation = 'update'; values = value; calls.push(['update', table, value]); return this; },
      insert(value) { operation = 'insert'; values = value; calls.push(['insert', table, value]); return this; },
      async maybeSingle() { return { data: null, error: null }; },
      async single() {
        if (table === 'users') return { data: operation === 'insert' ? { id: 'new-user', ...values } : users[filters.id] ?? null, error: null };
        if (table === 'cart_items') return { data: { id: 10, user_id: 'A', products: { stock_quantity: 20 }, ...values }, error: null };
        return { data: { id: 99, ...values }, error: null };
      }
    };
  } };
  const jwt = load('jwt.js', { jose }, { process: { env: { JWT_SECRET: secret } } });
  const auth = load('auth.js', {
    '@/lib/api-envelope': { normalizeApiBody }, './supabase': { supabase }, './jwt': jwt,
    'next/headers': { cookies() { throw new Error('Unexpected cookie helper'); } }
  });
  const deps = {
    '@/lib/api-envelope': { normalizeApiBody }, '@/lib/supabase': { supabase },
    '@/lib/jwt': jwt, '@/lib/auth': auth, 'next/server': { NextResponse: Response },
    bcryptjs: { default: { async hash() { return 'test-hash'; } } }
  };
  async function request(identity, body, payload) {
    const token = identity === null ? null : await new jose.SignJWT(payload ?? users[identity])
      .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(new TextEncoder().encode(secret));
    return { headers: new Headers(token ? { authorization: `Bearer ${token}` } : {}),
      cookies: { get() {} }, async json() { return body; } };
  }
  async function response(value) { return { status: value.status, body: await value.json() }; }
  return { calls, request, response, loadRoute: file => load(file, deps, { process: { env: {} } }) };
}

test('API1: owner allowed, other consumer denied, admin allowed, missing or invalid identity rejected', async () => {
  const ctx = await setup();
  const { PATCH } = ctx.loadRoute('../app/api/v1/cart/[id]/route.js');
  for (const [identity, status] of [['A', 200], ['B', 403], ['admin', 200], [null, 401]]) {
    ctx.calls.length = 0;
    const result = await ctx.response(await PATCH(await ctx.request(identity, { quantity: 2, userId: 'A' }), { params: Promise.resolve({ id: 10 }) }));
    assert.equal(result.status, status);
    if (status !== 200) {
      assert.equal(result.body.data, null);
      assert.ok(!ctx.calls.some(call => call[0] === 'update'));
    }
  }
  for (const payload of [{}, { id: '' }, { id: {} }, { id: 0 }]) {
    ctx.calls.length = 0;
    assert.equal((await PATCH(await ctx.request('A', { quantity: 2 }, payload), { params: { id: 10 } })).status, 401);
    assert.deepEqual(ctx.calls, []);
  }
  ctx.calls.length = 0;
  const invalidRequest = await ctx.request(null, { quantity: 2 });
  invalidRequest.headers.set('authorization', 'Bearer invalid-token');
  assert.equal((await PATCH(invalidRequest, { params: { id: 10 } })).status, 401);
  assert.deepEqual(ctx.calls, []);
});

test('API3: normal registration allowed, privileged properties rejected without database access or secret exposure', async () => {
  const ctx = await setup();
  const { POST } = ctx.loadRoute('../app/api/v1/auth/register/route.js');
  const body = { full_name: 'Maria Silva', email: 'aula87@example.test', password: 'Seguro@9876', confirmPassword: 'Seguro@9876' };
  const result = await ctx.response(await POST(await ctx.request(null, body)));
  assert.equal(result.status, 201);
  assert.equal(result.body.data.user.role, 'customer');
  const inserted = ctx.calls.find(call => call[0] === 'insert')[2];
  assert.equal(inserted.role, 'customer');
  assert.equal(inserted.is_active, true);
  assert.deepEqual(Object.keys(result.body.data.user).sort(), ['email', 'full_name', 'id', 'role']);
  assert.ok(!JSON.stringify(result.body).includes('test-hash'));
  assert.ok(!JSON.stringify(result.body).includes(body.password));
  // The public registration contract intentionally returns the new user's session token.
  assert.equal(typeof result.body.data.token, 'string');
  for (const identity of ['admin', 'A', 'B', null]) {
    for (const privileged of [{ role: 'admin' }, { is_active: false }]) {
      ctx.calls.length = 0;
      const denied = await ctx.response(await POST(await ctx.request(identity, { ...body, ...privileged })));
      assert.equal(denied.status, 400);
      assert.equal(denied.body.data, null);
      assert.deepEqual(ctx.calls, []);
    }
  }
});

test('API5: admin can create products, both consumers denied and unauthenticated user rejected', async () => {
  const ctx = await setup();
  const { POST } = ctx.loadRoute('../app/api/v1/products/route.js');
  const body = { name: 'Produto Aula', price: 10, stock_quantity: 2, sku: 'AULA87', category_id: 1, supplier_id: 1 };
  for (const [identity, status] of [['admin', 201], ['A', 403], ['B', 403], [null, 401]]) {
    ctx.calls.length = 0;
    // A stale/forged role claim must not override the database role.
    const payload = identity ? { id: identity, role: identity === 'admin' ? 'customer' : 'admin' } : undefined;
    const result = await ctx.response(await POST(await ctx.request(identity, body, payload)));
    assert.equal(result.status, status);
    if (status !== 201) {
      assert.equal(result.body.data, null);
      assert.ok(!ctx.calls.some(call => call[1] === 'products'));
    }
  }
});
