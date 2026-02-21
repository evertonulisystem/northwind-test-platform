const bcrypt = require('bcryptjs');

// Dados do usuário de teste
const testUser = {
  email: 'admin@qatest.com',
  password: 'Teste@123',
  full_name: 'Admin QA Test',
  role: 'admin',
  is_active: true
};

// Hash da senha
const passwordHash = bcrypt.hashSync(testUser.password, 10);

console.log('=== USUÁRIO DE TESTE ===');
console.log('Email:', testUser.email);
console.log('Senha:', testUser.password);
console.log('Hash:', passwordHash);
console.log('========================');

console.log('\n=== SQL PARA INSERIR ===');
console.log(`
INSERT INTO users (email, password_hash, full_name, role, is_active, created_at, updated_at) 
VALUES (
  '${testUser.email}',
  '${passwordHash}',
  '${testUser.full_name}',
  '${testUser.role}',
  ${testUser.is_active},
  NOW(),
  NOW()
);
`);
console.log('======================\n');
