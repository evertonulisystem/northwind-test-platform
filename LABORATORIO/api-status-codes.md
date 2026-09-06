# API Status Codes e Mensagens

## 📋 **Products**

### 📤 **POST /api/v1/products**
- **200/201**: `Produto criado com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.`
  - `Nenhum dado informado. Preencha os campos do produto.`
  - `Campos obrigatórios não preenchidos: name, price, stock_quantity, sku, category_id, supplier_id.`
  - `O preço deve ser um valor positivo maior que zero.`
  - `A quantidade em estoque deve ser um número inteiro maior ou igual a zero.`
- **401**: `Token inválido` ou `Token ausente`
- **409**: 
  - `Já existe um produto com esse nome/slug.`
  - `Já existe um produto com esse SKU.`
- **500**: 
  - `O preço deve ser um valor positivo maior que zero.` (constraint violation)
  - `A quantidade em estoque deve ser um número inteiro maior ou igual a zero.` (constraint violation)
  - `Dados inválidos. Verifique se preço e estoque são valores válidos.` (constraint violation)
  - `Erro ao criar produto.` (fallback)

### 📥 **GET /api/v1/products**
- **200**: Lista de produtos (paginada)
- **400**: 
  - `Token ausente`
  - `Token inválido`
- **401**: `Token inválido` ou `Token ausente`
- **500**: `Erro ao buscar produtos.`

### 📝 **PUT /api/v1/products/{id}**
- **200**: `Produto atualizado com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.`
  - `Nenhum dado informado. Preencha os campos do produto.`
  - `Campos obrigatórios não preenchidos: name, price, stock_quantity, sku, category_id, supplier_id.`
- **401**: `Token inválido` ou `Token ausente`
- **404**: `Produto com ID {id} não encontrado.`
- **409**: 
  - `Já existe um produto com esse nome/slug.`
  - `Já existe um produto com esse SKU.`
- **500**: `Erro ao atualizar produto.`

### 🗑️ **DELETE /api/v1/products/{id}**
- **200**: `Produto excluído com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `ID do produto inválido. Deve ser um número positivo.`
- **401**: `Token inválido` ou `Token ausente`
- **404**: `Produto com ID {id} não encontrado.`
- **500**: `Erro ao excluir produto.`

---

## 📂 **Categories**

### 📤 **POST /api/v1/categories**
- **200/201**: `Categoria criada com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.`
  - `Nenhum dado informado. Preencha os campos da categoria.`
  - `Nome da categoria é obrigatório.`
  - `Nome deve ter entre 3 e 100 caracteres.`
  - `Descrição deve ter no máximo 500 caracteres.`
- **401**: `Token inválido` ou `Token ausente`
- **409**: `Já existe uma categoria com este nome.`
- **500**: 
  - `Nome da categoria deve ter entre 3 e 100 caracteres.` (constraint violation)
  - `Descrição da categoria deve ter no máximo 500 caracteres.` (constraint violation)
  - `Dados inválidos. Verifique nome e descrição.` (constraint violation)
  - `Já existe uma categoria com este nome.` (duplicate key)
  - `Categoria com dados duplicados.` (unique constraint)
  - `Erro ao criar categoria.` (fallback)

### 📥 **GET /api/v1/categories**
- **200**: Lista de categorias (paginada)
- **400**: 
  - `Token ausente`
  - `Token inválido`
- **401**: `Token inválido` ou `Token ausente`
- **500**: `Erro ao buscar categorias.`

### 📝 **PUT /api/v1/categories/{id}**
- **200**: `Categoria atualizada com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.`
  - `ID da categoria inválido. Deve ser um número positivo.`
  - `Campos obrigatórios não foram preenchidos.` (null value in column)
- **401**: `Token inválido` ou `Token ausente`
- **404**: `Categoria com ID {id} não encontrada.`
- **409**: `Já existe uma categoria com este nome.`
- **500**: `Erro ao atualizar categoria.`

### 🗑️ **DELETE /api/v1/categories/{id}**
- **200**: `Categoria excluída com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `ID da categoria inválido. Deve ser um número positivo.`
- **401**: `Token inválido` ou `Token ausente`
- **404**: `Categoria com ID {id} não encontrada.`
- **500**: `Erro ao excluir categoria.`

### 📦 **GET /api/v1/categories/{id}/products**
- **200**: Lista de produtos da categoria
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `ID da categoria inválido. Deve ser um número positivo.`
- **401**: `Token inválido` ou `Token ausente`
- **404**: `Categoria com ID {id} não encontrada.`
- **500**: `Erro ao buscar produtos da categoria.`

---

## 🏢 **Suppliers**

