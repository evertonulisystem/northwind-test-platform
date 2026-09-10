const { test } = require('node:test');
const assert = require('node:assert/strict');
const spec = require('../swagger');

const paths = [
  '/api/v1/suppliers', '/api/v1/suppliers/{id}',
  '/api/v1/suppliers/{id}/products', '/api/v1/suppliers/{id}/unlink'
];

test('all seven supplier operations expose reviewed schemas and examples', () => {
  assert.deepEqual(Object.keys(spec.paths['/api/v1/suppliers']), ['get', 'post']);
  assert.deepEqual(Object.keys(spec.paths['/api/v1/suppliers/{id}']), ['get', 'put', 'delete']);
  assert.ok(spec.paths['/api/v1/suppliers/{id}/products'].get);
  assert.ok(spec.paths['/api/v1/suppliers/{id}/unlink'].post);
  let operations = 0;
  for (const path of paths) for (const operation of Object.values(spec.paths[path])) {
    operations++;
    for (const response of Object.values(operation.responses)) {
      const media = response.content['application/json'];
      assert.ok(media.schema);
      assert.ok(Object.hasOwn(media, 'example') || Object.keys(media.examples || {}).length);
    }
  }
  assert.equal(operations, 7);
});

test('supplier representations preserve the real state versus uf behavior', () => {
  const list = spec.paths['/api/v1/suppliers'].get.responses[200].content['application/json'].example.data[0];
  const created = spec.paths['/api/v1/suppliers'].post.responses[201].content['application/json'].example.data;
  assert.ok(Object.hasOwn(list, 'uf'));
  assert.ok(!Object.hasOwn(list, 'state'));
  assert.ok(Object.hasOwn(created, 'state'));
  assert.ok(!Object.hasOwn(created, 'uf'));
  for (const field of ['contact_title', 'street', 'city', 'zip_code', 'country', 'website', 'rating', 'is_active', 'notes', 'created_at']) {
    assert.ok(Object.hasOwn(list, field), field);
  }
});

test('supplier products document pagination and unlink documents the real result', () => {
  const products = spec.paths['/api/v1/suppliers/{id}/products'].get.responses[200].content['application/json'].example;
  assert.deepEqual(products.pagination, { page: 1, limit: 10, total: 2, totalPages: 1 });
  assert.equal(products.data.length, 2);
  const unlink = spec.paths['/api/v1/suppliers/{id}/unlink'].post.responses[200].content['application/json'].example;
  assert.equal(unlink.data.updated_count, 2);
  assert.equal(unlink.data.updated_products.length, 2);
  assert.deepEqual(unlink.mensagens, ['2 produto(s) desvinculado(s) do fornecedor com sucesso!']);
});

test('supplier 401 examples use messages returned by authentication handlers', () => {
  for (const path of paths) for (const operation of Object.values(spec.paths[path])) {
    const examples = operation.responses[401].content['application/json'].examples;
    assert.deepEqual(examples.TokenAusente.value, { data: null, mensagens: ['Token ausente'] });
    assert.equal(examples.TokenInvalido.value.mensagens[0], 'Token inválido');
  }
});
