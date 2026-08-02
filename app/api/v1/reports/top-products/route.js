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

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const ALLOWED_TOP_VALUES = [10, 20, 50, 100];

function parsePositiveInteger(value, fallback) {
  const parsed = parseInt(value || "", 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

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
 *         name: top
 *         schema: { type: integer, default: 20 }
 *         description: Quantidade máxima de produtos no ranking analisado
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Página da paginação
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Quantidade de produtos por página
 *     responses:
 *       200:
 *         description: Ranking de produtos mais vendidos
 */
async function getTopProducts(request, { user }) {
  try {
    const { searchParams } = new URL(request.url);
    const rawTop = searchParams.get("top");
    const page = parsePositiveInteger(searchParams.get("page"), 1);
    const limit = parsePositiveInteger(searchParams.get("limit"), 10);

    if (rawTop !== null) {
      const parsedTop = parseInt(rawTop, 10);
      if (
        !Number.isInteger(parsedTop) ||
        parsedTop < 1 ||
        !ALLOWED_TOP_VALUES.includes(parsedTop)
      ) {
        return NextResponse.json(
          {
            data: null,
            mensagens: ["Valor de top inválido. Use 10, 20, 50 ou 100."],
          },
          { status: 400 },
        );
      }
    }

    const top = rawTop === null ? 20 : parsePositiveInteger(rawTop, 20);

    const { data: items, error } = await supabase.from("order_items").select(`
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
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
        mensagens: ["Nenhuma venda encontrada."],
      });
    }

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

    const rankedProducts = Object.values(grouped)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, top);

    const maxQuantity = rankedProducts.reduce(
      (highest, item) => Math.max(highest, item.total_quantity),
      0,
    );

    const ranking = rankedProducts.map((item, index) => ({
      rank: index + 1,
      product_id: item.product_id,
      name: item.product?.name || "Produto removido",
      sku: item.product?.sku || "-",
      image_url: item.product?.image_url || null,
      current_price: item.product?.price || 0,
      rating: item.product?.rating || 0,
      reviews_count: item.product?.reviews_count || 0,
      total_quantity_sold: item.total_quantity,
      total_revenue: Math.round(item.total_revenue * 100) / 100,
      total_discount_given: Math.round(item.total_discount * 100) / 100,
      orders_count: item.orders_count,
      participation_percentage:
        maxQuantity > 0 ? (item.total_quantity / maxQuantity) * 100 : 0,
    }));

    const total = ranking.length;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
    const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
    const start = (safePage - 1) * limit;
    const paginatedRanking = ranking.slice(start, start + limit);

    return NextResponse.json({
      data: paginatedRanking,
      meta: {
        total_products_sold: total,
        grand_total_quantity: ranking.reduce(
          (acc, p) => acc + p.total_quantity_sold,
          0,
        ),
        grand_total_revenue:
          Math.round(
            ranking.reduce((acc, p) => acc + p.total_revenue, 0) * 100,
          ) / 100,
        grand_total_discount:
          Math.round(
            ranking.reduce((acc, p) => acc + p.total_discount_given, 0) * 100,
          ) / 100,
      },
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
      mensagens: ["Relatório de top produtos gerado com sucesso."],
    });
  } catch (error) {
    console.error("Erro ao gerar relatório de top produtos:", error);
    return NextResponse.json(
      { data: null, mensagens: ["Erro interno ao gerar relatório."] },
      { status: 500 },
    );
  }
}

export const GET = requireAuth(getTopProducts);
