// debug-jwt.js - Execute este arquivo na raiz do seu projeto Next.js
// node debug-jwt.js

const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(60));
console.log('🔍 DEBUG - Sistema JWT');
console.log('='.repeat(60));

// 1. Verificar JWT_SECRET
console.log('\n1️⃣ Verificando JWT_SECRET:');
console.log('   JWT_SECRET existe?', process.env.JWT_SECRET ? '✅ SIM' : '❌ NÃO');
console.log('   JWT_SECRET valor:', process.env.JWT_SECRET || '(VAZIO)');
console.log('   JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);

// 2. Token do Postman
const tokenDoPostman = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgwMmVlOWE4LWY2ZGUtNDEyZS1iZWY4LTE1YTE1MzkxOTFhZiIsImVtYWlsIjoiYWw2dTZybjY2bzM2NjMyQHRlc3QuY29tIiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY5NzY5NzI1LCJleHAiOjE3Njk4NTYxMjV9.njjDEQ1Q3WP6DHKCr05dMGES41yZj8O03rVQtuQ82iU';

console.log('\n2️⃣ Decodificando token (sem verificar):');
const decoded = jwt.decode(tokenDoPostman);
console.log('   Payload:', JSON.stringify(decoded, null, 4));

// 3. Verificar expiração
const now = Math.floor(Date.now() / 1000);
console.log('\n3️⃣ Verificando expiração:');
console.log('   Timestamp atual:', now);
console.log('   Token expira em:', decoded.exp);
console.log('   Diferença:', decoded.exp - now, 'segundos');
console.log('   Status:', now > decoded.exp ? '❌ EXPIRADO' : '✅ VÁLIDO');

// 4. Tentar verificar com JWT_SECRET atual
console.log('\n4️⃣ Tentando verificar token com JWT_SECRET atual:');
try {
  const verified = jwt.verify(tokenDoPostman, process.env.JWT_SECRET);
  console.log('   ✅ Token VÁLIDO!');
  console.log('   Payload verificado:', JSON.stringify(verified, null, 4));
} catch (error) {
  console.log('   ❌ Token INVÁLIDO!');
  console.log('   Erro:', error.message);
  console.log('   Nome do erro:', error.name);
  
  if (error.name === 'JsonWebTokenError') {
    console.log('\n   ⚠️  PROBLEMA: A secret key usada para GERAR o token');
    console.log('       é DIFERENTE da secret key usada para VERIFICAR!');
    console.log('\n   💡 SOLUÇÃO:');
    console.log('       1. O token foi gerado com uma secret key');
    console.log('       2. Mas o middleware está usando outra secret key');
    console.log('       3. Você precisa usar a MESMA JWT_SECRET em ambos!');
  }
}

// 5. Gerar novo token com a secret atual
console.log('\n5️⃣ Gerando novo token com a JWT_SECRET atual:');
const novoToken = jwt.sign(
  { 
    id: decoded.id, 
    email: decoded.email, 
    role: decoded.role 
  },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);
console.log('   Token gerado:', novoToken);

// 6. Verificar o novo token
console.log('\n6️⃣ Verificando o novo token:');
try {
  const verified = jwt.verify(novoToken, process.env.JWT_SECRET);
  console.log('   ✅ Novo token VÁLIDO!');
  console.log('   Use este token no Postman!');
} catch (error) {
  console.log('   ❌ Novo token INVÁLIDO!');
  console.log('   Erro:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('🎯 DIAGNÓSTICO:');
console.log('='.repeat(60));

if (!process.env.JWT_SECRET) {
  console.log('❌ JWT_SECRET não está definido no .env.local');
  console.log('   Solução: Crie o arquivo .env.local com JWT_SECRET=sua_chave');
} else if (error && error.name === 'JsonWebTokenError') {
  console.log('❌ JWT_SECRET mudou desde que o token foi gerado');
  console.log('   Solução: Use o novo token gerado acima (item 5)');
  console.log('   OU: Reverta o JWT_SECRET para o valor original');
} else {
  console.log('✅ Tudo OK! Use o token gerado no item 5 no Postman');
}

console.log('='.repeat(60));