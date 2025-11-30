// app/api/products/[id]/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const ok = (data, message = 'Sucesso') =>
  NextResponse.json({ data, message }, { status: 200 });

const badRequest = (message) =>
  NextResponse.json({ data: null, message }, { status: 400 });

const notFound = (message = 'Produto não encontrado') =>
  NextResponse.json({ data: null, message }, { status: 404 });

const serverError = (message = 'Erro interno do servidor') =>
  NextResponse.json({ data: null, message }, { status: 500 });

// GET
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

    if (error || !product) return notFound();

    return ok(product, 'Produto encontrado');
  } catch (error) {
    console.error('GET [id] Error:', error);
    return serverError('Erro ao buscar produto');
  }
}

// PUT
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { id } = params;

    let updateData = {};
    if (body.name) {
      updateData.name = body.name;
      updateData.slug = body.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.stock_quantity !== undefined) updateData.stock_quantity = parseInt(body.stock_quantity, 10);
    if (body.sku !== undefined) updateData.sku = body.sku || null;
    if (body.category_id !== undefined) updateData.category_id = body.category_id || null;
    if (body.supplier_id !== undefined) updateData.supplier_id = body.supplier_id || null;
    if (body.image_url !== undefined) updateData.image_url = body.image_url || null;

    const { data: updated, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(`
        id, name, price, stock_quantity, sku, image_url, created_at,
        category_id, supplier_id,
        categories (name),
        suppliers (company_name)
      `)
      .single();

    if (error || !updated) return notFound();

    return ok(updated, 'Produto atualizado com sucesso');
  } catch (error) {
    console.error('PUT Error:', error);
    return serverError('Erro ao atualizar produto');
  }
}

// DELETE → Excluir produto (QA FINAL - 100% FUNCIONAL)
export async function DELETE(request, { params }) {
  console.log('=== DELETE REQUEST START ===');
  console.log('params:', params);

  try {
    const { id } = params;

    if (!id || id === 'null' || id === 'undefined' || id.trim() === '') {
      console.log('ID inválido (vazio/null):', id);
      return badRequest('ID do produto é obrigatório');
    }

    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      console.log('ID não é número positivo:', id);
      return badRequest('ID do produto deve ser um número inteiro positivo');
    }

    console.log('ID válido, convertendo para número:', idNum);

    // VERIFICA SE EXISTE
    console.log('Fazendo SELECT para verificar existência...');
    const { data: existing, error: checkError, count: checkCount } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('id', idNum);

    console.log('SELECT result:', { existing, checkError, checkCount });

    if (checkError) {
      console.error('Erro no SELECT:', checkError);
      return serverError('Erro ao verificar produto');
    }

    if (!existing || existing.length === 0 || checkCount === 0) {
      console.log('Produto NÃO encontrado. Retornando 404.');
      return notFound('Produto não encontrado');
    }

    console.log('Produto encontrado. ID:', existing[0].id);

    // DELETA
    console.log('Executando DELETE...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', idNum);

    console.log('DELETE result:', { deleteError });

    if (deleteError) {
      console.error('Erro no DELETE:', deleteError);
      return serverError(deleteError.message);
    }

    console.log('DELETE executado com sucesso (sem count).');
    console.log('=== DELETE REQUEST END ===');

    return ok(null, 'Produto excluído com sucesso');

  } catch (error) {
    console.error('ERRO INESPERADO:', error);
    return serverError('Erro inesperado ao excluir produto');
  }
}