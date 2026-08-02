// ============================================================
// 🆕 NOVA FUNCIONALIDADE — Relatório de Vendas por Produto
// Módulo: Reports | Rota: GET /api/v1/reports/top-products
// Tabelas usadas: order_items (order_id, product_id, quantity,
//                 unit_price, discount, subtotal)
//                 + products (name, sku, image_url, price)
//
// Conceito: agrupa os order_items por produto, somando quantidade
//           vendida e receita total — equivalente a:
//           SELECT product_id, SUM(quantity), SUM(subtotal)
//           FROM order_items GROUP BY product_id ORDER BY SUM(quantity) DESC
//
// Adicionado em: agosto/2026
// ============================================================

import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

/**
 * @swagger
 * /api/v1/reports/top-products:
 *   get:
 *     summary: Relatório de produtos mais vendidos (ranking por quantidade)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Quantidade máxima de produtos no ranking
 *     responses:
 *       200:
 *         description: Ranking de produtos mais vendidos
 */
async function getTopProducts(request, { user }) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Buscar todos os order_items com dados do produto relacionado
    // O Supabase não suporta GROUP BY diretamente via JS client,
    // então buscamos todos os itens e agrupamos no servidor Node.
    const { data: items, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        unit_price,
        discount,
        subtotal,
        products (
          id,
          name,
          sku,
          image_url,
          price,
          rating,
          reviews_count
        )
      `);

    if (error) throw error;

    if (!items || items.length === 0) {
      return NextResponse.json({
        data: [],
        mensagens: ['Nenhum item de pedido encontrado.'],
      });
    }

    // Agrupar por product_id e acumular as métricas
    // Equivalente ao GROUP BY do SQL
    const grouped = {};
    for (const item of items) {
      const pid = item.product_id;
      if (!grouped[pid]) {
        grouped[pid] = {
          product_id: pid,
          product: item.products,
          total_quantity: 0,
          total_revenue: 0,
          total_discount: 0,
          orders_count: 0,
        };
      }
      grouped[pid].total_quantity += item.quantity || 0;
      grouped[pid].total_revenue += parseFloat(item.subtotal || 0);
      grouped[pid].total_discount += parseFloat(item.discount || 0);
      grouped[pid].orders_count += 1;
    }

    // Converter para array, ordenar por quantidade DESC e limitar
    const ranking = Object.values(grouped)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, limit)
      .map((item, index) => ({
        rank: index + 1,
        product_id: item.product_id,
        name: item.product?.name || 'Produto removido',
        sku: item.product?.sku || '-',
        image_url: item.product?.image_url || null,
        current_price: item.product?.price || 0,
        rating: item.product?.rating || 0,
        reviews_count: item.product?.reviews_count || 0,
        total_quantity_sold: item.total_quantity,
        total_revenue: Math.round(item.total_revenue * 100) / 100,
        total_discount_given: Math.round(item.total_discount * 100) / 100,
        orders_count: item.orders_count,
      }));

    return NextResponse.json({
      data: ranking,
      meta: {
        total_products_sold: ranking.length,
        grand_total_revenue: Math.round(
          ranking.reduce((acc, p) => acc + p.total_revenue, 0) * 100
        ) / 100,
      },
      mensagens: ['Relatório de top produtos gerado com sucesso.'],
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de top produtos:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro interno ao gerar relatório.'] },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getTopProducts);
