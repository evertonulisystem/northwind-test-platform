// app/api/auth/me/route.js
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return Response.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, phone, address, birth_date, created_at')
      .eq('id', payload.sub)
      .single();

    if (error || !user) {
      return Response.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return Response.json({ user });

  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
}