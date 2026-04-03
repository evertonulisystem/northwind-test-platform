// app/api/products/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

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
  console.log('=== DEBUG GET /api/products ===');
  console.log('URL:', request.url);
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
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

    const payload = verifyToken(token);
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search')?.trim();

    const start = (page - 1) * limit;

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

    if (search && search.length > 0) {
      const pattern = `%${search}%`;
      // AQUI É O JEITO CERTO QUE O SUPABASE ACEITA COM JOIN
      query = query.or(
        `name.ilike.${pattern},categories.name.ilike.${pattern},suppliers.company_name.ilike.${pattern}`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro Supabase:', error);
      throw error;
    }

    console.log('Dados retornados:', data?.length || 0, 'produtos');

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      message: 'Produtos carregados com sucesso',
    });

  } catch (error) {
    console.error('Erro fatal:', error);
    return NextResponse.json({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      message: 'Erro interno'
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

    const payload = verifyToken(token);
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

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { data: null, message: 'Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.' },
        { status: 400 }
      );
    }

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { data: null, message: 'Nenhum dado informado. Preencha os campos do produto.' },
        { status: 400 }
      );
    }

    // Validação de campos obrigatórios
    const requiredFields = ['name', 'price', 'stock_quantity', 'sku', 'category_id', 'supplier_id'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { data: null, message: `Campos obrigatórios não preenchidos: ${missingFields.join(', ')}.` },
        { status: 400 }
      );
    }

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

    if (error) {
      // Tratamento amigável de erros comuns
      if (error.message.includes('products_sku_key')) {
        return NextResponse.json(
          { data: null, message: 'Já existe um produto com este SKU. Por favor, escolha outro SKU.' },
          { status: 409 }
        );
      }
      if (error.message.includes('products_slug_key')) {
        return NextResponse.json(
          { data: null, message: 'Já existe um produto com este nome. Por favor, escolha outro nome.' },
          { status: 409 }
        );
      }
      if (error.message.includes('products_category_id_fkey')) {
        return NextResponse.json(
          { data: null, message: 'Categoria informada não existe. Por favor, escolha uma categoria válida.' },
          { status: 400 }
        );
      }
      if (error.message.includes('products_supplier_id_fkey')) {
        return NextResponse.json(
          { data: null, message: 'Fornecedor informado não existe. Por favor, escolha um fornecedor válido.' },
          { status: 400 }
        );
      }
      if (error.message.includes('null value in column')) {
        return NextResponse.json(
          { data: null, message: 'Campos obrigatórios não foram preenchidos. Verifique nome, preço, estoque e SKU.' },
          { status: 400 }
        );
      }
      if (error.message.includes('invalid input syntax')) {
        return NextResponse.json(
          { data: null, message: 'Formato de dados inválido. Verifique se os valores estão corretos.' },
          { status: 400 }
        );
      }
      throw error;
    }

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
