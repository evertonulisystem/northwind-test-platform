
// ============================================================
// Swagger OpenAPI Spec - Hardcoded completo
// Garante EXAMPLES em TODOS os campos para aparecer no Swagger UI
// ============================================================

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "QA Automation Shop API",
    version: "2.0.0",
    description: "API completa do Northwind Test Platform - Todos os endpoints com exemplos realistas",
    contact: {
      name: "QA Automation Team",
      email: "contato@gotasdetecnologia.com.br",
      url: "https://www.gotasdetecnologia.com.br"
    },
    license: { name: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  servers: [
    { url: "http://localhost:3000", description: "Ambiente Local de Desenvolvimento" },
    { url: "https://northwind-test-platform.vercel.app", description: "Produção Vercel" }
  ],
  tags: [
    { name: "🔐 Autenticação", description: "Registro, login e gestão de sessão" },
    { name: "📦 Produtos", description: "CRUD, busca e validação de produtos" },
    { name: "🏷️ Categorias", description: "Categorias de produtos" },
    { name: "🤝 Fornecedores", description: "Gestão de fornecedores" },
    { name: "🛒 Carrinho", description: "Itens do carrinho de compras" },
    { name: "📦 Pedidos", description: "Gestão de pedidos" },
    { name: "⭐ Avaliações", description: "Reviews de produtos (nova funcionalidade)" },
    { name: "🚚 Transportadoras", description: "Lista de transportadoras" },
    { name: "📊 Relatórios", description: "KPIs e relatórios" },
    { name: "🧪 Saúde e Debug", description: "Endpoints de health check" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Insira apenas o token JWT aqui (sem a palavra Bearer)"
      }
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "9a98ee38-14dd-418f-b5ef-414c38abea03" },
          full_name: { type: "string", example: "Administrador QA" },
          email: { type: "string", format: "email", example: "admin@qatest.com" },
          role: { type: "string", enum: ["admin", "customer"], example: "admin" },
          phone: { type: "string", nullable: true, example: "(11) 99999-0000" },
          address: { type: "string", nullable: true, example: "Av. Paulista, 1000, Bela Vista" },
          birth_date: { type: "string", format: "date", nullable: true, example: "1990-01-15" },
          is_active: { type: "boolean", example: true },
          created_at: { type: "string", format: "date-time", example: "2024-08-01T10:00:00.000Z" },
          last_login: { type: "string", format: "date-time", nullable: true, example: "2026-09-06T12:00:00.000Z" }
        }
      },
      RegisterRequest: {
        type: "object",
        required: ["full_name", "email", "password", "confirmPassword"],
        properties: {
          full_name: { type: "string", minLength: 3, maxLength: 100, example: "Maria Silva Santos" },
          email: { type: "string", format: "email", example: "maria.silva@exemplo.com.br" },
          password: {
            type: "string",
            format: "password",
            example: "SenhaForte@2024",
            description: "Mínimo 8 caracteres com maiúscula, minúscula, número e especial"
          },
          confirmPassword: { type: "string", format: "password", example: "SenhaForte@2024" }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@qatest.com" },
          password: { type: "string", example: "Teste@123" }
        }
      },
      AuthSuccess: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              token: {
                type: "string",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.exemplo.token.jwt.aqui"
              },
              user: { $ref: "#/components/schemas/User" }
            },
            example: {
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.exemplo_token_aqui",
              user: {
                id: "a2ba45af-e254-424b-9bf7-38bf7b8ccda4",
                full_name: "Maria Silva Santos",
                email: "maria.silva@exemplo.com.br",
                role: "customer",
                is_active: true
              }
            }
          },
          mensagens: { type: "array", items: { type: "string" }, example: ["Login realizado com sucesso!"] }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          data: { type: "null", nullable: true, example: null },
          mensagens: {
            type: "array",
            items: { type: "string" },
            example: ["Token ausente"]
          }
        }
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1, description: "ID auto gerado" },
          name: { type: "string", minLength: 6, maxLength: 40, example: "Mouse Gamer RGB Pro Wireless" },
          slug: { type: "string", example: "mouse-gamer-rgb-pro-wireless" },
          price: { type: "number", minimum: 0.01, example: 299.90 },
          stock_quantity: { type: "integer", minimum: 0, example: 150 },
          sku: { type: "string", minLength: 5, maxLength: 20, example: "MGP-2024W" },
          category_id: { type: "integer", minimum: 1, example: 1 },
          supplier_id: { type: "integer", minimum: 1, example: 1 },
          is_active: { type: "boolean", example: true },
          image_url: { type: "string", nullable: true, example: "/storage/products/1/image.png" },
          pdf_url: { type: "string", nullable: true, example: "/storage/products/1/pdf.pdf" },
          sales_count: { type: "integer", example: 284 },
          reviews_count: { type: "integer", example: 28 },
          rating: { type: "number", format: "float", example: 4.6 },
          created_at: { type: "string", format: "date-time", example: "2024-09-01T10:30:00.000Z" },
          categories: {
            type: "object",
            properties: { name: { type: "string", example: "Periféricos" } }
          },
          suppliers: {
            type: "object",
            properties: { company_name: { type: "string", example: "Tech Solutions Ltda" } }
          }
        },
        example: {
          id: 1,
          name: "Mouse Gamer RGB Pro Wireless",
          slug: "mouse-gamer-rgb-pro-wireless",
          price: 299.90,
          stock_quantity: 150,
          sku: "MGP-2024W",
          category_id: 1,
          supplier_id: 1,
          is_active: true,
          image_url: "/storage/products/1/image.png",
          sales_count: 284,
          reviews_count: 28,
          rating: 4.6,
          created_at: "2024-09-01T10:30:00.000Z",
          categories: { name: "Periféricos" },
          suppliers: { company_name: "Tech Solutions Ltda" }
        }
      },
      ProductCreateRequest: {
        type: "object",
        required: ["name", "price", "stock_quantity", "sku", "category_id", "supplier_id"],
        properties: {
          name: { type: "string", minLength: 6, maxLength: 40, example: "Teclado Mecânico Wireless" },
          price: { type: "number", minimum: 0.01, example: 549.99 },
          stock_quantity: { type: "integer", minimum: 0, example: 37 },
          sku: { type: "string", minLength: 5, maxLength: 20, example: "TCMW-2024B" },
          category_id: { type: "integer", example: 1 },
          supplier_id: { type: "integer", example: 1 }
        },
        example: {
          name: "Teclado Mecânico Wireless",
          price: 549.99,
          stock_quantity: 37,
          sku: "TCMW-2024B",
          category_id: 1,
          supplier_id: 1
        }
      },
      ProductValidationResponse: {
        type: "object",
        properties: {
          valid: { type: "boolean", example: true },
          errors: { type: "array", items: { type: "string" }, example: [] },
          warnings: { type: "array", items: { type: "string" }, example: ["SKU em formato não padrão"] },
          suggestions: { type: "array", items: { type: "string" }, example: ["Considere adicionar descrição detalhada"] },
          message: { type: "string", example: "Produto válido para cadastro" }
        }
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 92 },
          totalPages: { type: "integer", example: 10 }
        },
        example: { page: 1, limit: 10, total: 92, totalPages: 10 }
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", minLength: 3, maxLength: 100, example: "Periféricos" },
          description: { type: "string", maxLength: 500, example: "Teclados, mouses, headsets e acessórios gamers" },
          slug: { type: "string", example: "perifericos" },
          created_at: { type: "string", format: "date-time", example: "2024-01-01T00:00:00.000Z" }
        },
        example: {
          id: 1,
          name: "Periféricos",
          description: "Teclados, mouses, headsets e acessórios gamers",
          slug: "perifericos"
        }
      },
      CategoryCreateRequest: {
        type: "object",
        required: ["name", "description"],
        properties: {
          name: { type: "string", minLength: 3, maxLength: 100, example: "Eletrodomésticos" },
          description: { type: "string", maxLength: 500, example: "Aparelhos para casa e cozinha" }
        },
        example: {
          name: "Eletrodomésticos",
          description: "Aparelhos para casa e cozinha"
        }
      },
      Supplier: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          company_name: { type: "string", minLength: 3, maxLength: 100, example: "Tech Solutions Ltda" },
          contact_name: { type: "string", minLength: 5, maxLength: 80, example: "João Silva" },
          email: { type: "string", format: "email", example: "joao@techsolutions.com" },
          phone: { type: "string", example: "(11) 98765-4321" },
          cnpj: { type: "string", example: "12345678901234" },
          uf: { type: "string", example: "SP" },
          created_at: { type: "string", format: "date-time", example: "2024-01-01T00:00:00.000Z" }
        },
        example: {
          id: 1,
          company_name: "Tech Solutions Ltda",
          contact_name: "João Silva",
          email: "joao@techsolutions.com",
          phone: "(11) 98765-4321",
          cnpj: "12345678901234",
          uf: "SP"
        }
      },
      SupplierCreateRequest: {
        type: "object",
        required: ["company_name", "contact_name", "email", "phone", "cnpj", "uf"],
        properties: {
          company_name: { type: "string", example: "Tech Solutions Ltda" },
          contact_name: { type: "string", example: "João Silva" },
          email: { type: "string", format: "email", example: "joao@techsolutions.com" },
          phone: { type: "string", example: "(11) 98765-4321" },
          cnpj: { type: "string", example: "12345678901234" },
          uf: { type: "string", example: "SP" }
        },
        example: {
          company_name: "Tech Solutions Ltda",
          contact_name: "João Silva",
          email: "joao@techsolutions.com",
          phone: "(11) 98765-4321",
          cnpj: "12345678901234",
          uf: "SP"
        }
      },
      CartItem: {
        type: "object",
        properties: {
          id: { type: "integer", example: 501 },
          product_id: { type: "integer", example: 1 },
          quantity: { type: "integer", example: 2 },
          products: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              name: { type: "string", example: "Mouse Gamer RGB Pro" },
              price: { type: "number", example: 299.90 },
              sku: { type: "string", example: "MGP-2024A" },
              stock_quantity: { type: "integer", example: 150 }
            }
          }
        },
        example: {
          id: 501,
          product_id: 1,
          quantity: 2,
          products: {
            id: 1,
            name: "Mouse Gamer RGB Pro",
            price: 299.90,
            sku: "MGP-2024A",
            stock_quantity: 150
          }
        }
      },
      AddCartItemRequest: {
        type: "object",
        required: ["product_id", "quantity"],
        properties: {
          product_id: { type: "integer", example: 1 },
          quantity: { type: "integer", minimum: 1, example: 2 }
        },
        example: { product_id: 1, quantity: 2 }
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1001 },
          order_number: { type: "string", example: "ORD-20240906-1001" },
          user_id: { type: "string", example: "9a98ee38-14dd-418f-b5ef-414c38abea03" },
          status: {
            type: "string",
            enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
            example: "delivered"
          },
          total_amount: { type: "number", example: 599.80 },
          shipper_id: { type: "integer", example: 1 },
          created_at: { type: "string", format: "date-time", example: "2024-09-06T11:00:00.000Z" },
          shippers: {
            type: "object",
            properties: { company_name: { type: "string", example: "Correios SEDEX" } }
          }
        },
        example: {
          id: 1001,
          order_number: "ORD-20240906-1001",
          status: "delivered",
          total_amount: 599.80,
          created_at: "2024-09-06T11:00:00.000Z",
          shippers: { company_name: "Correios SEDEX" }
        }
      },
      OrderCreateRequest: {
        type: "object",
        required: ["items", "shipper_id"],
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                product_id: { type: "integer", example: 1 },
                quantity: { type: "integer", example: 2 },
                unit_price: { type: "number", example: 299.90 }
              }
            },
            example: [{ product_id: 1, quantity: 2, unit_price: 299.90 }]
          },
          shipper_id: { type: "integer", example: 1 },
          address_id: { type: "integer", example: 5 }
        }
      },
      Review: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          product_id: { type: "integer", example: 1 },
          user_id: { type: "string", example: "9a98ee38-14dd-418f-b5ef-414c38abea03" },
          order_id: { type: "integer", nullable: true, example: 1001 },
          rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
          title: { type: "string", nullable: true, example: "Excelente mouse!" },
          comment: { type: "string", example: "Produto de altíssima qualidade, chegou antes do prazo." },
          is_verified_purchase: { type: "boolean", example: true },
          is_approved: { type: "boolean", example: true },
          helpful_count: { type: "integer", example: 14 },
          created_at: { type: "string", format: "date-time", example: "2024-09-02T09:30:00.000Z" },
          products: {
            type: "object",
            properties: { name: { type: "string", example: "Mouse Gamer RGB Pro" } }
          }
        },
        example: {
          id: 1,
          product_id: 1,
          user_id: "9a98ee38-14dd-418f-b5ef-414c38abea03",
          order_id: 1001,
          rating: 5,
          title: "Excelente mouse!",
          comment: "Produto de altíssima qualidade, chegou antes do prazo.",
          is_verified_purchase: true,
          is_approved: true,
          helpful_count: 14,
          created_at: "2024-09-02T09:30:00.000Z",
          products: { name: "Mouse Gamer RGB Pro" }
        }
      },
      ReviewCreateRequest: {
        type: "object",
        required: ["product_id", "rating", "comment"],
        properties: {
          product_id: { type: "integer", example: 1 },
          rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
          title: { type: "string", example: "Produto excelente!" },
          comment: { type: "string", minLength: 10, example: "Chegou antes do prazo, qualidade top!" }
        },
        example: {
          product_id: 1,
          rating: 5,
          title: "Produto excelente!",
          comment: "Chegou antes do prazo, qualidade top!"
        }
      },
      Shipper: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          company_name: { type: "string", example: "Correios SEDEX" },
          phone: { type: "string", example: "(11) 3003-0100" },
          email: { type: "string", example: "sedex@correios.com.br" }
        },
        example: {
          id: 1,
          company_name: "Correios SEDEX",
          phone: "(11) 3003-0100",
          email: "sedex@correios.com.br"
        }
      }
    }
  },

  paths: {
    // ====== AUTENTICAÇÃO ======
    "/api/v1/auth/register": {
      post: {
        tags: ["🔐 Autenticação"],
        summary: "Cadastra novo usuário",
        description: "Cria uma conta (role customer padrão)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } }
        },
        responses: {
          "201": {
            description: "Usuário cadastrado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthSuccess" }
              }
            }
          },
          "400": {
            description: "Dados inválidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  SenhasDiferentes: {
                    value: { data: null, mensagens: ["As senhas não coincidem."] }
                  },
                  CamposAusentes: {
                    value: { data: null, mensagens: ["Campos obrigatórios não preenchidos: full_name, email."] }
                  }
                }
              }
            }
          },
          "409": {
            description: "Conflito",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { data: null, mensagens: ["Já existe um usuário com esse e-mail."] }
              }
            }
          }
        }
      }
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["🔐 Autenticação"],
        summary: "Realiza login",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } }
        },
        responses: {
          "200": { description: "Login bem-sucedido", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthSuccess" } } } },
          "401": {
            description: "Credenciais inválidas",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { data: null, mensagens: ["E-mail ou senha inválidos."] } } }
          }
        }
      }
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["🔐 Autenticação"],
        summary: "Dados do usuário logado",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Dados do usuário" },
          "401": {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  Ausente: { value: { data: null, mensagens: ["Token ausente"] } },
                  Invalido: { value: { data: null, mensagens: ["Token inválido"] } }
                }
              }
            }
          }
        }
      }
    },

    // ====== PRODUTOS ======
    "/api/v1/products": {
      get: {
        tags: ["📦 Produtos"],
        summary: "Lista produtos com paginação e filtros",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1, example: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 10, example: 8 } },
          { in: "query", name: "search", schema: { type: "string", example: "Gamer" } },
          { in: "query", name: "category_id", schema: { type: "integer", example: 1 } },
          { in: "query", name: "supplier_id", schema: { type: "integer", example: 2 } },
          { in: "query", name: "sortBy", schema: { type: "string", enum: ["id", "name", "price", "stock_quantity", "sku", "created_at"], example: "price" } },
          { in: "query", name: "order", schema: { type: "string", enum: ["asc", "desc"], example: "asc" } },
          { in: "query", name: "is_active", schema: { type: "string", enum: ["true", "false"], example: "true" } }
        ],
        responses: {
          "200": {
            description: "Lista paginada de produtos",
            content: {
              "application/json": {
                example: {
                  data: [
                    {
                      id: 1,
                      name: "Mouse Gamer RGB Pro Wireless",
                      price: 299.90,
                      stock_quantity: 150,
                      sku: "MGP-2024W",
                      categories: { name: "Periféricos" },
                      suppliers: { company_name: "Tech Solutions Ltda" }
                    }
                  ],
                  pagination: { page: 1, limit: 8, total: 92, totalPages: 12 },
                  mensagens: ["Produtos carregados com sucesso."]
                }
              }
            }
          },
          "401": { $ref: "#/components/responses/Unauthorized" }
        }
      },
      post: {
        tags: ["📦 Produtos"],
        summary: "Cria novo produto (US-08)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProductCreateRequest" } } }
        },
        responses: {
          "201": {
            description: "Produto criado",
            content: {
              "application/json": {
                example: {
                  data: {
                    id: 95,
                    name: "Teclado Mecânico Wireless",
                    price: 549.99,
                    stock_quantity: 37,
                    sku: "TCMW-2024B",
                    category_id: 1,
                    supplier_id: 1
                  },
                  mensagens: [
                    "Produto criado com sucesso!",
                    "Verificado: Salvo no banco Supabase (qvbbrcvqjssrbrcspwtu.supabase.co)"
                  ]
                }
              }
            }
          },
          "400": {
            description: "Dados inválidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  CamposAusentes: { value: { data: null, mensagens: ["Campos obrigatórios não preenchidos: name, sku, price."] } },
                  PrecoInvalido: { value: { data: null, mensagens: ["O preço deve ser um valor positivo maior que zero."] } },
                  EstoqueInvalido: { value: { data: null, mensagens: ["A quantidade em estoque deve ser um número inteiro maior ou igual a zero."] } }
                }
              }
            }
          },
          "404": {
            description: "Categoria ou fornecedor inexistente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  CategoriaNaoExiste: { value: { data: null, mensagens: ["Categoria selecionada não existe. Escolha uma categoria válida."] } },
                  FornecedorNaoExiste: { value: { data: null, mensagens: ["Fornecedor selecionado não existe. Escolha um fornecedor válido."] } }
                }
              }
            }
          },
          "409": {
            description: "SKU ou nome duplicado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  NomeDuplicado: { value: { data: null, mensagens: ["Já existe um produto com esse nome/slug."] } },
                  SkuDuplicado: { value: { data: null, mensagens: ["Já existe um produto com esse SKU."] } }
                }
              }
            }
          },
          "401": { $ref: "#/components/responses/Unauthorized" }
        }
      }
    },
    "/api/v1/products/{id}": {
      get: {
        tags: ["📦 Produtos"],
        summary: "Detalhes do produto",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", example: 1 } }],
        responses: {
          "200": { description: "Produto encontrado" },
          "404": { description: "Produto não encontrado", content: { "application/json": { example: { data: null, mensagens: ["Produto não encontrado."] } } } }
        }
      },
      put: {
        tags: ["📦 Produtos"],
        summary: "Atualiza produto",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", example: 1 } }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProductCreateRequest" } } } },
        responses: {
          "200": { description: "Produto atualizado" },
          "404": { description: "Produto não encontrado" }
        }
      },
      delete: {
        tags: ["📦 Produtos"],
        summary: "Exclui produto",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", example: 1 } }],
        responses: {
          "200": { description: "Produto excluído", content: { "application/json": { example: { mensagens: ["Produto removido com sucesso."] } } } },
          "404": { description: "Produto não encontrado" }
        }
      }
    },
    "/api/v1/products/{id}/image": {
      post: {
        tags: ["📦 Produtos"],
        summary: "Upload de imagem PNG",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", example: 1 } }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { type: "object", properties: { file: { type: "string", format: "binary" } } }
            }
          }
        },
        responses: {
          "200": { description: "Upload OK", content: { "application/json": { example: { data: { image_url: "/storage/products/1/image.png" }, mensagens: ["Imagem PNG atualizada com sucesso."] } } } },
          "400": {
            description: "Formato inválido",
            content: {
              "application/json": {
                example: {
                  data: null,
                  mensagens: [
                    "Apenas arquivos PNG são permitidos para imagem do produto.",
                    "Recebido: nome=\"foto.jpg\", tipo=\"image/jpeg\"."
                  ]
                }
              }
            }
          }
        }
      }
    },

    // ====== CATEGORIAS ======
    "/api/v1/categories": {
      get: {
        tags: ["🏷️ Categorias"],
        summary: "Lista categorias",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1, example: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 10, example: 1000 } }
        ],
        responses: {
          "200": {
            description: "Lista de categorias",
            content: {
              "application/json": {
                example: {
                  data: [
                    { id: 1, name: "Periféricos", description: "Teclados, mouses e acessórios", slug: "perifericos" },
                    { id: 2, name: "Eletrônicos", description: "Produtos de tecnologia", slug: "eletronicos" }
                  ],
                  pagination: { page: 1, totalPages: 1, total: 12 },
                  mensagens: ["Categorias carregadas com sucesso."]
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["🏷️ Categorias"],
        summary: "Cria categoria",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryCreateRequest" } } } },
        responses: {
          "201": {
            description: "Categoria criada",
            content: {
              "application/json": {
                example: {
                  data: { id: 13, name: "Eletrodomésticos", description: "Aparelhos para casa", slug: "eletrodomesticos" },
                  mensagens: ["Categoria criada com sucesso!"]
                }
              }
            }
          },
          "400": {
            description: "Dados inválidos",
            content: { "application/json": { example: { data: null, mensagens: ["Campos obrigatórios não preenchidos: name, description."] } } }
          },
          "409": {
            description: "Nome duplicado",
            content: { "application/json": { example: { data: null, mensagens: ["Já existe uma categoria com esse nome."] } } }
          }
        }
      }
    },

    // ====== FORNECEDORES ======
    "/api/v1/suppliers": {
      get: {
        tags: ["🤝 Fornecedores"],
        summary: "Lista fornecedores",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista",
            content: {
              "application/json": {
                example: {
                  data: [
                    {
                      id: 1,
                      company_name: "Tech Solutions Ltda",
                      contact_name: "João Silva",
                      email: "joao@techsolutions.com",
                      phone: "(11) 98765-4321",
                      cnpj: "12345678901234",
                      uf: "SP"
                    }
                  ],
                  mensagens: ["Fornecedores carregados com sucesso."]
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["🤝 Fornecedores"],
        summary: "Cria fornecedor",
        security: [{ bearerAuth: [] }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/SupplierCreateRequest" } } } },
        responses: { "201": { description: "Fornecedor criado" } }
      }
    },

    // ====== CARRINHO ======
    "/api/v1/cart": {
      get: {
        tags: ["🛒 Carrinho"],
        summary: "Itens do carrinho",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de itens",
            content: {
              "application/json": {
                example: {
                  data: [{ id: 501, product_id: 1, quantity: 2, products: { id: 1, name: "Mouse Gamer RGB Pro", price: 299.90 } }],
                  mensagens: ["Carrinho carregado com sucesso."]
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["🛒 Carrinho"],
        summary: "Adiciona item",
        security: [{ bearerAuth: [] }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/AddCartItemRequest" } } } },
        responses: {
          "201": { description: "Item adicionado" },
          "400": { description: "Estoque insuficiente", content: { "application/json": { example: { data: null, mensagens: ["Estoque insuficiente. Disponível: 150"] } } } }
        }
      }
    },

    // ====== PEDIDOS ======
    "/api/v1/orders": {
      get: {
        tags: ["📦 Pedidos"],
        summary: "Lista pedidos do usuário",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Pedidos",
            content: {
              "application/json": {
                example: {
                  data: [
                    {
                      id: 1001,
                      order_number: "ORD-20240906-1001",
                      status: "delivered",
                      total_amount: 599.80,
                      shippers: { company_name: "Correios SEDEX" }
                    }
                  ],
                  pagination: { page: 1, totalPages: 2, total: 11 }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["📦 Pedidos"],
        summary: "Checkout: cria pedido",
        security: [{ bearerAuth: [] }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/OrderCreateRequest" } } } },
        responses: { "201": { description: "Pedido criado" } }
      }
    },

    // ====== AVALIAÇÕES ======
    "/api/v1/reviews": {
      get: {
        tags: ["⭐ Avaliações"],
        summary: "Lista avaliações aprovadas",
        parameters: [{ in: "query", name: "product_id", schema: { type: "integer", example: 1 } }],
        responses: {
          "200": {
            description: "Lista de avaliações",
            content: {
              "application/json": {
                example: {
                  data: [
                    {
                      id: 1,
                      product_id: 1,
                      user_id: "9a98ee38-14dd-418f-b5ef-414c38abea03",
                      rating: 5,
                      title: "Excelente mouse!",
                      comment: "Chegou antes do prazo.",
                      helpful_count: 14,
                      created_at: "2024-09-02T09:30:00.000Z",
                      products: { name: "Mouse Gamer RGB Pro" }
                    }
                  ],
                  mensagens: ["Avaliações carregadas com sucesso."]
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["⭐ Avaliações"],
        summary: "Cria nova avaliação",
        security: [{ bearerAuth: [] }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewCreateRequest" } } } },
        responses: {
          "201": { description: "Avaliação criada" },
          "400": {
            description: "Rating inválido",
            content: { "application/json": { example: { data: null, mensagens: ["A nota deve ser um número inteiro entre 1 e 5."] } } }
          }
        }
      }
    },
    "/api/v1/reviews/without-reviews": {
      get: {
        tags: ["⭐ Avaliações"],
        summary: "Produtos vendidos sem avaliações (Nova Funcionalidade)",
        description: "SQL equivalente: SELECT p.name, p.price, p.sales_count FROM products p LEFT JOIN reviews r ON r.product_id = p.id WHERE r.id IS NULL AND p.sales_count > 0",
        responses: {
          "200": {
            description: "Produtos pendentes",
            content: {
              "application/json": {
                example: {
                  data: [
                    { id: 7, name: "Monitor 27\" 144Hz Gamer", price: 1799.90, sales_count: 34 },
                    { id: 12, name: "Notebook Core i7 16GB", price: 5299.00, sales_count: 18 }
                  ],
                  mensagens: ["Produtos sem avaliação carregados com sucesso."]
                }
              }
            }
          }
        }
      }
    },

    // ====== TRANSPORTADORAS ======
    "/api/v1/shippers": {
      get: {
        tags: ["🚚 Transportadoras"],
        summary: "Lista transportadoras",
        responses: {
          "200": {
            description: "Lista",
            content: {
              "application/json": {
                example: {
                  data: [
                    { id: 1, company_name: "Correios SEDEX", phone: "(11) 3003-0100", email: "sedex@correios.com.br" },
                    { id: 2, company_name: "Jadlog Express", phone: "(11) 4002-7200", email: "atendimento@jadlog.com.br" }
                  ]
                }
              }
            }
          }
        }
      }
    },

    // ====== RELATÓRIOS ======
    "/api/v1/reports/top-products": {
      get: {
        tags: ["📊 Relatórios"],
        summary: "Top produtos por vendas",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Ranking",
            content: {
              "application/json": {
                example: {
                  data: [
                    { name: "Mouse Gamer RGB Pro", sales_count: 284, total_revenue: 85171.60 },
                    { name: "Teclado Mecânico Wireless", sales_count: 192, total_revenue: 105598.08 }
                  ]
                }
              }
            }
          }
        }
      }
    },

    // ====== SAÚDE ======
    "/api/v1/health": {
      get: {
        tags: ["🧪 Saúde e Debug"],
        summary: "Health Check",
        responses: {
          "200": { description: "OK", content: { "application/json": { example: { status: "ok", timestamp: "2026-09-06T14:00:00.000Z", uptime: "1d 5h 32m" } } } }
        }
      }
    },
    "/api/v1/keepalive": {
      get: {
        tags: ["🧪 Saúde e Debug"],
        summary: "Keep Alive Vercel",
        responses: { "200": { description: "OK", content: { "text/plain": { example: "OK" } } } }
      }
    }
  },

  responses: {
    Unauthorized: {
      description: "Token ausente ou inválido",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ErrorResponse" },
          examples: {
            Ausente: { summary: "Sem token no header", value: { data: null, mensagens: ["Token ausente"] } },
            Invalido: { summary: "Token expirado/inválido", value: { data: null, mensagens: ["Token inválido"] } }
          }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
