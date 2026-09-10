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

  // GET /categories is documented from the current handler contract instead of
  // the older production snapshot. Keep this override local to the list route.
  schemas.CategoriesListItem = {
    type: 'object',
    required: ['id', 'name', 'slug', 'description', 'image_url', 'icon', 'display_order', 'is_active', 'created_at'],
    properties: {
      id: { type: 'integer', example: 1 },
      name: { type: 'string', example: 'Eletrônicos' },
      slug: { type: 'string', example: 'eletronicos' },
      description: { type: 'string', nullable: true, example: 'Produtos eletrônicos e acessórios' },
      image_url: { type: 'string', nullable: true, example: 'https://example.com/categories/eletronicos.jpg' },
      icon: { type: 'string', nullable: true, example: 'laptop' },
      display_order: { type: 'integer', nullable: true, example: 1 },
      is_active: { type: 'boolean', nullable: true, example: true },
      created_at: { type: 'string', format: 'date-time', nullable: true, example: '2026-08-15T10:30:00.000Z' }
    }
  };
  schemas.CategoriesListPagination = {
    type: 'object',
    required: ['currentPage', 'totalPages', 'totalItems', 'itemsPerPage', 'hasNextPage', 'hasPreviousPage'],
    properties: {
      currentPage: { type: 'integer', minimum: 1, example: 1 },
      totalPages: { type: 'integer', minimum: 0, example: 2 },
      totalItems: { type: 'integer', minimum: 0, example: 3 },
      itemsPerPage: { type: 'integer', minimum: 1, maximum: 1000, example: 2 },
      hasNextPage: { type: 'boolean', example: true },
      hasPreviousPage: { type: 'boolean', example: false }
    }
  };

  const listOperation = spec.paths[prefix].get;
  listOperation.responses[200] = {
    description: 'Lista paginada de categorias',
    content: { 'application/json': {
      schema: {
        type: 'object',
        required: ['data', 'pagination', 'mensagens'],
        properties: {
          data: { type: 'array', items: ref('ListItem') },
          pagination: ref('ListPagination'),
          mensagens: { type: 'array', items: { type: 'string' } }
        }
      },
      example: {
        data: [
          {
            id: 1,
            name: 'Eletrônicos',
            slug: 'eletronicos',
            description: 'Produtos eletrônicos e acessórios',
            image_url: 'https://example.com/categories/eletronicos.jpg',
            icon: 'laptop',
            display_order: 1,
            is_active: true,
            created_at: '2026-08-15T10:30:00.000Z'
          },
          {
            id: 2,
            name: 'Periféricos',
            slug: 'perifericos',
            description: 'Teclados, mouses e acessórios para computadores',
            image_url: null,
            icon: 'mouse',
            display_order: 2,
            is_active: true,
            created_at: '2026-08-16T09:00:00.000Z'
          }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 2,
          totalItems: 3,
          itemsPerPage: 2,
          hasNextPage: true,
          hasPreviousPage: false
        },
        mensagens: ['2 categorias carregadas com sucesso! (Página 1 de 2)']
      }
    } }
  };
  listOperation.responses[401] = {
    description: 'Token ausente ou inválido',
    content: { 'application/json': {
      schema: {
        type: 'object',
        required: ['data', 'mensagens'],
        properties: {
          data: { type: 'object', nullable: true, example: null },
          mensagens: { type: 'array', minItems: 1, items: { type: 'string' } }
        }
      },
      example: { data: null, mensagens: ['Token ausente'] }
    } }
  };
  spec.tags = spec.tags.filter(tag => !['Categories', '🏷️ Categorias'].includes(tag.name));
  spec.tags.push({ name: 'Categories', description: 'Categorias de produtos. Exemplos ilustrativos gerados dos schemas; não são dados consultados em produção.' });
}

module.exports = { applyCategoriesDocumentation };
