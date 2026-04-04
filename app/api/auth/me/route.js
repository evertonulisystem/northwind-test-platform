// app/api/auth/me/route.js
import { supabase } from '@/lib/supabase';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

export async function GET(request) {
  console.log('=== DEBUG /api/auth/me ===');
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  const token = getTokenFromRequest(request);
  console.log('Token extraído:', token ? 'SIM' : 'NÃO');
  console.log('Auth header:', request.headers.get('authorization'));
  
  if (!token) {
    console.log('❌ Token ausente - retornando erro 401');
    return Response.json({ 
      data: null,
      mensagens: ['Token ausente'] 
    }, { status: 401 });
  }

  const payload = verifyToken(token);
  console.log('Payload do token:', payload);

  if (!payload || payload.error) {
    const message = payload?.message || 'Token inválido';
    console.log('❌ Token inválido/expirado - retornando erro 401:', message);
    return Response.json({ 
      data: null,
      mensagens: [message] 
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
    mensagens: ['Dados do usuário recuperados com sucesso.']
  });
}