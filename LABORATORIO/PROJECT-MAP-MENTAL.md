# 🗺️ Northwind Test Platform - Mapa Mental Completo

## 🎯 Visão Geral do Projeto

### 📋 Propósito Principal
- **Plataforma de Testes API REST** para QA Engineers
- **Padrão Ouro** para automação de testes
- **Educacional** - Canal Gotas de Tecnologia
- **Portfolio** - Prof. Everton Ulisses (SDET)

---

## 🏗️ Arquitetura do Sistema

### 🎨 Frontend (Swagger UI)
```
📁 Frontend
├── 🌐 Swagger UI (/api-docs)
│   ├── 📚 Documentação Interativa
│   ├── 🧪 Testes Diretos na Interface
│   └── 📖 Exemplos de Requisições
├── 🎨 Design Corporativo
│   ├── 🏢 Azure DevOps Style (Categories)
│   ├── 🎨 Moderno com Gradientes (Products)
│   └── 🏷️ Paleta Terrosa (Suppliers)
└── 📱 Responsivo e Profissional
```

### 🔧 Backend (Next.js API Routes)
```
📁 app/api/v1/
├── 🔐 auth/
│   ├── POST /login (JWT Authentication)
│   ├── POST /register (User Creation)
│   └── POST /validate (Field Validation)
├── 📦 products/
│   ├── GET / (List + Pagination + Filters)
│   ├── POST / (Create with Validation)
│   ├── GET /{id} (Read by ID)
│   ├── PUT /{id} (Update Complete)
│   ├── PATCH /{id} (Update Partial)
│   ├── DELETE /{id} (Remove)
│   ├── POST /{id}/image (Upload PNG)
│   └── POST /{id}/pdf (Upload PDF)
├── 📂 categories/
│   ├── GET / (List + Search + Sort)
│   ├── POST / (Create with Slug)
│   ├── GET /{id} (Read Category)
│   ├── GET /{id}/products (Products by Category)
│   ├── PUT /{id} (Update Complete)
│   ├── PATCH /{id} (Update Partial)
│   └── DELETE /{id} (Remove)
├── 🏭 suppliers/
│   ├── GET / (List + Search + Sort)
│   ├── POST / (Create with Validation)
│   ├── GET /{id} (Read by ID)
│   ├── GET /{id}/products (Products by Supplier)
│   ├── PUT /{id} (Update Complete)
│   ├── PATCH /{id} (Update Partial)
│   ├── DELETE /{id} (Remove)
│   └── POST /{id}/document (Upload PDF)
├── 🏥 health/
│   └── GET / (Keepalive + Health Check + QA Info)
├── 📚 swagger.json/
│   └── GET / (Auto-generated Documentation)
└── 🔧 debug/ (Development Tools)
```

### 🗄️ Database (Supabase/PostgreSQL)
```
📁 Database Schema
├── 👥 users (Autenticação)
│   ├── id, email, password (bcrypt)
│   ├── role, created_at, updated_at
│   └── JWT Token Management
├── 📂 categories (Categorias)
│   ├── id, name, description, slug
│   ├── created_at, updated_at
│   └── Unique name + slug constraints
├── 📦 products (Produtos)
│   ├── id, name, slug, price, stock_quantity
│   ├── sku, category_id, supplier_id
│   ├── created_at, updated_at
│   └── Foreign Keys + Unique Constraints
├── 🏭 suppliers (Fornecedores)
│   ├── id, company_name, contact_name
│   ├── email, phone, created_at, updated_at
│   └── Unique email constraint
└── 🔗 Relacionamentos
    ├── products → categories (many-to-one)
    ├── products → suppliers (many-to-one)
    └── Cascade deletes e updates
```

---

## 🔐 Sistema de Autenticação

### 🛡️ JWT Flow
```
🔐 Authentication Flow
├── 📝 POST /auth/register
│   ├── ✅ Email validation (unique + format)
│   ├── ✅ Password bcrypt hash
│   └── ✅ Role assignment (admin/user)
├── 🔑 POST /auth/login
│   ├── ✅ Email verification
│   ├── ✅ Password compare (bcrypt)
│   └── ✅ JWT token generation (24h)
├── 🧪 POST /auth/validate
│   ├── ✅ Real-time field validation
│   ├── ✅ Email format check
│   └── ✅ Password strength validation
└── 🛡️ Middleware Protection
    ├── ✅ Token extraction (Bearer)
    ├── ✅ JWT verification
    └── ✅ 401 Unauthorized handling
```

