// proxy.js - Next.js 15+
import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/keepalive',
  '/api/docs', 
  '/api/swagger.json',
  '/api-docs',
  '/api/debug',
];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  
  // Rota pública? Libera
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Não é API? Libera
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Verificar token
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { data: null, mensagens: ['Token ausente'] },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);

  try {
    // Importação dinâmica da nossa lib de jwt para garantir consistência
    const { verifyToken } = await import('./lib/jwt.js');
    const payload = verifyToken(token);
    
    if (payload && payload.error) {
      console.log('❌ Token inválido via Proxy:', payload.message);
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [payload.message],
          expires_at: payload.expires_at || null
        },
        { status: 401 }
      );
    }
    
    console.log('✅ Token válido via Proxy:', payload.email);
    return NextResponse.next();
    
  } catch (error) {
    console.log('❌ Erro crítico no Proxy Auth:', error.message);
    return NextResponse.json(
      { data: null, mensagens: ['Erro na validação do token'] },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};