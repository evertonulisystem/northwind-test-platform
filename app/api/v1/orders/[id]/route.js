// app/api/v1/orders/[id]/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Obtém detalhes de um pedido específico
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detalhes do pedido e itens
 *       404:
 *         description: Pedido não encontrado
 */
async function getOrderDetail(request, { params, user }) {
  try {
    const { id } = params;

    // 1. Buscar o pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        shippers (company_name, phone)
      `)
      .eq('id', id)
      .eq('user_id', user.id) // Segurança
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { data: null, mensagens: ['Pedido não encontrado.'] },
        { status: 404 }
      );
    }

    // 2. Buscar os itens do pedido
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        unit_price,
        subtotal,
        products (
          id,
          name,
          sku,
          image_url
        )
      `)
      .eq('order_id', id);

    if (itemsError) throw itemsError;

    return NextResponse.json({
      data: {
        ...order,
        items: items || []
      },
      mensagens: ['Detalhes do pedido carregados com sucesso.']
    });

  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro ao buscar detalhes do pedido.'] },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getOrderDetail);
