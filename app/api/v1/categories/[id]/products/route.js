import { normalizeApiBody } from '@/lib/api-envelope';
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
 *     summary: Lista produtos paginados de uma categoria
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID da categoria
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página (padrão: 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Quantidade de itens por página (padrão: 10)
 *     responses:
 *       200:
 *         description: Lista paginada de produtos da categoria
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - id: 1
 *                   name: Mouse Gamer RGB Pro
 *                   price: 299.9
 *                   stock_quantity: 150
 *                   sku: MOU-RGB-001
 *                   slug: mouse-gamer-rgb-pro
 *                   categories:
 *                     name: Periféricos
 *                   suppliers:
 *                     company_name: Tech Solutions Ltda
 *                   image_url: "/api/v1/products/1/image/abc123xyz"
 *                 - id: 2
 *                   name: Teclado Mecânico Redragon
 *                   price: 459
 *                   stock_quantity: 80
 *                   sku: TEC-MEC-002
 *                   slug: teclado-mecanico-redragon
 *                   categories:
 *                     name: Periféricos
 *                   suppliers:
 *                     company_name: Tech Solutions Ltda
 *                   image_url: null
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 18
 *                 totalPages: 2
 *               mensagens:
 *                 - "18 produtos encontrados para a categoria Periféricos."
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["ID da categoria inválido. Deve ser um número positivo."]
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               TokenAusente:
 *                 value:
 *                   data: null
 *                   mensagens: ["Token ausente"]
 *               TokenInvalido:
 *                 value:
 *                   data: null
 *                   mensagens: ["Token inválido"]
 *                   expires_at: "2026-09-05T10:00:00.000Z"
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["Categoria com ID 9999 não encontrada."]
 *       500:
 *         description: Erro interno ao buscar produtos
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["Erro interno ao buscar produtos da categoria."]
 */
export async function GET(request, { params }) {
  try {
    // Verificar autenticação
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        normalizeApiBody({
          data: null,
          mensagens: ['Token ausente'] 
        }),
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.error) {
      const message = payload?.message || 'Token inválido';
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: [message],
          expires_at: payload?.expires_at || null
        }),
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['ID da categoria inválido. Deve ser um número positivo.'] 
        }),
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
        normalizeApiBody({
          data: null, 
          mensagens: [`Categoria com ID ${idNum} não encontrada.`] 
        }),
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
        normalizeApiBody({
          data: null, 
          mensagens: [error.message] 
        }),
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

    return NextResponse.json(normalizeApiBody({
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
    }));
  } catch (error) {
    return NextResponse.json(
      normalizeApiBody({
        data: null, 
        mensagens: ['Erro interno ao buscar produtos da categoria.'] 
      }),
      { status: 500 }
    );
  }
}
