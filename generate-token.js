// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { generateToken } = require('./lib/jwt.js');

// Gerar token para admin@qatest.com
const userData = {
  id: '9a98ee38-14dd-418f-b5ef-414c38abea03',
  email: 'admin@qatest.com',
  role: 'admin'
};

const token = generateToken(userData);
console.log('🔑 NOVO TOKEN GERADO:');
console.log(token);
console.log('\n📋 Copie e cole no Swagger:');
console.log('Bearer ' + token);
