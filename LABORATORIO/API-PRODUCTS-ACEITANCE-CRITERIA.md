# Critérios de Aceite - API Products (Azure DevOps)

## User Story
**Como** Desenvolvedor/Tester  
**Quero** Ter critérios de aceite claros para a API de Produtos  
**Para** Garantir qualidade e cobertura 100% nos testes automatizados

---

## 🎯 **Endpoint GET /api/products**

### **Cenário 1: Listagem Bem-Sucedida**
**Dado que** o usuário está autenticado com token válido  
**Quando** eu faço uma requisição GET para /api/products  
**Então** devo receber status 200  
**E** o response deve conter:
- `data`: array de produtos
- `pagination`: objeto com `page`, `limit`, `total`, `totalPages`
- `mensagens`: array com mensagem de sucesso

### **Cenário 2: Autenticação Ausente**
**Dado que** o usuário não envia token  
**Quando** eu faço uma requisição GET para /api/products  
**Então** devo receber status 401  
**E** o response deve conter:
- `data`: null
- `mensagens`: ["Token ausente"]

### **Cenário 3: Token Inválido**
**Dado que** o usuário envia token inválido/expirado  
**Quando** eu faço uma requisição GET para /api/products  
**Então** devo receber status 401  
**E** o response deve conter:
- `data`: null
- `mensagens`: ["Token inválido"] ou ["Token expirado. Por favor, faça login novamente."]

### **Cenário 4: Paginação Funciona**
**Dado que** existem 25 produtos no banco  
**Quando** eu faço GET para /api/products?page=2&limit=10  
**Então** devo receber status 200  
**E** `pagination.page` deve ser 2  
**E** `pagination.total` deve ser 25  
**E** `pagination.totalPages` deve ser 3  
**E** `data` deve ter 10 produtos

### **Cenário 5: Filtro por Nome**
**Dado que** existem produtos com "Mouse" no nome  
**Quando** eu faço GET para /api/products?search=Mouse  
**Então** devo receber status 200  
**E** todos os produtos em `data` devem conter "Mouse" no nome

### **Cenário 6: Filtro por Categoria**
**Dado que** existem produtos na categoria "Eletrônicos" (ID=1)  
**Quando** eu faço GET para /api/products?category_id=1  
**Então** devo receber status 200  
**E** todos os produtos em `data` devem ter `categories.id` igual a 1

### **Cenário 7: Filtro por Fornecedor**
**Dado que** existem produtos do fornecedor "Tech Solutions" (ID=1)  
**Quando** eu faço GET para /api/products?supplier_id=1  
**Então** devo receber status 200  
**E** todos os produtos em `data` devem ter `suppliers.id` igual a 1

### **Cenário 8: Filtro Combinado**
**Dado que** existem produtos com "Gamer" do fornecedor "Tech Solutions"  
**Quando** eu faço GET para /api/products?search=Gamer&supplier_id=1  
**Então** devo receber status 200  
**E** todos os produtos devem atender ambos os critérios

### **Cenário 9: Busca por SKU Numérico**
**Dado que** existe produto com SKU "MGP-2024"  
**Quando** eu faço GET para /api/products?search=MGP-2024  
**Então** devo receber status 200  
**E** o produto retornado deve ter SKU exato

### **Cenário 10: Nenhum Resultado**
**Dado que** não existem produtos com "Inexistente"  
**Quando** eu faço GET para /api/products?search=Inexistente  
**Então** devo receber status 404  
**E** `data` deve ser null  
**E** `mensagens` deve conter "Nenhum produto encontrado para os filtros aplicados"

---

## 🎯 **Endpoint POST /api/products**

### **Cenário 11: Criação Bem-Sucedida**
**Dado que** o usuário está autenticado  
**E** envia dados válidos:
```json
{
  "name": "Produto Teste",
  "price": 299.90,
  "stock_quantity": 50,
  "sku": "TEST-2024",
  "category_id": 1,
  "supplier_id": 1
}
```
**Quando** eu faço POST para /api/products  
**Então** devo receber status 201  
**E** o response deve conter:
- `data`: objeto do produto criado com ID
- `mensagens`: ["Produto criado com sucesso!"]

### **Cenário 12: Token Ausente no POST**
**Dado que** o usuário não envia token  
**Quando** eu faço POST para /api/products com dados válidos  
**Então** devo receber status 401  
**E** `mensagens` deve ser ["Token ausente"]