### 📤 **POST /api/v1/suppliers**
- **200/201**: `Fornecedor criado com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.`
  - `Nenhum dado informado. Preencha os campos do fornecedor.`
  - `Razão social da empresa é obrigatória.`
  - `Nome do contato é obrigatório.`
  - `E-mail do fornecedor é obrigatório.`
  - `Telefone do fornecedor é obrigatório.`
  - `CNPJ do fornecedor é obrigatório.`
  - `UF do fornecedor é obrigatória.`
  - `Razão social deve ter no mínimo 3 caracteres.`
  - `Razão social deve ter no máximo 100 caracteres.`
  - `Nome do contato deve ter no mínimo 5 caracteres.`
  - `Nome do contato deve ter no máximo 80 caracteres.`
  - `E-mail inválido. Informe um e-mail válido.`
  - `Telefone inválido. Use o formato (XX) XXXXX-XXXX.`
  - `CNPJ inválido. Informe apenas os 14 números do CNPJ.`
  - `UF inválida. Informe a sigla de 2 letras do estado (ex: SP, RJ, MG).`
  - `Já existe um fornecedor com este e-mail.` (duplicate check)
  - `Já existe um fornecedor com este CNPJ.` (duplicate check)
- **401**: `Token inválido` ou `Token ausente`
- **409**: 
  - `Já existe um fornecedor com este e-mail.`
  - `Já existe um fornecedor com este CNPJ.`
- **500**: 
  - `CNPJ deve ter 14 dígitos numéricos.` (constraint violation)
  - `Email inválido.` (constraint violation)
  - `Telefone deve estar no formato (XX) XXXXX-XXXX.` (constraint violation)
  - `UF deve ter 2 letras maiúsculas.` (constraint violation)
  - `Dados inválidos. Verifique todos os campos.` (constraint violation)
  - `Já existe um fornecedor com este CNPJ.` (duplicate key)
  - `Já existe um fornecedor com este email.` (duplicate key)
  - `Dados duplicados. Verifique CNPJ e email.` (unique constraint)
  - `Erro ao criar fornecedor.` (fallback)

### 📥 **GET /api/v1/suppliers**
- **200**: Lista de fornecedores (paginada)
- **400**: 
  - `Token ausente`
  - `Token inválido`
- **401**: `Token inválido` ou `Token ausente`
- **500**: `Erro ao buscar fornecedores.`

### 📝 **PUT /api/v1/suppliers/{id}**
- **200**: `Fornecedor atualizado com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.`
  - `ID do fornecedor inválido. Deve ser um número positivo.`
  - `Campos obrigatórios não foram preenchidos.`
- **401**: `Token inválido` ou `Token ausente`
- **404**: `Fornecedor com ID {id} não encontrado.`
- **409**: 
  - `Já existe um fornecedor com este e-mail.`
  - `Já existe um fornecedor com este CNPJ.`
- **500**: `Erro ao atualizar fornecedor.`

### 🗑️ **DELETE /api/v1/suppliers/{id}**
- **200**: `Fornecedor excluído com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `ID do fornecedor inválido. Deve ser um número positivo.`
- **401**: `Token inválido` ou `Token ausente`
- **404**: `Fornecedor com ID {id} não encontrado.`
- **500**: `Erro ao excluir fornecedor.`

### 📦 **GET /api/v1/suppliers/{id}/products**
- **200**: Lista de produtos do fornecedor
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `ID do fornecedor inválido. Deve ser um número positivo.`
- **401**: `Token inválido` ou `Token ausente`
- **404**: `Fornecedor com ID {id} não encontrado.`
- **500**: `Erro ao buscar produtos do fornecedor.`

### 🔗 **POST /api/v1/suppliers/{id}/unlink**
- **200**: `{updated_count} produto(s) desvinculado(s) do fornecedor com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `ID do fornecedor inválido. Deve ser um número positivo.`
  - `IDs dos produtos são obrigatórios e devem ser um array não vazio.`
  - `Nenhum ID de produto válido fornecido.`
  - `Nenhum produto encontrado vinculado a este fornecedor.`
- **401**: `Token inválido` ou `Token ausente`
- **404**: 
  - `Fornecedor com ID {id} não encontrado.`
  - `Nenhum produto encontrado vinculado a este fornecedor.`
- **500**: `Erro interno ao processar desvinculamento.`

---

## 🔐 **Auth**

### 📝 **POST /api/v1/auth/login**
- **200**: Login bem-sucedido
- **400**: 
  - `Email e senha são obrigatórios.`
  - `Email inválido.`
  - `Senha deve ter no mínimo 6 caracteres.`
- **401**: `Email ou senha incorretos.`
- **500**: `Erro ao fazer login.`

