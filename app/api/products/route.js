// app/api/products/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// === GET ALL (SÓ AQUI!) ===
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, price, stock_quantity, sku, category_id, supplier_id, slug,
        categories(name), suppliers(company_name)
      `)
      .order('id', { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      { data: data || [], message: 'Produtos carregados com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { data: null, message: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}

// === POST (ADICIONAR) ===
export async function POST(request) {
  try {
    const body = await request.json();
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

    if (error) throw error;

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