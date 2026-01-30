// lib/jwt.js
import jwt from 'jsonwebtoken';

console.log('🔑 JWT_SECRET carregado:', process.env.JWT_SECRET ? 'SIM' : 'NÃO');
console.log('🔑 Usando biblioteca: jsonwebtoken');

/**
 * Gera token JWT com expiração de 1 dia
 * @param {Object} user - Dados do usuário
 * @returns {string} Token JWT
 */
export function generateToken(user) {
  console.log('🔐 Gerando token para usuário:', user.email);
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  
  console.log('✅ Token gerado com sucesso');
  return token;
}

/**
 * Verifica e decodifica token JWT
 * @param {string} token - Token JWT
 * @returns {Object|null} Payload do token ou null se inválido
 */
export function verifyToken(token) {
  console.log('🔍 Verificando token...');
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token válido, usuário:', payload.email);
    return payload;
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error.message);
    return null;
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
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 2. Tentar pegar do cookie
  const cookieToken = request.cookies?.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  return null;
}