### 📝 **POST /api/v1/auth/register**
- **200/201**: `Usuário criado com sucesso!`
- **400**: 
  - `Nome, email e senha são obrigatórios.`
  - `Nome deve ter no mínimo 3 caracteres.`
  - `Email inválido.`
  - `Senha deve ter no mínimo 6 caracteres.`
  - `Já existe um usuário com este email.`
- **409**: `Já existe um usuário com este email.`
- **500**: `Erro ao criar usuário.`

### 📝 **POST /api/v1/auth/validate**
- **200**: Token válido
- **400**: Token ausente
- **401**: Token inválido ou expirado
- **500**: `Erro ao validar token.`

---

## 🛒 **Cart**

### 📥 **GET /api/v1/cart**
- **200**: Carrinho do usuário
- **400**: 
  - `Token ausente`
  - `Token inválido`
- **401**: `Token inválido` ou `Token ausente`
- **500**: `Erro ao buscar carrinho.`

### 📤 **POST /api/v1/cart**
- **200**: `Produto adicionado ao carrinho com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `ID do produto e quantidade são obrigatórios.`
  - `Quantidade deve ser maior que zero.`
  - `Produto não encontrado.`
  - `Estoque insuficiente.`
- **401**: `Token inválido` ou `Token ausente`
- **404**: `Produto não encontrado.`
- **500**: `Erro ao adicionar produto ao carrinho.`

### 📝 **PUT /api/v1/cart/{id}**
- **200**: `Item atualizado com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `ID do item inválido.`
  - `Quantidade deve ser maior que zero.`
  - `Estoque insuficiente.`
- **401**: `Token inválido` ou `Token ausente`
- **404**: `Item não encontrado no carrinho.`
- **500**: `Erro ao atualizar item do carrinho.`

### 🗑️ **DELETE /api/v1/cart/{id}**
- **200**: `Item removido do carrinho com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `ID do item inválido.`
- **401**: `Token inválido` ou `Token ausente`
- **404**: `Item não encontrado no carrinho.`
- **500**: `Erro ao remover item do carrinho.`

---

## 📦 **Orders**

### 📥 **GET /api/v1/orders**
- **200**: Lista de pedidos do usuário
- **400**: 
  - `Token ausente`
  - `Token inválido`
- **401**: `Token inválido` ou `Token ausente`
- **500**: `Erro ao buscar pedidos.`

### 📤 **POST /api/v1/orders**
- **200/201**: `Pedido criado com sucesso!`
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `Carrinho vazio. Adicione produtos antes de finalizar o pedido.`
  - `Estoque insuficiente para um ou mais produtos.`
- **401**: `Token inválido` ou `Token ausente`
- **500**: `Erro ao processar pedido.`

### 📥 **GET /api/v1/orders/{id}**
- **200**: Detalhes do pedido
- **400**: 
  - `Token ausente`
  - `Token inválido`
  - `ID do pedido inválido.`
- **401**: `Token inválido` ou `Token ausente`
- **404**: `Pedido não encontrado.`
- **500**: `Erro ao buscar pedido.`

---

## 🔧 **Utilitários**

### 📥 **GET /api/v1/health**
- **200**: Sistema saudável
- **500**: Erro de saúde do sistema

### 📥 **GET /api/v1/keepalive**
- **200**: Sistema ativo
- **500**: Erro de keepalive

### 📥 **GET /api/v1/debug/error-500**
- **500**: Erro simulado para testes

---

## 📊 **Resumo de Códigos de Status**

### ✅ **200/201 - Sucesso**
- Operação realizada com sucesso
- Dados retornados com sucesso

### ⚠️ **400 - Bad Request**
- Dados inválidos ou mal formatados
- Campos obrigatórios faltando
- Validações de negócio falharam

### 🔒 **401 - Unauthorized**
- Token ausente, inválido ou expirado
- Usuário não autenticado

### ❌ **404 - Not Found**
- Recurso não encontrado
- ID inválido ou inexistente

### 🔥 **409 - Conflict**
- Dados duplicados
- Conflito de unicidade

### 💥 **500 - Internal Server Error**
- Erro inesperado do servidor
- Falha de banco de dados
- Constraint violations (quando não tratadas)

### 🎯 **Padrão de Resposta**
```json
{
  "data": { ... }, // null em caso de erro
  "mensagens": ["Mensagem descritiva em português"],
  "debug": { ... } // opcional, apenas em desenvolvimento
}
```

### 🌐 **Padrão de Tratamento de Erros**
1. **Validações de entrada** → 400
2. **Autenticação** → 401
3. **Existência de recursos** → 404
4. **Duplicidade** → 409
5. **Erros de sistema** → 500
6. **Constraint violations** → Tratadas como 400 com mensagem amigável