### 🔑 JWT Features
- **Token Lifetime:** 24 horas
- **Secret Key:** Environment variable
- **Payload:** user_id, email, role, expires_at
- **Refresh:** Login required after expiration

---

## 📊 Funcionalidades de Negócio

### 📦 Products Management
```
📦 Products Features
├── 📋 CRUD Completo
│   ├── ✅ Create (name, price, stock, sku, category, supplier)
│   ├── ✅ Read (list + pagination + filters + search)
│   ├── ✅ Update (PUT completo + PATCH parcial)
│   └── ✅ Delete (remoção lógica)
├── 🔍 Busca e Filtros
│   ├── ✅ Text search (name, description)
│   ├── ✅ Category filter
│   ├── ✅ Supplier filter
│   ├── ✅ Price range
│   ├── ✅ Stock quantity
│   └── ✅ Sorting (name, price, stock, date)
├── 📁 Upload de Arquivos
│   ├── ✅ PNG images (2MB max)
│   ├── ✅ PDF documents (2MB max)
│   ├── ✅ File validation (type + size)
│   └── ✅ URL generation for access
└── 🔧 Validações
    ├── ✅ Name (3-100 chars, unique)
    ├── ✅ Price (> 0, 2 decimals)
    ├── ✅ Stock (integer ≥ 0)
    ├── ✅ SKU (6-20 chars, uppercase, unique)
    ├── ✅ Category (must exist)
    └── ✅ Supplier (must exist)
```

### 📂 Categories Management
```
📂 Categories Features
├── 📋 CRUD Completo
│   ├── ✅ Create (name, description, auto-slug)
│   ├── ✅ Read (list + search + sort)
│   ├── ✅ Update (PUT + PATCH)
│   └── ✅ Delete (cascade products handling)
├── 🔍 Funcionalidades Especiais
│   ├── ✅ Auto-slug generation
│   ├── ✅ Unique name validation
│   ├── ✅ Products by category
│   └── ✅ Category statistics
└── 🔧 Validações
    ├── ✅ Name (1-25 chars, unique)
    ├── ✅ Description (6-40 chars)
    └── ✅ Slug (auto-generated + unique)
```

### 🏭 Suppliers Management
```
🏭 Suppliers Features
├── 📋 CRUD Completo
│   ├── ✅ Create (company, contact, email, phone)
│   ├── ✅ Read (list + search + sort)
│   ├── ✅ Update (PUT + PATCH)
│   └── ✅ Delete (products reassignment)
├── 🔍 Funcionalidades Especiais
│   ├── ✅ Products by supplier
│   ├── ✅ Contact information
│   ├── ✅ Document upload (PDF)
│   └── ✅ Supplier statistics
└── 🔧 Validações
    ├── ✅ Company name (2-100 chars, unique)
    ├── ✅ Contact name (2-100 chars)
    ├── ✅ Email (valid format, unique)
    └── ✅ Phone (10-15 chars, international format)
```

---

## 🧪 Sistema de Testes

### 📋 Critérios de Aceite
```
🧪 Acceptance Criteria
├── 📦 Products (8 Endpoints)
│   ├── ✅ Validação de campos obrigatórios
│   ├── ✅ Unicidade de SKU e nome
│   ├── ✅ Formato de dados (preço, estoque)
│   ├── ✅ Upload de arquivos (PNG/PDF, 2MB)
│   └── ✅ Paginação e filtros funcionais
├── 📂 Categories (7 Endpoints)
│   ├── ✅ Geração automática de slug
│   ├── ✅ Validação de nome único
│   ├── ✅ Comprimento de campos
│   └── ✅ Relacionamento com produtos
├── 🏭 Suppliers (7 Endpoints)
│   ├── ✅ Validação de email
│   ├── ✅ Formato de telefone
│   ├── ✅ Nome da empresa único
│   └── ✅ Upload de documentos
└── 🔐 Auth (3 Endpoints)
    ├── ✅ JWT token generation
    ├── ✅ Password bcrypt hash
    ├── ✅ Email validation
    └── ✅ Field validation API
```

