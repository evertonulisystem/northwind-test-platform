// app/api/products/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET → Listar todos
export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id, name, price, stock_quantity, sku, image_url, created_at,
        category_id, supplier_id,
        categories (name),
        suppliers (company_name)
      `)
      .order('id');

    if (error) throw error;

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
  }
}

// POST → Adicionar novo
export async function POST(request) {
  try {
    const data = await request.json();

    // Validação
    if (!data.name || !data.price || !data.stock_quantity) {
      return NextResponse.json(
        { error: 'Nome, preço e estoque são obrigatórios' },
        { status: 400 }
      );
    }

    // GERAR SLUG
    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // INSERIR
    const { data: inserted, error: insertError } = await supabase
      .from('products')
      .insert({
        name: data.name,
        slug: slug,
        price: parseFloat(data.price),
        stock_quantity: parseInt(data.stock_quantity, 10),
        sku: data.sku || `SKU-${Date.now()}`,
        category_id: data.category_id || null,
        supplier_id: data.supplier_id || null,
      })
      .select(`
        id, name, price, stock_quantity, sku, image_url, created_at,
        category_id, supplier_id,
        categories (name),
        suppliers (company_name)
      `)
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ product: inserted }, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}