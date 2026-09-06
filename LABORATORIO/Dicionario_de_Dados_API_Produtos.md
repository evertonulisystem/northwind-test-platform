# Dicionário de Dados - API de Produtos

## Visão Geral
Este documento descreve todos os endpoints, campos, validações e mensagens de erro da API de Produtos, alinhado com os Critérios de Aceite da US-08 e integração com o Swagger.

---

## 1. Endpoints da API

| Método | Rota | Descrição | Autenticação Requerida |
|--------|------|-----------|------------------------|
| GET | `/api/v1/products` | Lista produtos com paginação, filtros e ordenação | Sim |
| POST | `/api/v1/products` | Cria um novo produto | Sim |
| GET | `/api/v1/products/{id}` | Busca um produto por ID | Sim |
| PUT | `/api/v1/products/{id}` | Atualiza um produto existente | Sim |
| POST | `/api/v1/products/{id}/image` | Faz upload de imagem PNG para um produto | Sim |

---

## 2. Schemas e Campos

### 2.1 Schema: Product (Produto)

| Campo | Tipo | Obrigatório | Validações | Descrição |
|-------|------|-------------|------------|-----------|
| `id` | Integer | Sim (gerado automaticamente) | Valor positivo, único | Identificador único do produto |
| `name` | String | Sim | Tamanho: 6-40 caracteres; Sem números; Sem caracteres especiais (exceto espaços); Sem espaços duplicados; Único | Nome completo do produto |
| `price` | Number | Sim | Valor > 0; Máximo 999999.99; 2 casas decimais | Preço de venda do produto |
| `stock_quantity` | Integer | Sim | Valor ≥ 0; Máximo 999 | Quantidade em estoque |
| `sku` | String | Sim | Tamanho: 5-20 caracteres; Apenas letras maiúsculas, números e hífen; Inicia com letra maiúscula; Único | Código único do produto (Stock Keeping Unit) |
| `slug` | String | Sim (gerado automaticamente) | Tamanho máximo 100 caracteres; Apenas letras minúsculas, números e hífen | Slug gerado do nome do produto (para URLs amigáveis) |
| `category_id` | Integer | Sim | Deve existir na tabela `categories`; Valor ≥ 1 | Identificador da categoria do produto |
| `supplier_id` | Integer | Sim | Deve existir na tabela `suppliers`; Valor ≥ 1 | Identificador do fornecedor do produto |
| `created_at` | DateTime | Sim (gerado automaticamente) | - | Data e hora de criação do produto |

---

## 3. Detalhes dos Endpoints

---

### 3.1 Endpoint: GET /api/v1/products
**Descrição:** Lista produtos com paginação, filtros e ordenação.

#### Parâmetros de Query
| Parâmetro | Tipo | Obrigatório | Padrão | Validações | Descrição |
|-----------|------|-------------|--------|------------|-----------|
| `page` | Integer | Não | 1 | ≥ 1 | Número da página |
| `limit` | Integer | Não | 10 | 1-1000 | Quantidade de itens por página |
| `search` | String | Não | - | - | Busca por nome, SKU ou ID do produto |
| `category_id` | Integer | Não | - | Deve existir na tabela `categories` | Filtrar por ID da categoria |
| `supplier_id` | Integer | Não | - | Deve existir na tabela `suppliers` | Filtrar por ID do fornecedor |
| `sortBy` | String | Não | `name` | Valores permitidos: `id`, `name`, `price`, `stock_quantity`, `sku`, `created_at` | Campo de ordenação |
| `order` | String | Não | `asc` | Valores permitidos: `asc`, `desc` | Ordem de ordenação (crescente/decrescente) |

#### Resposta de Sucesso (200)
```json
{
  "data": [
    {
      "id": 1,
      "name": "Mouse Gamer RGB Pro Wireless",
      "price": 299.90,
      "stock_quantity": 50,
      "sku": "MGP2024W",
      "category_id": 1,
      "supplier_id": 1,
      "slug": "mouse-gamer-rgb-pro-wireless",
      "categories": { "name": "Eletrônicos" },
      "suppliers": { "company_name": "Tech Solutions Ltda" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  },
  "mensagens": ["Produtos carregados com sucesso."]
}
```

#### Mensagens de Erro
| Status Code | Mensagem | Causa |
|-------------|----------|-------|
| 401 | `Token ausente` | Token JWT não fornecido no header `Authorization` |
| 401 | `Token inválido` | Token JWT expirado ou inválido |
| 400 | `Campo de ordenação '{campo}' não é permitido. Use: id, name, price, stock_quantity, sku, created_at.` | Campo `sortBy` inválido |
| 400 | `Ordem '{ordem}' não é permitida. Use: asc ou desc.` | Valor de `order` inválido |
| 404 | `Nenhum produto encontrado para os filtros aplicados.` | Filtros aplicados não retornaram resultados |
| 500 | `Erro interno ao carregar produtos.` | Erro no servidor |

---

### 3.2 Endpoint: POST /api/v1/products
**Descrição:** Cria um novo produto no catálogo.

#### Corpo da Requisição (application/json)
```json
{
  "name": "Mouse Gamer RGB Pro Wireless",
  "price": 299.90,
  "stock_quantity": 50,
  "sku": "MGP2024W",
  "category_id": 1,
  "supplier_id": 1
}
```

