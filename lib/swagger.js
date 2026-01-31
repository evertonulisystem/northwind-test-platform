const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QA Automation Shop API',
      version: '1.0.0',
      description: `
# 🚀 API Completa para Testes de Automação

Esta API foi projetada especificamente para estudantes de testes de automação aprenderem e praticarem em um ambiente realista.


---
**Desenvolvido com ❤️ para a comunidade de QA Automation**
      `,
      contact: {
        name: 'QA Automation Team',
        email: 'support@qaautomation.com',
        url: 'https://github.com/qaautomation/api'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
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
        Supplier: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            company_name: { type: 'string', example: 'Tech Solutions Ltda' },
            contact_name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao@techsolutions.com' },
            phone: { type: 'string', example: '(11) 98765-4321' },
            cnpj: { type: 'string', example: '12345678901234' },
            uf: { type: 'string', example: 'SP' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string', example: 'Eletrônicos' },
            description: { type: 'string', example: 'Produtos eletrônicos variados' },
            slug: { type: 'string', example: 'eletronicos' },
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
      '/api/auth/me': {
        get: {
          tags: ['Autenticação'],
          summary: 'Obtém dados do usuário autenticado',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Dados do usuário',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          user: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              email: { type: 'string' },
                              full_name: { type: 'string' },
                              role: { type: 'string' },
                              phone: { type: 'string', nullable: true },
                              address: { type: 'string', nullable: true },
                              birth_date: { type: 'string', nullable: true },
                              created_at: { type: 'string' },
                              last_login: { type: 'string', nullable: true },
                              is_active: { type: 'boolean' }
                            }
                          }
                        }
                      },
                      mensagens: { type: 'string' }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            404: {
              description: 'Usuário não encontrado'
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
          security: [{ bearerAuth: [] }],
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
            401: {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
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
      },
      '/api/products/{id}': {
        put: {
          tags: ['Products'],
          summary: 'Atualiza um produto existente',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    price: { type: 'number' },
                    stock_quantity: { type: 'integer' },
                    sku: { type: 'string' },
                    category_id: { type: 'integer', nullable: true },
                    supplier_id: { type: 'integer', nullable: true }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Produto atualizado',
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
            401: {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            404: {
              description: 'Produto não encontrado'
            }
          }
        },
        delete: {
          tags: ['Products'],
          summary: 'Remove um produto',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: {
              description: 'Produto removido',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            404: {
              description: 'Produto não encontrado'
            }
          }
        }
      },
      '/api/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Lista todas as categorias',
          responses: {
            200: {
              description: 'Lista de categorias',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      categories: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/suppliers': {
        get: {
          tags: ['Suppliers'],
          summary: 'Lista todos os fornecedores',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Lista de fornecedores',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Supplier'
                        }
                      },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Token ausente'
            }
          }
        },
        post: {
          tags: ['Suppliers'],
          summary: 'Adiciona um novo fornecedor',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['company_name', 'contact_name', 'email', 'phone', 'cnpj', 'uf'],
                  properties: {
                    company_name: {
                      type: 'string',
                      minLength: 3,
                      maxLength: 100,
                      example: 'Tech Solutions Ltda',
                      description: 'Razão social da empresa'
                    },
                    contact_name: {
                      type: 'string',
                      minLength: 5,
                      maxLength: 80,
                      example: 'João Silva',
                      description: 'Nome do contato'
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'joao@techsolutions.com',
                      description: 'E-mail do fornecedor'
                    },
                    phone: {
                      type: 'string',
                      pattern: '^\\([0-9]{2}\\) [0-9]{5}-[0-9]{4}$',
                      example: '(11) 98765-4321',
                      description: 'Telefone no formato (XX) XXXXX-XXXX'
                    },
                    cnpj: {
                      type: 'string',
                      pattern: '^[0-9]{14}$',
                      example: '12345678901234',
                      description: 'CNPJ com 14 números'
                    },
                    uf: {
                      type: 'string',
                      pattern: '^[A-Z]{2}$',
                      example: 'SP',
                      description: 'Sigla do estado (2 letras)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Fornecedor criado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        $ref: '#/components/schemas/Supplier'
                      },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Dados inválidos'
            },
            401: {
              description: 'Token ausente'
            },
            409: {
              description: 'Email ou CNPJ duplicado'
            }
          }
        }
      },
      '/api/suppliers/{id}': {
        get: {
          tags: ['Suppliers'],
          summary: 'Lista produtos de um fornecedor',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'ID do fornecedor'
            }
          ],
          responses: {
            200: {
              description: 'Lista de produtos do fornecedor',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      products: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Product'
                        }
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Token ausente'
            }
          }
        },
        put: {
          tags: ['Suppliers'],
          summary: 'Atualiza um fornecedor existente',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'ID do fornecedor'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['company_name', 'contact_name', 'email', 'phone', 'cnpj', 'uf'],
                  properties: {
                    company_name: {
                      type: 'string',
                      minLength: 3,
                      maxLength: 100,
                      example: 'Tech Solutions Ltda'
                    },
                    contact_name: {
                      type: 'string',
                      minLength: 5,
                      maxLength: 80,
                      example: 'João Silva'
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'joao@techsolutions.com'
                    },
                    phone: {
                      type: 'string',
                      pattern: '^\\([0-9]{2}\\) [0-9]{5}-[0-9]{4}$',
                      example: '(11) 98765-4321'
                    },
                    cnpj: {
                      type: 'string',
                      pattern: '^[0-9]{14}$',
                      example: '12345678901234'
                    },
                    uf: {
                      type: 'string',
                      pattern: '^[A-Z]{2}$',
                      example: 'SP'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Fornecedor atualizado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        $ref: '#/components/schemas/Supplier'
                      },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Dados inválidos'
            },
            401: {
              description: 'Token ausente'
            },
            404: {
              description: 'Fornecedor não encontrado'
            },
            409: {
              description: 'Email ou CNPJ duplicado'
            }
          }
        },
        delete: {
          tags: ['Suppliers'],
          summary: 'Exclui um fornecedor',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'ID do fornecedor'
            }
          ],
          responses: {
            200: {
              description: 'Fornecedor excluído',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'null' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Fornecedor em uso'
            },
            401: {
              description: 'Token ausente'
            },
            404: {
              description: 'Fornecedor não encontrado'
            }
          }
        }
      },
      '/api/keepalive': {
        get: {
          tags: ['Health'],
          summary: 'Mantém o projeto Supabase ativo (anti-pause)',
          responses: {
            200: {
              description: 'Supabase ativo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      message: { type: 'string', example: 'Supabase ativo' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/debug/token': {
        get: {
          tags: ['Debug'],
          summary: 'Endpoint de debug para inspecionar token e headers',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Informações de debug da requisição',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      headers: {
                        type: 'object',
                        description: 'Todos os headers recebidos'
                      },
                      authHeader: {
                        type: 'string',
                        nullable: true,
                        description: 'Header Authorization específico'
                      },
                      cookies: {
                        type: 'array',
                        items: {
                          type: 'object'
                        },
                        description: 'Todos os cookies recebidos'
                      },
                      tokenExtracted: {
                        type: 'string',
                        enum: ['SIM', 'NÃO'],
                        description: 'Se o token foi extraído com sucesso'
                      },
                      tokenPreview: {
                        type: 'string',
                        nullable: true,
                        description: 'Primeiros 50 caracteres do token'
                      }
                    }
                  }
                }
              }
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
    '../app/api/**/*.js',
    '/app/api/**/*.js',
    '**/app/api/**/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
