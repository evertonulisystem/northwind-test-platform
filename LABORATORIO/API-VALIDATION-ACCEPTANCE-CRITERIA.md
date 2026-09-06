# Critérios de Aceite - Validações de API

## Visão Geral
Este documento contém todos os critérios de aceite para validações dos endpoints de Produtos, Categorias e Fornecedores, visando garantir cobertura 100% das mensagens de validação e erro.

---

## 1. PRODUTOS (/api/v1/products)

### 1.1 Autenticação
- **CA-PROD-AUTH-001:** Token ausente deve retornar 401 com mensagem "Token ausente"
- **CA-PROD-AUTH-002:** Token inválido deve retornar 401 com mensagem "Token inválido"
- **CA-PROD-AUTH-003:** Token expirado deve retornar 401 com mensagem "Token expirado"

### 1.2 GET /api/v1/products (Listar)
- **CA-PROD-GET-001:** Listagem bem-sucedida retorna 200 com array de produtos
- **CA-PROD-GET-002:** Filtros por nome funcionam corretamente
- **CA-PROD-GET-003:** Filtros por categoria_id funcionam corretamente
- **CA-PROD-GET-004:** Filtros por supplier_id funcionam corretamente
- **CA-PROD-GET-005:** Paginação funciona com page e limit
- **CA-PROD-GET-006:** Ordenação padrão por id ascendente

### 1.3 GET /api/v1/products/{id} (Buscar por ID)
- **CA-PROD-GETID-001:** ID válido retorna produto com relacionamentos
- **CA-PROD-GETID-002:** ID não encontrado retorna 404 com "Produto com ID {id} não encontrado"
- **CA-PROD-GETID-003:** ID inválido (texto) retorna 400 com "ID do produto inválido. Deve ser um número positivo"
- **CA-PROD-GETID-004:** ID negativo retorna 400 com "ID do produto inválido. Deve ser um número positivo"
- **CA-PROD-GETID-005:** ID zero retorna 400 com "ID do produto inválido. Deve ser um número positivo"

### 1.4 POST /api/v1/products (Criar)
- **CA-PROD-POST-001:** Criação bem-sucedida retorna 201 com produto criado
- **CA-PROD-POST-002:** Body vazio retorna 400 com "Corpo da requisição inválido"
- **CA-PROD-POST-003:** Nome ausente retorna 400 com "Nome é obrigatório"
- **CA-PROD-POST-004:** Nome vazio retorna 400 com "Nome não pode estar vazio"
- **CA-PROD-POST-005:** Preço ausente retorna 400 com "Preço é obrigatório"
- **CA-PROD-POST-006:** Preço negativo retorna 400 com "Preço deve ser um número positivo"
- **CA-PROD-POST-007:** Preço texto retorna 400 com "Preço deve ser um número válido"
- **CA-PROD-POST-008:** Stock_quantity ausente retorna 400 com "Quantidade em estoque é obrigatória"
- **CA-PROD-POST-009:** Stock_quantity negativo retorna 400 com "Quantidade em estoque deve ser um número inteiro positivo"
- **CA-PROD-POST-010:** SKU ausente retorna 400 com "SKU é obrigatório"
- **CA-PROD-POST-011:** SKU vazio retorna 400 com "SKU não pode estar vazio"
- **CA-PROD-POST-012:** SKU duplicado retorna 409 com "Já existe um produto com esse SKU"
- **CA-PROD-POST-013:** Category_id inválido retorna 400 com "Categoria inválida"
- **CA-PROD-POST-014:** Supplier_id inválido retorna 400 com "Fornecedor inválido"
- **CA-PROD-POST-015:** Slug duplicado retorna 409 com "Já existe um produto com esse nome/slug"

### 1.5 PUT /api/v1/products/{id} (Atualizar completo)
- **CA-PROD-PUT-001:** Atualização bem-sucedida retorna 200 com produto atualizado
- **CA-PROD-PUT-002:** ID não encontrado retorna 404 com "Produto com ID {id} não encontrado"
- **CA-PROD-PUT-003:** SKU ausente retorna 400 com "SKU é obrigatório"
- **CA-PROD-PUT-004:** SKU duplicado retorna 409 com "Já existe outro produto com esse SKU"
- **CA-PROD-PUT-005:** Nome alterado gera novo slug automaticamente
- **CA-PROD-PUT-006:** Slug duplicado retorna 409 com "Já existe outro produto com esse nome/slug"

