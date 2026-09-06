
# 06 - Matriz de Cobertura de Mensagens e Testes

> Relatório de cobertura de mensagens em diferentes camadas do sistema, com identificação de mensagens sem testes

---

## Matriz de Cobertura

| Mensagem | Tipo | Endpoint | Arquivo | Testes Existentes | Caso de Teste Recomendado |
|----------|------|----------|---------|--------------------|----------------------------|
| Token ausente | Erro Autenticação | Todos autenticados | Vários | ✅ Sim (implícito) | CT-Auth-001 |
| Token inválido | Erro Autenticação | Todos autenticados | Vários | ✅ Sim (implícito) | CT-Auth-002 |
| Token expirado | Erro Autenticação | Todos autenticados | Vários | ⚠️ Não | Criar teste com token expirado |
| Produto criado com sucesso! | Sucesso | POST /api/v1/products | app/api/v1/products/route.js | ⚠️ Não | CT-Prod-005 |
| Produto atualizado com sucesso! | Sucesso | PUT /api/v1/products/:id | app/api/v1/products/[id]/route.js | ⚠️ Não | CT-Prod-009 |
| Produto excluído com sucesso! | Sucesso | DELETE /api/v1/products/:id | app/api/v1/products/[id]/route.js | ⚠️ Não | CT-Prod-010 |
| Campos obrigatórios não preenchidos: {campos} | Validação | POST /api/v1/products | app/api/v1/products/route.js | ⚠️ Não | CT-Prod-001 |
| O preço deve ser um valor positivo maior que zero. | Validação | POST /api/v1/products | app/api/v1/products/route.js | ⚠️ Não | CT-Prod-002 |
| A quantidade em estoque deve ser um número inteiro maior ou igual a zero. | Validação | POST /api/v1/products | app/api/v1/products/route.js | ⚠️ Não | CT-Prod-003 |
| Já existe um produto com esse nome/slug. | Conflito | POST /api/v1/products | app/api/v1/products/route.js | ⚠️ Não | CT-Prod-004 |
| Já existe um produto com esse SKU. | Conflito | POST /api/v1/products | app/api/v1/products/route.js | ⚠️ Não | CT-Prod-004 |
| Categoria selecionada não existe. Escolha uma categoria válida. | Validação | POST /api/v1/products | app/api/v1/products/route.js | ⚠️ Não | Criar teste com category_id inválido |
| Fornecedor selecionado não existe. Escolha um fornecedor válido. | Validação | POST /api/v1/products | app/api/v1/products/route.js | ⚠️ Não | Criar teste com supplier_id inválido |
| Upload da imagem realizado com sucesso! | Sucesso | POST /api/v1/products/:id/image | app/api/v1/products/[id]/image/route.js | ⚠️ Não | CT-Prod-011 |
| Apenas arquivos PNG são permitidos para imagem do produto. | Validação | POST /api/v1/products/:id/image | app/api/v1/products/[id]/image/route.js | ⚠️ Não | CT-Prod-012 |
| Arquivo muito grande. Tamanho máximo permitido: 2MB. | Validação | POST /api/v1/products/:id/image | app/api/v1/products/[id]/image/route.js | ⚠️ Não | CT-Prod-013 |
| Campo de ordenação "{sortBy}" não é permitido. Use: ... | Validação | GET /api/v1/products | app/api/v1/products/route.js | ⚠️ Não | CT-Prod-015 |
| Ordem "{order}" não é permitida. Use: asc ou desc. | Validação | GET /api/v1/products | app/api/v1/products/route.js | ⚠️ Não | Criar teste com order inválida |
| Nenhum produto encontrado para os filtros aplicados. | Erro Não Encontrado | GET /api/v1/products | app/api/v1/products/route.js | ⚠️ Não | Criar teste com filtro que não retorne resultados |
| Nome e descrição são obrigatórios. | Validação | POST /api/v1/categories | app/api/v1/categories/route.js | ⚠️ Não | CT-Cat-001 |
| Descrição deve ter no máximo 200 caracteres. | Validação | POST /api/v1/categories | app/api/v1/categories/route.js | ⚠️ Não | CT-Cat-002 |
| Categoria criada com sucesso! | Sucesso | POST /api/v1/categories | app/api/v1/categories/route.js | ⚠️ Não | CT-Cat-003 |
| Categoria atualizada com sucesso! | Sucesso | PUT /api/v1/categories/:id | app/api/v1/categories/route.js | ⚠️ Não | CT-Cat-004 |
| Categoria excluída com sucesso! | Sucesso | DELETE /api/v1/categories/:id | app/api/v1/categories/route.js | ⚠️ Não | CT-Cat-005 |
| Fornecedor criado com sucesso! | Sucesso | POST /api/v1/suppliers | app/api/v1/suppliers/route.js | ⚠️ Não | CT-For-002 |
| Fornecedor atualizado com sucesso! | Sucesso | PUT /api/v1/suppliers/:id | app/api/v1/suppliers/route.js | ⚠️ Não | CT-For-003 |
| Fornecedor excluído com sucesso! | Sucesso | DELETE /api/v1/suppliers/:id | app/api/v1/suppliers/route.js | ⚠️ Não | CT-For-004 |
| Você precisa estar logado. | Erro Autenticação | Frontend | Vários | ⚠️ Não | CT-Front-004 |
| Erro de conexão. | Erro Rede | Frontend | Vários | ⚠️ Não | Criar teste com servidor desligado |

---

## Resumo de Cobertura

| Status | Quantidade |
|--------|------------|
| ✅ Cobertos | 2 |
| ⚠️ Não Cobertos | ~80 |

## Oportunidades de Melhoria de Cobertura

1. Adicionar testes de integração para todos os endpoints principais
2. Adicionar testes unitários para validações frontend e backend
3. Adicionar testes E2E para fluxos principais (criar produto, fazer login, etc)
4. Implementar testes de regressão para validações duplicadas
