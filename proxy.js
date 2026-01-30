// proxy.js - Next.js 15+
import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/keepalive',
  '/api/docs', 
  '/api/swagger.json',
  '/api-docs',
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
    // Importação dinâmica funciona no Next.js 15
    const jwt = (await import('jsonwebtoken')).default;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('✅ Token válido:', payload.email);
    return NextResponse.next();
    
  } catch (error) {
    console.log('❌ Token inválido:', error.message);
    return NextResponse.json(
      { data: null, mensagens: ['Token inválido ou expirado'] },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};