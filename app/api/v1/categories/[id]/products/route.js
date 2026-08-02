// app/api/v1/categories/[id]/products/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

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
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade de itens por página
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

    // Pegar parâmetros de paginação
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const start = (page - 1) * limit;

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

    const { data: products, error, count } = await supabase
      .from('products')
      .select(`
        id, name, price, stock_quantity, sku, slug,
        categories(name),
        suppliers(company_name)
      `, { count: 'exact' })
      .eq('category_id', idNum)
      .order('name')
      .range(start, start + limit - 1);

    if (error) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [error.message] 
        }, 
        { status: 500 }
      );
    }

    // For each product, get the first image URL
    const productsWithImages = await Promise.all(
      (products || []).map(async (product) => {
        let image_url = null;
        try {
          const isVercel = !!process.env.VERCEL;
          if (isVercel) {
            const { data: files } = await supabase.storage.from('products').list(product.id.toString());
            if (files && files.length > 0) {
              const firstPng = files.find(f => f.name.endsWith('.png'));
              if (firstPng) {
                const fileId = firstPng.name.split('_')[0];
                image_url = `/api/v1/products/${product.id}/image/${fileId}`;
              }
            }
          } else {
            const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads', 'products');
            const productDir = path.join(UPLOAD_DIR, product.id.toString());
            if (existsSync(productDir)) {
              const files = await fs.readdir(productDir);
              const firstPng = files.find(f => f.endsWith('.png'));
              if (firstPng) {
                const fileId = firstPng.split('_')[0];
                image_url = `/api/v1/products/${product.id}/image/${fileId}`;
              }
            }
          }
        } catch (imageError) {
          console.error('Error fetching product image:', imageError);
        }
        return { ...product, image_url };
      })
    );

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ 
      data: productsWithImages || [],
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      mensagens: total > 0 
        ? [`${total} produtos encontrados para a categoria ${category.name}.`]
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
