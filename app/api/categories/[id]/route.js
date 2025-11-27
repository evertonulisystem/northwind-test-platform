// app/api/categories/[id]/route.js
import { supabase } from '@/lib/supabase';

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id, name, price, stock, image_url,
      suppliers (company_name)
    `)
    .eq('category_id', params.id)
    .eq('is_active', true)
    .order('name');

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ products });
}