# 🚀 Formas de Envio e Consulta de Dados em APIs REST

## 📋 **Resumo das Principais Formas**

### 1. **Query Parameters (Query Params)**
- **Uso:** Filtros, paginação, ordenação
- **Método:** GET
- **Formato:** `?key=value&key2=value2`
- **Exemplo:** `GET /products?page=1&limit=10&category=1&sort=price`

```javascript
// Exemplo de implementação
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');
  
  // Usar os parâmetros para filtrar/buscar
}
```

**Quando usar:**
- ✅ Listagens com paginação
- ✅ Filtros opcionais
- ✅ Ordenação
- ✅ Busca textual
- ❌ Dados sensíveis (aparece na URL)
- ❌ Grandes volumes de dados

---

### 2. **JSON Body (Request Body)**
- **Uso:** Envio de dados estruturados
- **Métodos:** POST, PUT, PATCH
- **Formato:** `application/json`
- **Exemplo:** POST /products com JSON completo

```javascript
// Cliente envia
{
  "name": "Mouse Gamer RGB",
  "price": 299.90,
  "stock_quantity": 50
}

// Servidor recebe
export async function POST(request) {
  const body = await request.json();
  const { name, price, stock_quantity } = body;
}
```

**Quando usar:**
- ✅ Criar recursos (POST)
- ✅ Atualizar recursos (PUT/PATCH)
- ✅ Dados complexos e estruturados
- ✅ Objetos aninhados
- ❌ GET (não deve ter body)
- ❌ Arquivos/binários

---

### 3. **Form Data (multipart/form-data)**
- **Uso:** Upload de arquivos e dados mistos
- **Métodos:** POST, PUT, PATCH
- **Formato:** `multipart/form-data`
- **Exemplo:** Upload de imagem + dados

```javascript
// Cliente envia (FormData)
const formData = new FormData();
formData.append('file', imageFile);
formData.append('title', 'Produto Image');
formData.append('description', 'Imagem do produto');

// Servidor recebe
export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const title = formData.get('title');
  
  // Processar arquivo e dados
}
```

**Quando usar:**
- ✅ Upload de arquivos (imagens, PDFs, etc.)
- ✅ Dados binários
- ✅ Arquivos + metadados juntos
- ❌ Apenas dados textuais (use JSON)
- ❌ Performance crítica (maior overhead)

---

### 4. **URL Parameters (Path Params)**
- **Uso:** Identificação de recursos específicos
- **Métodos:** GET, PUT, PATCH, DELETE
- **Formato:** `/resource/{id}`
- **Exemplo:** `GET /products/123`

```javascript
// Rota: app/api/v1/products/[id]/route.js
export async function GET(request, { params }) {
  const { id } = await params;
  const productId = parseInt(id);
  
  // Buscar produto pelo ID
}
```

**Quando usar:**
- ✅ Identificar recurso único
- ✅ Operações CRUD em item específico
- ✅ Recursos aninhados (`/categories/1/products`)
- ❌ Múltiplos parâmetros
- ❌ Dados opcionais

---

## 🆕 **Outras Formas Menos Comuns**

### 5. **URL Encoded (application/x-www-form-urlencoded)**
- **Uso:** Formulários web tradicionais
- **Métodos:** POST, PUT, PATCH
- **Formato:** `key=value&key2=value2`
- **Exemplo:** Login de formulário HTML

```javascript
// Cliente envia (como form HTML)
"name=João&email=joao@test.com&password=123456"

// Servidor recebe
export async function POST(request) {
  const formData = await request.formData();
  const name = formData.get('name');
  const email = formData.get('email');
}
```

**Quando usar:**
- ✅ Formulários HTML simples
- ✅ Compatibilidade com sistemas legados
- ❌ APIs modernas (use JSON)
- ❌ Dados complexos

---

### 6. **Raw Text/Binary**
- **Uso:** Dados brutos ou texto simples
- **Métodos:** POST, PUT
- **Formato:** `text/plain`, `application/octet-stream`
- **Exemplo:** Webhook, importação de CSV

```javascript
// Cliente envia texto puro
"nome,email,idade\nJoão,joao@test.com,30\nMaria,maria@test.com,25"

// Servidor recebe
export async function POST(request) {
  const text = await request.text();
  const lines = text.split('\n');
  // Processar CSV
}
```

**Quando usar:**
- ✅ Importação de CSV/TSV
- ✅ Webhooks (dados brutos)
- ✅ Streams de dados
- ❌ Dados estruturados
- ❌ APIs REST padrão

---

### 7. **GraphQL**
- **Uso:** Consultas flexíveis com dados específicos
- **Método:** POST
- **Formato:** `application/json` com query GraphQL
- **Exemplo:** Query personalizada

```javascript
// Cliente envia
{
  "query": "query { products { id name price } }"
}

// Servidor processa GraphQL
```

**Quando usar:**
- ✅ Múltiplos dados em uma requisição
- ✅ Campos específicos customizados
- ✅ Reduzir overfetching
- ❌ APIs REST simples
- ❌ Aprendizado elevado

---

### 8. **Server-Sent Events (SSE)**
- **Uso:** Streaming de dados em tempo real
- **Método:** GET
- **Formato:** `text/event-stream`
- **Exemplo:** Notificações, atualizações ao vivo

