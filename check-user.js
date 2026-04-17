// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser() {
  console.log('=== VERIFICANDO USUÁRIO NO SUPABASE ===');
  
  const userId = '9a98ee38-14dd-418f-b5ef-414c38abea03';
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.log('Erro na consulta:', error);
      return;
    }
    
    if (data) {
      console.log('USUÁRIO ENCONTRADO:', data);
    } else {
      console.log('USUÁRIO NÃO ENCONTRADO!');
      console.log('ID buscado:', userId);
    }
    
  } catch (err) {
    console.log('Erro geral:', err);
  }
}

checkUser();
