// app/api/products/[id]/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET → Buscar produto por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id, name, price, stock_quantity, sku, image_url, created_at,
        category_id, supplier_id,
        categories (name),
        suppliers (company_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error('GET [id] Error:', error);
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
  }
}

// PUT → Atualizar produto
export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { id } = params;

    // Gera slug se mudar o nome
    let updateData = { ...data };
    if (data.name) {
      updateData.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const { data: updated, error } = await supabase
      .from('products')
      .update({
        name: updateData.name,
        slug: updateData.slug,
        price: parseFloat(updateData.price),
        stock_quantity: parseInt(updateData.stock_quantity, 10),
        sku: updateData.sku || null,
        category_id: updateData.category_id || null,
        supplier_id: updateData.supplier_id || null,
      })
      .eq('id', id)
      .select(`
        id, name, price, stock_quantity, sku, image_url, created_at,
        category_id, supplier_id,
        categories (name),
        suppliers (company_name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ product: updated }, { status: 200 });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

// DELETE → Excluir produto
// DELETE → Excluir produto
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Primeiro: verifica se o produto existe
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Agora deleta
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json(
      { message: 'Produto excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir produto' },
      { status: 500 }
    );
  }
}