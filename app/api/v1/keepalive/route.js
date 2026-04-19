export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'



/**
 * @swagger
 * /api/v1/keepalive:
 *   get:
 *     summary: Mantém o projeto Supabase ativo (anti-pause)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Supabase ativo
 */
export async function GET() {
  try {
    const { error } = await supabase
      .from('keepalive')
      .insert({
        last_ping: new Date().toISOString()
      })
    if (error) throw error

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase ativo'
    })

  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