### **Cenário 13: Token Inválido no POST**
**Dado que** o usuário envia token inválido  
**Quando** eu faço POST para /api/products com dados válidos  
**Então** devo receber status 401  
**E** `mensagens` deve conter mensagem de token inválido

### **Cenário 14: Body Vazio**
**Dado que** o usuário está autenticado  
**Quando** eu faço POST para /api/products com body vazio  
**Então** devo receber status 400  
**E** `mensagens` deve ser ["Nenhum dado informado. Preencha os campos do produto."]

### **Cenário 15: JSON Inválido**
**Dado que** o usuário está autenticado  
**Quando** eu faço POST para /api/products com JSON malformado  
**Então** devo receber status 400  
**E** `mensagens` deve ser ["Dados inválidos. Verifique se todos os campos foram preenchidos corretamente."]

### **Cenário 16: Campo Obrigatório Ausente**
**Dado que** o usuário está autenticado  
**Quando** eu faço POST para /api/products sem o campo "name"  
**Então** devo receber status 400  
**E** `mensagens` deve conter "Campos obrigatórios não preenchidos: name"

### **Cenário 17: Múltiplos Campos Obrigatórios Ausentes**
**Dado que** o usuário está autenticado  
**Quando** eu faço POST para /api/products sem "name", "price", "sku"  
**Então** devo receber status 400  
**E** `mensagens` deve conter "Campos obrigatórios não preenchidos: name, price, sku"

### **Cenário 18: Nome Duplicado**
**Dado que** existe produto "Mouse Gamer"  
**Quando** eu faço POST para /api/products com name "Mouse Gamer"  
**Então** devo receber status 409  
**E** `mensagens` deve ser ["Já existe um produto com esse nome/slug."]

### **Cenário 19: SKU Duplicado**
**Dado que** existe produto com SKU "MGP-2024"  
**Quando** eu faço POST para /api/products com sku "MGP-2024"  
**Então** devo receber status 409  
**E** `mensagens` deve ser ["Já existe um produto com este SKU."]

### **Cenário 20: Categoria Inexistente**
**Dado que** não existe categoria com ID 999  
**Quando** eu faço POST para /api/products com category_id 999  
**Então** devo receber status 400  
**E** `mensagens` deve conter erro sobre categoria inexistente

### **Cenário 21: Fornecedor Inexistente**
**Dado que** não existe fornecedor com ID 999  
**Quando** eu faço POST para /api/products com supplier_id 999  
**Então** devo receber status 400  
**E** `mensagens` deve conter erro sobre fornecedor inexistente

### **Cenário 22: Preço Inválido**
**Dado que** o usuário está autenticado  
**Quando** eu faço POST para /api/products com price "abc"  
**Então** devo receber status 400  
**E** `mensagens` deve conter "Preço deve ser um número positivo"

### **Cenário 23: Estoque Inválido**
**Dado que** o usuário está autenticado  
**Quando** eu faço POST para /api/products com stock_quantity -5  
**Então** devo receber status 400  
**E** `mensagens` deve conter "Estoque deve ser um número inteiro não negativo"

### **Cenário 24: Nome Muito Longo**
**Dado que** o usuário está autenticado  
**Quando** eu faço POST para /api/products com name de 201 caracteres  
**Então** devo receber status 400  
**E** `mensagens` deve conter "Nome deve ter no máximo 200 caracteres"

### **Cenário 25: SKU Muito Longo**
**Dado que** o usuário está autenticado  
**Quando** eu faço POST para /api/products com sku de 51 caracteres  
**Então** devo receber status 400  
**E** `mensagens` deve conter "SKU deve ter no máximo 50 caracteres"

### **Cenário 26: Slug Automático**
**Dado que** o usuário está autenticado  
**Quando** eu faço POST para /api/products com name "Produto Teste" sem slug  
**Então** devo receber status 201  
**E** o produto criado deve ter slug "produto-teste"

### **Cenário 27: Slug Personalizado**
**Dado que** o usuário está autenticado  
**Quando** eu faço POST para /api/products com slug "custom-produto"  
**Então** devo receber status 201  
**E** o produto criado deve ter slug exato "custom-produto"

### **Cenário 28: Preço com Decimais**
**Dado que** o usuário está autenticado  
**Quando** eu faço POST para /api/products com price 299.99  
**Então** devo receber status 201  
**E** o produto criado deve ter price 299.99

