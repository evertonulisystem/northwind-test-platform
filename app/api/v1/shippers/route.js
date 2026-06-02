// app/api/v1/shippers/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

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
 *       500:
 *         description: Erro interno do servidor
 */
async function getShippers(request) {
  try {
    const { data, error } = await supabase
      .from('shippers')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      mensagens: ['Transportadoras carregadas com sucesso.']
    });
  } catch (error) {
    console.error('Erro ao buscar transportadoras:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro ao buscar transportadoras.'] },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getShippers);
