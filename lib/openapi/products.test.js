const { test } = require('node:test');
const assert = require('node:assert/strict');
const spec = require('../swagger');

const productPaths = Object.entries(spec.paths).filter(([path]) => path.startsWith('/api/v1/products'));

test('all 17 product operations expose reviewed response contracts', () => {
  const operations = productPaths.flatMap(([, item]) =>
    Object.entries(item).filter(([method]) => ['get', 'post', 'put', 'patch', 'delete'].includes(method))
  );
  assert.equal(operations.length, 17);
  for (const [, operation] of operations) {
    assert.ok(Object.keys(operation.responses).length > 0);
    for (const response of Object.values(operation.responses)) {
      for (const media of Object.values(response.content || {})) {
        assert.ok(media.schema);
        if (media.schema.format !== 'binary') assert.ok(media.example || media.examples);
      }
    }
  }
});

test('list, detail, search and create match their distinct database selections', () => {
  const list = spec.paths['/api/v1/products'].get.responses[200].content['application/json'].example;
  assert.equal(list.pagination.totalPages, Math.ceil(list.pagination.total / list.pagination.limit));
  assert.ok(Object.hasOwn(list.data[0], 'is_active'));
  assert.equal(Object.hasOwn(list.data[0], 'created_at'), false);

  const detail = spec.paths['/api/v1/products/{id}'].get.responses[200].content['application/json'].example.data;
  assert.equal(Object.hasOwn(detail, 'is_active'), false);
  const search = spec.paths['/api/v1/products/search'].get.responses[200].content['application/json'].example.data;
  assert.ok(Object.hasOwn(search, 'created_at'));
  assert.ok(Object.hasOwn(search, 'updated_at'));

  const created = spec.paths['/api/v1/products'].post.responses[201].content['application/json'].example;
  assert.ok(Object.hasOwn(created.data, 'description'));
  assert.equal(created.mensagens.length, 2);
  assert.doesNotMatch(created.mensagens.join(' '), /qvbbr|senha|token|secret/i);
});

test('reviews, validation and product files preserve their real envelopes', () => {
  const reviews = spec.paths['/api/v1/products/{id}/reviews'].get.responses[200].content['application/json'].example;
  assert.deepEqual(Object.keys(reviews), ['data', 'product', 'averageRating', 'totalReviews', 'mensagens']);
  const validation = spec.paths['/api/v1/products/validate'].post.responses[200].content['application/json'].example;
  assert.deepEqual(Object.keys(validation.data), ['valid', 'errors', 'warnings', 'suggestions']);
  for (const kind of ['image', 'pdf']) {
    const uploaded = spec.paths[`/api/v1/products/{id}/${kind}`].post.responses[200].content['application/json'].example.data;
    assert.deepEqual(Object.keys(uploaded), ['id', 'filename', 'size', 'mimetype', 'productId', 'url']);
    const binary = spec.paths[`/api/v1/products/{id}/${kind}/{fileId}`].get.responses[200];
    assert.equal(Object.values(binary.content)[0].schema.format, 'binary');
  }
});
