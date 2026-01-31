// app/api/health/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health Check completo da API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API saudável
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   example: 2024-01-30T23:00:00.000Z
 *                 uptime:
 *                   type: number
 *                   description: Uptime em segundos
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 environment:
 *                   type: string
 *                   example: development
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: connected
 *                         response_time_ms:
 *                           type: number
 *                           example: 15
 *                     auth:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: operational
 *                         jwt_secret:
 *                           type: string
 *                           example: configured
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 15
 *                     protected:
 *                       type: number
 *                       example: 12
 *                     public:
 *                       type: number
 *                       example: 3
 *                 testing:
 *                   type: object
 *                   properties:
 *                     sample_data:
 *                       type: object
 *                       properties:
 *                         test_user:
 *                           type: object
 *                           properties:
 *                             email:
 *                               type: string
 *                               example: admin@qatest.com
 *                             password:
 *                               type: string
 *                               example: Teste@123
 *                         test_endpoints:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["/api/auth/login", "/api/products"]
 *                         test_scenarios:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Happy Path", "Error Handling", "Security Tests"]
 *       503:
 *         description: Serviço indisponível
 */
export async function GET() {
  const startTime = Date.now();
  
  try {
    // Testar conexão com Supabase
    const dbStartTime = Date.now();
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    const dbResponseTime = Date.now() - dbStartTime;
    
    if (error) {
      throw error;
    }

    // Verificar configuração JWT
    const jwtConfigured = !!process.env.JWT_SECRET;
    
    // Calcular uptime (simplificado)
    const uptime = process.uptime();

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: 'connected',
          response_time_ms: dbResponseTime
        },
        auth: {
          status: jwtConfigured ? 'operational' : 'misconfigured',
          jwt_secret: jwtConfigured ? 'configured' : 'missing'
        }
      },
      endpoints: {
        total: 15,
        protected: 12,
        public: 3
      },
      testing: {
        sample_data: {
          test_user: {
            email: 'admin@qatest.com',
            password: 'Teste@123',
            role: 'admin'
          },
          test_endpoints: [
            '/api/auth/login',
            '/api/auth/register',
            '/api/products',
            '/api/categories',
            '/api/suppliers',
            '/api/auth/me'
          ],
          test_scenarios: [
            'Happy Path Tests',
            'Error Handling Tests',
            'Security Tests',
            'Validation Tests',
            'Performance Tests',
            'Integration Tests'
          ]
        },
        test_tips: {
          authentication: {
            note: 'Use o endpoint /api/auth/login para obter token',
            header: 'Authorization: Bearer <token>',
            expires_in: '24 horas'
          },
          testing_strategies: {
            manual: 'Use Swagger UI em /api-docs',
            automated: 'Importe /api/swagger.json no Postman',
            programmatic: 'Use /api-docs para baixar especificação'
          },
          common_pitfalls: [
            'Esquecer de enviar token em endpoints protegidos',
            'Não validar status codes específicos',
            'Não testar casos de erro',
            'Não limpar dados entre testes'
          ]
        }
      },
      metrics: {
        response_time_ms: Date.now() - startTime,
        memory_usage: process.memoryUsage(),
        node_version: process.version
      }
    };

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: {
          status: 'disconnected',
          error: error.message
        },
        auth: {
          status: 'unknown'
        }
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verificar disponibilidade do health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Serviço disponível
 *       503:
 *         description: Serviço indisponível
 */
