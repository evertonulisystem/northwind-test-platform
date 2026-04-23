// app/api/v1/health/route.js - Health Check completo para QA
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Keepalive + Health Check: Testar conexão com Supabase
    const dbStartTime = Date.now();
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    const dbResponseTime = Date.now() - dbStartTime;
    
    if (error) {
      throw error;
    }

    // Verificar configuração JWT
    const jwtConfigured = !!process.env.JWT_SECRET;
    
    // Calcular uptime
    const uptime = process.uptime();

    const healthData = {
      // Keepalive status
      status: 'ok',
      message: 'Supabase ativo',
      
      // Health check detalhado
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
      
      // Informações para QA
      testing: {
        sample_data: {
          test_user: {
            email: 'admin@qatest.com',
            password: 'Teste@123',
            role: 'admin'
          },
          test_endpoints: [
            '/api/v1/auth/login',
            '/api/v1/auth/register',
            '/api/v1/products',
            '/api/v1/categories',
            '/api/v1/suppliers',
            '/api/v1/auth/validate'
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
            note: 'Use o endpoint /api/v1/auth/login para obter token',
            header: 'Authorization: Bearer <token>',
            expires_in: '24 horas'
          },
          testing_strategies: {
            manual: 'Use Swagger UI em /api-docs',
            automated: 'Importe /api/v1/swagger.json no Postman',
            programmatic: 'Use /api/v1/docs para baixar especificação'
          },
          common_pitfalls: [
            'Esquecer de enviar token em endpoints protegidos',
            'Não validar status codes específicos',
            'Não testar casos de erro',
            'Não limpar dados entre testes'
          ]
        }
      },
      
      // Sugestões de automação
      automation: {
        keepalive: {
          purpose: 'Evitar desconexão do Supabase após 7 dias',
          frequency: 'A cada 6 dias',
          methods: [
            'GitHub Actions cron job',
            'Vercel Cron Jobs',
            'External monitoring service'
          ]
        },
        monitoring: {
          suggested_tools: [
            'Uptime Robot',
            'Pingdom',
            'New Relic',
            'DataDog'
          ],
          alerts: [
            'Database disconnection',
            'High response times',
            'JWT misconfiguration'
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
      status: 'error',
      message: 'Supabase inativo',
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