#### Resposta de Sucesso (201)
```json
{
  "data": {
    "id": 101,
    "name": "Mouse Gamer RGB Pro Wireless",
    "price": 299.90,
    "stock_quantity": 50,
    "sku": "MGP2024W",
    "category_id": 1,
    "supplier_id": 1,
    "slug": "mouse-gamer-rgb-pro-wireless",
    "created_at": "2026-07-05T12:34:56.789Z"
  },
  "mensagens": [
    "Produto criado com sucesso!",
    "Verificado: Salvo no banco Supabase (seu-projeto.supabase.co)"
  ]
}
```

#### Mensagens de Erro
| Status Code | Mensagem | Causa |
|-------------|----------|-------|
| 401 | `Token ausente` | Token JWT não fornecido |
| 401 | `Token inválido` | Token JWT expirado ou inválido |
| 400 | `Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.` | JSON inválido no corpo da requisição |
| 400 | `Nenhum dado informado. Preencha os campos do produto.` | Corpo da requisição vazio |
| 400 | `Campos obrigatórios não preenchidos: {campos}.` | Um ou mais campos obrigatórios ausentes |
| 400 | `O preço deve ser um valor positivo maior que zero.` | Preço ≤ 0 ou não é um número |
| 400 | `A quantidade em estoque deve ser um número inteiro maior ou igual a zero.` | Estoque < 0 ou não é um número |
| 409 | `Já existe um produto com esse nome/slug.` | Nome do produto já existe |
| 409 | `Já existe um produto com esse SKU.` | SKU já existe |
| 400 | `Categoria selecionada não existe. Escolha uma categoria válida.` | `category_id` não existe na tabela `categories` |
| 400 | `Fornecedor selecionado não existe. Escolha um fornecedor válido.` | `supplier_id` não existe na tabela `suppliers` |
| 500 | `Erro ao criar produto.` | Erro genérico no servidor |

---

### 3.3 Endpoint: GET /api/v1/products/{id}
**Descrição:** Busca um produto pelo ID.

#### Parâmetro de Path
| Parâmetro | Tipo | Obrigatório | Validações |
|-----------|------|-------------|------------|
| `id` | Integer | Sim | ≥ 1, produto existe |

#### Resposta de Sucesso (200)
```json
{
  "data": {
    "id": 1,
    "name": "Mouse Gamer RGB Pro Wireless",
    "price": 299.90,
    "stock_quantity": 50,
    "sku": "MGP2024W",
    "category_id": 1,
    "supplier_id": 1,
    "slug": "mouse-gamer-rgb-pro-wireless",
    "categories": { "name": "Eletrônicos" },
    "suppliers": { "company_name": "Tech Solutions Ltda" }
  },
  "mensagens": ["Produto carregado com sucesso."]
}
```

#### Mensagens de Erro
| Status Code | Mensagem | Causa |
|-------------|----------|-------|
| 401 | `Token ausente` | Token JWT não fornecido |
| 401 | `Token inválido` | Token JWT expirado ou inválido |
| 400 | `ID do produto inválido. Deve ser um número positivo.` | `id` não é um número ou é ≤ 0 |
| 404 | `Produto com ID {id} não encontrado.` | Produto com o ID fornecido não existe |
| 500 | `Erro interno ao buscar produto.` | Erro no servidor |

---

### 3.4 Endpoint: POST /api/v1/products/{id}/image
**Descrição:** Faz upload de uma imagem PNG para um produto.

#### Parâmetro de Path
| Parâmetro | Tipo | Obrigatório | Validações |
|-----------|------|-------------|------------|
| `id` | Integer | Sim | ≥ 1, produto existe |

#### Corpo da Requisição (multipart/form-data)
| Campo | Tipo | Obrigatório | Validações | Descrição |
|-------|------|-------------|------------|-----------|
| `file` | File | Sim | Tipo `image/png`; Extensão `.png`; Tamanho máximo 2MB | Arquivo de imagem PNG do produto |

#### Resposta de Sucesso (200)
```json
{
  "data": {
    "id": "uuid-aqui",
    "filename": "uuid-aqui_imagem.png",
    "size": 1024000,
    "mimetype": "image/png",
    "productId": 1,
    "url": "/api/v1/products/1/image/uuid-aqui"
  },
  "mensagens": ["Upload realizado com sucesso!"]
}
```

#### Mensagens de Erro
| Status Code | Mensagem | Causa |
|-------------|----------|-------|
| 401 | `Token ausente` | Token JWT não fornecido |
| 401 | `Token inválido` | Token JWT expirado ou inválido |
| 400 | `ID do produto inválido.` | `id` não é um número ou é ≤ 0 |
| 404 | `Produto com ID {id} não encontrado.` | Produto com o ID fornecido não existe |
| 400 | `Nenhum arquivo enviado ou campo "file" ausente.` | Campo `file` não fornecido |
| 400 | `Apenas arquivos PNG são permitidos para imagem do produto. Recebido: nome="{nome}", tipo="{tipo}". Certifique-se de que o arquivo tem a extensão .png e o tipo image/png.` | Arquivo não é PNG ou extensão incorreta |
| 400 | `Arquivo muito grande. Tamanho máximo permitido: 2MB. Tamanho atual: {tamanho}MB` | Arquivo excede 2MB |
| 500 | `Erro ao fazer upload para o storage na nuvem.` | Erro no upload para o Supabase Storage |

---

## 4. Integração com Swagger
A documentação Swagger está disponível na rota `/api-docs` do projeto. Todos os endpoints descritos acima estão documentados com:
- Exemplos de requisição/resposta
- Validações de campos
- Mensagens de erro
- Autenticação Bearer Token

Para acessar o Swagger:
1. Inicie o servidor local (`npm run dev`)
2. Acesse `http://localhost:3000/api-docs`
3. Clique em `Authorize` e insira o token JWT no formato `Bearer SEU_TOKEN`
