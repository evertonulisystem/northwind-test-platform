// app/api-docs/route.js
import { NextResponse } from 'next/server';
import swaggerSpec from '@/lib/swagger';

/**
 * @swagger
 * /api-docs:
 *   get:
 *     summary: Baixar especificação OpenAPI completa
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Especificação OpenAPI em formato JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Especificação não encontrada
 */
export async function GET() {
  try {
    // Adicionar informações adicionais para download
    const enhancedSpec = {
      ...swaggerSpec,
      'x-download-info': {
        filename: 'qa-automation-api.json',
        description: 'Especificação completa da API para testes de automação',
        version: swaggerSpec.info.version,
        generated_at: new Date().toISOString(),
        endpoints_count: Object.keys(swaggerSpec.paths).length,
        schemas_count: Object.keys(swaggerSpec.components?.schemas || {}).length
      },
      'x-testing-guide': {
        quick_start: {
          auth: {
            login_endpoint: '/api/auth/login',
            register_endpoint: '/api/auth/register',
            example_credentials: {
              email: 'admin@qatest.com',
              password: 'Teste@123'
            }
          },
          test_data: {
            sample_product: {
              name: 'Mouse Gamer RGB',
              price: 299.90,
              stock_quantity: 50,
              sku: 'MGP-2024',
              category_id: 1,
              supplier_id: 1
            },
            sample_category: {
              name: 'Eletrônicos',
              description: 'Produtos eletrônicos variados'
            },
            sample_supplier: {
              company_name: 'Tech Solutions Ltda',
              contact_name: 'João Silva',
              email: 'joao@techsolutions.com',
              phone: '(11) 98765-4321',
              cnpj: '12345678901234',
              uf: 'SP'
            }
          },
          common_errors: {
            auth: {
              401: 'Token ausente ou inválido',
              403: 'Acesso negado'
            },
            validation: {
              400: 'Dados inválidos',
              409: 'Recurso duplicado'
            },
            not_found: {
              404: 'Recurso não encontrado'
            },
            server: {
              500: 'Erro interno do servidor'
            }
          }
        },
        tools: {
          postman: {
            import_url: '/api/swagger.json',
            collection_name: 'QA Automation API'
          },
          insomnia: {
            import_url: '/api/swagger.json',
            workspace_name: 'QA Automation Tests'
          },
          curl: {
            base_url: 'http://localhost:3000',
            auth_header: 'Authorization: Bearer YOUR_TOKEN'
          }
        }
      }
    };

    return NextResponse.json(enhancedSpec, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="qa-automation-api.json"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar especificação:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao gerar especificação da API',
        message: 'Tente novamente mais tarde'
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api-docs:
 *   options:
 *     summary: Verificar disponibilidade do endpoint
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Endpoint disponível
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}