### **Cenário 29: Campos Opcionais Nulos**
**Dado que** o usuário está autenticado  
**Quando** eu faço POST para /api/products sem description e weight  
**Então** devo receber status 201  
**E** o produto criado deve ter description e weight como null

### **Cenário 30: Erro Interno do Servidor**
**Dado que** o banco de dados está offline  
**Quando** eu faço POST para /api/products com dados válidos  
**Então** devo receber status 500  
**E** `mensagens` deve ser ["Erro interno ao criar produto"]

---

## 🎯 **Validações de Campos Específicos**

### **Nome (name)**
- ✅ Obrigatório
- ✅ String
- ✅ Min: 3 caracteres
- ✅ Max: 200 caracteres
- ✅ Não pode ser apenas espaços
- ✅ Gera slug automaticamente se não fornecido

### **Preço (price)**
- ✅ Obrigatório
- ✅ Number
- ✅ Min: 0.01
- ✅ Max: 999999.99
- ✅ Aceita decimais

### **Estoque (stock_quantity)**
- ✅ Obrigatório
- ✅ Integer
- ✅ Min: 0
- ✅ Max: 999999

### **SKU**
- ✅ Obrigatório
- ✅ String
- ✅ Min: 3 caracteres
- ✅ Max: 50 caracteres
- ✅ Único no sistema
- ✅ Alfanumérico permitido

### **Categoria (category_id)**
- ✅ Obrigatório
- ✅ Integer
- ✅ Deve existir na tabela categories

### **Fornecedor (supplier_id)**
- ✅ Obrigatório
- ✅ Integer
- ✅ Deve existir na tabela suppliers

---

## 🎯 **Critérios de Performance**

### **Tempo de Resposta**
- ✅ GET /api/products: < 500ms (sem filtros)
- ✅ GET /api/products?search=: < 1000ms (com busca)
- ✅ POST /api/products: < 1000ms

### **Concorrência**
- ✅ Múltiplas requisições simultâneas não devem duplicar dados
- ✅ Sistema deve tratar race conditions em SKU/nome

---

## 🎯 **Critérios de Segurança**

### **Autenticação**
- ✅ Todos os endpoints exigem token válido
- ✅ Token expirado é rejeitado corretamente
- ✅ Token malformado é rejeitado

### **Autorização**
- ✅ Apenas usuários autenticados podem criar produtos
- ✅ Todos os usuários podem listar produtos

### **Validação de Dados**
- ✅ SQL Injection prevenido
- ✅ XSS prevenido
- ✅ Campos sanitizados

---

## 🎯 **Critérios de Formato de Response**

### **Sucesso (200/201)**
```json
{
  "data": { ... } | [ ... ],
  "pagination": { ... } | null,
  "mensagens": ["Mensagem de sucesso"]
}
```

### **Erro (400/401/404/409/500)**
```json
{
  "data": null,
  "mensagens": ["Mensagem de erro específica"]
}
```

### **Headers**
- ✅ Content-Type: application/json
- ✅ CORS headers configurados
- ✅ Cache headers apropriados

---

## 🎯 **Cobertura de Testes: 100%**

### **Testes Funcionais**
- ✅ Todos os 30 cenários acima
- ✅ Happy paths e edge cases
- ✅ Validações de negócio

### **Testes de Integração**
- ✅ Conexão com Supabase
- ✅ Relacionamentos (categories, suppliers)
- ✅ Transações

### **Testes de Performance**
- ✅ Load testing
- ✅ Stress testing
- ✅ Memory leaks

### **Testes de Segurança**
- ✅ OWASP Top 10
- ✅ Autenticação/autorização
- ✅ Injeção de dados

---

## 🎯 **Azure DevOps Integration**

### **Test Cases Structure**
```
├── Products_API_Get/
│   ├── TC001_Authenticated_Success.json
│   ├── TC002_Unauthenticated_Token.json
│   ├── TC003_Invalid_Token.json
│   └── ...
├── Products_API_Post/
│   ├── TC011_Valid_Product.json
│   ├── TC012_Missing_Token.json
│   └── ...
└── Products_API_Performance/
    ├── TC_Performance_Get.json
    └── TC_Performance_Post.json
```

### **Automatização Pipeline**
- ✅ Trigger em cada PR
- ✅ Execução paralela de testes
- ✅ Relatório de cobertura
- ✅ Notificação de falhas
- ✅ Deploy automático em sucesso

---

**Total de Critérios de Aceite: 30+ cenários cobrindo 100% da API de Produtos**
