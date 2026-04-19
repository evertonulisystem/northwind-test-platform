// lib/jwt.js
import { SignJWT, jwtVerify, decodeJwt } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const secret = new TextEncoder().encode(JWT_SECRET);

console.log('🔑 JWT_SECRET carregado:', JWT_SECRET ? 'SIM' : 'NÃO');
console.log('🔑 Usando biblioteca: jose');

/**
 * Gera token JWT com expiração de 7 dias
 * @param {Object} user - Dados do usuário
 * @returns {Promise<string>} Token JWT
 */
export async function generateToken(user) {
  console.log('🔐 Gerando token para usuário:', user.email);
  
  const token = await new SignJWT({ 
      id: user.id, 
      email: user.email, 
      role: user.role || 'user'
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  
  const decoded = decodeJwt(token);
  console.log('✅ Token gerado (Válido por 7 dias). iat:', decoded.iat, 'exp:', decoded.exp);
  
  return token;
}

/**
 * Verifica e decodifica token JWT
 * @param {string} token - Token JWT
 * @returns {Promise<Object|null>} Payload do token ou objeto de erro
 */
export async function verifyToken(token) {
  const now = Math.floor(Date.now() / 1000);
  console.log('🔍 Verificando token em:', new Date().toLocaleString(), '(timestamp:', now, ')');
  
  if (!JWT_SECRET) {
      console.error('❌ ERRO CRÍTICO: JWT_SECRET não está definido!');
      return { error: 'InternalError', message: 'Configuração do servidor incompleta.' };
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      clockTolerance: 60 // 60 segundos de tolerância
    });
    console.log('✅ Token válido, usuário:', payload.email);
    return payload;
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error.message);
    
    // Obter dados para debug
    let expiresAt = null;
    let issuedAt = null;
    try {
      const decoded = decodeJwt(token);
      if (decoded) {
        if (decoded.exp) expiresAt = new Date(decoded.exp * 1000).toISOString();
        if (decoded.iat) issuedAt = new Date(decoded.iat * 1000).toISOString();
        if (decoded.exp && decoded.exp < now) {
          console.log('⏰ Token está no passado por', now - decoded.exp, 'segundos');
        }
      }
    } catch (decodeError) {
      console.error('⚠️ Erro ao decodificar token para debug:', decodeError.message);
    }

    if (error.code === 'ERR_JWT_EXPIRED') {
      return { 
        error: 'TokenExpiredError', 
        message: 'Token expirado. Por favor, faça login novamente.',
        expires_at: expiresAt,
        issued_at: issuedAt
      };
    }
    
    return { 
      error: error.code || 'InvalidTokenError', 
      message: 'Token inválido ou malformado.',
      expires_at: expiresAt
    };
  }
}

/**
 * Extrai token do request (Header Authorization ou Cookie)
 * @param {Request} request - Request do Next.js
 * @returns {string|null} Token ou null
 */
export function getTokenFromRequest(request) {
  // 1. Tentar pegar do header Authorization
  const authHeader = request.headers.get('authorization');
  
  if (authHeader) {
    // Regex robusto para pegar o token indiferente de maiúsculas/minúsculas no 'Bearer'
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) {
      return match[1];
    }
  }
  
  // 2. Tentar pegar do cookie
  const cookieToken = request.cookies?.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  return null;
}