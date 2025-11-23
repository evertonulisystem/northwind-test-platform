import { supabase } from '@/lib/supabase';
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = supabase
      .from('products')
      .select(`
        *,
        categories (id, name, slug),
        suppliers (id, company_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return Response.json(
        { error: 'Erro ao buscar produtos' },
        { status: 500 }
      );
    }

    return Response.json({
      products,
      total: count,
      limit,
      offset
    });

  } catch (error) {
    console.error('Erro:', error);
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}