const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { normalizeApiBody } = require('./api-envelope');

test('authentication wrappers return the Portuguese 401 envelope without accessing the database', async () => {
  const source = fs.readFileSync(require.resolve('./auth.js'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  });
  const exports = {};
  const dependencies = {
    '@/lib/api-envelope': { normalizeApiBody },
    './supabase': { supabase: { from() { assert.fail('Database must not be accessed'); } } },
    './jwt': {
      getTokenFromRequest: () => null,
      verifyToken() { assert.fail('Missing token must not be verified'); }
    },
    'next/headers': { cookies() { assert.fail('Unexpected cookie access'); } }
  };
  vm.runInNewContext(outputText, {
    exports, Response,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    }
  });
  for (const wrapper of [exports.requireAuth, exports.requireAdmin]) {
    const response = await wrapper(() => assert.fail('Handler must not execute'))({});
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { data: null, mensagens: ['Token ausente'] });
  }
});
