const production = require('../../docs/contracts/categories.production.json');
const { exampleFromSchema } = require('./examples');

const prefix = '/api/v1/categories';
const ref = name => ({ $ref: `#/components/schemas/Categories${name}` });

// Isolate published components so other tags retain their existing definitions.
function namespace(value) {
  if (Array.isArray(value)) return value.map(namespace);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key,
    key === '$ref' ? child.replace('#/components/schemas/', '#/components/schemas/Categories') : namespace(child)
  ]));
}

function applyCategoriesDocumentation(spec) {
  const schemas = spec.components.schemas;
  for (const [name, schema] of Object.entries(production.components.schemas)) {
    schemas[`Categories${name}`] = namespace(schema);
  }
  // Bodies missing in the published document: envelope observed in the handlers.
  // Message samples are illustrative, not assertions of exact runtime wording.
  schemas.CategoriesEmptyData = { type: 'object', nullable: true, example: null };
  schemas.CategoriesResult = {
    type: 'object', properties: {
      data: ref('Category'), mensagens: { type: 'array', items: { type: 'string' } }
    }
  };
  schemas.CategoriesEmptyResult = {
    type: 'object', properties: {
      data: ref('EmptyData'), mensagens: { type: 'array', items: { type: 'string' } }
    }
  };
  for (const path of Object.keys(spec.paths)) if (path.startsWith(prefix)) delete spec.paths[path];
  for (const [path, methods] of Object.entries(production.paths)) {
    spec.paths[path] = namespace(methods);
    for (const [method, operation] of Object.entries(spec.paths[path])) {
      for (const parameter of operation.parameters || []) {
        if (parameter.schema) parameter.example = exampleFromSchema(parameter.schema, schemas);
      }
      for (const media of Object.values(operation.requestBody?.content || {})) {
        media.example = exampleFromSchema(media.schema, schemas);
      }
      for (const [status, response] of Object.entries(operation.responses)) {
        response.content ||= { 'application/json': {
          schema: ref(Number(status) >= 400 || method === 'delete' ? 'EmptyResult' : 'Result')
        } };
        for (const media of Object.values(response.content)) {
          media.example = exampleFromSchema(media.schema, schemas);
          if (media.example && Object.hasOwn(media.example, 'mensagens')) {
            media.example.mensagens = [response.description];
          }
        }
      }
    }
  }
  spec.tags = spec.tags.filter(tag => !['Categories', '🏷️ Categorias'].includes(tag.name));
  spec.tags.push({ name: 'Categories', description: 'Categorias de produtos. Exemplos ilustrativos gerados dos schemas; não são dados consultados em produção.' });
}

module.exports = { applyCategoriesDocumentation };
