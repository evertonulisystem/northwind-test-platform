const ref = name => ({ $ref: `#/components/schemas/Products${name}` });
const messages = { type: 'array', minItems: 1, items: { type: 'string' } };
const nullableString = (example, extra = {}) => ({ type: 'string', nullable: true, example, ...extra });

function response(description, schema, example) {
  return { description, content: { 'application/json': { schema, example } } };
}
function envelope(data, example, message, extras = {}) {
  return response(message, {
    type: 'object', required: ['data', ...Object.keys(extras), 'mensagens'],
    properties: { data, ...Object.fromEntries(Object.keys(extras).map(key => [key, extras[key].schema])), mensagens: messages }
  }, { data: example, ...Object.fromEntries(Object.entries(extras).map(([key, value]) => [key, value.example])), mensagens: [message] });
}
function error(description, message, messagesExample) {
  return response(description, ref('Error'), { data: null, mensagens: messagesExample || [message] });
}
function unauthorized(withExpiry = true) {
  const examples = {
    TokenAusente: { value: { data: null, mensagens: ['Token ausente'] } },
    TokenInvalido: { value: withExpiry
      ? { data: null, expires_at: '2026-09-10T18:00:00.000Z', mensagens: ['Token inválido'] }
      : { data: null, mensagens: ['Token inválido'] } }
  };
  return { description: 'Token ausente ou inválido', content: { 'application/json': { schema: ref(withExpiry ? 'Unauthorized' : 'Error'), examples } } };
}

