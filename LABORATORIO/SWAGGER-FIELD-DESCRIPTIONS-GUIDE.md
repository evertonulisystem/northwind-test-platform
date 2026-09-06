# Guia: Como Adicionar Descrições Detalhadas nos Endpoints Swagger

## 🎯 **Problema Identificado**
Todos os endpoints precisam de descrições detalhadas dos campos para melhor usabilidade no Swagger UI.

## 📋 **Exemplos Completos de Como Adicionar Descrições**

### 1. Categories - POST (Criar Categoria)
```javascript
/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 25
 *                 description: "Nome da categoria (obrigatório, máximo 25 caracteres, não pode conter números)"
 *                 example: "Eletrônicos"
 *               description:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 40
 *                 description: "Descrição detalhada da categoria (obrigatório, entre 6 e 40 caracteres, deve explicar o propósito)"
 *                 example: "Produtos eletrônicos variados como celulares, notebooks e acessórios"
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *       400:
 *         description: Dados inválidos ou campos obrigatórios ausentes
 *       401:
 *         description: Não autorizado
 *       409:
 *         description: Categoria com este nome já existe
 */
```

### 2. Products - POST (Criar Produto)
```javascript
/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock_quantity
 *               - sku
 *               - category_id
 *               - supplier_id
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 description: "Nome completo do produto (obrigatório, entre 3 e 100 caracteres, deve ser descritivo)"
 *                 example: "Smartphone Samsung Galaxy S23"
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *                 description: "Preço de venda do produto (obrigatório, deve ser maior que 0, use 2 casas decimais)"
 *                 example: 2999.99
 *               stock_quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: "Quantidade em estoque (obrigatório, número inteiro, não pode ser negativo)"
 *                 example: 50
 *               sku:
 *                 type: string
 *                 pattern: "^[A-Z0-9]{6,20}$"
 *                 description: "SKU do produto (obrigatório, código único em maiúsculas, 6-20 caracteres alfanuméricos)"
 *                 example: "SAMSUNG23"
 *               category_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: "ID da categoria (obrigatório, deve existir na tabela categories)"
 *                 example: 1
 *               supplier_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: "ID do fornecedor (obrigatório, deve existir na tabela suppliers)"
 *                 example: 1
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       400:
 *         description: Dados inválidos ou campos obrigatórios ausentes
 *       401:
 *         description: Não autorizado
 *       409:
 *         description: SKU ou nome do produto já existe
 */
```

### 3. Products - PATCH (Atualização Parcial)
```javascript
/**
 * @swagger
 * /api/v1/products/{id}:
 *   patch:
 *     summary: Atualiza parcialmente um produto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: "ID do produto a ser atualizado (deve ser um número positivo)"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: "Campos a serem atualizados (pelo menos um campo é obrigatório)"
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 description: "Novo nome do produto (opcional, entre 3 e 100 caracteres, gera novo slug automaticamente)"
 *                 example: "Smartphone Samsung Galaxy S23 Plus"
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *                 description: "Novo preço do produto (opcional, deve ser maior que 0, use 2 casas decimais)"
 *                 example: 3299.99
 *               stock_quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: "Nova quantidade em estoque (opcional, número inteiro, não pode ser negativo)"
 *                 example: 45
 *               sku:
 *                 type: string
 *                 pattern: "^[A-Z0-9]{6,20}$"
 *                 description: "Novo SKU do produto (opcional, código único em maiúsculas, 6-20 caracteres alfanuméricos)"
 *                 example: "SAMSUNG23P"
 *               category_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: "Novo ID da categoria (opcional, deve existir na tabela categories, use null para remover)"
 *                 example: 2
 *               supplier_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: "Novo ID do fornecedor (opcional, deve existir na tabela suppliers, use null para remover)"
 *                 example: 2
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       400:
 *         description: Dados inválidos ou nenhum campo fornecido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Produto não encontrado
 *       409:
 *         description: SKU ou nome do produto já existe
 */
```

### 4. Suppliers - POST (Criar Fornecedor)
```javascript
/**
 * @swagger
 * /api/v1/suppliers:
 *   post:
 *     summary: Cria um novo fornecedor
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_name
 *               - contact_name
 *               - email
 *               - phone
 *             properties:
 *               company_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: "Nome da empresa fornecedora (obrigatório, entre 2 e 100 caracteres)"
 *                 example: "Tech Distribuidora Ltda"
 *               contact_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: "Nome do contato principal (obrigatório, entre 2 e 100 caracteres)"
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: "Email do fornecedor (obrigatório, deve ser um email válido)"
 *                 example: "contato@techdistribuidora.com.br"
 *               phone:
 *                 type: string
 *                 pattern: "^\\+?[0-9]{10,15}$"
 *                 description: "Telefone do fornecedor (obrigatório, formato internacional ou nacional, 10-15 dígitos)"
 *                 example: "+55 11 99999-8888"
 *     responses:
 *       201:
 *         description: Fornecedor criado com sucesso
 *       400:
 *         description: Dados inválidos ou campos obrigatórios ausentes
 *       401:
 *         description: Não autorizado
 *       409:
 *         description: Email da empresa já cadastrado
 */
```

### 5. Auth - Login
```javascript
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Realiza login na plataforma
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: "Email do usuário (obrigatório, deve ser um email válido e cadastrado)"
 *                 example: "usuario@exemplo.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: "Senha do usuário (obrigatório, mínimo 8 caracteres, deve corresponder ao cadastro)"
 *                 example: "SenhaForte@123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Credenciais inválidas ou campos ausentes
 *       401:
 *         description: Email ou senha incorretos
 */
```

## 🎯 **Padrões de Descrição Recomendados**

### **Campos Obrigatórios:**
- Sempre inclua "(obrigatório)" na descrição
- Especifique as regras de validação
- Dê exemplos claros

### **Campos Opcionais:**
- Sempre inclua "(opcional)" na descrição
- Explique o que acontece se não for enviado
- Especifique se pode ser null

### **IDs:**
- "ID do [recurso] (obrigatório, deve ser número positivo)"
- "ID do [recurso] (opcional, deve existir na tabela [tabela])"

### **Strings:**
- "Nome do [campo] (obrigatório/opcional, entre X e Y caracteres)"
- Especifique regras especiais (sem números, maiúsculas, etc.)

### **Números:**
- "Valor do [campo] (obrigatório/opcional, deve ser maior/menor que X)"
- Especifique casas decimais se aplicável

### **Emails:**
- "Email do [usuário/fornecedor] (obrigatório, deve ser email válido)"

### **Datas:**
- "Data [campo] (obrigatório, formato YYYY-MM-DD)"

## 🚀 **Como Implementar**

1. **Copie os exemplos** acima para os endpoints correspondentes
2. **Adapte as descrições** conforme seu negócio
3. **Seja específico** sobre regras de validação
4. **Use exemplos realistas** que façam sentido
5. **Teste no Swagger UI** para verificar se aparece corretamente

## 📋 **Checklist de Revisão**

- [ ] Todos os campos têm descrição
- [ ] Descrições mencionam se é obrigatório/opcional
- [ ] Regras de validação estão explicadas
- [ ] Exemplos são realistas
- [ ] Formatos estão corretos (email, date, etc.)
- [ ] Limites (min/max) estão especificados
- [ ] Códigos de resposta estão documentados

**Com estas descrições detalhadas, sua API ficará muito mais profissional e fácil de usar!** 🚀✨
