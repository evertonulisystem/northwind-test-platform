// app/api/products/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const ok = (data, message = 'Sucesso') =>
  NextResponse.json({ data, message }, { status: 200 });

const created = (data, message = 'Criado com sucesso') =>
  NextResponse.json({ data, message }, { status: 201 });

const badRequest = (message) =>
  NextResponse.json({ data: null, message }, { status: 400 });

const notFound = (message = 'Recurso não encontrado') =>
  NextResponse.json({ data: null, message }, { status: 404 });

const serverError = (message = 'Erro interno do servidor') =>
  NextResponse.json({ data: null, message }, { status: 500 });

// GET
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

    if (error) return serverError(error.message);

    return ok(products, 'Produtos carregados com sucesso');
  } catch (error) {
    console.error('GET Error:', error);
    return serverError('Falha ao buscar produtos');
  }
}

// POST
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.price || !body.stock_quantity) {
      return badRequest('Nome, preço e estoque são obrigatórios');
    }

    const slug = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data: inserted, error } = await supabase
      .from('products')
      .insert({
        name: body.name,
        slug,
        price: parseFloat(body.price),
        stock_quantity: parseInt(body.stock_quantity, 10),
        sku: body.sku || `SKU-${Date.now()}`,
        category_id: body.category_id || null,
        supplier_id: body.supplier_id || null,
        image_url: body.image_url || null,
      })
      .select(`
        id, name, price, stock_quantity, sku, image_url, created_at,
        category_id, supplier_id,
        categories (name),
        suppliers (company_name)
      `)
      .single();

    if (error) return badRequest(error.message);

    return created(inserted, 'Produto criado com sucesso');
  } catch (error) {
    console.error('POST Error:', error);
    return serverError('Erro ao criar produto');
  }
}