function applyProductsDocumentation(spec) {
  const secureGet = summary => ({ get: { tags: ['Products'], summary, security: [{ bearerAuth: [] }], responses: {} } });
  spec.paths['/api/v1/products/{id}/reviews'] ||= secureGet('Lista avaliações aprovadas de um produto');
  spec.paths['/api/v1/products/{id}/image/{fileId}'] ||= secureGet('Baixa uma imagem específica do produto');
  spec.paths['/api/v1/products/{id}/pdf/{fileId}'] ||= secureGet('Baixa um PDF específico do produto');
  const schemas = spec.components.schemas;
  const relationFields = {
    categories: { type: 'object', nullable: true, required: ['name'], properties: { name: { type: 'string' } } },
    suppliers: { type: 'object', nullable: true, required: ['company_name'], properties: { company_name: { type: 'string' } } }
  };
  const coreFields = {
    id: { type: 'integer' }, name: { type: 'string' }, price: { type: 'number' },
    stock_quantity: { type: 'integer' }, sku: { type: 'string' },
    category_id: { type: 'integer', nullable: true }, supplier_id: { type: 'integer', nullable: true },
    slug: { type: 'string' }, ...relationFields
  };
  schemas.ProductsListItem = { type: 'object', required: [...Object.keys(coreFields), 'is_active'], properties: {
    ...coreFields, is_active: { type: 'boolean', nullable: true }
  } };
  schemas.ProductsDetail = { type: 'object', required: Object.keys(coreFields), properties: coreFields };
  schemas.ProductsSearchResult = { type: 'object', required: [...Object.keys(coreFields), 'created_at', 'updated_at'], properties: {
    ...coreFields, created_at: nullableString('2026-08-15T10:30:00.000Z', { format: 'date-time' }),
    updated_at: nullableString('2026-09-01T14:20:00.000Z', { format: 'date-time' })
  } };
  schemas.ProductsStored = { type: 'object', required: ['id', 'name', 'slug', 'price', 'stock_quantity', 'sku'], properties: {
    id: { type: 'integer' }, category_id: { type: 'integer', nullable: true }, supplier_id: { type: 'integer', nullable: true },
    name: { type: 'string' }, slug: { type: 'string' }, description: nullableString(null), short_description: nullableString(null),
    price: { type: 'number' }, cost_price: { type: 'number', nullable: true }, stock_quantity: { type: 'integer' },
    reorder_level: { type: 'integer', nullable: true }, image_url: nullableString(null, { format: 'uri' }), sku: { type: 'string' },
    barcode: nullableString(null), weight: { type: 'number', nullable: true }, is_active: { type: 'boolean', nullable: true },
    is_featured: { type: 'boolean', nullable: true }, discount_percentage: { type: 'number', nullable: true },
    rating: { type: 'number', nullable: true }, reviews_count: { type: 'integer', nullable: true },
    views_count: { type: 'integer', nullable: true }, sales_count: { type: 'integer', nullable: true },
    created_at: nullableString('2026-09-10T12:00:00.000Z', { format: 'date-time' })
  } };
  schemas.ProductsPagination = { type: 'object', required: ['page', 'limit', 'total', 'totalPages'], properties: {
    page: { type: 'integer', minimum: 1 }, limit: { type: 'integer', minimum: 1 }, total: { type: 'integer', minimum: 0 }, totalPages: { type: 'integer', minimum: 0 }
  } };
  schemas.ProductsError = { type: 'object', required: ['data', 'mensagens'], properties: {
    data: { type: 'object', nullable: true, example: null }, mensagens: messages
  } };
  schemas.ProductsUnauthorized = { type: 'object', required: ['data', 'mensagens'], properties: {
    data: { type: 'object', nullable: true, example: null }, expires_at: nullableString(null, { format: 'date-time' }), mensagens: messages
  } };
  schemas.ProductsFile = { type: 'object', required: ['id', 'filename', 'url'], properties: {
    id: { type: 'string', format: 'uuid' }, filename: { type: 'string' }, url: { type: 'string' }
  } };
  schemas.ProductsUpload = { type: 'object', required: ['id', 'filename', 'size', 'mimetype', 'productId', 'url'], properties: {
    ...schemas.ProductsFile.properties, size: { type: 'integer' }, mimetype: { type: 'string' }, productId: { type: 'integer' }
  } };
  schemas.ProductsReview = { type: 'object', required: ['id', 'product_id', 'user_id', 'rating', 'title', 'comment', 'is_verified_purchase', 'helpful_count', 'created_at'], properties: {
    id: { type: 'integer' }, product_id: { type: 'integer' }, user_id: { type: 'string', format: 'uuid' }, rating: { type: 'integer' },
    title: nullableString('Excelente produto'), comment: nullableString('Funcionou conforme esperado.'),
    is_verified_purchase: { type: 'boolean' }, helpful_count: { type: 'integer' }, created_at: { type: 'string', format: 'date-time' }
  } };
  schemas.ProductsValidation = { type: 'object', required: ['valid', 'errors', 'warnings', 'suggestions'], properties: {
    valid: { type: 'boolean' }, errors: { type: 'array', items: { type: 'string' } }, warnings: { type: 'array', items: { type: 'string' } }, suggestions: { type: 'array', items: { type: 'string' } }
  } };

  const base = { id: 12, name: 'Teclado Mecânico', price: 349.9, stock_quantity: 18, sku: 'TEC-MEC-012', category_id: 3, supplier_id: 2, slug: 'teclado-mecanico', categories: { name: 'Periféricos' }, suppliers: { company_name: 'Tech Brasil Ltda.' } };
  const second = { id: 13, name: 'Mouse Sem Fio', price: 129.9, stock_quantity: 35, sku: 'MOUSE-013', category_id: 3, supplier_id: 2, slug: 'mouse-sem-fio', categories: { name: 'Periféricos' }, suppliers: { company_name: 'Tech Brasil Ltda.' } };
  const stored = { id: 14, category_id: 3, supplier_id: 2, name: 'Suporte para Notebook', slug: 'suporte-para-notebook', description: null, short_description: null, price: 159.9, cost_price: null, stock_quantity: 20, reorder_level: 5, image_url: null, sku: 'SUP-NOTE-014', barcode: null, weight: null, is_active: true, is_featured: false, discount_percentage: 0, rating: 0, reviews_count: 0, views_count: 0, sales_count: 0, created_at: '2026-09-10T12:00:00.000Z' };
  const id = { in: 'path', name: 'id', required: true, schema: { type: 'integer', minimum: 1 }, example: 12 };
  const fileId = { in: 'path', name: 'fileId', required: true, schema: { type: 'string', format: 'uuid' }, example: '123e4567-e89b-42d3-a456-426614174000' };

  const collection = spec.paths['/api/v1/products'];
  collection.get.responses = {
    200: response('Lista paginada de produtos carregada com sucesso', { type: 'object', required: ['data', 'pagination', 'mensagens'], properties: { data: { type: 'array', items: ref('ListItem') }, pagination: ref('Pagination'), mensagens: messages } }, { data: [{ ...base, is_active: true }, { ...second, is_active: true }], pagination: { page: 1, limit: 10, total: 12, totalPages: 2 }, mensagens: ['Produtos carregados com sucesso.'] }),
    400: error('Parâmetros de ordenação inválidos', "Campo de ordenação 'invalido' não é permitido. Use: id, name, price, stock_quantity, sku, created_at."),
    401: unauthorized(), 404: error('Nenhum produto encontrado', 'Nenhum produto encontrado para os filtros aplicados.'),
    500: response('Erro interno ao carregar produtos', { type: 'object', required: ['data', 'pagination', 'mensagens'], properties: { data: { type: 'array', items: ref('ListItem') }, pagination: ref('Pagination'), mensagens: messages } }, { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }, mensagens: ['Erro interno ao carregar produtos.'] })
  };
  collection.post.responses = {
    201: response('Produto criado com sucesso', { type: 'object', required: ['data', 'mensagens'], properties: { data: ref('Stored'), mensagens: messages } }, { data: stored, mensagens: ['Produto criado com sucesso!', 'Verificado: Salvo no banco Supabase (projeto-exemplo.supabase.co)'] }),
    400: error('Dados inválidos', 'Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.'),
    401: unauthorized(), 409: error('Nome, slug ou SKU duplicado', 'Já existe um produto com esse SKU.')
  };

  const item = spec.paths['/api/v1/products/{id}'];
  for (const operation of Object.values(item)) operation.parameters = [id];
  const success = message => envelope(ref('Detail'), base, message);
  item.get.responses = { 200: success('Produto carregado com sucesso.'), 400: error('ID inválido', 'ID do produto inválido. Deve ser um número positivo.'), 401: unauthorized(), 404: error('Produto não encontrado', 'Produto com ID 12 não encontrado.'), 500: error('Erro interno', 'Erro interno ao buscar produto.') };
  item.put.responses = { 200: success('Produto atualizado com sucesso!'), 400: error('Dados inválidos', 'SKU é obrigatório.'), 401: unauthorized(), 404: error('Produto não encontrado', 'Produto com ID 12 não encontrado.'), 409: error('Nome, slug ou SKU duplicado', 'Já existe outro produto com esse SKU.'), 500: error('Erro interno', 'Erro ao atualizar produto.') };
  item.patch.responses = { 200: success('Produto atualizado com sucesso!'), 400: error('Dados inválidos', 'Pelo menos um campo deve ser fornecido para atualização.'), 401: unauthorized(), 404: error('Produto não encontrado', 'Produto com ID 12 não encontrado.'), 409: error('Nome, slug ou SKU duplicado', 'Já existe outro produto com esse nome/slug.'), 500: error('Erro interno', 'Erro ao atualizar produto.') };
  item.delete.responses = { 200: envelope({ type: 'object', nullable: true }, null, 'Produto excluído com sucesso!'), 400: error('ID inválido', 'ID do produto inválido. Deve ser um número positivo.'), 401: unauthorized(), 404: error('Produto não encontrado', 'Produto com ID 12 não encontrado.'), 500: error('Erro interno', 'Não é possível excluir este produto pois existem dados vinculados a ele.') };

  const search = spec.paths['/api/v1/products/search'].get;
  search.responses = { 200: envelope(ref('SearchResult'), { ...base, created_at: '2026-08-15T10:30:00.000Z', updated_at: '2026-09-01T14:20:00.000Z' }, 'Produto encontrado com sucesso.'), 400: error('Parâmetro ausente ou inválido', 'Pelo menos um parâmetro deve ser fornecido: id, sku, slug ou name.'), 401: unauthorized(), 404: error('Produto não encontrado', 'Produto não encontrado.'), 500: error('Erro interno', 'Erro interno ao buscar produto.') };

  const validate = spec.paths['/api/v1/products/validate'].post;
  validate.responses = {
    200: envelope(ref('Validation'), { valid: true, errors: [], warnings: [], suggestions: ['Considere adicionar informações de compatibilidade'] }, 'Produto válido para cadastro'),
    400: envelope(ref('Validation'), { valid: false, errors: ['JSON inválido'], warnings: [], suggestions: ['Verifique o formato do JSON enviado'] }, '', {}),
    401: envelope(ref('Validation'), { valid: false, errors: ['Token ausente'], warnings: [], suggestions: [] }, '', {}),
    500: envelope(ref('Validation'), { valid: false, errors: ['Erro interno na validação'], warnings: [], suggestions: ['Tente novamente em instantes'] }, '', {})
  };
  for (const status of [400, 401, 500]) validate.responses[status].description = status === 400 ? 'JSON inválido' : status === 401 ? 'Token ausente ou inválido' : 'Erro interno na validação';

  spec.paths['/api/v1/products/simulate-error'].get.responses = { 401: unauthorized(), 500: error('Erro interno simulado', 'Erro interno simulado: falha na conexão com o serviço de processamento de dados.') };
  const cleanup = spec.paths['/api/v1/products/storage/cleanup'].delete;
  cleanup.responses = { 200: envelope({ type: 'object', required: ['origin'], properties: { origin: { type: 'string', enum: ['supabase', 'localhost'] } } }, { origin: 'supabase' }, 'FAXINA CONCLUÍDA: Todos os arquivos do bucket "products" na nuvem foram apagados!'), 403: error('Chave administrativa ausente ou inválida', 'Acesso negado. Você não tem permissão para limpar o storage. Passe a chave correta no header "x-admin-key".'), 500: error('Erro ao limpar o storage', 'Erro interno ao executar a faxina.', ['Erro interno ao executar a faxina.', 'Falha temporária no serviço de armazenamento.']) };

  const review = spec.paths['/api/v1/products/{id}/reviews'].get;
  review.parameters = [id];
  review.responses = { 200: response('Avaliações aprovadas do produto', { type: 'object', required: ['data', 'product', 'averageRating', 'totalReviews', 'mensagens'], properties: { data: { type: 'array', items: ref('Review') }, product: { type: 'object', required: ['id', 'name'], properties: { id: { type: 'integer' }, name: { type: 'string' } } }, averageRating: { type: 'number', nullable: true }, totalReviews: { type: 'integer' }, mensagens: messages } }, { data: [{ id: 7, product_id: 12, user_id: '123e4567-e89b-42d3-a456-426614174000', rating: 5, title: 'Excelente produto', comment: 'Funcionou conforme esperado.', is_verified_purchase: true, helpful_count: 3, created_at: '2026-09-05T10:00:00.000Z' }], product: { id: 12, name: 'Teclado Mecânico' }, averageRating: 5, totalReviews: 1, mensagens: ['1 avaliação(ões) encontrada(s).'] }), 400: error('ID inválido', 'ID do produto inválido.'), 401: unauthorized(false), 404: error('Produto não encontrado', 'Produto não encontrado.'), 500: error('Erro interno', 'Erro interno ao buscar avaliações do produto.') };

  for (const kind of ['image', 'pdf']) {
    const operation = spec.paths[`/api/v1/products/{id}/${kind}`];
    const label = kind === 'image' ? 'imagem' : 'PDF';
    const mime = kind === 'image' ? 'image/png' : 'application/pdf';
    const filename = kind === 'image' ? '123e4567-e89b-42d3-a456-426614174000_produto.png' : '123e4567-e89b-42d3-a456-426614174000_manual.pdf';
    const url = `/api/v1/products/12/${kind}/123e4567-e89b-42d3-a456-426614174000`;
    operation.get.parameters = [id];
    operation.get.responses = { 200: envelope({ type: 'array', items: ref('File') }, [{ id: '123e4567-e89b-42d3-a456-426614174000', filename, url }], `Lista de ${kind === 'image' ? 'imagens' : 'PDFs'} recuperada com sucesso.`), 500: error('Erro na listagem', `Erro ao buscar ${kind === 'image' ? 'imagens' : 'PDFs'}.`, [`Erro ao buscar ${kind === 'image' ? 'imagens' : 'PDFs'}.`, 'Falha temporária no serviço de armazenamento.']) };
    operation.post.parameters = [id];
    operation.post.responses = { 200: envelope(ref('Upload'), { id: '123e4567-e89b-42d3-a456-426614174000', filename, size: 245760, mimetype: mime, productId: 12, url }, `Upload ${kind === 'image' ? 'da imagem' : 'do PDF'} realizado com sucesso!`), 400: error('ID ou arquivo inválido', 'ID do produto inválido.'), 401: unauthorized(false), 404: error('Produto não encontrado', 'Produto com ID 12 não encontrado.'), 500: error('Erro no upload', 'Erro interno ao processar upload.', ['Erro interno ao processar upload.', 'Falha temporária no serviço de armazenamento.']) };
    const download = spec.paths[`/api/v1/products/{id}/${kind}/{fileId}`].get;
    download.parameters = [id, fileId];
    download.responses = {
      200: { description: `Arquivo ${label} binário`, content: { [mime]: { schema: { type: 'string', format: 'binary' } } } },
      404: error(`${label} não encontrado`, `${kind === 'image' ? 'Imagem' : 'PDF'} não encontrado para este ID.`),
      500: error('Erro interno no download', `Erro interno ao buscar ${kind === 'image' ? 'a imagem' : 'o PDF'}.`, [`Erro interno ao buscar ${kind === 'image' ? 'a imagem' : 'o PDF'}.`, 'Falha temporária no serviço de armazenamento.'])
    };
  }
}

module.exports = { applyProductsDocumentation };
