// Teste da regex de validação de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const testEmails = [
  'mane@gmail.com',
  'joao@gmail.com', 
  'admin@qatest.com',
  'teste@gmail.com',
  'test@domain.com',
  'user@sub.domain.com'
];

console.log('=== TESTE REGEX EMAIL ===\n');

testEmails.forEach(email => {
  const result = emailRegex.test(email.trim());
  console.log(`Email: ${email}`);
  console.log(`Regex: ${emailRegex}`);
  console.log(`Resultado: ${result ? '✅ VÁLIDO' : '❌ INVÁLIDO'}\n`);
});

console.log('=== FIM ===');
