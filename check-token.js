// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { verifyToken } = require('./lib/jwt.js');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjlhOThlZTM4LTE0ZGQtNDE4Zi1iNWVmLTQxNGMzOGFiZWEwMyIsImVtYWlsIjoiYWRtaW5AcWF0ZXN0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NjM1NjMxMSwiZXhwIjoxNzc2OTYxMTExfQ.R9iuvZBPNweAHY9tvEqi_Fue8A-Rx_0ECwQqyulUujs';

console.log('=== VERIFICANDO TOKEN ===');
const payload = verifyToken(token);
console.log('Payload:', payload);
console.log('ID do usuário:', payload.id);
console.log('Email:', payload.email);
