// app/api/swagger.json/route.js
import { NextResponse } from 'next/server';
import { swaggerSpec } from '../../../../lib/swagger';

export async function GET() {
  // Forçar rebuild e evitar cache
  const response = NextResponse.json(swaggerSpec, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    }
  });

  return response;
}