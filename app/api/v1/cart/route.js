// app/api/v1/cart/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Lista os itens do carrinho do usuário autenticado
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de itens no carrinho
 *       401:
 *         description: Não autorizado
 */
async function getCart(request, { user }) {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        products (
          id,
          name,
          price,
          sku,
          image_url,
          stock_quantity
        )
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { data: [], mensagens: ['Seu carrinho está vazio.'] },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: data,
      mensagens: ['Carrinho carregado com sucesso.']
    });
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro ao buscar itens do carrinho.'] },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/cart:
 *   post:
 *     summary: Adiciona ou atualiza um item no carrinho
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Item adicionado/atualizado
 *       400:
 *         description: Dados inválidos ou estoque insuficiente
 */
async function addToCart(request, { user }) {
  try {
    const body = await request.json();
    const { product_id, quantity } = body;

    if (!product_id || !quantity || quantity <= 0) {
      return NextResponse.json(
        { data: null, mensagens: ['product_id e quantity (positivo) são obrigatórios.'] },
        { status: 400 }
      );
    }

    // 1. Verificar se o produto existe e tem estoque
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .eq('id', product_id)
      .single();

    if (prodError || !product) {
      return NextResponse.json(
        { data: null, mensagens: ['Produto não encontrado.'] },
        { status: 404 }
      );
    }

    if (product.stock_quantity < quantity) {
      return NextResponse.json(
        { data: null, mensagens: [`Estoque insuficiente. Disponível: ${product.stock_quantity}`] },
        { status: 400 }
      );
    }

    // 2. Verificar se já existe no carrinho para esse usuário
    const { data: existingItem, error: fetchError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let result;
    if (existingItem) {
      // Atualizar quantidade
      const newQuantity = existingItem.quantity + quantity;
      
      // Re-verificar estoque para a nova quantidade total
      if (product.stock_quantity < newQuantity) {
        return NextResponse.json(
          { data: null, mensagens: [`Estoque insuficiente para a quantidade total desejada. Disponível: ${product.stock_quantity}`] },
          { status: 400 }
        );
      }

      const { data: updated, error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      result = updated;
    } else {
      // Inserir novo
      const { data: inserted, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id,
          quantity
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      result = inserted;
    }

    return NextResponse.json(
      { data: result, mensagens: ['Item adicionado ao carrinho com sucesso!'] },
      { status: existingItem ? 200 : 201 }
    );

  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro interno ao processar carrinho.'] },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/cart:
 *   delete:
 *     summary: Limpa todo o carrinho do usuário
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho limpo
 */
async function clearCart(request, { user }) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({
      data: null,
      mensagens: ['Carrinho limpo com sucesso.']
    });
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro ao limpar carrinho.'] },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getCart);
export const POST = requireAuth(addToCart);
export const DELETE = requireAuth(clearCart);
