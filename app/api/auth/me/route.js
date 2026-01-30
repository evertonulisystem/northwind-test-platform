// app/api/auth/me/route.js
import { supabase } from '@/lib/supabase';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

export async function GET(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return Response.json({ 
      data: null,
      mensagens: ['Token ausente'] 
    }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return Response.json({ 
      data: null,
      mensagens: ['Token inválido'] 
    }, { status: 401 });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id, email, full_name, role, phone, address, birth_date, 
      created_at, last_login, is_active
    `)
    .eq('id', payload.id)
    .single();

  if (error || !user) {
    return Response.json({ 
      data: null,
      mensagens: ['Usuário não encontrado'] 
    }, { status: 404 });
  }

  return Response.json({ 
    data: { user },
    mensagens: 'Dados do usuário recuperados com sucesso'
  });
}