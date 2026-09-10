const ref = name => ({ $ref: `#/components/schemas/Suppliers${name}` });

const nullableString = (example, extra = {}) => ({ type: 'string', nullable: true, example, ...extra });
const messages = { type: 'array', minItems: 1, items: { type: 'string' } };

function response(description, schema, example) {
  return { description, content: { 'application/json': { schema, example } } };
}

function envelope(data, example, message) {
  return response(message, {
    type: 'object', required: ['data', 'mensagens'],
    properties: { data, mensagens: messages }
  }, { data: example, mensagens: [message] });
}

function error(description, message) {
  return response(description, ref('Error'), { data: null, mensagens: [message] });
}

function unauthorized() {
  return {
    description: 'Token ausente ou inválido',
    content: { 'application/json': {
      schema: ref('Unauthorized'),
      examples: {
        TokenAusente: { summary: 'Token não enviado', value: { data: null, mensagens: ['Token ausente'] } },
        TokenInvalido: { summary: 'Token inválido ou expirado', value: { data: null, expires_at: '2026-09-10T18:00:00.000Z', mensagens: ['Token inválido'] } }
      }
    } }
  };
}

function applySuppliersDocumentation(spec) {
  const secureOperation = (summary, tag = 'Fornecedores') => ({
    tags: [tag], summary, security: [{ bearerAuth: [] }], responses: {}
  });
  spec.paths['/api/v1/suppliers'] ||= {
    get: secureOperation('Lista fornecedores com busca opcional'),
    post: secureOperation('Cria fornecedor')
  };
  spec.paths['/api/v1/suppliers/{id}'] ||= {
    get: secureOperation('Obtém detalhes de um fornecedor'),
    put: secureOperation('Atualiza um fornecedor existente'),
    delete: secureOperation('Exclui um fornecedor')
  };
  spec.paths['/api/v1/suppliers/{id}/products'] ||= {
    get: secureOperation('Lista produtos de um fornecedor')
  };
  spec.paths['/api/v1/suppliers/{id}/unlink'] ||= {
    post: secureOperation('Desvincula produtos do fornecedor')
  };

  const schemas = spec.components.schemas;
  const supplierFields = {
    id: { type: 'integer', example: 1 },
    company_name: { type: 'string', example: 'Tech Brasil Ltda.' },
    contact_name: nullableString('Marina Costa'),
    contact_title: nullableString('Gerente comercial'),
    email: nullableString('contato@techbrasil.example', { format: 'email' }),
    phone: nullableString('11987654321'),
    cnpj: nullableString('12345678000195'),
    street: nullableString('Avenida Central, 100'),
    city: nullableString('São Paulo'),
    zip_code: nullableString('01001000'),
    country: nullableString('Brazil'),
    website: nullableString('https://techbrasil.example'),
    rating: { type: 'number', nullable: true, example: 4.5 },
    is_active: { type: 'boolean', nullable: true, example: true },
    notes: nullableString('Fornecedor homologado'),
    created_at: nullableString('2026-08-15T10:30:00.000Z', { format: 'date-time' })
  };
  const requiredSupplierFields = Object.keys(supplierFields);

  schemas.SuppliersView = {
    type: 'object', required: [...requiredSupplierFields, 'uf'],
    properties: { ...supplierFields, uf: nullableString('SP') }
  };
  schemas.SuppliersStored = {
    type: 'object', required: [...requiredSupplierFields, 'state'],
    properties: { ...supplierFields, state: nullableString('SP') }
  };
  schemas.SuppliersError = {
    type: 'object', required: ['data', 'mensagens'],
    properties: { data: { type: 'object', nullable: true, example: null }, mensagens: messages }
  };
  schemas.SuppliersUnauthorized = {
    type: 'object', required: ['data', 'mensagens'],
    properties: {
      data: { type: 'object', nullable: true, example: null },
      expires_at: nullableString(null, { format: 'date-time' }),
      mensagens: messages
    }
  };
  schemas.SuppliersCreateRequest = {
    type: 'object', required: ['company_name', 'contact_name', 'email', 'phone', 'cnpj', 'uf'],
    properties: {
      company_name: { type: 'string', minLength: 3, maxLength: 100, example: 'Tech Brasil Ltda.' },
      contact_name: { type: 'string', minLength: 5, maxLength: 80, example: 'Marina Costa' },
      email: { type: 'string', format: 'email', example: 'contato@techbrasil.example' },
      phone: { type: 'string', pattern: '^[0-9() +.-]*$', example: '11987654321', description: 'Telefone com 10 ou 11 dígitos; a formatação é removida pela API.' },
      cnpj: { type: 'string', pattern: '^[0-9.\\/-]*$', example: '12345678000195', description: 'CNPJ com 14 dígitos; a formatação é removida pela API.' },
      uf: { type: 'string', minLength: 2, maxLength: 2, pattern: '^[A-Za-z]{2}$', example: 'SP' }
    }
  };
  schemas.SuppliersUpdateRequest = {
    ...schemas.SuppliersCreateRequest,
    properties: {
      ...schemas.SuppliersCreateRequest.properties,
      phone: { type: 'string', pattern: '^\\([0-9]{2}\\) [0-9]{5}-[0-9]{4}$', example: '(11) 98765-4321' }
    }
  };
  schemas.SuppliersProductsPagination = {
    type: 'object', required: ['page', 'limit', 'total', 'totalPages'],
    properties: {
      page: { type: 'integer', example: 1 }, limit: { type: 'integer', example: 10 },
      total: { type: 'integer', example: 2 }, totalPages: { type: 'integer', example: 1 }
    }
  };
  schemas.SuppliersProduct = {
    type: 'object', required: ['id', 'name', 'price', 'stock_quantity', 'sku', 'categories', 'suppliers'],
    properties: {
      id: { type: 'integer', example: 1 }, name: { type: 'string', example: 'Mouse sem fio' },
      price: { type: 'number', example: 129.9 }, stock_quantity: { type: 'integer', nullable: true, example: 20 },
      sku: { type: 'string', example: 'MOUSE-001' },
      categories: { type: 'object', nullable: true, properties: { name: { type: 'string', example: 'Periféricos' } } },
      suppliers: { type: 'object', nullable: true, properties: { company_name: { type: 'string', example: 'Tech Brasil Ltda.' } } }
    }
  };
  schemas.SuppliersUnlinkRequest = {
    type: 'object', required: ['product_ids'],
    properties: { product_ids: { type: 'array', minItems: 1, items: { type: 'integer', minimum: 1 }, example: [1, 2] } }
  };
  schemas.SuppliersUnlinkResult = {
    type: 'object', required: ['updated_count', 'updated_products', 'supplier_id'],
    properties: {
      updated_count: { type: 'integer', example: 2 }, supplier_id: { type: 'integer', example: 1 },
      updated_products: { type: 'array', items: { type: 'object', required: ['id', 'name', 'supplier_id'], properties: {
        id: { type: 'integer' }, name: { type: 'string' }, supplier_id: { type: 'integer', nullable: true, example: null }
      } } }
    }
  };

  const view1 = {
    id: 1, company_name: 'Tech Brasil Ltda.', contact_name: 'Marina Costa', contact_title: 'Gerente comercial',
    email: 'contato@techbrasil.example', phone: '11987654321', cnpj: '12345678000195',
    street: 'Avenida Central, 100', city: 'São Paulo', zip_code: '01001000', country: 'Brazil',
    website: 'https://techbrasil.example', rating: 4.5, is_active: true, notes: 'Fornecedor homologado',
    created_at: '2026-08-15T10:30:00.000Z', uf: 'SP'
  };
  const view2 = {
    id: 2, company_name: 'Minas Componentes S.A.', contact_name: 'Carlos Mendes', contact_title: null,
    email: 'vendas@minascomponentes.example', phone: '3533334444', cnpj: '98765432000110',
    street: null, city: 'Pouso Alegre', zip_code: null, country: 'Brazil', website: null,
    rating: 4, is_active: true, notes: null, created_at: '2026-08-16T09:00:00.000Z', uf: 'MG'
  };
  const stored = ({ uf, ...supplier }) => ({ ...supplier, state: uf });
  const id = { in: 'path', name: 'id', required: true, schema: { type: 'integer', minimum: 1 }, example: 1 };
  const jsonBody = (name, schema) => ({ required: true, content: { 'application/json': {
    schema,
    example: Object.fromEntries(Object.entries(schemas[`Suppliers${name}`].properties).map(([key, value]) => [key, value.example]))
  } } });

  const collection = spec.paths['/api/v1/suppliers'];
  collection.get.parameters = [{ in: 'query', name: 'search', required: false, schema: { type: 'string' }, example: 'Tech', description: 'Busca por ID numérico, razão social, contato ou e-mail.' }];
  collection.get.responses = {
    200: envelope({ type: 'array', items: ref('View') }, [view1, view2], 'Fornecedores carregados com sucesso!'),
    401: unauthorized(),
    500: error('Erro interno ao carregar fornecedores', 'Erro ao carregar fornecedores.')
  };
  collection.post.requestBody = jsonBody('CreateRequest', ref('CreateRequest'));
  collection.post.responses = {
    201: envelope(ref('Stored'), stored(view1), 'Fornecedor criado com sucesso!'),
    400: error('Dados inválidos', 'Razão social da empresa é obrigatória.'),
    401: unauthorized(),
    409: error('E-mail ou CNPJ duplicado', 'Já existe um fornecedor com este CNPJ.')
  };

  const item = spec.paths['/api/v1/suppliers/{id}'];
  for (const operation of Object.values(item)) operation.parameters = [id];
  item.get.responses = {
    200: envelope(ref('View'), view1, 'Fornecedor encontrado com sucesso.'),
    400: error('ID inválido', 'ID do fornecedor inválido. Deve ser um número positivo.'),
    401: unauthorized(), 404: error('Fornecedor não encontrado', 'Fornecedor com ID 1 não encontrado.'),
    500: error('Erro interno ao buscar fornecedor', 'Erro interno ao buscar detalhes do fornecedor.')
  };
  item.put.requestBody = jsonBody('UpdateRequest', ref('UpdateRequest'));
  item.put.responses = {
    200: envelope(ref('Stored'), stored({ ...view1, phone: '(11) 98765-4321' }), 'Fornecedor atualizado com sucesso!'),
    400: error('Dados inválidos', 'UF inválida. Informe a sigla de 2 letras do estado (ex: SP, RJ, MG).'),
    401: unauthorized(), 404: error('Fornecedor não encontrado', 'Fornecedor com ID 1 não encontrado.'),
    409: error('E-mail ou CNPJ duplicado', 'Já existe um fornecedor com este CNPJ.'),
    500: error('Erro interno ao atualizar fornecedor', 'Erro ao atualizar fornecedor.')
  };
  item.delete.responses = {
    200: envelope({ type: 'object', nullable: true, example: null }, null, 'Fornecedor excluído com sucesso!'),
    400: error('Fornecedor em uso ou ID inválido', 'Não é possível excluir. Este fornecedor está sendo usado por produtos.'),
    401: unauthorized(), 404: error('Fornecedor não encontrado', 'Fornecedor com ID 1 não encontrado.'),
    500: error('Erro interno ao excluir fornecedor', 'Erro ao excluir fornecedor.')
  };

  const products = spec.paths['/api/v1/suppliers/{id}/products'].get;
  products.parameters = [id,
    { in: 'query', name: 'page', schema: { type: 'integer', default: 1 }, example: 1 },
    { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 }, example: 10 }
  ];
  const productExamples = [
    { id: 1, name: 'Mouse sem fio', price: 129.9, stock_quantity: 20, sku: 'MOUSE-001', categories: { name: 'Periféricos' }, suppliers: { company_name: view1.company_name } },
    { id: 2, name: 'Teclado mecânico', price: 249.9, stock_quantity: 12, sku: 'TEC-002', categories: { name: 'Periféricos' }, suppliers: { company_name: view1.company_name } }
  ];
  products.responses = {
    200: response('Lista paginada de produtos do fornecedor', { type: 'object', required: ['data', 'pagination', 'mensagens'], properties: {
      data: { type: 'array', items: ref('Product') }, pagination: ref('ProductsPagination'), mensagens: messages
    } }, { data: productExamples, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }, mensagens: [`2 produtos encontrados para o fornecedor ${view1.company_name}.`] }),
    400: error('ID inválido', 'ID do fornecedor inválido. Deve ser um número positivo.'),
    401: unauthorized(), 404: error('Fornecedor não encontrado', 'Fornecedor com ID 1 não encontrado.'),
    500: error('Erro interno ao buscar produtos', 'Erro interno ao buscar produtos do fornecedor.')
  };

  const unlink = spec.paths['/api/v1/suppliers/{id}/unlink'].post;
  unlink.parameters = [id];
  unlink.requestBody = { required: true, content: { 'application/json': { schema: ref('UnlinkRequest'), example: { product_ids: [1, 2] } } } };
  unlink.responses = {
    200: envelope(ref('UnlinkResult'), { updated_count: 2, updated_products: [
      { id: 1, name: 'Mouse sem fio', supplier_id: null }, { id: 2, name: 'Teclado mecânico', supplier_id: null }
    ], supplier_id: 1 }, '2 produto(s) desvinculado(s) do fornecedor com sucesso!'),
    400: error('Requisição ou IDs inválidos', 'Nenhum ID de produto válido fornecido.'),
    401: unauthorized(), 404: error('Fornecedor ou produtos não encontrados', 'Nenhum produto encontrado vinculado a este fornecedor.'),
    500: error('Erro interno ao desvincular produtos', 'Erro ao desvincular produtos do fornecedor.')
  };
}

module.exports = { applySuppliersDocumentation };
