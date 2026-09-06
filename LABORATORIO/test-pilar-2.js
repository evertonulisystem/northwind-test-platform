// LABORATORIO/test-pilar-2.js
const API_BASE = 'http://localhost:3000/api/v1';

async function testFlow() {
  console.log('🚀 Iniciando Teste do Pilar 2...');

  try {
    // 1. Login
    console.log('\n🔐 1. Realizando Login...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@qatest.com',
        password: 'Teste@123'
      })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error('Falha no login');
    const token = loginData.data.token;
    console.log('✅ Token obtido.');

    // 2. Buscar um produto para testar
    console.log('\n📦 2. Buscando produto para teste...');
    const prodRes = await fetch(`${API_BASE}/products?limit=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const prodData = await prodRes.json();
    const product = prodData.data[0];
    if (!product) throw new Error('Nenhum produto encontrado no banco');
    console.log(`✅ Usando produto: ${product.name} (ID: ${product.id})`);

    // 3. Adicionar ao Carrinho
    console.log('\n🛒 3. Adicionando ao carrinho...');
    const cartPostRes = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: product.id,
        quantity: 2
      })
    });
    const cartPostData = await cartPostRes.json();
    console.log('✅ Carrinho atualizado:', cartPostData.mensagens[0]);

    // 4. Listar Carrinho
    console.log('\n📋 4. Listando carrinho...');
    const cartGetRes = await fetch(`${API_BASE}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const cartGetData = await cartGetRes.json();
    console.log(`✅ Itens no carrinho: ${cartGetData.data.length}`);

    // 5. Checkout
    console.log('\n💳 5. Realizando Checkout...');
    const checkoutRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        notes: 'Teste automatizado do Pilar 2',
        shipper_id: 1
      })
    });
    const checkoutData = await checkoutRes.json();
    if (!checkoutRes.ok) throw new Error(`Falha no checkout: ${checkoutData.mensagens.join(' | ')}`);
    console.log('✅ Pedido criado:', checkoutData.data.order_number);

    // 6. Listar Pedidos
    console.log('\n📜 6. Verificando histórico de pedidos...');
    const orderRes = await fetch(`${API_BASE}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const orderData = await orderRes.json();
    console.log(`✅ Total de pedidos: ${orderData.data.length}`);
    console.log('✅ Pedido mais recente:', orderData.data[0].order_number);

    console.log('\n✨ TESTE CONCLUÍDO COM SUCESSO! ✨');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
  }
}

testFlow();
