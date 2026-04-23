// app/api/v1/categories/[id]/products/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/v1/categories/{id}/products:
 *   get:
 *     summary: Lista produtos de uma categoria
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de produtos da categoria
 *       404:
 *         description: Categoria não encontrada
 */
export async function GET(request, { params }) {
  try {
    // Verificar autenticação
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { 
          data: null,
          mensagens: ['Token ausente'] 
        }, 
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.error) {
      const message = payload?.message || 'Token inválido';
      return NextResponse.json(
        { 
          data: null,
          mensagens: [message],
          expires_at: payload?.expires_at || null
        }, 
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['ID da categoria inválido. Deve ser um número positivo.'] 
        },
        { status: 400 }
      );
    }

    // Primeiro, verifica se a categoria existe
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', idNum)
      .single();

    if (catError || !category) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Categoria com ID ${idNum} não encontrada.`] 
        },
        { status: 404 }
      );
    }

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id, name, price, stock_quantity, sku,
        suppliers (company_name)
      `)
      .eq('category_id', idNum)
      .order('name');

    if (error) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [error.message] 
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      data: products || [],
      mensagens: products?.length > 0 
        ? [`${products.length} produtos encontrados para a categoria ${category.name}.`]
        : [`Nenhum produto cadastrado para a categoria ${category.name}.`]
    });
  } catch (error) {
    return NextResponse.json(
      { 
        data: null, 
        mensagens: ['Erro interno ao buscar produtos da categoria.'] 
      },
      { status: 500 }
    );
  }
}
