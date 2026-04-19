// app/api/v1/categories/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Lista todas as categorias
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { data: null, mensagens: ['Token ausente'] }, 
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.error) {
      const message = payload?.message || 'Token inválido';
      return NextResponse.json(
        { data: null, mensagens: [message] }, 
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(
      { data, mensagens: ['Categorias carregadas com sucesso!'] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { data: null, mensagens: ['Erro ao carregar categorias.'] },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Adiciona uma nova categoria
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoria criada
 */
export async function POST(request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { data: null, mensagens: ['Token ausente'] }, 
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.error) {
      return NextResponse.json(
        { data: null, mensagens: ['Token inválido'] }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || !description) {
      return NextResponse.json(
        { data: null, mensagens: ['Nome e descrição são obrigatórios.'] },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ name, description, slug: name.toLowerCase().replace(/ /g, '-') })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { data, mensagens: ['Categoria criada com sucesso!'] },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { data: null, mensagens: ['Erro ao criar categoria.'] },
      { status: 500 }
    );
  }
}
