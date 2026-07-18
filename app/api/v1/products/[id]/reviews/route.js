// ============================================================
// 🆕 NOVA FUNCIONALIDADE — Avaliações de Produtos
// Módulo: Reviews | Cenário: Avaliações por produto específico
// Adicionado em: julho/2026
// ============================================================

// app/api/v1/products/[id]/reviews/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

/**
 * GET /api/v1/products/:id/reviews
 *
 * Retorna todas as avaliações aprovadas de um produto específico.
 * Inclui também:
 *   - averageRating: média das notas (número com 1 decimal)
 *   - totalReviews: total de avaliações aprovadas
 *
 * Parâmetro de rota: :id — ID do produto (inteiro positivo)
 *
 * Requer autenticação via Bearer token.
 */
export async function GET(request, { params }) {
  console.log(`=== GET /api/v1/products/${params.id}/reviews ===`);

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

  // ── 2. Validação do parâmetro :id ────────────────────────────
  const productId = parseInt(params.id, 10);
  if (isNaN(productId) || productId <= 0) {
    return NextResponse.json(
      { data: null, mensagens: ['ID do produto inválido.'] },
      { status: 400 }
    );
  }

  try {
    // ── 3. Verificar se o produto existe ─────────────────────────
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json(
        { data: null, mensagens: ['Produto não encontrado.'] },
        { status: 404 }
      );
    }

    // ── 4. Buscar avaliações aprovadas do produto ────────────────
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        product_id,
        user_id,
        rating,
        title,
        comment,
        is_verified_purchase,
        helpful_count,
        created_at
      `)
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro Supabase GET product reviews:', error);
      throw error;
    }

    // ── 5. Calcular estatísticas ─────────────────────────────────
    // Média de rating e total de avaliações são calculados
    // dinamicamente para garantir consistência com os dados reais.
    const totalReviews = reviews?.length || 0;
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10
          ) / 10
        : null;

    return NextResponse.json({
      data: reviews || [],
      product: { id: product.id, name: product.name },
      averageRating,
      totalReviews,
      mensagens: [
        totalReviews > 0
          ? `${totalReviews} avaliação(ões) encontrada(s).`
          : 'Este produto ainda não possui avaliações.',
      ],
    });

  } catch (error) {
    console.error(`Erro fatal GET /api/v1/products/${productId}/reviews:`, error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro interno ao buscar avaliações do produto.'] },
      { status: 500 }
    );
  }
}
