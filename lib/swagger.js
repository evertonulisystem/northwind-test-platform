const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QA Automation Shop API',
      version: '1.0.0',
      description: 'API para consulta e gerenciamento de produtos, categorias e pedidos. Desenvolvida para prática de automação de testes.',
      contact: {
        name: 'QA Automation Team',
        email: 'contato@gotasdetecnologia.com.br',
        url: 'https://www.gotasdetecnologia.com.br'
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
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            product_id: { type: 'integer' },
            quantity: { type: 'integer' },
            products: { $ref: '#/components/schemas/Product' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            order_number: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] },
            total_amount: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
            shippers: {
              type: 'object',
              properties: {
                company_name: { type: 'string' }
              }
            }
          }
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            product_id: { type: 'integer' },
            quantity: { type: 'integer' },
            unit_price: { type: 'number' },
            subtotal: { type: 'number' },
            products: { 
              type: 'object',
              properties: {
                name: { type: 'string' },
                sku: { type: 'string' }
              }
            }
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
      '/api/v1/auth/register': {
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
      '/api/v1/auth/login': {
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
      '/api/v1/auth/me': {
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
      '/api/v1/products': {
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
      '/api/v1/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Busca um produto pelo ID',
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
              description: 'Produto encontrado',
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
            404: {
              description: 'Produto não encontrado'
            }
          }
        },
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

        patch: {
    tags: ['Products'],
    summary: 'Atualiza parcialmente um produto',
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
      200: { description: 'Produto atualizado parcialmente' },
      400: { description: 'Dados inválidos' },
      401: { description: 'Não autorizado' },
      404: { description: 'Produto não encontrado' },
      409: { description: 'SKU ou slug duplicado' }
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
      '/api/v1/products/search': {
        get: {
          tags: ['Products'],
          summary: 'Busca produto por ID, SKU ou slug',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'id',
              schema: { type: 'integer' },
              description: 'ID do produto para busca específica'
            },
            {
              in: 'query',
              name: 'sku',
              schema: { type: 'string' },
              description: 'SKU do produto para busca'
            },
            {
              in: 'query',
              name: 'slug',
              schema: { type: 'string' },
              description: 'Slug do produto para busca'
            }
          ],
          responses: {
            200: {
              description: 'Produto encontrado',
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
              description: 'Produto não encontrado',
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
              description: 'Parâmetros inválidos',
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
            }
          }
        }
      },
      '/api/v1/products/validate': {
        post: {
          tags: ['Products'],
          summary: 'Valida dados de produto antes de salvar',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      example: 'Mouse Gamer RGB',
                      description: 'Nome do produto (6-40 caracteres)'
                    },
                    price: {
                      type: 'number',
                      example: 299.90,
                      description: 'Preço do produto (maior que 0)'
                    },
                    stock_quantity: {
                      type: 'integer',
                      example: 50,
                      description: 'Quantidade em estoque (0-999)'
                    },
                    sku: {
                      type: 'string',
                      example: 'MGP-2024',
                      description: 'SKU único (5-20 caracteres)'
                    },
                    category_id: {
                      type: 'integer',
                      example: 1,
                      description: 'ID da categoria (opcional)'
                    },
                    supplier_id: {
                      type: 'integer',
                      example: 1,
                      description: 'ID do fornecedor (opcional)'
                    },
                    id: {
                      type: 'integer',
                      example: 123,
                      description: 'ID do produto (apenas para edição)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Validação realizada com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      valid: {
                        type: 'boolean',
                        example: true,
                        description: 'Indica se o produto é válido'
                      },
                      errors: {
                        type: 'array',
                        items: { type: 'string' },
                        example: [],
                        description: 'Erros que impedem o cadastro'
                      },
                      warnings: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['SKU em formato não padrão'],
                        description: 'Avisos de atenção'
                      },
                      suggestions: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['Considerar adicionar descrição'],
                        description: 'Sugestões de melhoria'
                      },
                      message: {
                        type: 'string',
                        example: 'Produto válido para cadastro'
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      valid: { type: 'boolean', example: false },
                      errors: { type: 'array', items: { type: 'string' }, example: ['Token ausente'] },
                      warnings: { type: 'array', items: { type: 'string' }, example: [] },
                      suggestions: { type: 'array', items: { type: 'string' }, example: [] }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Dados inválidos',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      valid: { type: 'boolean', example: false },
                      errors: { type: 'array', items: { type: 'string' }, example: ['JSON inválido'] },
                      warnings: { type: 'array', items: { type: 'string' }, example: [] },
                      suggestions: { type: 'array', items: { type: 'string' }, example: [] }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/products/{id}/image': {
        post: {
          tags: ['Products'],
          summary: 'Upload de imagem PNG do produto',
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
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'Arquivo de imagem PNG'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Upload realizado com sucesso' },
            400: { description: 'Arquivo inválido ou ausente' },
            401: { description: 'Não autorizado' },
            404: { description: 'Produto não encontrado' }
          }
        },
        get: {
          tags: ['Products'],
          summary: 'Download da imagem PNG do produto',
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
              description: 'Imagem do produto',
              content: { 'image/png': { schema: { type: 'string', format: 'binary' } } }
            },
            404: { description: 'Imagem não encontrada' }
          }
        }
      },
      '/api/v1/products/{id}/pdf': {
        post: {
          tags: ['Products'],
          summary: 'Upload de manual PDF do produto',
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
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'Arquivo PDF'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Upload realizado com sucesso' },
            400: { description: 'Arquivo inválido ou ausente' },
            401: { description: 'Não autorizado' },
            404: { description: 'Produto não encontrado' }
          }
        },
        get: {
          tags: ['Products'],
          summary: 'Download do manual PDF do produto',
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
              description: 'Manual PDF do produto',
              content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } }
            },
            404: { description: 'PDF não encontrado' }
          }
        }
      },
      '/api/v1/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Lista categorias com paginação',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
              description: 'Número da página'
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
              description: 'Quantidade de itens por página'
            }
          ],
          responses: {
            200: {
              description: 'Lista paginada de categorias',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Category'
                        }
                      },
                      pagination: {
                        $ref: '#/components/schemas/Pagination'
                      },
                      mensagens: {
                        type: 'array',
                        items: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Categories'],
          summary: 'Adiciona uma nova categoria',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'description'],
                  properties: {
                    name: {
                      type: 'string',
                      maxLength: 25,
                      example: 'Eletrônicos'
                    },
                    description: {
                      type: 'string',
                      minLength: 6,
                      maxLength: 40,
                      example: 'Produtos eletrônicos variados'
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Categoria criada' },
            400: { description: 'Dados inválidos' },
            409: { description: 'Categoria duplicada' }
          }
        }
      },
      '/api/v1/categories/{id}': {
        get: {
          tags: ['Categories'],
          summary: 'Lista produtos de uma categoria',
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
              description: 'Lista de produtos da categoria',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Product' }
                      },
                      mensagens: {
                        type: 'array',
                        items: { type: 'string' }
                      }
                    }
                  }
                }
              }
            },
            404: { description: 'Categoria não encontrada' }
          }
        },
        put: {
          tags: ['Categories'],
          summary: 'Atualiza uma categoria existente',
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
                  required: ['name', 'description'],
                  properties: {
                    name: {
                      type: 'string',
                      maxLength: 25,
                      example: 'Eletrônicos'
                    },
                    description: {
                      type: 'string',
                      minLength: 6,
                      maxLength: 40,
                      example: 'Produtos eletrônicos variados'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Categoria atualizada' },
            400: { description: 'Dados inválidos' },
            404: { description: 'Categoria não encontrada' },
            409: { description: 'Categoria duplicada' }
          }
        },
        patch: {
          tags: ['Categories'],
          summary: 'Atualiza parcialmente uma categoria',
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
                    name: {
                      type: 'string',
                      maxLength: 25,
                      example: 'Eletrônicos'
                    },
                    description: {
                      type: 'string',
                      minLength: 6,
                      maxLength: 40,
                      example: 'Produtos eletrônicos variados'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Categoria atualizada parcialmente' },
            400: { description: 'Dados inválidos' },
            404: { description: 'Categoria não encontrada' },
            409: { description: 'Categoria duplicada' }
          }
        },
        delete: {
          tags: ['Categories'],
          summary: 'Exclui uma categoria',
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
            200: { description: 'Categoria excluída' },
            404: { description: 'Categoria não encontrada' },
            400: { description: 'Categoria em uso' }
          }
        }
      },
      '/api/v1/categories/{id}/products': {
        get: {
          tags: ['Categories'],
          summary: 'Lista produtos de uma categoria',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'ID da categoria'
            }
          ],
          responses: {
            200: {
              description: 'Lista de produtos da categoria',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Product'
                        }
                      },
                      mensagens: {
                        type: 'array',
                        items: { type: 'string' }
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Token ausente ou inválido'
            },
            404: {
              description: 'Categoria não encontrada'
            }
          }
        }
      },
      '/api/v1/suppliers': {
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
      '/api/v1/suppliers/{id}': {
        get: {
          tags: ['Suppliers'],
          summary: 'Obtém detalhes de um fornecedor',
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
              description: 'Detalhes do fornecedor',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        $ref: '#/components/schemas/Supplier'
                      },
                      mensagens: {
                        type: 'array',
                        items: { type: 'string' }
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Token ausente ou inválido'
            },
            404: {
              description: 'Fornecedor não encontrado'
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
      '/api/v1/suppliers/{id}/products': {
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
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Product'
                        }
                      },
                      mensagens: {
                        type: 'array',
                        items: { type: 'string' }
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Token ausente ou inválido'
            },
            404: {
              description: 'Fornecedor não encontrado'
            }
          }
        }
      },
      '/api/v1/keepalive': {
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
      '/api/v1/cart': {
        get: {
          tags: ['Cart'],
          summary: 'Lista os itens do carrinho do usuário autenticado',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de itens no carrinho' },
            401: { description: 'Não autorizado' }
          }
        },
        post: {
          tags: ['Cart'],
          summary: 'Adiciona ou atualiza um item no carrinho',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['product_id', 'quantity'],
                  properties: {
                    product_id: { type: 'integer' },
                    quantity: { type: 'integer' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Item adicionado/atualizado' },
            400: { description: 'Dados inválidos' }
          }
        },
        delete: {
          tags: ['Cart'],
          summary: 'Limpa todo o carrinho do usuário',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Carrinho limpo' }
          }
        }
      },
      '/api/v1/cart/{id}': {
        patch: {
          tags: ['Cart'],
          summary: 'Atualiza a quantidade de um item no carrinho',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['quantity'],
                  properties: { quantity: { type: 'integer' } }
                }
              }
            }
          },
          responses: {
            200: { description: 'Item atualizado' },
            404: { description: 'Item não encontrado' }
          }
        },
        delete: {
          tags: ['Cart'],
          summary: 'Remove um item do carrinho',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: 'Item removido' }
          }
        }
      },
      '/api/v1/orders': {
        get: {
          tags: ['Orders'],
          summary: 'Lista o histórico de pedidos do usuário',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de pedidos' }
          }
        },
        post: {
          tags: ['Orders'],
          summary: 'Realiza o checkout (converte carrinho em pedido)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    shipper_id: { type: 'integer' },
                    address_id: { type: 'integer' },
                    notes: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Pedido criado com sucesso' },
            400: { description: 'Carrinho vazio ou estoque insuficiente' }
          }
        }
      },
      '/api/v1/debug/token': {
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
    path.join(__dirname, '../app/api/v1/**/*.js').replace(/\\/g, '/'),
    path.join(__dirname, '../app/api/v1/**/route.js').replace(/\\/g, '/'),
    // Adicionar paths específicos para arquivos com colchetes
    path.join(__dirname, '../app/api/v1/products/[id]/route.js').replace(/\\/g, '/'),
    path.join(__dirname, '../app/api/v1/categories/[id]/route.js').replace(/\\/g, '/'),
    path.join(__dirname, '../app/api/v1/suppliers/[id]/route.js').replace(/\\/g, '/'),
    path.join(__dirname, '../app/api/v1/products/[id]/image/route.js').replace(/\\/g, '/'),
    path.join(__dirname, '../app/api/v1/products/[id]/pdf/route.js').replace(/\\/g, '/'),
    path.join(__dirname, '../app/api/v1/categories/[id]/products/route.js').replace(/\\/g, '/'),
    path.join(__dirname, '../app/api/v1/suppliers/[id]/products/route.js').replace(/\\/g, '/')
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
