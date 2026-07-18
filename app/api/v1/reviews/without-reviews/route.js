// ============================================================
// 🆕 NOVA FUNCIONALIDADE — Avaliações de Produtos
// Módulo: Reviews | Cenário: Produtos vendidos sem avaliação
// Adicionado em: julho/2026
// ============================================================

// app/api/v1/reviews/without-reviews/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

/**
 * GET /api/v1/reviews/without-reviews
 *
 * Retorna produtos que tiveram vendas (sales_count > 0) mas
 * ainda não possuem nenhuma avaliação na tabela reviews.
 *
 * Equivalente SQL de referência:
 *   SELECT p.name, p.price, p.sales_count
 *   FROM products p
 *   LEFT JOIN reviews r ON r.product_id = p.id
 *   WHERE r.id IS NULL
 *   AND p.sales_count > 0
 *
 * Resposta: array com { id, name, price, sales_count }
 *
 * Requer autenticação via Bearer token.
 */
export async function GET(request) {
  console.log('=== GET /api/v1/reviews/without-reviews ===');

  // ── 1. Autenticação ──────────────────────────────────────────
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json(
      { data: null, mensagens: ['Token ausente'] },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);
  if (!payload || payload.error) {
    return NextResponse.json(
      { data: null, mensagens: [payload?.message || 'Token inválido'] },
      { status: 401 }
    );
  }

  try {
    // ── 2. Buscar produtos SEM avaliações que tiveram vendas ─────
    //
    // Estratégia:
    //   a) Buscar IDs de produtos que JÁ TÊM pelo menos uma review
    //   b) Buscar produtos com sales_count > 0 excluindo esses IDs
    //
    // Por que não usar LEFT JOIN direto?
    // O Supabase PostgREST não suporta LEFT JOIN com filtro IS NULL
    // diretamente. A abordagem "not in (subquery)" é equivalente e
    // funciona perfeitamente com o cliente JavaScript do Supabase.

    // Passo a) — IDs de produtos que já têm avaliação
    const { data: reviewedProductIds, error: reviewError } = await supabase
      .from('reviews')
      .select('product_id');

    if (reviewError) {
      console.error('Erro ao buscar IDs com reviews:', reviewError);
      throw reviewError;
    }

    // Extrai array de IDs únicos de produtos já avaliados
    const idsWithReviews = [
      ...new Set((reviewedProductIds || []).map((r) => r.product_id)),
    ];

    // Passo b) — Produtos com vendas que NÃO estão na lista acima
    let query = supabase
      .from('products')
      .select('id, name, price, sales_count')
      .gt('sales_count', 0)            // sales_count > 0
      .order('sales_count', { ascending: false }); // Maior vendas primeiro

    // Se existem produtos já avaliados, exclui-los do resultado
    if (idsWithReviews.length > 0) {
      query = query.not('id', 'in', `(${idsWithReviews.join(',')})`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro Supabase without-reviews:', error);
      throw error;
    }

    return NextResponse.json({
      data: data || [],
      total: data?.length || 0,
      mensagens: [
        data?.length > 0
          ? `${data.length} produto(s) com vendas aguardando avaliação.`
          : 'Todos os produtos vendidos já foram avaliados!',
      ],
    });

  } catch (error) {
    console.error('Erro fatal GET /api/v1/reviews/without-reviews:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro interno ao buscar produtos sem avaliação.'] },
      { status: 500 }
    );
  }
}
