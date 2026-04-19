// lib/jwt.js
import { SignJWT, jwtVerify, decodeJwt } from 'jose';

// Helper para obter o segredo em runtime
const getSecret = () => {
  const secretStr = process.env.JWT_SECRET;
  if (!secretStr) {
    console.error('❌ ERRO CRÍTICO: JWT_SECRET não definido em process.env');
    return null;
  }
  return new TextEncoder().encode(secretStr);
};

console.log('🔑 JWT Utility carregado (jose - ultra-robust)');

/**
 * Gera token JWT com expiração de 7 dias
 */
export async function generateToken(user) {
  const secret = getSecret();
  if (!secret) throw new Error('JWT_SECRET missing');

  return await new SignJWT({ 
      id: user.id, 
      email: user.email, 
      role: user.role || 'user'
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

/**
 * Verifica e decodifica token JWT
 */
export async function verifyToken(token) {
  if (!token) return { error: 'MissingToken', message: 'Token não fornecido.' };
  
  const secret = getSecret();
  if (!secret) {
    return { error: 'InternalError', message: 'Configuração do servidor incompleta.' };
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      clockTolerance: 300 
    });
    return payload;
  } catch (error) {
    console.error('❌ Erro JWT:', error.message);
    
    let expiresAt = null;
    try {
      // Decode attempt for diagnostics
      const decoded = decodeJwt(token);
      if (decoded?.exp) expiresAt = new Date(decoded.exp * 1000).toISOString();
    } catch (e) {}

    return { 
      error: error.code || 'InvalidTokenError', 
      message: error.code === 'ERR_JWT_EXPIRED' ? 'Token expirado.' : 'Token inválido.',
      expires_at: expiresAt
    };
  }
}

/**
 * Extrai token do request - VERSÃO ULTRA-ROBUSTA
 */
export function getTokenFromRequest(request) {
  // 1. Tentar pegar do header Authorization
  const authHeader = request.headers.get('authorization');
  
  if (authHeader) {
    console.log('🔍 Header Authorization encontrado');
    
    // Tenta formato padrão: Bearer <token>
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) {
      return match[1].trim();
    }
    
    // FALLBACK: Se o header existe mas não tem 'Bearer', 
    // e parece um JWT (tem pelo menos um ponto), assume que é o token puro
    if (authHeader.includes('.') && authHeader.length > 20) {
      console.log('⚠️ Header encontrado sem prefixo Bearer, tentando usar valor puro');
      return authHeader.trim();
    }
  }
  
  // 2. Tentar pegar do cookie como último recurso
  return request.cookies?.get('auth-token')?.value || null;
}