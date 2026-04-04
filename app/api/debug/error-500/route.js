// app/api/debug/error-500/route.js
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/debug/error-500:
 *   get:
 *     summary: Simula um erro interno (500) com mensagens aleatórias
 *     description: Endpoint didático para testar resiliência em testes de automação.
 *     tags: [Debug]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       500:
 *         description: Erro interno simulado
 */
export async function GET(request) {
  try {
    // 1. Verificar autenticação (O erro só deve ocorrer para usuários logados)
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ data: null, mensagens: ['Token ausente'] }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.error) {
      return NextResponse.json({ data: null, mensagens: [payload?.message || 'Token inválido'] }, { status: 401 });
    }

    // 2. Lista de erros "clássicos" de backend para simular aleatoriedade
    const errorMessages = [
      "Falha crítica na conexão com o pool de banco de dados.",
      "Erro inesperado no middleware de processamento de fila.",
      "Memory leak detectado no processo worker-04.",
      "Falha ao processar o handshake SSL com o provedor de storage.",
      "NullPointerException ao tentar mapear o schema de cache Redis.",
      "Time-out excedido na comunicação com o serviço externo de auditoria."
    ];

    const randomMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];

    // 3. Forçar o estouro do erro
    throw new Error(randomMessage);

  } catch (error) {
    // 4. Retornar no padrão corporativo da API
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [error.message || 'Erro interno do servidor.'] 
      },
      { status: 500 }
    );
  }
}
