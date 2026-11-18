const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { normalizeApiBody } = require('./api-envelope');

test('GET categories accepts limits above 100 and rejects zero before querying categories', async () => {
  const calls = [];
  const rows = Array.from({ length: 120 }, (_, i) => ({ id: i + 1, name: `Category ${i + 1}` }));
  const supabase = { from(table) {
    assert.equal(table, 'categories');
    calls.push(table);
    return {
      select(fields, options) { return options?.head ? Promise.resolve({ count: rows.length, error: null }) : this; },
      order() { return this; },
      async range(start, end) { calls.push([start, end]); return { data: rows.slice(start, end + 1), error: null }; }
    };
  } };
  const dependencies = {
    '@/lib/auth': { requireAuth: handler => handler, requireAdmin: handler => handler },
    '@/lib/api-envelope': { normalizeApiBody }, '@/lib/supabase': { supabase },
    '@/lib/jwt': { getTokenFromRequest: () => 'isolated-token', verifyToken: async () => ({ id: 'A' }) },
    'next/server': { NextResponse: Response }
  };
  const source = fs.readFileSync(path.join(__dirname, '../app/api/v1/categories/route.js'), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, URL, console, require(name) { assert.ok(Object.hasOwn(dependencies, name)); return dependencies[name]; } });
  for (const query of ['', '?limit=10', '?limit=100', '?limit=101', '?limit=1000', '?limit=0']) {
    calls.length = 0;
    const response = await exports.GET({ url: `http://localhost/api/v1/categories${query}` });
    const body = await response.json();
    if (query === '?limit=0') {
      assert.equal(response.status, 400);
      assert.deepEqual(body, { data: null, mensagens: ['Limite deve ser maior que 0.'] });
      assert.deepEqual(calls, []);
    } else {
      const limit = Number(new URLSearchParams(query).get('limit') || 10);
      assert.equal(response.status, 200);
      assert.deepEqual(body.data, rows.slice(0, limit));
      assert.equal(body.pagination.itemsPerPage, limit);
      assert.equal(body.pagination.totalItems, 120);
      assert.equal(body.pagination.totalPages, Math.ceil(120 / limit));
      assert.deepEqual(calls.at(-1), [0, limit - 1]);
    }
  }
  const operation = require('./swagger').paths['/api/v1/categories'].get;
  const parameter = operation.parameters.find(p => p.name === 'limit');
  assert.equal(parameter.schema.default, 10);
  assert.equal(parameter.schema.maximum, undefined);
  assert.deepEqual(operation.responses[400].content['application/json'].examples.LimiteInvalido.value,
    { data: null, mensagens: ['Limite deve ser maior que 0.'] });
});
