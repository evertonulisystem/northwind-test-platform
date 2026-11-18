const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

for (const includeCount of [false, true]) test(`suppliers product counts are opt-in: ${includeCount}`, async () => {
  let selected;
  const base = { id: 1, company_name: 'Supplier', state: 'SP' };
  const query = {
    select(fields) { selected = fields; return this; },
    order() { return this; },
    then(resolve) { resolve({ data: [includeCount ? { ...base, products: [{ count: 3 }] } : { ...base }], error: null }); },
  };
  const dependencies = {
    '@/lib/auth': { requireAuth: handler => handler, requireAdmin: handler => handler },
    '@/lib/api-envelope': require('./api-envelope'),
    '@/lib/supabase': { supabase: { from: () => query } },
    '@/lib/jwt': { getTokenFromRequest: () => 'test', verifyToken: async () => ({ id: 1 }) },
    'next/server': { NextResponse: Response },
  };
  const source = fs.readFileSync(path.join(__dirname, '../app/api/v1/suppliers/route.js'), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, URL, console, require: name => dependencies[name] });
  const response = await exports.GET({ url: `http://localhost/api/v1/suppliers${includeCount ? '?include_product_count=true' : ''}` });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(selected, includeCount ? '*, products(count)' : '*');
  assert.deepEqual(body.data, [{ id: 1, company_name: 'Supplier', uf: 'SP', ...(includeCount ? { product_count: 3 } : {}) }]);
});
