const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const root = path.join(__dirname, '..');
function extract(file, name) {
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'), 99, true, ts.ScriptKind.JSX);
  let code;
  function visit(n) {
    if (ts.isVariableDeclaration(n) && n.name.getText(source) === name) code = n.initializer.getText(source);
    if (ts.isFunctionDeclaration(n) && n.name?.text === name) code = n.getText(source).replace('export ', '');
    ts.forEachChild(n, visit);
  }
  visit(source);
  assert.ok(code);
  return code;
}
for (const valid of [true, false]) test(`edit submit prevents navigation and confirms returned category: ${valid}`, async () => {
  let prevented = false, successes = 0, errors = 0, refreshed = 0, closed = false;
  const context = {
    validateForm: () => true, setLoading() {}, localStorage: { getItem: () => 'token' },
    editingCategory: { id: 1 }, formData: { name: 'Updated', description: 'Updated description' },
    fetch: async (url, options) => {
      assert.ok(prevented, 'native navigation must be cancelled before the request');
      assert.equal(options.method, 'PUT');
      assert.equal(JSON.parse(options.body).name, 'Updated');
      return { ok: true, json: async () => ({ data: valid ? { id: 1 } : null }) };
    },
    toast: { success() { successes++; }, error() { errors++; } },
    fetchCategories: async () => { refreshed++; }, setShowEditModal: () => { closed = true; },
    setEditingCategory() {}, setFormData() {}
  };
  const handler = vm.runInNewContext('(' + extract('app/categories/page.js', 'handleUpdate') + ')', context);
  await handler({ preventDefault() { prevented = true; } });
  assert.equal(successes, valid ? 1 : 0);
  assert.equal(errors, valid ? 0 : 1);
  assert.equal(refreshed, valid ? 1 : 0);
  assert.equal(closed, valid);
});
for (const method of ['PUT', 'PATCH']) for (const persisted of [true, false]) {
  test(`${method} reports success only when database returns updated row: ${persisted}`, async () => {
    const row = { id: 1, name: 'Updated', description: 'Updated description' };
    let calls = 0;
    const query = {
      select() { return this; }, eq() { return this; }, neq() { return this; },
      update(value) { assert.equal(value.name, row.name); return this; },
      async maybeSingle() { calls++; return { error: null, data: calls === 1 ? { id: 1, name: 'Original' } : calls === 2 ? null : persisted ? row : null }; }
    };
    const handler = vm.runInNewContext('(' + extract('app/api/v1/categories/[id]/route.js', method) + ')', {
      supabase: { from: () => query }, getTokenFromRequest: () => 'token', verifyToken: async () => ({ id: 1 }),
      generateSlug: () => 'updated', normalizeApiBody: value => value,
      NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) },
      console: { log() {} }
    });
    const response = await handler({ json: async () => row }, { params: Promise.resolve({ id: '1' }) });
    assert.equal(response.status, persisted ? 200 : 500);
    assert.equal(response.body.data, persisted ? row : null);
  });
}
