import { normalizeApiBody } from '@/lib/api-envelope';
// app/api/auth/me/route.js
import { supabase } from '@/lib/supabase';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

export async function GET(request) {
  const token = getTokenFromRequest(request);

  if (!token) {
    return Response.json(normalizeApiBody({
      data: null,
      mensagens: ['Token ausente'] 
    }), { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload || payload.error) {
    const message = payload?.message || 'Token inválido';
    return Response.json(normalizeApiBody({
      data: null,
      mensagens: [message] 
    }), { status: 401 });
  }

  const validId = (typeof payload.id === 'string' && payload.id.trim().length > 0)
    || (Number.isSafeInteger(payload.id) && payload.id > 0);
  if (!validId) {
    return Response.json(normalizeApiBody({
      data: null,
      mensagens: ['Token inválido']
    }), { status: 401 });
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
    return Response.json(normalizeApiBody({
      data: null,
      mensagens: ['Usuário não encontrado'] 
    }), { status: 404 });
  }

  if (!user.is_active) {
    return Response.json(normalizeApiBody({
      data: null,
      mensagens: ['Usuário inativo']
    }), { status: 401 });
  }

  return Response.json(normalizeApiBody({
    data: { user },
    mensagens: ['Dados do usuário recuperados com sucesso.']
  }));
}
