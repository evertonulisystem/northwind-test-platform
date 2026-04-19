// app/api/v1/cart/[id]/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

/**
 * @swagger
 * /api/v1/cart/{id}:
 *   patch:
 *     summary: Atualiza a quantidade de um item no carrinho
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item atualizado
 *       404:
 *         description: Item não encontrado
 */
async function updateCartItem(request, { params, user }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { data: null, mensagens: ['quantity (positivo) é obrigatório.'] },
        { status: 400 }
      );
    }

    // 1. Buscar o item e o produto para verificar estoque
    const { data: item, error: fetchError } = await supabase
      .from('cart_items')
      .select('id, user_id, product_id, products(stock_quantity)')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { data: null, mensagens: ['Item do carrinho não encontrado.'] },
        { status: 404 }
      );
    }

    // Segurança: Garantir que o item pertence ao usuário
    if (item.user_id !== user.id) {
       return NextResponse.json(
        { data: null, mensagens: ['Acesso negado.'] },
        { status: 403 }
      );
    }

    if (item.products.stock_quantity < quantity) {
      return NextResponse.json(
        { data: null, mensagens: [`Estoque insuficiente. Disponível: ${item.products.stock_quantity}`] },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      data: updated,
      mensagens: ['Quantidade atualizada com sucesso.']
    });

  } catch (error) {
    console.error('Erro ao atualizar item do carrinho:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro ao atualizar item.'] },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/cart/{id}:
 *   delete:
 *     summary: Remove um item do carrinho
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Item removido
 */
async function deleteCartItem(request, { params, user }) {
  try {
    const { id } = params;

    // Verificar se o item pertence ao usuário antes de deletar
    const { data: item, error: fetchError } = await supabase
      .from('cart_items')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { data: null, mensagens: ['Item não encontrado no carrinho.'] },
        { status: 404 }
      );
    }

    if (item.user_id !== user.id) {
      return NextResponse.json(
        { data: null, mensagens: ['Acesso negado.'] },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      data: null,
      mensagens: ['Item removido do carrinho.']
    });

  } catch (error) {
    console.error('Erro ao remover item do carrinho:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro ao remover item.'] },
      { status: 500 }
    );
  }
}

export const PATCH = requireAuth(updateCartItem);
export const DELETE = requireAuth(deleteCartItem);
