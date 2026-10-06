const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { normalizeApiBody } = require('./api-envelope');

async function health({ configured = true, error = null } = {}) {
  const calls = [];
  const source = fs.readFileSync(path.join(__dirname, '../app/api/v1/health/route.js'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  });
  const dependencies = {
    '@/lib/api-envelope': { normalizeApiBody },
    '@/lib/supabase': { supabase: {
      from(table) {
        calls.push(['from', table]);
        return {
          select(column) { calls.push(['select', column]); return this; },
          async limit(count) { calls.push(['limit', count]); return { error }; }
        };
      }
    } },
    'next/server': { NextResponse: Response }
  };
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    console: { error() {} },
    process: {
      env: { NODE_ENV: 'test', ...(configured ? { JWT_SECRET: 'health-test-secret' } : {}) },
      uptime: () => 123.5,
      memoryUsage: () => ({ rss: 1024 }),
      version: 'v22.0.0'
    }
  });
  const response = await exports.GET();
  return { response, body: await response.json(), calls };
}

test('GET health omits only the two private fields and preserves public diagnostics', async () => {
  for (const configured of [true, false]) {
    const { response, body, calls } = await health({ configured });
    assert.equal(response.status, 200);
    assert.deepEqual(calls, [['from', 'users'], ['select', 'id'], ['limit', 1]]);
    assert.deepEqual(body.mensagens, ['Supabase ativo']);
    const data = body.data;
    assert.deepEqual(Object.keys(data), [
      'status', 'timestamp', 'uptime', 'version', 'environment',
      'services', 'endpoints', 'testing', 'automation', 'metrics'
    ]);
    assert.equal(data.status, 'ok');
    assert.ok(Number.isFinite(Date.parse(data.timestamp)));
    assert.equal(data.uptime, 123);
    assert.equal(data.version, '1.0.0');
    assert.equal(data.environment, 'test');
    assert.deepEqual(Object.keys(data.services), ['database', 'auth']);
    assert.deepEqual(data.services.auth, { status: configured ? 'operational' : 'misconfigured' });
    assert.deepEqual(Object.keys(data.services.database), ['status', 'response_time_ms']);
    assert.equal(data.services.database.status, 'connected');
    assert.ok(data.services.database.response_time_ms >= 0);
    assert.deepEqual(data.endpoints, { total: 15, protected: 12, public: 3 });
    assert.deepEqual(data.testing.sample_data.test_user, { email: 'admin@qatest.com', role: 'admin' });
    assert.deepEqual(Object.keys(data.testing), ['sample_data', 'test_tips']);
    assert.deepEqual(Object.keys(data.testing.sample_data), ['test_user', 'test_endpoints', 'test_scenarios']);
    assert.equal(data.testing.sample_data.test_endpoints.length, 6);
    assert.equal(data.testing.sample_data.test_scenarios.length, 6);
    assert.deepEqual(Object.keys(data.testing.test_tips), ['authentication', 'testing_strategies', 'common_pitfalls']);
    assert.equal(data.testing.test_tips.authentication.header, 'Authorization: Bearer <token>');
    assert.deepEqual(Object.keys(data.automation), ['keepalive', 'monitoring']);
    assert.equal(data.automation.keepalive.methods.length, 3);
    assert.equal(data.automation.monitoring.suggested_tools.length, 4);
    assert.equal(data.automation.monitoring.alerts.length, 3);
    assert.deepEqual(Object.keys(data.metrics), ['response_time_ms', 'memory_usage', 'node_version']);
    assert.ok(data.metrics.response_time_ms >= 0);
    assert.deepEqual(data.metrics.memory_usage, { rss: 1024 });
    assert.equal(data.metrics.node_version, 'v22.0.0');
    assert.equal(response.headers.get('Cache-Control'), 'no-cache, no-store, must-revalidate');
    assert.equal(response.headers.get('Pragma'), 'no-cache');
    assert.equal(response.headers.get('Expires'), '0');
  }
});

test('GET health preserves the database failure response', async () => {
  const { response, body } = await health({ error: { message: 'Database unavailable' } });
  assert.equal(response.status, 503);
  assert.deepEqual(body.mensagens, ['Supabase inativo']);
  assert.deepEqual(Object.keys(body.data), ['status', 'timestamp', 'services']);
  assert.equal(body.data.status, 'error');
  assert.ok(Number.isFinite(Date.parse(body.data.timestamp)));
  assert.deepEqual(body.data.services, {
    database: { status: 'disconnected', error: 'Database unavailable' },
    auth: { status: 'unknown' }
  });
  assert.equal(response.headers.get('Cache-Control'), 'no-cache, no-store, must-revalidate');
});

test('Swagger health documentation describes the omitted fields', () => {
  const operation = require('./swagger').paths['/api/v1/health'].get;
  assert.match(operation.description, /testing\.sample_data\.test_user\.password/);
  assert.match(operation.description, /services\.auth\.jwt_secret/);
});
