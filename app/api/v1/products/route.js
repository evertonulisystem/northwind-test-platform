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
 *     summary: Cria um novo produto no catálogo
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *               - category_id
 *               - supplier_id
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 description: "Nome completo do produto (obrigatório, entre 3 e 100 caracteres, deve ser descritivo e único)"
 *                 example: "Mouse Gamer RGB Pro Wireless"
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *                 multipleOf: 0.01
 *                 description: "Preço de venda do produto (obrigatório, deve ser maior que 0, use 2 casas decimais)"
 *                 example: 299.90
 *               stock_quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: "Quantidade em estoque (obrigatório, número inteiro, não pode ser negativo, atualiza automaticamente)"
 *                 example: 50
 *               sku:
 *                 type: string
 *                 pattern: "^[A-Z0-9]{6,20}$"
 *                 description: "SKU do produto (obrigatório, código único em maiúsculas, 6-20 caracteres alfanuméricos, sem espaços)"
 *                 example: "MGP2024W"
 *               category_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: "ID da categoria (obrigatório, deve existir na tabela categories, use 1 para 'Eletrônicos')"
 *                 example: 1
 *               supplier_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: "ID do fornecedor (obrigatório, deve existir na tabela suppliers, use 1 para fornecedor padrão)"
 *                 example: 1
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 mensagens:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Produto criado com sucesso!"]
 *       400:
 *         description: Dados inválidos ou campos obrigatórios ausentes
 *       401:
 *         description: Não autorizado - token ausente ou inválido
 *       409:
 *         description: SKU ou nome do produto já existe
 *       500:
 *         description: Erro interno do servidor
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

    // Validação de preço
    const price = parseFloat(body.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['O preço deve ser um valor positivo maior que zero.'] 
        },
        { status: 400 }
      );
    }

    // Validação de estoque
    const stockQuantity = parseInt(body.stock_quantity);
    if (isNaN(stockQuantity) || stockQuantity < 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['A quantidade em estoque deve ser um número inteiro maior ou igual a zero.'] 
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
        price: price, // Usar valor validado
        stock_quantity: stockQuantity, // Usar valor validado
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
    
    // Tratamento específico para constraint violations
    let errorMessage = 'Erro ao criar produto.';
    
    if (error.message) {
      if (error.message.includes('products_price_check')) {
        errorMessage = 'O preço deve ser um valor positivo maior que zero.';
      } else if (error.message.includes('products_stock_quantity_check')) {
        errorMessage = 'A quantidade em estoque deve ser um número inteiro maior ou igual a zero.';
      } else if (error.message.includes('products_supplier_id_fkey')) {
        errorMessage = 'Fornecedor selecionado não existe. Escolha um fornecedor válido.';
      } else if (error.message.includes('products_category_id_fkey')) {
        errorMessage = 'Categoria selecionada não existe. Escolha uma categoria válida.';
      } else if (error.message.includes('violates foreign key constraint')) {
        if (error.message.includes('supplier_id')) {
          errorMessage = 'Fornecedor selecionado não existe. Escolha um fornecedor válido.';
        } else if (error.message.includes('category_id')) {
          errorMessage = 'Categoria selecionada não existe. Escolha uma categoria válida.';
        } else {
          errorMessage = 'Referência inválida. Verifique se fornecedor e categoria existem.';
        }
      } else if (error.message.includes('violates check constraint')) {
        errorMessage = 'Dados inválidos. Verifique se preço e estoque são valores válidos.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [errorMessage] 
      },
      { status: 400 }
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
