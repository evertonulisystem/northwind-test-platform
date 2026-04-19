// lib/jwt.js
import jwt from 'jsonwebtoken';

console.log('🔑 JWT_SECRET carregado:', process.env.JWT_SECRET ? 'SIM' : 'NÃO');
console.log('🔑 Usando biblioteca: jsonwebtoken');

/**
 * Gera token JWT com expiração de 7 dias
 * @param {Object} user - Dados do usuário
 * @returns {string} Token JWT
 */
export function generateToken(user) {
  console.log('🔐 Gerando token para usuário:', user.email);
  
  const now = Math.floor(Date.now() / 1000);
  const sevenDays = 7 * 24 * 60 * 60;
  
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role || 'user'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  const decoded = jwt.decode(token);
  console.log('✅ Token gerado (Válido por 7 dias). iat:', decoded.iat, 'exp:', decoded.exp);
  console.log('✅ Expiração em:', new Date(decoded.exp * 1000).toLocaleString());
  
  return token;
}

/**
 * Verifica e decodifica token JWT
 * @param {string} token - Token JWT
 * @returns {Object|null} Payload do token ou objeto de erro
 */
export function verifyToken(token) {
  const now = Math.floor(Date.now() / 1000);
  console.log('🔍 Verificando token em:', new Date().toLocaleString(), '(timestamp:', now, ')');
  console.log('🔑 JWT_SECRET existe:', process.env.JWT_SECRET ? 'SIM' : 'NÃO');
  
  try {
    // Adicionamos 60s de tolerância para evitar erros de sincronia de tempo
    const payload = jwt.verify(token, process.env.JWT_SECRET, { clockTolerance: 60 });
    console.log('✅ Token válido, usuário:', payload.email);
    return payload;
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error.message);
    
    // Obter data de expiração se disponível
    let expiresAt = null;
    let issuedAt = null;
    try {
      const decoded = jwt.decode(token);
      if (decoded) {
        if (decoded.exp) expiresAt = new Date(decoded.exp * 1000).toISOString();
        if (decoded.iat) issuedAt = new Date(decoded.iat * 1000).toISOString();
        console.log('📊 Token debug - iat:', decoded.iat, 'exp:', decoded.exp, 'now:', now);
        if (decoded.exp && decoded.exp < now) {
          console.log('⏰ Token está no passado por', now - decoded.exp, 'segundos');
        }
      }
    } catch (decodeError) {
      console.error('⚠️ Erro ao decodificar token para debug:', decodeError.message);
    }

    if (error.name === 'TokenExpiredError') {
      return { 
        error: 'TokenExpiredError', 
        message: 'Token expirado. Por favor, faça login novamente.',
        expires_at: expiresAt,
        issued_at: issuedAt
      };
    }
    
    if (error.name === 'JsonWebTokenError') {
      return { 
        error: 'JsonWebTokenError', 
        message: 'Token inválido. Formato ou assinatura incorretos.',
        expires_at: expiresAt
      };
    }
    
    if (error.name === 'SyntaxError' || error.message.includes('Unexpected token')) {
      return { 
        error: 'SyntaxError', 
        message: 'Token malformado. Verifique o formato.',
        expires_at: expiresAt
      };
    }
    
    return { 
      error: 'UnknownError', 
      message: 'Token inválido. Erro desconhecido.',
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
  console.log('🔍 getTokenFromRequest - Iniciando');
  
  // 1. Tentar pegar do header Authorization
  const authHeader = request.headers.get('authorization');
  console.log('📋 Auth header completo:', authHeader);
  
  if (authHeader) {
    // Regex para pegar o token indiferente de maiúsculas/minúsculas no 'Bearer'
    // e flexível com espaços entre 'Bearer' e o token
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) {
      const token = match[1];
      console.log('✅ Token extraído do header Authorization:', token.substring(0, 20) + '...');
      return token;
    }
  }
  
  // 2. Tentar pegar do cookie
  const cookieToken = request.cookies?.get('auth-token')?.value;
  console.log('🍪 Token do cookie:', cookieToken ? cookieToken.substring(0, 20) + '...' : 'NÃO');
  
  if (cookieToken) {
    return cookieToken;
  }
  
  console.log('❌ Nenhum token encontrado');
  return null;
}