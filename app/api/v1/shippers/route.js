import { normalizeApiBody } from '@/lib/api-envelope';
// app/api/v1/shippers/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/v1/shippers:
 *   get:
 *     summary: Lista as transportadoras disponíveis para entrega
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transportadoras carregada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       500:
 *         description: Erro interno do servidor
 */
async function getShippers(request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        normalizeApiBody({ data: null, mensagens: ['Token ausente'] }),
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.error) {
      return NextResponse.json(
        normalizeApiBody({
          data: null,
          mensagens: [payload?.message || 'Token inválido'],
          expires_at: payload?.expires_at || null
        }),
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('shippers')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    return NextResponse.json(normalizeApiBody({
      data: data || [],
      mensagens: ['Transportadoras carregadas com sucesso.']
    }));
  } catch (error) {
    console.error('Erro ao buscar transportadoras:', error);
    return NextResponse.json(
      normalizeApiBody({ data: null, mensagens: ['Erro ao buscar transportadoras.'] }),
      { status: 500 }
    );
  }
}

export const GET = getShippers;
