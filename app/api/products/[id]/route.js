// app/api/products/[id]/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

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

// === PUT (EDITAR) - VERSÃO FINAL COM DEBUG ===
export async function PUT(request, { params }) {
  try {
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