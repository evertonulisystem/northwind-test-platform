// app/api/health/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
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
