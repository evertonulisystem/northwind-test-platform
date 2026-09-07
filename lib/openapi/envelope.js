const { normalizeApiBody } = require('../api-envelope');

function envelopeSchema(schema, spec) {
  if (schema.$ref) {
    const resolved = schema.$ref.slice(2).split('/').reduce((node, key) => node?.[key], spec);
    if (!resolved) throw new Error(`Missing schema: ${schema.$ref}`);
    return envelopeSchema(resolved, spec);
  }
  if (schema.anyOf || schema.oneOf) {
    const key = schema.anyOf ? 'anyOf' : 'oneOf';
    return { [key]: schema[key].map(item => envelopeSchema(item, spec)) };
  }
  const copy = structuredClone(schema);
  const properties = copy.properties || {};
  const hasData = Object.hasOwn(properties, 'data');
  const messageFields = ['message', 'mensagem', 'mensagens', 'error'];
  for (const key of messageFields) delete properties[key];
  if (copy.required) copy.required = copy.required.filter(key => !messageFields.includes(key));
  delete copy.example;
  const output = hasData ? { ...copy, properties } : {
    type: 'object', properties: {
      data: Object.keys(properties).length || copy.type !== 'object' ? { ...copy, ...(copy.type === 'object' ? { properties } : {}) } : { type: 'object', nullable: true, example: null }
    }
  };
  output.properties.mensagens = { type: 'array', items: { type: 'string' } };
  output.required = [...new Set([...(hasData ? output.required || [] : []), 'data', 'mensagens'])];
  return output;
}

function normalizeResponseDocumentation(spec) {
  function response(value) {
    if (value.$ref) return;
    const media = value.content?.['application/json'];
    if (!media) return;
    media.schema = envelopeSchema(media.schema, spec);
    if (Object.hasOwn(media, 'example')) media.example = normalizeApiBody(media.example);
    for (const example of Object.values(media.examples || {})) {
      if (Object.hasOwn(example, 'value')) example.value = normalizeApiBody(example.value);
    }
  }
  for (const methods of Object.values(spec.paths)) for (const operation of Object.values(methods)) {
    for (const item of Object.values(operation.responses || {})) response(item);
  }
  for (const item of Object.values(spec.components.responses || {})) response(item);
}

module.exports = { envelopeSchema, normalizeResponseDocumentation };
