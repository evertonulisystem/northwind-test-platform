// middleware.js
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Lista de rotas públicas (não exigem autenticação)
const PUBLIC_ROUTES = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/keepalive',
  '/api/docs', 
  '/api/swagger.json',
  '/api-docs',   // Se tiver Swagger UI
];

/**
 * Middleware de autenticação para proteger rotas
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Verificar se é uma rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 2. Verificar se é uma rota de API (proteger só /api)
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 3. Verificar token JWT
  const authHeader = request.headers.get('authorization');
  
  console.log('🔍 Middleware - Auth Header:', authHeader); // 👈 DEBUG

  // 3.1. Token ausente // 4. Verificar se header existe e começa com "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
     console.log('❌ Middleware - Token ausente ou formato inválido');
    return NextResponse.json(
      { 
        data: null,
        mensagens: ['Token ausente. Faça login para acessar este recurso']
      },
      { status: 401 }
    );
  }

  // 3.2. Extrair e verificar token
  const token = authHeader.substring(7);

  console.log('✅ Middleware - Token extraído:', token.substring(0, 20) + '...'); // 👈 DEBUG

  const payload = verifyToken(token);
  
  if (!payload) {
     console.log('❌ Middleware - Token inválido ou expirado');
    return NextResponse.json(
      { 
        data: null,
        mensagens: ['Token inválido ou expirado. Faça login novamente']
      },
      { status: 401 }
    );
  }

  // 4. Adicionar usuário ao request (para uso nos handlers)
   console.log('✅ Middleware - Token válido, usuário:', payload.email);
  request.user = payload;

  return NextResponse.next();
}

// Configuração do middleware
export const config = {
  matcher: '/:path*',
};