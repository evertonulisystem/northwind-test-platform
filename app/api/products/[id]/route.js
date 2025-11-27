// app/api/products/[id]/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const { id } = params;
  const data = await request.json();

  try {
    // Gerar slug se name mudou
    const updates = {
      name: data.name,
      price: parseFloat(data.price),
      stock_quantity: parseInt(data.stock_quantity, 10),
      sku: data.sku,
    };

    if (data.name) {
      updates.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao editar:', error);
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}