### 1.6 PATCH /api/v1/products/{id} (Atualizar parcial)
- **CA-PROD-PATCH-001:** Atualização parcial bem-sucedida retorna 200
- **CA-PROD-PATCH-002:** Nenhum campo fornecido retorna 400 com "Pelo menos um campo deve ser fornecido para atualização"
- **CA-PROD-PATCH-003:** Atualizar apenas name funciona e gera slug
- **CA-PROD-PATCH-004:** Atualizar apenas price funciona
- **CA-PROD-PATCH-005:** Atualizar apenas stock_quantity funciona
- **CA-PROD-PATCH-006:** Atualizar apenas sku funciona (valida duplicidade)
- **CA-PROD-PATCH-007:** Atualizar apenas category_id funciona
- **CA-PROD-PATCH-008:** Atualizar apenas supplier_id funciona
- **CA-PROD-PATCH-009:** Name vazio retorna 400 com "Nome não pode estar vazio"
- **CA-PROD-PATCH-010:** Price negativo retorna 400 com "Preço deve ser um número positivo"
- **CA-PROD-PATCH-011:** Stock_quantity negativo retorna 400 com "Quantidade em estoque deve ser um número inteiro positivo"
- **CA-PROD-PATCH-012:** SKU vazio retorna 400 com "SKU não pode estar vazio"
- **CA-PROD-PATCH-013:** SKU duplicado retorna 409 com "Já existe outro produto com esse SKU"
- **CA-PROD-PATCH-014:** Category_id inválido retorna 400 com "ID da categoria deve ser um número positivo ou nulo"
- **CA-PROD-PATCH-015:** Supplier_id inválido retorna 400 com "ID do fornecedor deve ser um número positivo ou nulo"
- **CA-PROD-PATCH-016:** Slug duplicado retorna 409 com "Já existe outro produto com esse nome/slug"

### 1.7 DELETE /api/v1/products/{id}
- **CA-PROD-DEL-001:** Exclusão bem-sucedida retorna 200 com "Produto excluído com sucesso"
- **CA-PROD-DEL-002:** ID não encontrado retorna 404 com "Produto com ID {id} não encontrado"

---

## 2. CATEGORIAS (/api/v1/categories)

### 2.1 Autenticação
- **CA-CAT-AUTH-001:** Token ausente deve retornar 401 com "Token ausente"
- **CA-CAT-AUTH-002:** Token inválido deve retornar 401 com "Token inválido"
- **CA-CAT-AUTH-003:** Token expirado deve retornar 401 com "Token expirado"

### 2.2 GET /api/v1/categories (Listar)
- **CA-CAT-GET-001:** Listagem bem-sucedida retorna 200 com array de categorias
- **CA-CAT-GET-002:** Ordenação padrão por nome ascendente

### 2.3 POST /api/v1/categories (Criar)
- **CA-CAT-POST-001:** Criação bem-sucedida retorna 201 com categoria criada
- **CA-CAT-POST-002:** Body vazio retorna 400 com "Corpo da requisição inválido"
- **CA-CAT-POST-003:** Name ausente retorna 400 com "Nome é obrigatório"
- **CA-CAT-POST-004:** Name vazio retorna 400 com "Nome não pode estar vazio"
- **CA-CAT-POST-005:** Description ausente retorna 400 com "Descrição é obrigatória"
- **CA-CAT-POST-006:** Description vazia retorna 400 com "Descrição não pode estar vazia"
- **CA-CAT-POST-007:** Nome duplicado retorna 409 com "Já existe uma categoria com esse nome"

### 2.4 PATCH /api/v1/categories/{id} (Atualizar parcial)
- **CA-CAT-PATCH-001:** Atualização bem-sucedida retorna 200
- **CA-CAT-PATCH-002:** ID não encontrado retorna 404 com "Categoria não encontrada"
- **CA-CAT-PATCH-003:** Nenhum campo fornecido retorna 400 com "Pelo menos um campo (name ou description) deve ser fornecido"
- **CA-CAT-PATCH-004:** Atualizar apenas name funciona e gera slug
- **CA-CAT-PATCH-005:** Atualizar apenas description funciona
- **CA-CAT-PATCH-006:** Name vazio retorna 400 com "Nome não pode estar vazio"
- **CA-CAT-PATCH-007:** Description vazia retorna 400 com "Descrição não pode estar vazia"
- **CA-CAT-PATCH-008:** Nome duplicado retorna 409 com "Já existe uma categoria com esse nome"

