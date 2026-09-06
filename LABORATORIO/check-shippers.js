const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env or .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Credenciais do Supabase não encontradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkShippers() {
  console.log('🔍 Verificando transportadoras...');
  const { data, error } = await supabase.from('shippers').select('*');
  
  if (error) {
    console.error('❌ Erro ao buscar transportadoras:', error);
  } else {
    console.log('✅ Transportadoras encontradas:', data);
  }
}

checkShippers();
