const published = require('../../docs/contracts/api.production.json');
const audited = require('../../docs/contracts/response-errors.json');
const { exampleFromSchema } = require('./examples');

// Documentation only. These examples do not participate in request validation.
function schemaFromExample(value) {
  if (value === null) return { type: 'object', nullable: true, example: null };
  if (Array.isArray(value)) return { type: 'array', items: value.length ? schemaFromExample(value[0]) : {}, example: value };
  if (typeof value === 'object') return { type: 'object', properties: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, schemaFromExample(v)])) };
  return { type: typeof value === 'number' ? (Number.isInteger(value) ? 'integer' : 'number') : typeof value, example: value };
}
const json = (example, description = 'Resposta ilustrativa') => ({ description, content: { 'application/json': { schema: schemaFromExample(example), example } } });
const envelope = (data, message = 'Operação realizada com sucesso.') => ({ data, mensagens: [message] });
const cartItem = { id: 1, user_id: '00000000-0000-4000-8000-000000000001', product_id: 1, quantity: 2 };
const order = { id: 1, order_number: 'ORD-001', status: 'pending', total_amount: 199.9 };
const user = { id: '00000000-0000-4000-8000-000000000001', email: 'aluno@example.com', full_name: 'Aluno Exemplo', role: 'customer' };

