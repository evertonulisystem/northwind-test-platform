// ============================================================
// 🆕 NOVA FUNCIONALIDADE — Timeline de Histórico do Pedido
// Módulo: Order History | Rota: GET /api/v1/orders/[id]/history
// Tabela usada: order_history (order_id, status, notes, changed_by, created_at)
// Conceito: cada mudança de status do pedido é registrada aqui,
//           formando uma linha do tempo (timeline) auditável.
// Adicionado em: agosto/2026
// ============================================================

import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

/**
 * @swagger
 * /api/v1/orders/{id}/history:
 *   get:
 *     summary: Retorna o histórico de status (timeline) de um pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Timeline de mudanças de status do pedido
 *       404:
 *         description: Pedido não encontrado
 */
async function getOrderHistory(request, { params, user }) {
  try {
    const { id } = await params;

    // 1. Verificar se o pedido pertence ao usuário autenticado (segurança)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, order_number')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { data: null, mensagens: ['Pedido não encontrado ou sem permissão.'] },
        { status: 404 }
      );
    }

    // 2. Buscar o histórico de mudanças de status (timeline)
    // Ordenamos por created_at ASC para montar a linha do tempo cronologicamente
    const { data: history, error: historyError } = await supabase
      .from('order_history')
      .select(`
        id,
        order_id,
        status,
        notes,
        changed_by,
        created_at
      `)
      .eq('order_id', id)
      .order('created_at', { ascending: true });

    if (historyError) throw historyError;

    return NextResponse.json({
      data: {
        order_id: parseInt(id),
        order_number: order.order_number,
        current_status: order.status,
        // A timeline é o histórico completo de mudanças de status
        timeline: history || [],
      },
      mensagens: ['Histórico do pedido carregado com sucesso.'],
    });

  } catch (error) {
    console.error('Erro ao buscar histórico do pedido:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro interno ao buscar histórico.'] },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getOrderHistory);
