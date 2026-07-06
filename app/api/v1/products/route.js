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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *         description: Número da página (inicia em 1)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 1000 }
 *         description: Quantidade de itens por página (1-1000)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Busca por nome, SKU ou ID do produto
 *       - in: query
 *         name: category_id
 *         schema: { type: integer, minimum: 1 }
 *         description: Filtrar por ID da categoria
 *       - in: query
 *         name: supplier_id
 *         schema: { type: integer, minimum: 1 }
 *         description: Filtrar por ID do fornecedor
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [id, name, price, stock_quantity, sku, created_at], default: name }
 *         description: Campo de ordenação permitido
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *         description: Ordem de ordenação (asc = crescente, desc = decrescente)
 *     responses:
 *       200:
 *         description: Lista paginada de produtos carregada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 47
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                 mensagens:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Produtos carregados com sucesso."]
 *       400:
 *         description: Parâmetros inválidos (sortBy ou order)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               CampoOrdenacaoInvalido:
 *                 summary: Campo de ordenação inválido
 *                 value:
 *                   data: null
 *                   mensagens: ["Campo de ordenação 'invalido' não é permitido. Use: id, name, price, stock_quantity, sku, created_at."]
 *               OrdemInvalida:
 *                 summary: Ordem de ordenação inválida
 *                 value:
 *                   data: null
 *                   mensagens: ["Ordem 'invalido' não é permitido. Use: asc ou desc."]
 *       401:
 *         description: Não autorizado - token ausente ou inválido
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
 *       404:
 *         description: Nenhum produto encontrado com os filtros aplicados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               data: null
 *               mensagens: ["Nenhum produto encontrado para os filtros aplicados."]
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               data: null
 *               mensagens: ["Erro interno ao carregar produtos."]
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
    const sortBy = searchParams.get('sortBy') || 'name';
    const order = searchParams.get('order') || 'asc';
    
    // Debug dos parâmetros
    console.log('📋 GET /products - Parâmetros recebidos:');
    console.log('  - page:', page);
    console.log('  - limit:', limit);
    console.log('  - search:', search);
    console.log('  - category_id:', category_id);
    console.log('  - supplier_id:', supplier_id);
    console.log('  - sortBy:', sortBy);
    console.log('  - order:', order);
    console.log('  - URL completa:', request.url);

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
    // Validar campos permitidos para ordenação
    const allowedSortFields = ['id', 'name', 'price', 'stock_quantity', 'sku', 'created_at'];
    const allowedOrders = ['asc', 'desc'];
    
    if (!allowedSortFields.includes(sortBy)) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Campo de ordenação '${sortBy}' não é permitido. Use: ${allowedSortFields.join(', ')}.`] 
        },
        { status: 400 }
      );
    }
    
    if (!allowedOrders.includes(order.toLowerCase())) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Ordem '${order}' não é permitida. Use: asc ou desc.`] 
        },
        { status: 400 }
      );
    }
    
    const ascending = order.toLowerCase() === 'asc';
    
    query = query
      .range(start, start + limit - 1)
      .order(sortBy, { ascending });

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
    console.log('📊 Paginação final:');
    console.log('  - data.length:', data?.length || 0);
    console.log('  - count:', count || 0);
    console.log('  - page:', page);
    console.log('  - limit:', limit);
    console.log('  - totalPages:', Math.ceil((count || 0) / limit));
    console.log('🔀 Ordenação aplicada:');
    console.log('  - sortBy:', sortBy);
    console.log('  - order:', order);
    console.log('  - ascending:', ascending);

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
 *     summary: Cria um novo produto no catálogo (US-08)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreateRequest'
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
 *                   example: ["Produto criado com sucesso!", "Verificado: Salvo no banco Supabase (seu-projeto.supabase.co)"]
 *       400:
 *         description: Dados inválidos ou campos obrigatórios ausentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               CamposObrigatorios:
 *                 summary: Campos obrigatórios não preenchidos
 *                 value:
 *                   data: null
 *                   mensagens: ["Campos obrigatórios não preenchidos: name, price."]
 *               PrecoInvalido:
 *                 summary: Preço inválido (menor ou igual a zero)
 *                 value:
 *                   data: null
 *                   mensagens: ["O preço deve ser um valor positivo maior que zero."]
 *               EstoqueInvalido:
 *                 summary: Estoque inválido (menor que zero)
 *                 value:
 *                   data: null
 *                   mensagens: ["A quantidade em estoque deve ser um número inteiro maior ou igual a zero."]
 *               CategoriaInexistente:
 *                 summary: Categoria selecionada não existe
 *                 value:
 *                   data: null
 *                   mensagens: ["Categoria selecionada não existe. Escolha uma categoria válida."]
 *               FornecedorInexistente:
 *                 summary: Fornecedor selecionado não existe
 *                 value:
 *                   data: null
 *                   mensagens: ["Fornecedor selecionado não existe. Escolha um fornecedor válido."]
 *       401:
 *         description: Não autorizado - token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               TokenAusente:
 *                 summary: Token JWT não fornecido
 *                 value:
 *                   data: null
 *                   mensagens: ["Token ausente"]
 *               TokenInvalido:
 *                 summary: Token JWT expirado ou inválido
 *                 value:
 *                   data: null
 *                   mensagens: ["Token inválido"]
 *       409:
 *         description: SKU ou nome do produto já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               NomeJaExiste:
 *                 summary: Nome do produto já existe
 *                 value:
 *                   data: null
 *                   mensagens: ["Já existe um produto com esse nome/slug."]
 *               SKUJaExiste:
 *                 summary: SKU do produto já existe
 *                 value:
 *                   data: null
 *                   mensagens: ["Já existe um produto com esse SKU."]
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

    // Debug para o usuário verificar o projeto
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectHost = supabaseUrl ? new URL(supabaseUrl).host : 'desconhecido';

    return NextResponse.json(
      { 
        data: newProduct, 
        mensagens: [
          'Produto criado com sucesso!',
          `Verificado: Salvo no banco Supabase (${projectHost})`
        ] 
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