### 🎯 Status Codes Padrão
```
📊 HTTP Status Codes
├── ✅ 200 - Success (GET, PUT, PATCH, DELETE)
├── ✅ 201 - Created (POST)
├── ❌ 400 - Bad Request (Validation errors)
├── ❌ 401 - Unauthorized (No/Invalid token)
├── ❌ 404 - Not Found (Resource missing)
├── ❌ 409 - Conflict (Duplicate data)
└── ❌ 500 - Server Error (Internal issues)
```

---

## 🚀 Deploy e Produção

### 🌐 Vercel Deployment
```
🚀 Production Setup
├── 🌐 https://northwind-test-platform.vercel.app
├── 🔧 Environment Variables
│   ├── NEXT_PUBLIC_SUPABASE_URL
│   ├── NEXT_PUBLIC_SUPABASE_ANON_KEY
│   └── JWT_SECRET
├── 📊 Performance
│   ├── ✅ Edge functions
│   ├── ✅ Auto-scaling
│   ├── ✅ Global CDN
│   └── ✅ SSL certificate
└── 🔄 CI/CD Pipeline
    ├── ✅ Auto-deploy on push
    ├── ✅ Preview deployments
    ├── ✅ Rollback capability
    └── ✅ Environment separation
```

### 🏥 Health Monitoring
```
🔍 Health Check System
├── 📡 GET /api/v1/health
│   ├── ✅ Keepalive (Supabase connection)
│   ├── ✅ Service status (DB + Auth)
│   ├── ✅ Response time metrics
│   ├── ✅ QA test data and tips
│   └── ✅ Automation suggestions
├── 📊 Metrics Collection
│   ├── ✅ Response times
│   ├── ✅ Memory usage
│   ├── ✅ Uptime tracking
│   └── ✅ Error rates
└── 🤖 Automation
    ├── ✅ GitHub Actions (keepalive)
    ├── ✅ Vercel Cron Jobs
    ├── ✅ External monitoring
    └── ✅ Alert configuration
```

---

## 📚 Recursos Educacionais

### 📋 Documentação
```
📚 Educational Resources
├── 📄 HTML Criteria Files
│   ├── 📦 PRODUCTS-ACCEPTANCE-CRITERIA.html
│   ├── 📂 CATEGORIES-ACCEPTANCE-CRITERIA.html
│   ├── 🏭 SUPPLIERS-ACCEPTANCE-CRITERIA.html
│   └── 🎨 Multiple design styles
├── 📖 Technical Guides
│   ├── 🔧 SWAGGER-FIELD-DESCRIPTIONS-GUIDE.md
│   ├── 📡 API-DATA-TRANSFER-METHODS.md
│   └── 🗂️ API-MARKET-STANDARDS-ASSESSMENT.md
├── 🧪 Test Examples
│   ├── ✅ Playwright code samples
│   ├── ✅ Postman collection
│   ├── ✅ Manual test scenarios
│   └── ✅ Automation strategies
└── 🎓 Learning Path
    ├── 📱 Basic API testing
    ├── 🔐 Authentication testing
    ├── 📁 File upload testing
    ├── 🔍 Validation testing
    └── 🚀 Performance testing
```

### 🎯 Branding e Autoria
```
👨‍🏫 Author Information
├── 👤 Prof. Everton Ulisses
├── 🎓 QA Engineer & SDET
├── 📺 Gotas de Tecnologia Channel
├── 🚀 Passion: Teaching automation
└── 🔗 Social Links
    ├── GitHub: evertonulisystem
    ├── LinkedIn: evertonulisses
    └── YouTube: @gotasdetecnologia
```

---

## 🎨 Design e UX

### 🎨 Interface Patterns
```
🎨 Design System
├── 🏢 Corporate Style (Categories)
│   ├── Azure DevOps colors
│   ├── Clean typography
│   ├── Professional layout
│   └── Minimal animations
├── 🎨 Modern Style (Products)
│   ├── Vibrant gradients
│   ├── Interactive elements
│   ├── Smooth animations
│   └── Rich visual feedback
├── 🏷️ Earth Tones (Suppliers)
│   ├── Brown/gold palette
│   ├── Warm colors
│   ├── Professional feel
│   └── Corporate elegance
└── 📱 Responsive Design
    ├── ✅ Mobile-first approach
    ├── ✅ Tablet optimization
    ├── ✅ Desktop enhancement
    └── ✅ Accessibility compliance
```

