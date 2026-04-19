// app/api/auth/me/route.js
import { supabase } from '@/lib/supabase';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

export async function GET(request) {
  console.log('=== DEBUG /api/auth/me ===');
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  console.log('URL:', request.url);
  console.log('Method:', request.method);
  
  const token = getTokenFromRequest(request);
  console.log('Token extraído:', token ? 'SIM' : 'NÃO');
  console.log('Auth header:', request.headers.get('authorization'));
  console.log('Token completo (primeiros 50 chars):', token ? token.substring(0, 50) + '...' : 'N/A');
  
  if (!token) {
    console.log('❌ Token ausente - retornando erro 401');
    return Response.json({ 
      data: null,
      mensagens: ['Token ausente'] 
    }, { status: 401 });
  }

  const payload = await verifyToken(token);
  console.log('Payload do token:', payload);
  console.log('ID do usuário no payload:', payload?.id);
  console.log('Email no payload:', payload?.email);

  if (!payload || payload.error) {
    const message = payload?.message || 'Token inválido';
    console.log('❌ Token inválido/expirado - retornando erro 401:', message);
    console.log('Payload.error:', payload?.error);
    return Response.json({ 
      data: null,
      mensagens: [message] 
    }, { status: 401 });
  }

  console.log('✅ Token válido, buscando usuário no Supabase...');
  console.log('ID para busca:', payload.id);

  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id, email, full_name, role, phone, address, birth_date, 
      created_at, last_login, is_active
    `)
    .eq('id', payload.id)
    .single();

  console.log('Resultado Supabase - User:', user);
  console.log('Resultado Supabase - Error:', error);

  if (error || !user) {
    console.log('❌ Usuário não encontrado ou erro na consulta');
    if (error) console.log('Detalhes do erro:', error);
    return Response.json({ 
      data: null,
      mensagens: ['Usuário não encontrado'] 
    }, { status: 404 });
  }

  console.log('✅ Usuário encontrado, retornando sucesso');
  return Response.json({ 
    data: { user },
    mensagens: ['Dados do usuário recuperados com sucesso.']
  });
}