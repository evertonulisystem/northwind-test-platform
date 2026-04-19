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

console.log('🔑 JWT Utility carregado (jose)');

/**
 * Gera token JWT com expiração de 7 dias
 */
export async function generateToken(user) {
  console.log('🔐 Gerando token para:', user.email);
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
  const now = Math.floor(Date.now() / 1000);
  const secret = getSecret();
  
  if (!secret) {
    return { error: 'InternalError', message: 'Configuração do servidor incompleta.' };
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      clockTolerance: 300 // 5 minutos de tolerância para desvios de relógio
    });
    return payload;
  } catch (error) {
    console.error('❌ Erro JWT:', error.message);
    
    let expiresAt = null;
    try {
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
 * Extrai token do request
 */
export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1];
  }
  return request.cookies?.get('auth-token')?.value || null;
}