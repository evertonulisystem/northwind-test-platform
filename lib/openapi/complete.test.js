const { test } = require('node:test');
const assert = require('node:assert/strict');
const spec = require('../swagger');
const audited = require('../../docs/contracts/response-errors.json');
const published = require('../../docs/contracts/api.production.json');

function resolve(value) {
  if (!value.$ref) return value;
  const target = value.$ref.slice(2).split('/').reduce((node, key) => node?.[key], spec);
  assert.ok(target, value.$ref);
  return resolve(target);
}

test('all published operations remain documented and audited errors are covered', () => {
  for (const [path, methods] of Object.entries(published.paths)) {
    for (const method of Object.keys(methods)) assert.ok(spec.paths[path]?.[method], `${method} ${path}`);
  }
  for (const [key, { errors }] of Object.entries(audited)) {
    // Existing legacy collection PATCH has no id in its URL; outside the published contract.
    if (key === 'patch /api/v1/categories') continue;
    const [method, path] = key.split(' ');
    const operation = spec.paths[path]?.[method];
    assert.ok(operation, key);
    for (const status of Object.keys(errors)) assert.ok(operation.responses[status], `${key}: ${status}`);
  }
});

test('all operations have schemas and examples, except binary response examples', () => {
  let operations = 0;
  for (const [path, methods] of Object.entries(spec.paths)) for (const [method, op] of Object.entries(methods)) {
    operations++;
    assert.ok(op.tags.every(t => !/\p{Extended_Pictographic}/u.test(t)));
    for (const item of [op.requestBody, ...Object.values(op.responses)].filter(Boolean)) {
      const content = resolve(item).content;
      assert.ok(content, `${method} ${path}`);
      for (const media of Object.values(content)) {
        assert.ok(media.schema);
        const schema = resolve(media.schema);
        assert.ok(schema.format === 'binary' || Object.hasOwn(media, 'example') || Object.keys(media.examples || {}).length);
      }
    }
  }
  assert.equal(operations, 57);
});

test('all local references resolve and OpenAPI 3.0 schemas do not use type null', () => {
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (value.$ref) resolve(value);
    assert.notEqual(value.type, 'null');
    Object.values(value).forEach(visit);
  }
  visit(spec);
});

test('documented JSON examples match their schemas', () => {
  const Ajv = require('ajv');
  const ajv = new Ajv({ nullable: true, unknownFormats: 'ignore', logger: false, multipleOfPrecision: 8 });
  for (const [path, methods] of Object.entries(spec.paths)) for (const [method, op] of Object.entries(methods)) {
    for (const item of [op.requestBody, ...Object.values(op.responses)].filter(Boolean)) {
      for (const [type, media] of Object.entries(resolve(item).content)) {
        if (type !== 'application/json') continue;
        const validate = ajv.compile({ components: spec.components, ...media.schema });
        const samples = Object.hasOwn(media, 'example') ? [media.example] : Object.values(media.examples || {}).map(e => resolve(e).value);
        for (const sample of samples) assert.ok(validate(sample), `${method} ${path}: ${JSON.stringify(validate.errors)}`);
      }
    }
  }
});

test('every JSON response example exposes data and mensagens as an array', () => {
  for (const methods of Object.values(spec.paths)) for (const op of Object.values(methods)) {
    for (const item of Object.values(op.responses)) {
      const media = resolve(item).content['application/json'];
      if (!media) continue;
      const samples = Object.hasOwn(media, 'example') ? [media.example] : Object.values(media.examples || {}).map(e => resolve(e).value);
      for (const body of samples) {
        assert.ok(Object.hasOwn(body, 'data'));
        assert.ok(Array.isArray(body.mensagens));
        assert.ok(body.mensagens.every(m => typeof m === 'string'));
        for (const key of ['error', 'message', 'mensagem']) assert.ok(!Object.hasOwn(body, key));
      }
    }
  }
});
