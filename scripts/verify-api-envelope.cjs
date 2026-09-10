const assert = require('node:assert/strict');

(async () => {
  // No credentials, writes to the database or production requests.
  const cases = [
    ['GET', '/api/v1/categories', 401],
    ['GET', '/api/v1/cart', 401],
    ['GET', '/api/v1/orders', 401],
    ['GET', '/api/v1/auth/me', 401],
    ['POST', '/api/v1/auth/login', 400, {}],
    ['POST', '/api/v1/auth/validate', 200, { field: 'email', value: 'aluno@example.com' }],
    ['POST', '/api/v1/auth/validate', 400, { field: 'unsupported', value: 'test' }],
    ['POST', '/api/v1/products/validate', 401, {}],
    ['GET', '/api/v1/debug/simple', 200],
    ['GET', '/api/v1/debug/token', 200]
  ];
  for (const [method, path, status, input] of cases) {
    const response = await fetch(`http://localhost:3000${path}`, { method, ...(input ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) } : {}) });
    assert.equal(response.status, status, `${method} ${path}`);
    const body = await response.json();
    assert.ok(Object.hasOwn(body, 'data'), path);
    assert.ok(Array.isArray(body.mensagens), path);
    assert.ok(body.mensagens.every(m => typeof m === 'string'), path);
    for (const key of ['message', 'mensagem', 'error']) assert.ok(!Object.hasOwn(body, key), `${path}: ${key}`);
    if (path === '/api/v1/auth/validate' && status === 200) assert.equal(body.data.valid, true);
  }
  console.log(`${cases.length} local HTTP cases passed: data + mensagens[]`);
})().catch(error => { console.error(error); process.exitCode = 1; });
