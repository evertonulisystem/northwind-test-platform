// app/api/suppliers/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, company_name')
      .order('company_name');

    if (error) throw error;
    return NextResponse.json({ suppliers: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar fornecedores' }, { status: 500 });
  }
}