// app/api/products/search/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Busca produto por ID ou outros parâmetros
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: integer }
 *         description: ID do produto para busca específica
 *       - in: query
 *         name: sku
 *         schema: { type: string }
 *         description: SKU do produto para busca
 *       - in: query
 *         name: slug
 *         schema: { type: string }
 *         description: Slug do produto para busca
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *       404:
 *         description: Produto não encontrado
 *       401:
 *         description: Não autorizado
 *       400:
 *         description: Parâmetros inválidos
 */
export async function GET(request) {
  console.log('=== DEBUG GET /api/products/search ===');
  console.log('URL:', request.url);
  
  try {
    // Verificar autenticação
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { 
          data: null,
          message: 'Token ausente' 
        }, 
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { 
          data: null,
          message: 'Token inválido' 
        }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const sku = searchParams.get('sku');
    const slug = searchParams.get('slug');

    // Validação: pelo menos um parâmetro deve ser fornecido
    if (!id && !sku && !slug) {
      return NextResponse.json(
        { 
          data: null,
          message: 'Pelo menos um parâmetro deve ser fornecido: id, sku ou slug' 
        }, 
        { status: 400 }
      );
    }

    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        stock_quantity,
        sku,
        category_id,
        supplier_id,
        slug,
        created_at,
        updated_at,
        categories(name),
        suppliers(company_name)
      `);

    // Aplicar filtro baseado no parâmetro fornecido
    if (id) {
      const productId = parseInt(id);
      if (isNaN(productId) || productId <= 0) {
        return NextResponse.json(
          { 
            data: null,
            message: 'ID deve ser um número positivo válido' 
          }, 
          { status: 400 }
        );
      }
      query = query.eq('id', productId);
    } else if (sku) {
      query = query.eq('sku', sku.trim().toUpperCase());
    } else if (slug) {
      query = query.eq('slug', slug.trim().toLowerCase());
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Erro Supabase:', error);
      
      if (error.code === 'PGRST116') {
        // Produto não encontrado
        return NextResponse.json(
          { 
            data: null,
            message: 'Produto não encontrado' 
          }, 
          { status: 404 }
        );
      }
      
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { 
          data: null,
          message: 'Produto não encontrado' 
        }, 
        { status: 404 }
      );
    }

    console.log('Produto encontrado:', data.name);
    
    return NextResponse.json({
      data,
      message: 'Produto encontrado com sucesso',
    });

  } catch (error) {
    console.error('Erro fatal:', error);
    return NextResponse.json({
      data: null,
      message: 'Erro interno ao buscar produto'
    }, { status: 500 });
  }
}
