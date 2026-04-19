// app/api/debug/token/route.js
import { getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

export async function GET(request) {
  console.log('=== DEBUG TOKEN ENDPOINT ===');
  
  // Pega todos os headers
  const allHeaders = Object.fromEntries(request.headers.entries());
  console.log('Todos os headers:', allHeaders);
  
  // Pega o auth header especificamente
  const authHeader = request.headers.get('authorization');
  console.log('Authorization header:', authHeader);
  
  // Pega cookies
  const cookies = request.cookies.getAll();
  console.log('Cookies:', cookies);
  
  // Tenta extrair o token
  const token = getTokenFromRequest(request);
  console.log('Token extraído:', token ? 'SIM' : 'NÃO');
  if (token) {
    console.log('Token (primeiros 20 chars):', token.substring(0, 20) + '...');
  }
  
  // Retornar com headers CORS
  return new Response(JSON.stringify({
    timestamp: new Date().toISOString(),
    path: '/api/v1/debug/token',
    headers: allHeaders,
    headerKeys: Object.keys(allHeaders),
    authHeader: authHeader,
    tokenExtracted: token ? 'SIM' : 'NÃO',
    tokenPreview: token ? token.substring(0, 50) + '...' : null
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, Accept',
    }
  });
}
