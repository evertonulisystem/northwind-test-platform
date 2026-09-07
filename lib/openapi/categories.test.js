const { test } = require('node:test');
const assert = require('node:assert/strict');
const production = require('../../docs/contracts/categories.production.json');
const spec = require('../swagger');
const { exampleFromSchema } = require('./examples');

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'example').map(([key, child]) =>
    [key, key === '$ref' ? child.replace('/schemas/Categories', '/schemas/') : normalize(child)]));
}

test('all seven published operations retain inputs, security, status codes and existing response schemas', () => {
  let operations = 0;
  for (const [path, methods] of Object.entries(production.paths)) {
    assert.deepEqual(Object.keys(spec.paths[path]), Object.keys(methods));
    for (const [method, original] of Object.entries(methods)) {
      operations++;
      const actual = spec.paths[path][method];
      for (const key of ['security', 'parameters', 'requestBody', 'tags', 'summary']) {
        assert.deepEqual(normalize(actual[key]), normalize(original[key]), `${method} ${path}: ${key}`);
      }
      for (const status of Object.keys(original.responses)) assert.ok(actual.responses[status]);
      for (const [status, response] of Object.entries(original.responses)) {
        if (response.content) {
          const expected = structuredClone(response.content);
          for (const media of Object.values(expected)) media.schema = require('./envelope').envelopeSchema(media.schema, spec);
          assert.deepEqual(normalize(actual.responses[status].content), normalize(expected));
        }
      }
    }
  }
  assert.equal(operations, 7);
  for (const [name, schema] of Object.entries(production.components.schemas)) {
    assert.deepEqual(normalize(spec.components.schemas[`Categories${name}`]), normalize(schema));
  }
});

test('every published response and request has a generated example and resolvable schema', () => {
  let responses = 0;
  for (const path of Object.keys(production.paths)) {
    for (const operation of Object.values(spec.paths[path])) {
      const contents = [operation.requestBody, ...Object.values(operation.responses)].filter(Boolean);
      for (const item of contents) {
        assert.ok(item.content);
        for (const media of Object.values(item.content)) {
          assert.ok(Object.hasOwn(media, 'example'));
          assert.doesNotThrow(() => exampleFromSchema(media.schema, spec.components.schemas));
        }
      }
      responses += Object.keys(operation.responses).length;
    }
  }
  assert.equal(responses, 35);
  assert.equal(spec.paths['/api/v1/categories'].post.responses[500], undefined);
  assert.ok(spec.paths['/api/v1/categories/{id}'].get.responses[500]);
});

test('sampler follows schema changes, preserves falsy samples and rejects broken references', () => {
  assert.equal(exampleFromSchema({ type: 'string', minLength: 8, maxLength: 8 }, {}), 'stringxx');
  for (const example of [null, false, 0, '']) assert.equal(exampleFromSchema({ example }, {}), example);
  assert.throws(() => exampleFromSchema({ $ref: '#/components/schemas/Missing' }, {}));
  assert.deepEqual(exampleFromSchema({ type: 'object', properties: { added: { type: 'integer', minimum: 5 } } }, {}), { added: 5 });
});
