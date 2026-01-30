// app/api/products/[id]/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

// === FUNÇÃO DE SLUG ===
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

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Atualiza um produto existente
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock_quantity:
 *                 type: integer
 *               sku:
 *                 type: string
 *               category_id:
 *                 type: integer
 *                 nullable: true
 *               supplier_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       404:
 *         description: Produto não encontrado
 *       409:
 *         description: SKU ou slug duplicado
 */

// === PUT (EDITAR) - VERSÃO FINAL COM DEBUG ===
export async function PUT(request, { params }) {
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
    if (!payload) {
      return NextResponse.json(
        { 
          data: null,
          mensagens: ['Token inválido'] 
        }, 
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    console.log('PUT /api/products/[id] - ID:', id);
    console.log('Body recebido:', body);

    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return NextResponse.json(
        { data: null, message: 'ID inválido' },
        { status: 400 }
      );
    }

    // 1. VALIDA SKU
    const sku = body.sku?.trim();
    if (!sku) {
      return NextResponse.json(
        { data: null, message: 'SKU é obrigatório' },
        { status: 400 }
      );
    }

    // 2. VERIFICA SKU DUPLICADO
    const { data: skuExists } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .neq('id', idNum)
      .maybeSingle();

    if (skuExists) {
      return NextResponse.json(
        { data: null, message: 'Já existe outro produto com esse SKU.' },
        { status: 409 }
      );
    }

    // 3. BUSCA PRODUTO ATUAL
    const { data: current, error: fetchError } = await supabase
      .from('products')
      .select('name, slug')
      .eq('id', idNum);

    if (fetchError) {
      console.error('Erro ao buscar produto:', fetchError);
      throw fetchError;
    }
    if (!current || current.length === 0) {
      return NextResponse.json(
        { data: null, message: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    const currentProduct = current[0];
    console.log('Produto atual no banco:', currentProduct);

    // 4. DECIDE SLUG
    let slug = currentProduct.slug;
    if (body.name && body.name !== currentProduct.name) {
      slug = generateSlug(body.name);
      console.log('Novo slug gerado:', slug);

      const { data: slugExists } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .neq('id', idNum)
        .maybeSingle();

      if (slugExists) {
        return NextResponse.json(
          { data: null, message: 'Já existe outro produto com esse nome/slug.' },
          { status: 409 }
        );
      }
    }

    // 5. FORÇA O UPDATE (com log)
    console.log('Executando UPDATE com:', {
      name: body.name,
      price: body.price,
      stock_quantity: body.stock_quantity,
      sku: sku,
      category_id: body.category_id || null,
      supplier_id: body.supplier_id || null,
      slug: slug,
    });

    const { error: updateError } = await supabase
      .from('products')
      .update({
        name: body.name,
        price: body.price,
        stock_quantity: body.stock_quantity,
        sku: sku,
        category_id: body.category_id || null,
        supplier_id: body.supplier_id || null,
        slug: slug,
      })
      .eq('id', idNum);

    if (updateError) {
      console.error('ERRO NO UPDATE:', updateError);
      throw updateError;
    }

    console.log('UPDATE executado com sucesso');

    // 6. BUSCA O PRODUTO NOVAMENTE
    const { data: updated, error: selectError } = await supabase
      .from('products')
      .select(`
        id, name, price, stock_quantity, sku, category_id, supplier_id, slug,
        categories(name), suppliers(company_name)
      `)
      .eq('id', idNum)
      .single();

    if (selectError) {
      console.error('Erro ao buscar após update:', selectError);
      throw selectError;
    }

    console.log('Produto após update:', updated);

    return NextResponse.json(
      { data: updated, message: 'Produto atualizado com sucesso!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro fatal no PUT:', error);
    return NextResponse.json(
      { data: null, message: error.message || 'Erro ao atualizar' },
      { status: 500 }
    );
  }
}
/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Remove um produto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto excluído
 *       404:
 *         description: Produto não encontrado
 *       400:
 *         description: ID inválido
 */

// === DELETE (CORRIGIDO - PADRÃO data + message) ===
export async function DELETE(request, { params }) {
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
    if (!payload) {
      return NextResponse.json(
        { 
          data: null,
          mensagens: ['Token inválido'] 
        }, 
        { status: 401 }
      );
    }

    const { id } = params;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        { data: null, message: 'ID inválido' },
        { status: 400 }
      );
    }

    // VERIFICA SE EXISTE
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', idNum)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existing) {
      return NextResponse.json(
        { data: null, message: 'Produto não encontrado' }, // CORRIGIDO
        { status: 404 }
      );
    }

    // DELETA
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', idNum);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      { data: null, message: 'Produto excluído com sucesso!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no DELETE:', error);
    return NextResponse.json(
      { data: null, message: error.message || 'Erro ao excluir produto' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Busca produto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *       400:
 *         description: ID inválido
 */

// === GET POR ID - 100% FUNCIONAL ===
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        { data: null, message: 'ID inválido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
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
      `)
      .eq('id', idNum)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { data: null, message: 'Produto não encontrado' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { data, message: 'Produto encontrado' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no GET /api/products/[id]:', error);
    return NextResponse.json(
      { data: null, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}