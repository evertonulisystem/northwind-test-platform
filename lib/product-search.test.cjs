const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../app/api/v1/products/search/route.js'), 'utf8');
const code = source.slice(source.indexOf('export async function GET')).replace('export ', '');
async function search(params, result = { data: { id: 1 }, error: null }) {
  const filters = [];
  const query = { select() { return this; }, eq(...args) { filters.push(args); return this; }, single: async () => result };
  const handler = vm.runInNewContext('(' + code + ')', {
    URL, console: { log() {}, error() {} }, supabase: { from: () => query },
    getTokenFromRequest: () => 'token', verifyToken: async () => ({ id: 1 }),
    normalizeApiBody: value => value,
    NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) }
  });
  return { response: await handler({ url: 'http://localhost/api/v1/products/search?' + new URLSearchParams(params) }), filters };
}
test('searches exact name and trims surrounding whitespace', async () => {
  const { response, filters } = await search({ name: '  Mouse Gamer RGB Pro Wireless  ' });
  assert.equal(response.status, 200);
  assert.deepEqual(filters, [['name', 'Mouse Gamer RGB Pro Wireless']]);
});
test('rejects empty name with no other search parameter', async () => {
  const { response, filters } = await search({ name: '   ' });
  assert.equal(response.status, 400);
  assert.match(response.body.mensagens[0], /name/);
  assert.equal(filters.length, 0);
});
test('preserves existing filter precedence when name is also supplied', async () => {
  for (const [params, expected] of [
    [{ id: '1', sku: 'abc', slug: 'slug', name: 'Name' }, ['id', 1]],
    [{ sku: 'abc', slug: 'slug', name: 'Name' }, ['sku', 'ABC']],
    [{ slug: 'SLUG', name: 'Name' }, ['slug', 'slug']]
  ]) assert.deepEqual((await search(params)).filters, [expected]);
});
test('returns 404 when name does not match a product', async () => {
  assert.equal((await search({ name: 'Missing' }, { data: null, error: { code: 'PGRST116' } })).response.status, 404);
});
test('Swagger exposes name with an example', () => {
  const spec = require('./swagger');
  const parameter = spec.paths['/api/v1/products/search'].get.parameters.find(p => p.name === 'name');
  assert.equal(parameter.schema.type, 'string');
  assert.equal(parameter.schema.example, 'Mouse Gamer RGB Pro Wireless');
});
