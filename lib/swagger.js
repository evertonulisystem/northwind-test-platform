// lib/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QA Automation Shop API',
      version: '1.0.0',
      description: 'API completa para plataforma de testes de automação com Supabase + Next.js',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local',
      },
      {
        url: 'https://northwind-test-platform.vercel.app',
        description: 'Produção (Vercel)',
      },
    ],
    components: {
      schemas: {
        // ===== AUTENTICAÇÃO =====
        RegisterRequest: {
          type: 'object',
          required: ['full_name', 'email', 'password', 'confirmPassword'],
          properties: {
            full_name: {
              type: 'string',
              example: 'Aluno Teste',
              description: 'Nome completo do usuário'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'aluno@test.com',
              description: 'Email válido'
            },
            password: {
              type: 'string',
              example: 'SenhaForte@123',
              description: 'Senha forte (8+ chars, maiúscula, minúscula, número, caractere especial)'
            },
            confirmPassword: {
              type: 'string',
              example: 'SenhaForte@123',
              description: 'Confirmação da senha'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@qatest.com'
            },
            password: {
              type: 'string',
              example: 'Teste@123'
            }
          }
        },
        AuthSuccessResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx'
                },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'uuid-aqui' },
                    full_name: { type: 'string', example: 'Aluno Teste' },
                    email: { type: 'string', example: 'aluno@test.com' },
                    role: { type: 'string', example: 'customer' }
                  }
                }
              }
            },
            mensagens: {
              type: 'string',
              example: 'Usuário cadastrado com sucesso'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'null',
              description: 'Sempre null em respostas de erro'
            },
            mensagens: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Senha inválida', 'Mínimo de 8 caracteres']
            }
          }
        },

        // ===== PRODUTOS =====
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string', example: 'Mouse Gamer RGB' },
            price: { type: 'number', example: 299.90 },
            stock_quantity: { type: 'integer', example: 50 },
            sku: { type: 'string', example: 'MGP-2024' },
            category_id: { type: 'integer', nullable: true },
            supplier_id: { type: 'integer', nullable: true },
            slug: { type: 'string', example: 'mouse-gamer-rgb' },
            categories: {
              type: 'object',
              properties: { name: { type: 'string' } },
            },
            suppliers: {
              type: 'object',
              properties: { company_name: { type: 'string' } },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            totalPages: { type: 'integer', example: 5 },
            total: { type: 'integer', example: 47 }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT aqui (sem a palavra "Bearer")'
        }
      }
      // ⚠️ IMPORTANTE: NENHUMA security AQUI no nível global!
      // Isso permite que endpoints públicos (register/login) funcionem sem token
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Autenticação'],
          summary: 'Registrar novo usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' }
              }
            }
          },
          responses: {
            201: {
              description: 'Usuário cadastrado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthSuccessResponse' }
                }
              }
            },
            400: {
              description: 'Dados inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            409: {
              description: 'Email já cadastrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            500: {
              description: 'Erro interno do servidor',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Autenticação'],
          summary: 'Realiza login de usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Login realizado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthSuccessResponse' }
                }
              }
            },
            401: {
              description: 'Email ou senha inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            403: {
              description: 'Usuário inativo',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            500: {
              description: 'Erro interno do servidor',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'Lista produtos com paginação, filtros e ordenação',
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 }
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 }
            },
            {
              in: 'query',
              name: 'search',
              schema: { type: 'string' }
            },
            {
              in: 'query',
              name: 'category_id',
              schema: { type: 'integer' }
            },
            {
              in: 'query',
              name: 'supplier_id',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: {
              description: 'Lista paginada de produtos',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Product' }
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Products'],
          summary: 'Adiciona um novo produto',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'price', 'stock_quantity', 'sku'],
                  properties: {
                    name: { type: 'string', example: 'Mouse Gamer RGB' },
                    price: { type: 'number', example: 299.90 },
                    stock_quantity: { type: 'integer', example: 50 },
                    sku: { type: 'string', example: 'MGP-2024' },
                    category_id: { type: 'integer', nullable: true },
                    supplier_id: { type: 'integer', nullable: true }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Produto criado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Product' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            409: {
              description: 'SKU ou slug duplicado'
            },
            400: {
              description: 'Dados inválidos'
            }
          }
        }
      }
    }
  },
  apis: [
    './app/api/**/*.js',
    'app/api/**/*.js',
    './app/api/**/route.js',
    'app/api/**/route.js',
    '../app/api/**/*.js'
  ], // Lê os comentários JSDoc dos arquivos de rota (funciona em dev e prod)
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;