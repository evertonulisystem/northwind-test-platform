// app/api/categories/route.js
import { supabase } from '@/lib/supabase';

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, description')
    .order('name');

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ categories });
}