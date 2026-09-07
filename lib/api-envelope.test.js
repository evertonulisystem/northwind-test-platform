const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeApiBody } = require('./api-envelope');

test('preserves existing data, pagination, expiry and message arrays without mutation', () => {
  const original = { data: [{ id: 1 }], pagination: { total: 1 }, expires_at: null, mensagens: ['OK'] };
  const before = structuredClone(original);
  assert.deepEqual(normalizeApiBody(original), before);
  assert.deepEqual(original, before);
});

test('normalizes middleware errors, string messages and raw validation results', () => {
  assert.deepEqual(normalizeApiBody({ error: 'Unauthorized' }), { data: null, mensagens: ['Unauthorized'] });
  assert.deepEqual(normalizeApiBody({ data: { user: { id: 1 } }, mensagens: 'Login realizado' }), { data: { user: { id: 1 } }, mensagens: ['Login realizado'] });
  assert.deepEqual(normalizeApiBody({ valid: false, message: 'Email inválido' }), { data: { valid: false }, mensagens: ['Email inválido'] });
  assert.deepEqual(normalizeApiBody({ status: 'ok', message: 'Supabase ativo' }), { data: { status: 'ok' }, mensagens: ['Supabase ativo'] });
});

test('normalization is idempotent and retains raw business fields', () => {
  const body = { valid: true, errors: [], warnings: ['Aviso'], suggestions: [], message: 'Válido' };
  const expected = { data: { valid: true, errors: [], warnings: ['Aviso'], suggestions: [] }, mensagens: ['Válido'] };
  assert.deepEqual(normalizeApiBody(body), expected);
  assert.deepEqual(normalizeApiBody(expected), expected);
});

test('every JSON response in API handlers uses the envelope, excluding the OpenAPI document', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const ts = require('typescript');
  function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : e.name === 'route.js' ? [path.join(dir, e.name)] : []); }
  for (const file of [...files(path.join(__dirname, '../app/api/v1')), path.join(__dirname, 'auth.js')]) {
    if (file.includes('swagger.json')) continue;
    const src = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), 99, true);
    function visit(node) {
      if (ts.isCallExpression(node) && /^(NextResponse|Response)\.json$/.test(node.expression.getText(src))) {
        assert.ok(node.arguments[0].getText(src).startsWith('normalizeApiBody('), file);
      }
      ts.forEachChild(node, visit);
    }
    visit(src);
    if (file.includes(path.join('debug', 'token'))) assert.match(src.text, /JSON\.stringify\(normalizeApiBody\(/);
  }
});