---

## 3. FORNECEDORES (/api/v1/suppliers)

### 3.1 Autenticação
- **CA-SUP-AUTH-001:** Token ausente deve retornar 401 com "Token ausente"
- **CA-SUP-AUTH-002:** Token inválido deve retornar 401 com "Token inválido"
- **CA-SUP-AUTH-003:** Token expirado deve retornar 401 com "Token expirado"

### 3.2 GET /api/v1/suppliers (Listar)
- **CA-SUP-GET-001:** Listagem bem-sucedida retorna 200 com array de fornecedores
- **CA-SUP-GET-002:** Ordenação padrão por company_name ascendente

### 3.3 POST /api/v1/suppliers (Criar)
- **CA-SUP-POST-001:** Criação bem-sucedida retorna 201 com fornecedor criado
- **CA-SUP-POST-002:** Body vazio retorna 400 com "Corpo da requisição inválido"
- **CA-SUP-POST-003:** Company_name ausente retorna 400 com "Nome da empresa é obrigatório"
- **CA-SUP-POST-004:** Company_name vazio retorna 400 com "Nome da empresa não pode estar vazio"
- **CA-SUP-POST-005:** Email ausente retorna 400 com "Email é obrigatório"
- **CA-SUP-POST-006:** Email inválido retorna 400 com "Email inválido"
- **CA-SUP-POST-007:** Email duplicado retorna 409 com "Já existe um fornecedor com esse email"
- **CA-SUP-POST-008:** CNPJ ausente retorna 400 com "CNPJ é obrigatório"
- **CA-SUP-POST-009:** CNPJ inválido retorna 400 com "CNPJ inválido"
- **CA-SUP-POST-010:** CNPJ duplicado retorna 409 com "Já existe um fornecedor com esse CNPJ"

### 3.4 PUT /api/v1/suppliers/{id} (Atualizar completo)
- **CA-SUP-PUT-001:** Atualização bem-sucedida retorna 200
- **CA-SUP-PUT-002:** ID não encontrado retorna 404 com "Fornecedor não encontrado"
- **CA-SUP-PUT-003:** Email duplicado retorna 409 com "Já existe outro fornecedor com esse email"
- **CA-SUP-PUT-004:** CNPJ duplicado retorna 409 com "Já existe outro fornecedor com esse CNPJ"

### 3.5 PATCH /api/v1/suppliers/{id} (Atualizar parcial)
- **CA-SUP-PATCH-001:** Atualização parcial bem-sucedida retorna 200
- **CA-SUP-PATCH-002:** ID não encontrado retorna 404 com "Fornecedor não encontrado"
- **CA-SUP-PATCH-003:** Nenhum campo fornecido retorna 400 com "Pelo menos um campo deve ser fornecido para atualização"
- **CA-SUP-PATCH-004:** Atualizar apenas company_name funciona
- **CA-SUP-PATCH-005:** Atualizar apenas email funciona (valida duplicidade)
- **CA-SUP-PATCH-006:** Atualizar apenas cnpj funciona (valida duplicidade)
- **CA-SUP-PATCH-007:** Company_name vazio retorna 400 com "Nome da empresa não pode estar vazio"
- **CA-SUP-PATCH-008:** Email inválido retorna 400 com "Email inválido"
- **CA-SUP-PATCH-009:** Email duplicado retorna 409 com "Já existe outro fornecedor com esse email"
- **CA-SUP-PATCH-010:** CNPJ inválido retorna 400 com "CNPJ inválido"
- **CA-SUP-PATCH-011:** CNPJ duplicado retorna 409 com "Já existe outro fornecedor com esse CNPJ"

### 3.6 DELETE /api/v1/suppliers/{id}
- **CA-SUP-DEL-001:** Exclusão bem-sucedida retorna 200
- **CA-SUP-DEL-002:** ID não encontrado retorna 404 com "Fornecedor não encontrado"

