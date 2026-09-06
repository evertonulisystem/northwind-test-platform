// app/api/v1/orders/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Lista o histórico de pedidos do usuário
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
async function getOrders(request, { user }) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        created_at,
        shippers (company_name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { data: [], mensagens: ['Você ainda não possui pedidos.'] },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: data,
      mensagens: ['Histórico de pedidos carregado.']
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro ao buscar histórico de pedidos.'] },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Realiza o checkout (converte carrinho em pedido)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shipper_id:
 *                 type: integer
 *               address_id:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Carrinho vazio ou estoque insuficiente
 */
async function checkout(request, { user }) {
  try {
    const body = await request.json().catch(() => ({}));
    const { shipper_id = 1, address_id, notes } = body;

    // 1. Buscar itens do carrinho
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        products (
          id,
          name,
          price,
          stock_quantity
        )
      `)
      .eq('user_id', user.id);

    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { data: null, mensagens: ['Seu carrinho está vazio.'] },
        { status: 400 }
      );
    }

    // 2. Validar estoque e calcular totais
    let subtotal = 0;
    for (const item of cartItems) {
      if (item.products.stock_quantity < item.quantity) {
        return NextResponse.json(
          { data: null, mensagens: [`Estoque insuficiente para o produto: ${item.products.name}. Disponível: ${item.products.stock_quantity}`] },
          { status: 400 }
        );
      }
      subtotal += item.products.price * item.quantity;
    }

    const shippingCost = subtotal > 200 ? 0 : 25.00; // Frete grátis acima de 200
    const totalAmount = subtotal + shippingCost;
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. Criar Pedido
    // Fallback de segurança: garantir que shipper_id seja um número válido existente ou remover a restrição para testes
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: 'pending',
        subtotal,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        shipper_id: shipper_id || 1, 
        shipping_address_id: address_id || null,
        notes: notes || ''
      })
      .select()
      .single();

    if (orderError) {
      console.error('Erro detalhado do Supabase (Orders):', orderError);
      throw new Error(`Erro ao criar pedido no banco: ${orderError.message}`);
    }

    // 4. Criar Itens do Pedido e Atualizar Estoque (Simulado Sequencial)
    for (const item of cartItems) {
      // Inserir Order Item
      await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.products.price,
          subtotal: item.products.price * item.quantity
        });

      // Decrementar estoque
      await supabase
        .from('products')
        .update({ stock_quantity: item.products.stock_quantity - item.quantity })
        .eq('id', item.product_id);
    }

    // 5. Limpar carrinho
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    return NextResponse.json(
      { 
        data: {
          id: order.id,
          order_number: order.order_number,
          total: totalAmount
        }, 
        mensagens: ['Pedido realizado com sucesso!'] 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro no checkout:', error);
    return NextResponse.json(
      { 
        data: null, 
        mensagens: ['Erro ao processar pedido.', error.message || 'Erro desconhecido'],
        debug: error 
      },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getOrders);
export const POST = requireAuth(checkout);