```javascript
// Servidor envia eventos contínuos
export async function GET(request) {
  const stream = new ReadableStream({
    start(controller) {
      // Enviar dados periodicamente
      const interval = setInterval(() => {
        controller.enqueue(`data: ${JSON.stringify({ time: Date.now() })}\n\n`);
      }, 1000);
    }
  });
  
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

**Quando usar:**
- ✅ Notificações em tempo real
- ✅ Atualizações ao vivo
- ✅ Chat systems
- ❌ APIs REST tradicionais
- ❌ Dados estáticos

---

### 9. **WebSockets**
- **Uso:** Comunicação bidirecional em tempo real
- **Protocolo:** `ws://` ou `wss://`
- **Exemplo:** Chat colaborativo, jogos online

```javascript
// Implementação mais complexa
// Requer servidor WebSocket dedicado
```

**Quando usar:**
- ✅ Chat em tempo real
- ✅ Jogos multiplayer
- ✅ Colaboração simultânea
- ❌ APIs REST simples
- ❌ Requisições stateless

---

### 10. **gRPC**
- **Uso:** Microserviços de alta performance
- **Protocolo:** HTTP/2 com Protocol Buffers
- **Exemplo:** Comunicação entre microsserviços

```javascript
// Requer setup específico com gRPC
// Não é padrão em APIs REST web
```

**Quando usar:**
- ✅ Microsserviços
- ✅ Alta performance
- ✅ Sistemas internos
- ❌ APIs web públicas
- ❌ Compatibilidade com browsers

---

## 🎯 **Guia Prático: Quando Usar Cada Método**

### **Para Listagens e Buscas:**
```javascript
// ✅ Query Params - Ideal para filtros
GET /products?category=1&price_min=100&price_max=500&sort=name

// ✅ Query Params - Paginação
GET /products?page=2&limit=20

// ✅ Query Params - Busca textual
GET /products?search=mouse%20gamer
```

### **Para Criação e Atualização:**
```javascript
// ✅ JSON Body - Criar produto
POST /products
{
  "name": "Mouse Gamer",
  "price": 299.90,
  "category_id": 1
}

// ✅ JSON Body - Atualização parcial
PATCH /products/123
{
  "price": 249.90
}

// ✅ Form Data - Upload com metadados
POST /products/123/image
Content-Type: multipart/form-data
file: [imagem.jpg]
title: "Foto do produto"
```

### **Para Operações Específicas:**
```javascript
// ✅ Path Params - Recurso específico
GET /products/123
PUT /products/123
DELETE /products/123

// ✅ Path Params - Recursos aninhados
GET /categories/1/products
GET /suppliers/5/products
```

### **Para Casos Especiais:**
```javascript
// ✅ Raw Text - Importar CSV
POST /products/import
Content-Type: text/plain
name,price,category
Mouse,299.90,Electronics

// ✅ SSE - Notificações
GET /notifications/stream
Accept: text/event-stream

// ✅ GraphQL - Query flexível
POST /graphql
{
  "query": "query { products(id: 123) { name price category { name } } }"
}
```

---

## 📊 **Tabela Comparativa Rápida**

| Método | Uso Principal | Vantagens | Desvantagens | Exemplo |
|--------|---------------|------------|--------------|---------|
| **Query Params** | Filtros, paginação | Simples, cacheável | Aparece na URL | `GET /products?cat=1` |
| **JSON Body** | Dados estruturados | Flexível, tipado | Não cacheável | `POST /products` |
| **Form Data** | Upload arquivos | Arquivos + dados | Overhead maior | `POST /upload` |
| **Path Params** | ID do recurso | Limpo, semântico | Fixo na URL | `GET /products/123` |
| **URL Encoded** | Formulários HTML | Padrão web | Limitado | `POST /login` |
| **Raw Text** | CSV, webhooks | Simples | Sem estrutura | `POST /import` |
| **GraphQL** | Queries flexíveis | Eficiente, custom | Complexo | `POST /graphql` |
| **SSE** | Real-time | Streaming contínuo | Stateful | `GET /stream` |
| **WebSockets** | Bidirecional | Full-duplex | Complexo | `WS://chat` |
| **gRPC** | Microserviços | Ultra-rápido | Limitado | `gRPC://service` |

---

## 🚀 **Recomendações para Sua API**

### **Para a Northwind Test Platform:**

1. **Query Params** ✅ (já usando)
   - Paginação: `?page=1&limit=10`
   - Filtros: `?category_id=1&supplier_id=2`
   - Busca: `?search=mouse`
   - Ordenação: `?sort=price&order=desc`

2. **JSON Body** ✅ (já usando)
   - Criar produtos, categorias, fornecedores
   - Atualizações completas (PUT)
   - Atualizações parciais (PATCH)

3. **Form Data** ✅ (já usando)
   - Upload de imagens: `/products/{id}/image`
   - Upload de PDFs: `/products/{id}/pdf`

4. **Path Params** ✅ (já usando)
   - Operações por ID: `/products/{id}`
   - Recursos aninhados: `/categories/{id}/products`

### **Para Evoluir:**
- **SSE** para notificações em tempo real
- **GraphQL** para queries complexas
- **Raw Text** para importação em lote

**Com estes métodos, sua API cobre 95% dos casos de uso!** 🚀✨
