# 🚀 Northwind Test Platform

> **Plataforma de Testes API REST para Automação QA com Next.js + Supabase**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=Playwright&logoColor=white)](https://playwright.dev/)

## 📋 Sobre o Projeto

**Northwind Test Platform** é uma aplicação REST API completa desenvolvida como **padrão ouro** para testes automatizados em ambientes QA. Criado por **Prof. Everton Ulisses** do canal **Gotas de Tecnologia**, este projeto serve como base para:

- ✅ **Testes de API REST** com validações completas
- ✅ **Autenticação JWT** com tokens seguros
- ✅ **CRUD completo** para Products, Categories e Suppliers
- ✅ **Upload de arquivos** (PNG/PDF) com validações
- ✅ **Documentação Swagger** interativa
- ✅ **Critérios de aceite** detalhados para testes

### 🎯 Público-Alvo

- **QA Engineers** que precisam de uma API robusta para testes
- **SDET** (Software Development Engineer in Test)
- **Instrutores de QA** que precisam de exemplos práticos
- **Estudantes de automação** que querem aprender com projetos reais

---

## 🏗️ Arquitetura e Tecnologias

### **Backend (Next.js API Routes)**
```
📁 app/api/v1/
├── auth/           # Autenticação JWT
├── categories/     # CRUD de categorias
├── products/       # CRUD de produtos + uploads
├── suppliers/      # CRUD de fornecedores
└── swagger.json    # Documentação automática
```

### **Database (Supabase/PostgreSQL)**
- **Tabelas:** users, categories, products, suppliers
- **Relacionamentos:** products → categories, products → suppliers
- **Autenticação:** JWT com bcrypt para senhas

### **Frontend (Swagger UI)**
- Documentação interativa em `/api-docs`
- Testes diretos na interface
- Exemplos de requisições/respostas

---

## 🚀 Quick Start

### **Pré-requisitos**
- Node.js 18+
- npm/yarn/pnpm
- Conta Supabase (opcional para desenvolvimento)

### **1. Clone o Projeto**
```bash
git clone https://github.com/evertonulisystem/northwind-test-platform.git
cd northwind-test-platform
```

### **2. Instale Dependências**
```bash
npm install
# ou
yarn install
```

### **3. Configure Variáveis de Ambiente**
```bash
cp .env.example .env.local
# Configure:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
# JWT_SECRET=your_jwt_secret
```

### **4. Execute o Servidor**
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

### **5. Acesse a Aplicação**
- **API Base:** http://localhost:3000/api/v1
- **Swagger Docs:** http://localhost:3000/api-docs
- **Health Check:** http://localhost:3000/api/v1/health

---

## 🔧 Endpoints da API

### **🔐 Autenticação**
```http
POST /api/v1/auth/login     # Login com JWT
POST /api/v1/auth/register  # Registro de usuário
POST /api/v1/auth/validate  # Validação de campos
```

### **📦 Products**
```http
GET    /api/v1/products           # Listar com paginação
POST   /api/v1/products           # Criar produto
GET    /api/v1/products/{id}      # Buscar por ID
PUT    /api/v1/products/{id}      # Atualizar completo
PATCH  /api/v1/products/{id}      # Atualização parcial
DELETE /api/v1/products/{id}      # Remover produto
POST   /api/v1/products/{id}/image # Upload imagem PNG
POST   /api/v1/products/{id}/pdf   # Upload PDF
```

### **📂 Categories**
```http
GET    /api/v1/categories           # Listar categorias
POST   /api/v1/categories           # Criar categoria
GET    /api/v1/categories/{id}      # Buscar por ID
GET    /api/v1/categories/{id}/products # Produtos da categoria
PUT    /api/v1/categories/{id}      # Atualizar
PATCH  /api/v1/categories/{id}      # Atualização parcial
DELETE /api/v1/categories/{id}      # Remover
```

### **🏭 Suppliers**
```http
GET    /api/v1/suppliers            # Listar fornecedores
POST   /api/v1/suppliers            # Criar fornecedor
GET    /api/v1/suppliers/{id}       # Buscar por ID
GET    /api/v1/suppliers/{id}/products # Produtos do fornecedor
PUT    /api/v1/suppliers/{id}       # Atualizar
PATCH  /api/v1/suppliers/{id}       # Atualização parcial
DELETE /api/v1/suppliers/{id}       # Remover
```

---

## 🧪 Testes Automatizados

### **Exemplo com Playwright**
```typescript
import { test, expect } from '@playwright/test';

test('API Products CRUD', async ({ request }) => {
  // Login
  const loginResponse = await request.post('/api/v1/auth/login', {
    data: { email: 'test@example.com', password: 'password123' }
  });
  const { token } = await loginResponse.json();
  
  // Criar produto
  const createResponse = await request.post('/api/v1/products', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      name: "Mouse Gamer Test",
      price: 299.90,
      stock_quantity: 50,
      sku: "TEST001",
      category_id: 1,
      supplier_id: 1
    }
  });
  
  expect(createResponse.status()).toBe(201);
  const product = await createResponse.json();
  expect(product.data.name).toBe("Mouse Gamer Test");
});
```

### **Critérios de Aceite**
- ✅ **Validações completas** de campos obrigatórios
- ✅ **Tokens JWT** seguros e validados
- ✅ **Status codes** HTTP corretos
- ✅ **Mensagens de erro** claras e consistentes
- ✅ **Paginação** e filtros funcionais

---

## 📊 Status Codes Padrão

| Código | Significado | Quando Usar |
|--------|-------------|-------------|
| `200` | ✅ Success | Requisição bem-sucedida |
| `201` | ✅ Created | Recurso criado |
| `400` | ❌ Bad Request | Dados inválidos |
| `401` | ❌ Unauthorized | Token ausente/inválido |
| `404` | ❌ Not Found | Recurso não encontrado |
| `409` | ❌ Conflict | Dados duplicados |
| `500` | ❌ Server Error | Erro interno |

---

## 🚀 Deploy em Produção

### **Vercel (Recomendado)**
```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Variáveis de Ambiente no Vercel**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `JWT_SECRET`

**🌐 Aplicação em Produção:** https://northwind-test-platform.vercel.app

---

## 📚 Documentação e Recursos

### **📋 Critérios de Aceite**
- [Products Criteria](./LABORATORIO/PRODUCTS-ACCEPTANCE-CRITERIA.html)
- [Categories Criteria](./LABORATORIO/CATEGORIES-ACCEPTANCE-CRITERIA.html)
- [Suppliers Criteria](./LABORATORIO/SUPPLIERS-ACCEPTANCE-CRITERIA.html)

### **🔧 Guias Técnicos**
- [Swagger Field Descriptions](./LABORATORIO/SWAGGER-FIELD-DESCRIPTIONS-GUIDE.md)
- [API Data Transfer Methods](./LABORATORIO/API-DATA-TRANSFER-METHODS.md)

### **📺 Canal Gotas de Tecnologia**
- [Vídeos de QA e Automação](https://youtube.com/@gotasdetecnologia)
- [Tutoriais práticos](https://github.com/evertonulisystem)

---

## 🤝 Contribuição

### **Para QA Engineers**
1. **Clone** o repositório
2. **Crie** testes automatizados
3. **Teste** todos os endpoints
4. **Reporte** bugs ou melhorias

### **Para Desenvolvedores**
1. **Fork** o projeto
2. **Crie** uma feature branch
3. **Implemente** melhorias
4. **Abra** um Pull Request

---

## 📜 Licença

Este projeto é **educacional** e **open-source** para a comunidade QA.

---

## 👨‍🏫 Sobre o Autor

**Prof. Everton Ulisses**  
🎓 **QA Engineer & SDET**  
📺 **Criador de conteúdo** no canal **Gotas de Tecnologia**  
🚀 **Paixão:** Ensinar automação de testes com projetos reais

### **🔗 Conecte-se**
- [GitHub](https://github.com/evertonulisystem)
- [LinkedIn](https://linkedin.com/in/evertonulisses)
- [YouTube](https://youtube.com/@gotasdetecnologia)

---

## ⭐ Apoie o Projeto

Se este projeto ajudou seus estudos em QA:

- ⭐ **Star** no repositório
- 📺 **Inscreva** no canal Gotas de Tecnologia
- 🔄 **Compartilhe** com outros QA Engineers
- 💬 **Contribua** com melhorias

---

**🚀 Happy Testing!** 🧪✨

--- 
### Habilitando DEV