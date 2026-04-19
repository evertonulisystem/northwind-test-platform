// app/api/products/simulate-error/route.js
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

/**
 * @swagger
 * /api/v1/products/simulate-error:
 *   get:
 *     summary: Simula um erro interno (500) para fins de teste
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       500:
 *         description: Erro interno simulado
 */
export async function GET(request) {
  try {
    // Verificar autenticação
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { 
          data: null,
          mensagens: ['Token ausente'] 
        }, 
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.error) {
      const message = payload?.message || 'Token inválido';
      return NextResponse.json(
        { 
          data: null,
          mensagens: [message],
          expires_at: payload?.expires_at || null
        }, 
        { status: 401 }
      );
    }

    // Simular um erro inesperado
    throw new Error('Erro interno simulado: falha na conexão com o serviço de processamento de dados.');

  } catch (error) {
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [error.message || 'Erro interno do servidor.'] 
      },
      { status: 500 }
    );
  }
}
