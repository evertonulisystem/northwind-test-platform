import { normalizeApiBody } from '@/lib/api-envelope';
// lib/auth.js
import { supabase } from './supabase';
import { verifyToken, getTokenFromRequest } from './jwt'; // 👈 Agora getTokenFromRequest existe!
import { cookies } from 'next/headers';

export async function verifyAdmin(request) {
  const token = request.cookies?.get('auth-token')?.value || cookies().get('auth-token')?.value;
  if (!token) return false;

  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

export async function getUserFromToken(request) {
  const token = request.cookies?.get('auth-token')?.value || cookies().get('auth-token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function authenticate(request) {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return { authenticated: false, user: null, error: 'No token provided' };
  }

  const decoded = await verifyToken(token);
  
  const validId = (typeof decoded?.id === 'string' && decoded.id.trim().length > 0)
    || (Number.isSafeInteger(decoded?.id) && decoded.id > 0);
  if (!decoded || decoded.error || !validId) {
    return { authenticated: false, user: null, error: 'Invalid token',
      message: decoded?.message || 'Token inválido', expires_at: decoded?.expires_at || null };
  }

  // Busca usuário no banco
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, full_name, role, is_active')
    .eq('id', decoded.id)
    .single();

  if (error || !user || !user.is_active) {
    return { authenticated: false, user: null, error: 'User not found or inactive' };
  }

  return { authenticated: true, user, error: null };
}

export function requireAuth(handler) {
  return async (request, context) => {
    const auth = await authenticate(request);
    
    if (!auth.authenticated) {
      return Response.json(
        normalizeApiBody({ error: auth.error || 'Unauthorized' }),
        { status: 401 }
      );
    }

    return handler(request, { ...context, user: auth.user });
  };
}

export function requireAdmin(handler) {
  return async (request, context) => {
    const auth = await authenticate(request);
    
    if (!auth.authenticated) {
      return Response.json(
        normalizeApiBody({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    if (auth.user.role !== 'admin') {
      return Response.json(
        normalizeApiBody({ error: 'Forbidden - Admin access required' }),
        { status: 403 }
      );
    }

    return handler(request, { ...context, user: auth.user });
  };
}
