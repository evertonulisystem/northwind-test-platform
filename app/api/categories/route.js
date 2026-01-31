// app/api/categories/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lista todas as categorias
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
export async function GET(request) {
  try {
    // Verificar autenticação
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { 
          data: null,
          mensagens: ['Token ausente'] 
        }, 
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { 
          data: null,
          mensagens: ['Token inválido'] 
        }, 
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(
      { data, message: 'Categorias carregadas com sucesso!' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { data: null, message: 'Erro ao carregar categorias' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Adiciona uma nova categoria
 *     tags: [Categories]
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
 *                 maxLength: 25
 *                 example: "Eletrônicos"
 *               description:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 40
 *                 example: "Produtos eletrônicos variados"
 *     responses:
 *       201:
 *         description: Categoria criada
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Categoria duplicada
 */
export async function POST(request) {
  try {
    // Verificar autenticação
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { 
          data: null,
          mensagens: ['Token ausente'] 
        }, 
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { 
          data: null,
          mensagens: ['Token inválido'] 
        }, 
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { data: null, message: 'Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.' },
        { status: 400 }
      );
    }

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { data: null, message: 'Nenhum dado informado. Preencha os campos da categoria.' },
        { status: 400 }
      );
    }

    // Validação de campos obrigatórios
    const { name, description } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { data: null, message: 'Nome da categoria é obrigatório.' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { data: null, message: 'Descrição da categoria é obrigatória.' },
        { status: 400 }
      );
    }

    // Validação de tamanho
    if (name.trim().length > 25) {
      return NextResponse.json(
        { data: null, message: 'Nome da categoria deve ter no máximo 25 caracteres.' },
        { status: 400 }
      );
    }

    if (description.trim().length < 6) {
      return NextResponse.json(
        { data: null, message: 'Descrição deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    if (description.trim().length > 40) {
      return NextResponse.json(
        { data: null, message: 'Descrição deve ter no máximo 40 caracteres.' },
        { status: 400 }
      );
    }

    // VERIFICA DUPLICIDADE (nome)
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('name', name.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { data: null, message: 'Já existe uma categoria com este nome.' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        description: description.trim()
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('null value in column')) {
        return NextResponse.json(
          { data: null, message: 'Campos obrigatórios não foram preenchidos.' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { data, message: 'Categoria criada com sucesso!' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { data: null, message: error.message || 'Erro ao criar categoria' },
      { status: 500 }
    );
  }
}