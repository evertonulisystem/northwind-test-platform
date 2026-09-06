
# 04 - Mapa Backend → Frontend

> Relatório de mapeamento entre mensagens do backend e exibição no frontend

---

## Tabela de Mapeamento

| Mensagem do Backend | Endpoint | Método | Exibida no Frontend | Localização Frontend |
|----------------------|----------|--------|----------------------|-----------------------|
| Token ausente | Todos autenticados | Vários | Sim | Vários (via toast.error) |
| Token inválido | Todos autenticados | Vários | Sim | Vários (via toast.error) |
| Token expirado | Todos autenticados | Vários | Sim | Vários (via toast.error) |
| Produto criado com sucesso! | /api/v1/products | POST | Sim | components/AddProductModal.jsx (toast.success) |
| Produto atualizado com sucesso! | /api/v1/products/:id | PUT | Sim | components/EditProductModal.jsx (toast.success) |
| Produto excluído com sucesso! | /api/v1/products/:id | DELETE | Sim | app/products/page.js (toast.success) |
| Produtos carregados com sucesso. | /api/v1/products | GET | Não (apenas exibe dados) | app/products/page.js |
| Produto carregado com sucesso. | /api/v1/products/:id | GET | Não | components/ProductDetailsModal.jsx, EditProductModal.jsx |
| Nenhum produto encontrado para os filtros aplicados. | /api/v1/products | GET | Não (apenas mensagem de "Nenhum produto") | app/products/page.js |
| Campos obrigatórios não preenchidos: {campos} | /api/v1/products | POST | Sim | components/AddProductModal.jsx (toast.error) |
| O preço deve ser um valor positivo maior que zero. | /api/v1/products | POST/PUT | Sim | components/AddProductModal.jsx, EditProductModal.jsx (toast.error) |
| A quantidade em estoque deve ser um número inteiro maior ou igual a zero. | /api/v1/products | POST/PUT | Sim | components/AddProductModal.jsx, EditProductModal.jsx (toast.error) |
| Já existe um produto com esse nome/slug. | /api/v1/products | POST/PUT | Sim | components/AddProductModal.jsx, EditProductModal.jsx (toast.error) |
| Já existe um produto com esse SKU. | /api/v1/products | POST/PUT | Sim | components/AddProductModal.jsx, EditProductModal.jsx (toast.error) |
| Categoria selecionada não existe. Escolha uma categoria válida. | /api/v1/products | POST/PUT | Sim | components/AddProductModal.jsx, EditProductModal.jsx (toast.error) |
| Fornecedor selecionado não existe. Escolha um fornecedor válido. | /api/v1/products | POST/PUT | Sim | components/AddProductModal.jsx, EditProductModal.jsx (toast.error) |
| Upload da imagem realizado com sucesso! | /api/v1/products/:id/image | POST | Sim | components/EditProductModal.jsx (toast.success) |
| Apenas arquivos PNG são permitidos para imagem do produto. | /api/v1/products/:id/image | POST | Sim | components/EditProductModal.jsx (toast.error) |
| Arquivo muito grande. Tamanho máximo permitido: 2MB. | /api/v1/products/:id/image | POST | Sim | components/EditProductModal.jsx (toast.error) |
| Categoria criada com sucesso! | /api/v1/categories | POST | Sim | app/categories/page.js (toast.success) |
| Categoria atualizada com sucesso! | /api/v1/categories/:id | PUT | Sim | app/categories/page.js (toast.success) |
| Categoria excluída com sucesso! | /api/v1/categories/:id | DELETE | Sim | app/categories/page.js (toast.success) |
| Fornecedor criado com sucesso! | /api/v1/suppliers | POST | Sim | app/suppliers/page.js (toast.success) |
| Fornecedor atualizado com sucesso! | /api/v1/suppliers/:id | PUT | Sim | app/suppliers/page.js (toast.success) |
| Fornecedor excluído com sucesso! | /api/v1/suppliers/:id | DELETE | Sim | app/suppliers/page.js (toast.success) |

---

## Observações

- **Padronização de Exibição**: O frontend usa React Toastify para exibir mensagens
- **Formato do Backend**: Todas as mensagens são retornadas em `{ mensagens: ["msg1", "msg2"] }`
- **Código Status**: O backend usa corretamente os códigos HTTP (200, 201, 400, 401, 404, 409, 500)
