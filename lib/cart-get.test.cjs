const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { normalizeApiBody } = require('./api-envelope');

const secret = 'cart-get-test-secret';
const user = { id: 'user-123', is_active: true };
const items = [{ id: 1, product_id: 2, quantity: 3 }];

function load(file, dependencies, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, Response, TextEncoder, URL,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    }, ...globals
  });
  return exports;
}

async function setup({ profile = user, cart = items } = {}) {
  const jose = await import('jose');
  const console = { log() {}, error() {}, warn() {} };
  const jwt = load('jwt.js', { jose }, { console, process: { env: { JWT_SECRET: secret } } });
  const calls = [];
  const supabase = {
    from(table) {
      calls.push(['from', table]);
      const result = { data: table === 'users' ? profile : cart, error: null };
      return {
        select() { return this; },
        eq(field, value) { calls.push(['eq', table, field, value]); return this; },
        async single() { return result; },
        then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); }
      };
    }
  };
  const { GET } = load('../app/api/v1/cart/route.js', {
    '@/lib/api-envelope': { normalizeApiBody },
    '@/lib/supabase': { supabase },
    '@/lib/jwt': jwt,
    '@/lib/auth': { requireAuth: handler => handler },
    'next/server': { NextResponse: Response }
  }, { console });
  async function token(payload = { id: profile?.id ?? user.id }, options = {}) {
    return new jose.SignJWT(payload).setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(options.exp ?? '1h')
      .sign(new TextEncoder().encode(options.secret ?? secret));
  }
  async function call(value, query = '', cookie = false) {
    const response = await GET({
      url: `http://localhost/api/v1/cart${query}`,
      headers: new Headers(value && !cookie ? { authorization: `Bearer ${value}` } : {}),
      cookies: { get: name => cookie && name === 'auth-token' ? { value } : undefined }
    });
    return { status: response.status, body: await response.json() };
  }
  return { calls, token, call };
}

test('GET cart preserves normal and same-user queries and authenticated ownership', async () => {
  for (const query of ['', '?userId=user-123']) {
    const ctx = await setup();
    const response = await ctx.call(await ctx.token({ id: user.id, sub: 'another-user' }), query);
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { data: items, mensagens: ['Carrinho carregado com sucesso.'] });
    assert.deepEqual(ctx.calls.filter(call => call[0] === 'eq'), [
      ['eq', 'users', 'id', user.id], ['eq', 'cart_items', 'user_id', user.id]
    ]);
  }
});

test('GET cart compares numeric authenticated ids with query strings', async () => {
  const ctx = await setup({ profile: { ...user, id: 123 } });
  assert.equal((await ctx.call(await ctx.token(), '?userId=123')).status, 200);
  assert.ok(ctx.calls.some(call => call[1] === 'cart_items' && call[2] === 'user_id' && call[3] === 123));
});

test('GET cart denies another user and empty userId without querying the cart', async () => {
  for (const query of ['?userId=another-user', '?userId=']) {
    const ctx = await setup();
    const response = await ctx.call(await ctx.token(), query);
    assert.equal(response.status, 403);
    assert.deepEqual(response.body, { data: null, mensagens: ['Acesso negado.'] });
    assert.deepEqual(ctx.calls.filter(call => call[0] === 'from'), [['from', 'users']]);
  }
});

test('GET cart rejects absent, invalid, wrong-signature and expired tokens before any database query', async () => {
  const ctx = await setup();
  for (const value of [null, 'invalid-token', await ctx.token({ id: user.id }, { secret: 'wrong-secret' }),
    await ctx.token({ id: user.id }, { exp: Math.floor(Date.now() / 1000) - 600 })]) {
    const response = await ctx.call(value, '?userId=another-user');
    assert.equal(response.status, 401);
    assert.equal(response.body.data, null);
  }
  assert.deepEqual(ctx.calls, []);
});

test('GET cart rejects missing and invalid id claims before any database query', async () => {
  const ctx = await setup();
  for (const id of [undefined, null, '', '   ', false, [], {}, 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    const response = await ctx.call(await ctx.token(id === undefined ? {} : { id }));
    assert.equal(response.status, 401, `id: ${JSON.stringify(id)}`);
    assert.equal(response.body.data, null);
  }
  assert.deepEqual(ctx.calls, []);
});

test('GET cart preserves cookie transport and existing JWT clock tolerance', async () => {
  const ctx = await setup();
  const response = await ctx.call(await ctx.token({ id: user.id }, { exp: Math.floor(Date.now() / 1000) - 60 }), '', true);
  assert.equal(response.status, 200);
});

test('GET cart preserves empty-cart response', async () => {
  const ctx = await setup({ cart: [] });
  const response = await ctx.call(await ctx.token());
  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { data: [], mensagens: ['Seu carrinho está vazio.'] });
});

test('GET cart rejects missing or inactive users without querying cart', async () => {
  for (const profile of [null, { ...user, is_active: false }]) {
    const ctx = await setup({ profile });
    assert.equal((await ctx.call(await ctx.token())).status, 401);
    assert.deepEqual(ctx.calls.filter(call => call[0] === 'from'), [['from', 'users']]);
  }
});
