const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const file = path.join(__dirname, '../app/api/v1/shippers/route.js');
const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), 99, true, ts.ScriptKind.JS);
let handlerCode;
function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'getShippers') {
    handlerCode = node.getText(source);
  }
  ts.forEachChild(node, visit);
}
visit(source);
assert.ok(handlerCode);

async function call({ token, payload }) {
  let databaseCalls = 0;
  const query = {
    select() { return this; },
    async order() { databaseCalls++; return { data: [{ id: 1, company_name: 'Entrega Exemplo' }], error: null }; }
  };
  const handler = vm.runInNewContext(`(${handlerCode})`, {
    getTokenFromRequest: () => token,
    verifyToken: async () => payload,
    supabase: { from: () => query },
    normalizeApiBody: body => body,
    NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) },
    console: { error() {} }
  });
  return { response: await handler({ headers: new Headers() }), databaseCalls };
}

test('GET /shippers accepts a valid JWT without querying the users table', async () => {
  const { response, databaseCalls } = await call({ token: 'valid-token', payload: { id: 123, role: 'user' } });
  assert.equal(response.status, 200);
  assert.equal(databaseCalls, 1);
  assert.equal(response.body.mensagens[0], 'Transportadoras carregadas com sucesso.');
});

test('GET /shippers rejects missing and invalid tokens before querying shippers', async () => {
  for (const input of [
    { token: null, payload: null, message: 'Token ausente' },
    { token: 'invalid-token', payload: { error: 'InvalidTokenError', message: 'Token inválido.' }, message: 'Token inválido.' }
  ]) {
    const { response, databaseCalls } = await call(input);
    assert.equal(response.status, 401);
    assert.equal(databaseCalls, 0);
    assert.equal(response.body.mensagens[0], input.message);
  }
});
