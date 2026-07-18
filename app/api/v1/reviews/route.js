// ============================================================
// 🆕 NOVA FUNCIONALIDADE — Avaliações de Produtos
// Módulo: Reviews | Cenário: Listagem e criação de avaliações
// Adicionado em: julho/2026
// ============================================================

// app/api/v1/reviews/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

/**
 * GET /api/v1/reviews
 *
 * Retorna todas as avaliações aprovadas (is_approved = true).
 * Suporte a query param: ?product_id=X para filtrar por produto.
 *
 * Resposta: array de objetos com:
 *   { id, product_id, user_id, rating, title, comment,
 *     is_verified_purchase, helpful_count, created_at }
 *
 * Requer autenticação via Bearer token.
 */
export async function GET(request) {
  console.log('=== GET /api/v1/reviews ===');

  // ── 1. Autenticação ──────────────────────────────────────────
  // Toda rota protegida exige Bearer token no header Authorization.
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

  // ── 2. Parâmetros de query ───────────────────────────────────
  // Permitimos filtrar por produto via ?product_id=X
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  try {
    // ── 3. Query no Supabase ─────────────────────────────────────
    // Buscamos apenas avaliações aprovadas pelo moderador (is_approved = true).
    // O join com products traz o nome para exibição no front-end.
    let query = supabase
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
        created_at,
        products(name)
      `)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    // Filtro opcional por produto
    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro Supabase GET reviews:', error);
      throw error;
    }

    return NextResponse.json({
      data: data || [],
      mensagens: ['Avaliações carregadas com sucesso.'],
    });

  } catch (error) {
    console.error('Erro fatal GET /api/v1/reviews:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro interno ao carregar avaliações.'] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/reviews
 *
 * Cria uma nova avaliação para um produto.
 * Body: { product_id, rating (1-5), title, comment }
 *
 * Regras de negócio:
 *   - Requer autenticação
 *   - rating deve ser inteiro entre 1 e 5
 *   - product_id deve existir na tabela products
 *   - A avaliação é criada com is_approved = false (aguarda moderação)
 *     mas para fins didáticos do curso, retornamos o objeto criado.
 *
 * Retorna: a review criada com status 201.
 */
export async function POST(request) {
  console.log('=== POST /api/v1/reviews ===');

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
      {
        data: null,
        mensagens: [payload?.message || 'Token inválido'],
        expires_at: payload?.expires_at || null,
      },
      { status: 401 }
    );
  }

  // ── 2. Parse do body ─────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { data: null, mensagens: ['Corpo da requisição inválido.'] },
      { status: 400 }
    );
  }

  // ── 3. Validações ────────────────────────────────────────────
  // 3a. Campos obrigatórios
  const { product_id, rating, title, comment } = body || {};

  if (!product_id) {
    return NextResponse.json(
      { data: null, mensagens: ['O campo product_id é obrigatório.'] },
      { status: 400 }
    );
  }

  // 3b. Validar rating: deve ser inteiro de 1 a 5
  // Motivo: estrelas vão de 1 (Ruim) a 5 (Excelente)
  const ratingInt = parseInt(rating, 10);
  if (!rating || isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
    return NextResponse.json(
      { data: null, mensagens: ['O campo rating deve ser um inteiro entre 1 e 5.'] },
      { status: 400 }
    );
  }

  // 3c. Verificar se o produto existe
  const { data: productExists, error: productError } = await supabase
    .from('products')
    .select('id, name')
    .eq('id', product_id)
    .maybeSingle();

  if (productError || !productExists) {
    return NextResponse.json(
      { data: null, mensagens: ['Produto não encontrado.'] },
      { status: 404 }
    );
  }

  // ── 4. Inserção no banco ─────────────────────────────────────
  // O user_id vem do token JWT para garantir que o usuário autenticado
  // seja o autor da avaliação (não aceitar user_id no body = segurança).
  try {
    const { data: newReview, error } = await supabase
      .from('reviews')
      .insert({
        product_id: parseInt(product_id, 10),
        user_id: payload.id,
        rating: ratingInt,
        title: title?.trim() || null,
        comment: comment?.trim() || null,
        is_approved: true,       // Para fins didáticos: auto-aprovado
        is_verified_purchase: false,
        helpful_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    // ── 5. Atualizar contadores no produto (denormalização) ──────
    // Buscamos as métricas atuais para recalcular a média de rating
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', product_id)
      .eq('is_approved', true);

    if (reviewsData && reviewsData.length > 0) {
      const avgRating =
        reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length;

      await supabase
        .from('products')
        .update({
          reviews_count: reviewsData.length,
          rating: Math.round(avgRating * 10) / 10, // 1 casa decimal
        })
        .eq('id', product_id);
    }

    return NextResponse.json(
      {
        data: newReview,
        mensagens: ['Avaliação criada com sucesso!'],
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro fatal POST /api/v1/reviews:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro interno ao criar avaliação.'] },
      { status: 500 }
    );
  }
}
