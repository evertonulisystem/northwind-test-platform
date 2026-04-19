// app/api/v1/products/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

/**
 * @swagger
 * /api/v1/products:
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
// app/api/v1/products/route.js → GET ATUALIZADO (O ÚNICO QUE FUNCIONA DE VERDADE COM JOIN)
// app/api/v1/products/route.js → GET FINAL (FUNCIONA COM TEXTO EM NOME, CATEGORIA E FORNECEDOR)
// app/api/v1/products/route.js → VERSÃO FINAL QUE FUNCIONA 100%
export async function GET(request) {
  console.log('=== DEBUG GET /api/v1/products ===');
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search')?.trim();
    const category_id = searchParams.get('category_id');
    const supplier_id = searchParams.get('supplier_id');

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
      `, { count: 'exact' });

    // Filtros fixos (AND)
    if (category_id) {
      query = query.eq('category_id', category_id);
    }
    if (supplier_id) {
      query = query.eq('supplier_id', supplier_id);
    }

    // Busca global (OR)
    if (search && search.length > 0) {
      const isNumeric = /^\d+$/.test(search);
      const pattern = `%${search}%`;
      
      // Construir condições OR apenas para a tabela principal (products)
      // para evitar erro 500 em joins complexos no PostgREST
      let orConditions = `name.ilike.${pattern},sku.ilike.${pattern},slug.ilike.${pattern}`;
      
      if (isNumeric) {
        orConditions += `,id.eq.${search}`;
      }
      
      query = query.or(orConditions);
    }

    // Ordenação e Paginação
    query = query
      .range(start, start + limit - 1)
      .order('name', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro Supabase:', error);
      throw error;
    }

    // Se houver filtros (search, category_id ou supplier_id) e não encontrar nada, retorna 404
    if ((search || category_id || supplier_id) && (!data || data.length === 0)) {
      return NextResponse.json(
        { 
          data: null,
          mensagens: ['Nenhum produto encontrado para os filtros aplicados.'] 
        },
        { status: 404 }
      );
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
      mensagens: ['Produtos carregados com sucesso.'],
    });

  } catch (error) {
    console.error('Erro fatal:', error);
    return NextResponse.json({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      mensagens: ['Erro interno ao carregar produtos.']
    }, { status: 500 });
  }
}
/**
 * @swagger
 * /api/v1/products:
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

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.'] 
        },
        { status: 400 }
      );
    }

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Nenhum dado informado. Preencha os campos do produto.'] 
        },
        { status: 400 }
      );
    }

    // Validação de campos obrigatórios
    const requiredFields = ['name', 'price', 'stock_quantity', 'sku', 'category_id', 'supplier_id'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}.`] 
        },
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
        { 
          data: null, 
          mensagens: ['Já existe um produto com esse nome/slug.'] 
        },
        { status: 409 }
      );
    }

    // VERIFICA SKU DUPLICADO
    const { data: skuExists } = await supabase
      .from('products')
      .select('id')
      .eq('sku', body.sku)
      .maybeSingle();

    if (skuExists) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Já existe um produto com esse SKU.'] 
        },
        { status: 409 }
      );
    }

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        name: body.name,
        price: body.price,
        stock_quantity: body.stock_quantity,
        sku: body.sku,
        category_id: body.category_id,
        supplier_id: body.supplier_id,
        slug: slug
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { 
        data: newProduct, 
        mensagens: ['Produto criado com sucesso!'] 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro no POST:', error);
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [error.message || 'Erro ao criar produto.'] 
      },
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
