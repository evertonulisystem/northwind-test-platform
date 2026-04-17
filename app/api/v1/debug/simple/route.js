import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function GET(request) {
  console.log('=== DEBUG SIMPLE ===');
  
  // Pega headers brutos
  const authHeader = request.headers.get('authorization');
  console.log('Auth header:', authHeader);
  
  // Pega todos os headers
  const allHeaders = {};
  request.headers.forEach((value, key) => {
    allHeaders[key] = value;
  });
  console.log('Todos headers:', allHeaders);
  
  return NextResponse.json({
    message: 'Debug simples',
    authHeader: authHeader,
    headers: allHeaders,
    timestamp: new Date().toISOString()
  });
}

// Handler OPTIONS para CORS
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}
