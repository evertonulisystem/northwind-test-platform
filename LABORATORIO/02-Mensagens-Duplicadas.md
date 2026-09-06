
# 02 - Mensagens Duplicadas

> Relatório de mensagens que aparecem em múltiplos locais do código, indicando oportunidades de centralização

---

## Lista de Mensagens Duplicadas

| Mensagem | Ocorrências | Arquivos |
|----------|-------------|----------|
| Token ausente | 12 | app/api/v1/products/route.js, app/api/v1/products/[id]/route.js, app/api/v1/categories/route.js, app/api/v1/suppliers/route.js, app/api/v1/auth routes, etc |
| Token inválido | 12 | app/api/v1/products/route.js, app/api/v1/products/[id]/route.js, app/api/v1/categories/route.js, app/api/v1/suppliers/route.js, etc |
| Você precisa estar logado | 7 | components/EditProductModal.jsx, components/AddProductModal.jsx, app/products/page.js, app/categories/page.js, app/suppliers/page.js, etc |
| Erro de conexão | 8 | app/page.js, app/cart/page.js, app/categories/page.js, app/suppliers/page.js, etc |
| Corrija os erros antes de salvar | 5 | components/AddProductModal.jsx, components/EditProductModal.jsx, app/categories/page.js, app/suppliers/page.js, etc |
| Nome é obrigatório | 4 | components/AddProductModal.jsx, components/EditProductModal.jsx, app/categories/page.js |
| Produto atualizado com sucesso! | 3 | app/api/v1/products/[id]/route.js, components/EditProductModal.jsx |
| Erro ao atualizar | 3 | components/EditProductModal.jsx, app/categories/page.js, app/suppliers/page.js |
| Produto excluído com sucesso! | 2 | app/api/v1/products/[id]/route.js, app/products/page.js |
| Erro interno ao buscar produto. | 2 | app/api/v1/products/[id]/route.js |
| Já existe um produto com esse nome/slug. | 3 | app/api/v1/products/route.js, app/api/v1/products/[id]/route.js |
| Já existe um produto com esse SKU. / Já existe outro produto com esse SKU. | 4 | app/api/v1/products/route.js, app/api/v1/products/[id]/route.js |
| Apenas arquivos PNG são permitidos para imagem do produto. | 2 | app/api/v1/products/[id]/image/route.js, components/EditProductModal.jsx |
| Arquivo muito grande. Tamanho máximo permitido: 2MB. | 2 | app/api/v1/products/[id]/image/route.js, components/EditProductModal.jsx |
| Categoria selecionada não existe. Escolha uma categoria válida. | 2 | app/api/v1/products/route.js |
| Fornecedor selecionado não existe. Escolha um fornecedor válido. | 2 | app/api/v1/products/route.js |
| O preço deve ser um valor positivo maior que zero. | 3 | app/api/v1/products/route.js |
| A quantidade em estoque deve ser um número inteiro maior ou igual a zero. | 3 | app/api/v1/products/route.js |
| Dados inválidos. Verifique se todos os campos foram preenchidos corretamente. | 2 | app/api/v1/products/route.js |
| Verificado: Salvo no banco Supabase ({host}) | 2 | app/api/v1/products/route.js, app/api/v1/categories/route.js |
| Categoria cadastrada com sucesso! | 2 | Frontend e Backend |
| Fornecedor cadastrado com sucesso! | 2 | Frontend e Backend |
| Categoria atualizada com sucesso! | 2 | Frontend e Backend |
| Fornecedor atualizado com sucesso! | 2 | Frontend e Backend |
| SKU é obrigatório | 4 | Frontend e Backend |
| ID do produto inválido. Deve ser um número positivo. | 6 | app/api/v1/products/[id]/route.js |
| Produto com ID {id} não encontrado. | 4 | app/api/v1/products/[id]/route.js |

---

## Oportunidades de Melhoria

1. **Criar Arquivo de Constantes** - Centralizar todas as mensagens em um arquivo como `lib/messages.js` para manter consistência
2. **Padronizar Nomenclatura** - Algumas mensagens têm variações como "Já existe um produto..." vs "Já existe outro produto..."
3. **Criar Helper Functions** - Criar funções reutilizáveis para mensagens padrão de autenticação, validação, etc
