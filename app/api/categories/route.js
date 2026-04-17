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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
export async function GET(request) {
  console.log('=== DEBUG CATEGORIES GET ===');
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Verificar autenticação
    const token = getTokenFromRequest(request);
    console.log('Token categories:', token ? 'RECEBIDO' : 'AUSENTE');
    
    if (!token) {
      console.log('Retornando Token ausente - Categories');
      return NextResponse.json(
        { 
          data: null,
          mensagens: ['Token ausente'] 
        }, 
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.error) {
      const message = payload?.message || 'Token inválido';
      return NextResponse.json(
        { 
          data: null,
          mensagens: [message],
          expires_at: payload?.expires_at || null
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
      { 
        data, 
        mensagens: ['Categorias carregadas com sucesso!'] 
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        data: null, 
        mensagens: ['Erro ao carregar categorias.'] 
      },
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
    if (!payload || payload.error) {
      const message = payload?.message || 'Token inválido';
      return NextResponse.json(
        { 
          data: null,
          mensagens: [message],
          expires_at: payload?.expires_at || null
        }, 
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.'] 
        },
        { status: 400 }
      );
    }

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Nenhum dado informado. Preencha os campos da categoria.'] 
        },
        { status: 400 }
      );
    }

    // Validação de campos obrigatórios
    const { name, description } = body;
    
    console.log('🐛 DEBUG POST /api/categories');
    console.log('Body recebido:', body);
    console.log('Name:', name, 'Type:', typeof name, 'Length:', name?.length);
    console.log('Description:', description, 'Type:', typeof description, 'Length:', description?.length);
    
    if (!name || !name.trim()) {
      console.log('❌ Name falhou na validação');
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Nome da categoria é obrigatório.'] 
        },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      console.log('❌ Description falhou na validação');
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Descrição da categoria é obrigatória.'] 
        },
        { status: 400 }
      );
    }

    // Validação de tamanho
    if (name.trim().length > 25) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Nome da categoria deve ter no máximo 25 caracteres.'] 
        },
        { status: 400 }
      );
    }

    if (description.trim().length < 6) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Descrição deve ter no mínimo 6 caracteres.'] 
        },
        { status: 400 }
      );
    }

    if (description.trim().length > 40) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Descrição deve ter no máximo 40 caracteres.'] 
        },
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
        { 
          data: null, 
          mensagens: ['Já existe uma categoria com este nome.'] 
        },
        { status: 409 }
      );
    }

    // Gerar slug automaticamente
    const slug = generateSlug(name.trim());

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        description: description.trim(),
        slug: slug
      })
      .select()
      .single();

    if (error) {
      console.log('❌ Erro Supabase:', error);
      throw error;
    }

    return NextResponse.json(
      { 
        data, 
        mensagens: ['Categoria criada com sucesso!'] 
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [error.message || 'Erro ao criar categoria.'] 
      },
      { status: 500 }
    );
  }
}

function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}
