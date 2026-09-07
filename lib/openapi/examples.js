// Deterministic documentation samples. Never calls the API or reads the database.
function exampleFromSchema(schema, schemas, seen = []) {
  if (!schema) throw new Error('Missing example schema');
  if (schema.type === 'null') return null;
  if (schema.oneOf || schema.anyOf) return exampleFromSchema((schema.oneOf || schema.anyOf)[0], schemas, seen);
  if (schema.allOf) return Object.assign({}, ...schema.allOf.map(s => exampleFromSchema(s, schemas, seen)));
  if (Object.keys(schema).length === 0) return {};
  if (Object.hasOwn(schema, 'example')) return structuredClone(schema.example);
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop();
    if (!schemas[name] || seen.includes(name)) throw new Error(`Unresolved/circular schema: ${name}`);
    return exampleFromSchema(schemas[name], schemas, [...seen, name]);
  }
  if (Object.hasOwn(schema, 'default')) return structuredClone(schema.default);
  if (schema.enum) return structuredClone(schema.enum[0]);
  if (schema.type === 'object') return Object.fromEntries(
    Object.entries(schema.properties || {}).map(([key, value]) => [key, exampleFromSchema(value, schemas, seen)])
  );
  if (schema.type === 'array') return Array.from({ length: Math.max(1, schema.minItems || 0) }, () => exampleFromSchema(schema.items, schemas, seen));
  if (schema.type === 'integer' || schema.type === 'number') return Math.max(schema.minimum ?? 1, Math.min(1, schema.maximum ?? 1));
  if (schema.type === 'boolean') return false;
  if (schema.type === 'string') {
    const formats = { 'date-time': '2026-09-07T00:00:00.000Z', date: '2026-09-07', uuid: '00000000-0000-4000-8000-000000000001' };
    return formats[schema.format] || 'string'.padEnd(schema.minLength || 0, 'x').slice(0, schema.maxLength);
  }
  throw new Error(`Unsupported sample schema: ${JSON.stringify(schema)}`);
}

module.exports = { exampleFromSchema };