function completeDocumentation(spec) {
  // Recover published operations omitted by the earlier local documentation.
  // Namespacing preserves the component references without replacing other schemas.
  const scoped = value => {
    if (Array.isArray(value)) return value.map(scoped);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, k === '$ref' ? v.replace('#/components/schemas/', '#/components/schemas/Published') : scoped(v)]));
  };
  for (const [name, schema] of Object.entries(published.components.schemas)) spec.components.schemas[`Published${name}`] = scoped(schema);
  const tags = { Auth: 'Autenticação', Authentication: 'Autenticação', Products: 'Produtos', Suppliers: 'Fornecedores', Cart: 'Carrinho', Orders: 'Pedidos', Reviews: 'Avaliações', Debug: 'Saúde e Debug' };
  for (const [path, methods] of Object.entries(published.paths)) for (const [method, op] of Object.entries(methods)) {
    spec.paths[path] ||= {};
    if (!spec.paths[path][method]) {
      spec.paths[path][method] = scoped(op);
      spec.paths[path][method].tags = (op.tags || []).map(t => tags[t] || t);
    }
  }
  function add(path, method, tag, summary, sample, body, secure = true, status = 200) {
    spec.paths[path] ||= {};
    spec.paths[path][method] ||= {
      tags: [tag], summary, ...(secure ? { security: [{ bearerAuth: [] }] } : {}),
      parameters: [...path.matchAll(/\{([^}]+)\}/g)].map(([, name]) => ({ in: 'path', name, required: true, schema: { type: name === 'fileId' ? 'string' : 'integer' }, example: name === 'fileId' ? 'arquivo-exemplo' : 1 })),
      ...(body ? { requestBody: { required: true, content: { 'application/json': { schema: schemaFromExample(body), example: body } } } } : {}),
      responses: { [status]: json(sample) }
    };
  }
  add('/api/v1/auth/validate', 'post', 'Autenticação', 'Valida campo do formulário', { valid: true, message: 'Email válido' }, { field: 'email', value: 'aluno@example.com' }, false);
  add('/api/v1/suppliers/{id}/unlink', 'post', 'Fornecedores', 'Desvincula produtos do fornecedor', envelope({ updated_count: 1, updated_products: [{ id: 1, name: 'Mouse Gamer', supplier_id: null }], supplier_id: 1 }), { product_ids: [1] });
  add('/api/v1/orders/{id}', 'get', 'Pedidos', 'Detalhes do pedido', envelope({ ...order, items: [{ id: 1, quantity: 1, unit_price: 199.9, subtotal: 199.9, products: { id: 1, name: 'Mouse Gamer', sku: 'MOUSE-001', image_url: null } }] }));
  add('/api/v1/orders/{id}/history', 'get', 'Pedidos', 'Histórico do pedido', envelope({ order_id: 1, order_number: 'ORD-001', current_status: 'pending', timeline: [{ id: 1, order_id: 1, status: 'pending', notes: 'Pedido criado', changed_by: user.id, created_at: '2026-09-07T00:00:00.000Z' }] }));
  add('/api/v1/orders/{id}/payments', 'get', 'Pedidos', 'Pagamentos do pedido', envelope([{ id: 1, order_id: 1, payment_method: 'pix', payment_status: 'pending', amount: 199.9, transaction_id: null, payment_date: null, card_last_digits: null, installments: 1, notes: null, created_at: '2026-09-07T00:00:00.000Z' }]));
  add('/api/v1/debug/simple', 'get', 'Saúde e Debug', 'Diagnóstico simples', { message: 'Debug simples', authHeader: null, headers: { host: 'localhost:3000' }, timestamp: '2026-09-07T00:00:00.000Z' }, null, false);
  add('/api/v1/debug/error-500', 'get', 'Saúde e Debug', 'Simula erro interno', envelope(null, 'Erro interno simulado'), null, true, 500);
  add('/api/v1/admin/hash-password', 'post', 'Saúde e Debug', 'Gera hash de senha', { password: 'Exemplo@123', hash: '$2b$10$hash.ilustrativo', message: 'Use este hash no UPDATE do banco' }, { password: 'Exemplo@123' }, false);
  add('/api/v1/register', 'post', 'Autenticação', 'Cadastro em memória', { success: true, message: 'User created successfully', data: { user: { ...user, role: 'user' }, token: 'jwt.exemplo.token' } }, { email: user.email, password: 'Exemplo@123', full_name: user.full_name }, false, 201);
  for (const [resource, mime] of [['image', 'image/png'], ['pdf', 'application/pdf']]) {
    const path = `/api/v1/products/{id}/${resource}/{fileId}`;
    add(path, 'get', 'Produtos', `Download de ${resource}`, null, null, false);
    spec.paths[path].get.responses[200] = { description: 'Arquivo binário', content: { [mime]: { schema: { type: 'string', format: 'binary' } } } };
  }

  const success = {
    'get /api/v1/auth/me': envelope({ user }),
    'post /api/v1/suppliers': envelope(exampleFromSchema(spec.components.schemas.Supplier, spec.components.schemas)),
    'get /api/v1/cart': envelope([{ ...cartItem, products: { id: 1, name: 'Mouse Gamer', price: 199.9, stock_quantity: 10 } }]),
    'post /api/v1/cart': envelope(cartItem), 'delete /api/v1/cart': envelope(null),
    'patch /api/v1/cart/{id}': envelope(cartItem), 'delete /api/v1/cart/{id}': envelope(null),
    'get /api/v1/orders': { ...envelope([order]), pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
    'post /api/v1/orders': envelope({ id: 1, order_number: 'ORD-001', total: 199.9 }),
    'post /api/v1/reviews': envelope({ id: 1, product_id: 1, user_id: user.id, rating: 5, title: 'Excelente', comment: 'Produto conforme descrito', is_approved: true })
  };
  // Existing item: the cart handler returns 200 instead of 201.
  spec.paths['/api/v1/keepalive'].get.responses[200] = json({ status: 'ok', message: 'Supabase ativo' }, 'Supabase ativo');
  spec.paths['/api/v1/cart'].post.responses[200] ||= json(success['post /api/v1/cart'], 'Item existente atualizado');
  for (const [path, methods] of Object.entries(spec.paths)) for (const [method, op] of Object.entries(methods)) {
    const key = `${method} ${path}`;
    for (const [status, item] of Object.entries(audited[key]?.errors || {})) {
      op.responses[status] ||= json(item.example, status === '500' ? 'Erro interno do servidor' : `Erro HTTP ${status}`);
    }
    for (const [status, response] of Object.entries(op.responses || {})) {
      if (response.$ref) continue;
      if (!response.content) {
        const sample = audited[key]?.errors[status]?.example || (Number(status) >= 400 ? envelope(null, response.description) : success[key]);
        if (!sample) throw new Error(`Missing reviewed response example: ${key} ${status}`);
        response.content = json(sample).content;
      }
    }
  }
  // The original file placed reusable responses at the root instead of components.
  spec.components.responses = { ...spec.responses, ...spec.components.responses };
  delete spec.responses;
  function enrich(value) {
    if (!value || typeof value !== 'object') return;
    if (value.type === 'null') { value.type = 'object'; value.nullable = true; value.example = null; }
    if (value.content) for (const media of Object.values(value.content)) {
      const sample = Object.hasOwn(media, 'example') ? media.example : Object.values(media.examples || {}).find(e => Object.hasOwn(e, 'value'))?.value;
      if (!media.schema && sample !== undefined) {
        const samples = Object.hasOwn(media, 'example') ? [sample] : Object.values(media.examples).map(e => e.value);
        media.schema = samples.length === 1 ? schemaFromExample(sample) : { anyOf: samples.map(schemaFromExample) };
      }
      if (!media.schema) throw new Error('Response/request content without schema');
      if (sample === undefined && media.schema.format !== 'binary') media.example = exampleFromSchema(media.schema, spec.components.schemas);
    }
    Object.values(value).forEach(enrich);
  }
  enrich(spec);
  require('./envelope').normalizeResponseDocumentation(spec);
}

module.exports = { completeDocumentation, schemaFromExample };