---

## 🔧 Ferramentas e Tecnologias

### 🛠️ Tech Stack
```
🔧 Technology Stack
├── ⚛️ Frontend
│   ├── Next.js 14 (App Router)
│   ├── React 18
│   ├── Swagger UI
│   └── Tailwind CSS
├── 🔧 Backend
│   ├── Next.js API Routes
│   ├── Node.js 18+
│   ├── JavaScript/ES6+
│   └── Supabase Client
├── 🗄️ Database
│   ├── Supabase (PostgreSQL)
│   ├── Real-time capabilities
│   ├── Row Level Security
│   └── Automatic backups
├── 🔐 Security
│   ├── JWT authentication
│   ├── bcrypt password hashing
│   ├── CORS configuration
│   └── Environment variables
└── 🧪 Testing
    ├── Playwright
    ├── Postman
    ├── Swagger UI
    └── Manual testing
```

### 📦 Dependencies
```
📦 Package Dependencies
├── 🚀 Core
│   ├── next (React framework)
│   ├── react (UI library)
│   ├── @supabase/supabase-js (Database)
│   └── swagger-ui-react (Documentation)
├── 🔐 Security
│   ├── bcryptjs (Password hashing)
│   ├── jsonwebtoken (JWT)
│   └── @types/bcryptjs, @types/jsonwebtoken
├── 🎨 Styling
│   ├── tailwindcss (CSS framework)
│   ├── autoprefixer (CSS prefixes)
│   └── postcss (CSS processing)
└── 🔧 Development
    ├── eslint (Code linting)
    ├── jsconfig.json (JS config)
    └── vercel (Deployment)
```

---

## 🎯 Roadmap Futuro

### 🚀 Próximas Features
```
🗺️ Future Roadmap
├── 🔐 Enhanced Security
│   ├── OAuth2 integration
│   ├── Multi-factor auth
│   ├── Rate limiting
│   └── API key management
├── 📊 Analytics & Monitoring
│   ├── Usage statistics
│   ├── Performance metrics
│   ├── Error tracking
│   └── User analytics
├── 🧪 Advanced Testing
│   ├── Load testing scenarios
│   ├── Security testing suite
│   ├── Performance benchmarks
│   └── Automated regression tests
├── 📱 Mobile App
│   ├── React Native app
│   ├── Offline capabilities
│   ├── Push notifications
│   └── Biometric auth
└── 🌐 Multi-tenant
    ├── Organization support
    ├── Team management
    ├── Role-based access
    └── White-label options
```

---

## 📊 Estatísticas do Projeto

### 📈 Metrics
```
📊 Project Statistics
├── 📁 Code Structure
│   ├── 41 API files
│   ├── 8 Component files
│   ├── 5 Library files
│   └── 4 Configuration files
├── 🔧 API Endpoints
│   ├── 22 total endpoints
│   ├── 18 protected (JWT)
│   ├── 4 public endpoints
│   └── 3 file upload endpoints
├── 📋 Documentation
│   ├── 3 HTML criteria files
│   ├── 3 Markdown guides
│   ├── 1 Professional README
│   └── 1 Mental map (this file)
├── 🎨 Design Variants
│   ├── Azure DevOps style
│   ├── Modern gradient style
│   ├── Earth tones style
│   └── Corporate professional
└── 🧪 Test Coverage
    ├── 100% endpoint coverage
    ├── All status codes tested
    ├── File upload validation
    └── Security testing
```

---

## 🎯 Conclusão

### 🏆 Valor do Projeto
- **🎓 Educacional:** Padrão de referência para QA
- **🚀 Production-ready:** API robusta e escalável
- **📚 Completo:** Do básico ao avançado
- **👨‍🏫 Autoria:** Profissional com experiência real
- **🌐 Open Source:** Contribuição para comunidade QA

### 🚀 Impacto Esperado
- **Formação** de QA Engineers qualificados
- **Referência** para projetos de automação
- **Portfólio** demonstrando competências SDET
- **Comunidade** de aprendizado colaborativo
- **Inovação** em técnicas de teste

---

**🗺️ Este mapa mental serve como guia completo para entender a arquitetura, funcionalidades e propósito da Northwind Test Platform!**

**Use com a extensão Markmap para visualização gráfica!** 🚀✨
