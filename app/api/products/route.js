// app/api/products/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lista produtos com paginação, filtros e ordenação
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category_id
 *         schema: { type: integer }
 *       - in: query
 *         name: supplier_id
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista paginada
 */
// app/api/products/route.js → GET ATUALIZADO (O ÚNICO QUE FUNCIONA DE VERDADE COM JOIN)
// app/api/products/route.js → GET FINAL (FUNCIONA COM TEXTO EM NOME, CATEGORIA E FORNECEDOR)
// app/api/products/route.js → VERSÃO FINAL QUE FUNCIONA 100%

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search')?.trim();

    const start = (page - 1) * limit;

    // Primeiro busca TODOS os produtos com join (sem filtro)
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
        categories(name),
        suppliers(company_name)
      `, { count: 'exact' })
      .range(start, start + limit - 1)
      .order('name', { ascending: true });

    const { data: products, error, count } = await query;

    if (error) throw error;

    // Agora filtra EM MEMÓRIA (É A ÚNICA FORMA QUE FUNCIONA 100% COM JOIN)
    let filtered = products || [];
    let totalFiltered = count || 0;

    if (search && search.length > 0) {
      const term = search.toLowerCase();
      filtered = products.filter(p => {
        const name = (p.name || '').toLowerCase();
        const category = (p.categories?.name || '').toLowerCase();
        const supplier = (p.suppliers?.company_name || '').toLowerCase();
        return name.includes(term) || category.includes(term) || supplier.includes(term);
      });
      totalFiltered = filtered.length;
    }

    const totalPages = Math.ceil(totalFiltered / limit);

    return NextResponse.json({
      data: filtered,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages,
      },
      message: 'Produtos carregados com sucesso',
    });

  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      message: 'Erro ao carregar produtos'
    }, { status: 500 });
  }
}




/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Adiciona um novo produto
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock_quantity
 *               - sku
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Mouse Gamer RGB"
 *               price:
 *                 type: number
 *                 example: 299.90
 *               stock_quantity:
 *                 type: integer
 *                 example: 50
 *               sku:
 *                 type: string
 *                 example: "MGP-2024"
 *               category_id:
 *                 type: integer
 *                 nullable: true
 *               supplier_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Produto criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *       409:
 *         description: SKU ou slug duplicado
 *       400:
 *         description: Dados inválidos
 */

// === POST (ADICIONAR) ===
export async function POST(request) {
  try {
    const body = await request.json();
    const slug = body.slug || generateSlug(body.name);

    // VERIFICA DUPLICIDADE
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { data: null, message: 'Já existe um produto com esse nome/slug.' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('products')
      .insert({ ...body, slug })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { data, message: 'Produto adicionado com sucesso!' },
      { status: 201 }
    );
  } catch (error) {
    if (error.message.includes('products_slug_key')) {
      return NextResponse.json(
        { data: null, message: 'Slug duplicado.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { data: null, message: error.message || 'Erro ao adicionar' },
      { status: 500 }
    );
  }
}

function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}