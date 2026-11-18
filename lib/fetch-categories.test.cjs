const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(fetch) {
  const source = fs.readFileSync(require.resolve('./fetch-categories.js'), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, fetch });
  return exports.fetchAllCategories;
}

test('loads all category pages with the supported limit and authorization', async () => {
  const rows = Array.from({ length: 205 }, (_, id) => ({ id }));
  const headers = { Authorization: 'Bearer test' };
  let calls = 0;
  const fetchCategories = load(async (url, options) => {
    const page = ++calls;
    assert.equal(url, `/api/v1/categories?page=${page}&limit=100`);
    assert.equal(options.headers, headers);
    assert.equal(options.cache, 'no-store');
    return { ok: true, json: async () => ({
      data: rows.slice((page - 1) * 100, page * 100),
      pagination: { hasNextPage: page < 3 },
    }) };
  });
  assert.deepEqual(Array.from(await fetchCategories(headers)), rows);
  assert.equal(calls, 3);
});

test('returns an empty list when there are no categories', async () => {
  const fetchCategories = load(async () => ({ ok: true, json: async () => ({ data: [], pagination: { hasNextPage: false } }) }));
  assert.equal((await fetchCategories({})).length, 0);
});

test('propagates API errors instead of returning an empty or partial list', async () => {
  let calls = 0;
  const fetchCategories = load(async () => ++calls === 1
    ? { ok: true, json: async () => ({ data: [{ id: 1 }], pagination: { hasNextPage: true } }) }
    : { ok: false, json: async () => ({ data: null, mensagens: ['Token inválido'] }) });
  await assert.rejects(fetchCategories({}), /Token inválido/);
});
