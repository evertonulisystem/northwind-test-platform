
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = 'http://localhost:3000';

async function testAuthVariations() {
  console.log('--- Testing Hotfix: Auth Variations ---');
  
  if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET not found in .env.local');
    return;
  }

  const token = jwt.sign(
    { id: 'hotfix-tester', email: 'hotfix@example.com', role: 'admin' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const variations = [
    { name: 'Standard "Bearer "', header: `Bearer ${token}` },
    { name: 'Lowercase "bearer "', header: `bearer ${token}` },
    { name: 'MixedCase "BeArEr "', header: `BeArEr ${token}` },
    { name: 'Multiple spaces "Bearer    "', header: `Bearer    ${token}` }
  ];

  for (const variation of variations) {
    console.log(`\nTesting: ${variation.name}`);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/categories`, {
        method: 'GET',
        headers: {
          'Authorization': variation.header
        }
      });

      console.log(`Status: ${res.status}`);
      if (res.ok) {
        console.log('✅ Success!');
      } else {
        const data = await res.json();
        console.log('❌ Failed:', JSON.stringify(data.mensagens));
      }
    } catch (error) {
      console.error('❌ Connection error. Is the server running?');
      break;
    }
  }
}

testAuthVariations();