---

## 4. VALIDAÇÕES TRANSVERSAIS

### 4.1 Formato de Resposta
- **CA-FORMAT-001:** Todas as respostas seguem formato `{ data: ..., mensagens: [...] }`
- **CA-FORMAT-002:** Respostas de sucesso incluem dados e mensagem positiva
- **CA-FORMAT-003:** Respostas de erro incluem data: null e mensagem de erro
- **CA-FORMAT-004:** Status codes HTTP corretos (200, 201, 400, 401, 404, 409, 500)

### 4.2 Segurança
- **CA-SEC-001:** Todos os endpoints exigem autenticação JWT
- **CA-SEC-002:** Tokens são validados quanto à assinatura e expiração
- **CA-SEC-003:** Endpoints sem token retornam 401

### 4.3 Integridade de Dados
- **CA-DATA-001:** Validação de campos obrigatórios
- **CA-DATA-002:** Validação de tipos de dados
- **CA-DATA-003:** Validação de unicidade (SKU, Email, CNPJ, etc.)
- **CA-DATA-004:** Validação de relacionamentos (category_id, supplier_id)

---

## 5. MENSAGENS ESPERADAS

### 5.1 Autenticação
- "Token ausente"
- "Token inválido"
- "Token expirado"

### 5.2 Produtos
- "ID do produto inválido. Deve ser um número positivo"
- "Produto com ID {id} não encontrado"
- "Corpo da requisição inválido"
- "Nome é obrigatório"
- "Nome não pode estar vazio"
- "Preço é obrigatório"
- "Preço deve ser um número positivo"
- "Preço deve ser um número válido"
- "Quantidade em estoque é obrigatória"
- "Quantidade em estoque deve ser um número inteiro positivo"
- "SKU é obrigatório"
- "SKU não pode estar vazio"
- "Já existe um produto com esse SKU"
- "Já existe outro produto com esse SKU"
- "Categoria inválida"
- "Fornecedor inválido"
- "Já existe um produto com esse nome/slug"
- "Já existe outro produto com esse nome/slug"
- "Pelo menos um campo deve ser fornecido para atualização"
- "ID da categoria deve ser um número positivo ou nulo"
- "ID do fornecedor deve ser um número positivo ou nulo"
- "Produto excluído com sucesso"

### 5.3 Categorias
- "Categoria não encontrada"
- "Nome é obrigatório"
- "Nome não pode estar vazio"
- "Descrição é obrigatória"
- "Descrição não pode estar vazia"
- "Já existe uma categoria com esse nome"
- "Pelo menos um campo (name ou description) deve ser fornecido"

### 5.4 Fornecedores
- "Fornecedor não encontrado"
- "Nome da empresa é obrigatório"
- "Nome da empresa não pode estar vazio"
- "Email é obrigatório"
- "Email inválido"
- "Já existe um fornecedor com esse email"
- "Já existe outro fornecedor com esse email"
- "CNPJ é obrigatório"
- "CNPJ inválido"
- "Já existe um fornecedor com esse CNPJ"
- "Já existe outro fornecedor com esse CNPJ"
- "Pelo menos um campo deve ser fornecido para atualização"

---

## 6. COBERTURA DE TESTES

### 6.1 Total de Critérios
- **Produtos:** 47 critérios
- **Categorias:** 16 critérios
- **Fornecedores:** 25 critérios
- **Transversais:** 12 critérios
- **TOTAL:** 100 critérios de aceite

### 6.2 Cenários de Teste
1. **Fluxos felizes:** Operações bem-sucedidas
2. **Validações de entrada:** Dados inválidos ou ausentes
3. **Validações de negócio:** Regras de unicidade
4. **Segurança:** Autenticação e autorização
5. **Integridade:** Relacionamentos e consistência

---

## 7. IMPLEMENTAÇÃO

### 7.1 Automação
- Usar Cypress ou Playwright para automação
- Criar suites por entidade (Produtos, Categorias, Fornecedores)
- Parametrizar testes para cobertura massiva

### 7.2 Relatórios
- Gerar relatório de cobertura dos critérios
- Mapear cada critério aos testes automatizados
- Indicar pass/fail para cada critério

---

**Este documento serve como base completa para implementação de testes automatizados com cobertura 100% das validações da API.**
