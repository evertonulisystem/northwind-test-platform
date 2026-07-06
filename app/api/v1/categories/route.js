// app/api/v1/categories/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Lista categorias com paginação
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página (padrão: 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Quantidade de itens por página (padrão: 10, máximo: 100)
 *     responses:
 *       200:
 *         description: Lista de categorias com informações de paginação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     totalItems:
 *                       type: integer
 *                       example: 25
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPreviousPage:
 *                       type: boolean
 *                       example: false
 *                 mensagens:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["10 categorias carregadas com sucesso! (Página 1 de 3)"]
 *       400:
 *         description: Parâmetros de paginação inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
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

    // Extrair parâmetros de paginação da URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Validação dos parâmetros
    if (page < 1) {
      return NextResponse.json(
        { data: null, mensagens: ['Página deve ser maior que 0.'] }, 
        { status: 400 }
      );
    }
    
    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        { data: null, mensagens: ['Limite deve estar entre 1 e 1000.'] }, 
        { status: 400 }
      );
    }

    // Calcular offset
    const offset = (page - 1) * limit;

    // Buscar total de categorias
    const { count, error: countError } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true });

    if (countError) throw countError;

    let data = [];
    let error = null;

    if (count > 0) {
      // Buscar categorias com paginação
      const query = supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      // Só aplica range se o count for maior que 0 para evitar erros de range
      const { data: categoriesData, error: categoriesError } = await query.range(offset, offset + limit - 1);
      data = categoriesData;
      error = categoriesError;
    }

    if (error) throw error;

    // Calcular informações de paginação
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json(
      { 
        data: data || [],
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNextPage: hasNextPage,
          hasPreviousPage: hasPreviousPage
        },
        mensagens: [`${data?.length || 0} categorias carregadas com sucesso! (Página ${page} de ${totalPages})`]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erro no GET categories:', error);
    return NextResponse.json(
      { data: null, mensagens: ['Erro ao carregar categorias.', error.message] },
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
 *             $ref: '#/components/schemas/CategoryCreateRequest'
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *                 mensagens:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Categoria criada com sucesso!", "Verificado: Salvo no banco Supabase (seu-projeto.supabase.co)"]
 *       400:
 *         description: Dados inválidos, campos obrigatórios ausentes ou validações não atendidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               CamposObrigatorios:
 *                 summary: Campos obrigatórios não preenchidos
 *                 value:
 *                   data: null
 *                   mensagens: ["Nome e descrição são obrigatórios."]
 *               NomeInvalido:
 *                 summary: Nome da categoria inválido (tamanho)
 *                 value:
 *                   data: null
 *                   mensagens: ["Nome da categoria deve ter entre 3 e 100 caracteres."]
 *               DescricaoInvalida:
 *                 summary: Descrição muito longa
 *                 value:
 *                   data: null
 *                   mensagens: ["Descrição da categoria deve ter no máximo 500 caracteres."]
 *               NomeDuplicado:
 *                 summary: Nome da categoria já existe
 *                 value:
 *                   data: null
 *                   mensagens: ["Já existe uma categoria com este nome."]
 *       401:
 *         description: Não autorizado - token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               TokenAusente:
 *                 value:
 *                   data: null
 *                   mensagens: ["Token ausente"]
 *               TokenInvalido:
 *                 value:
 *                   data: null
 *                   mensagens: ["Token inválido"]
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

    if (description.trim().length > 200) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Descrição deve ter no máximo 200 caracteres.'] 
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ name, description, slug: name.toLowerCase().replace(/ /g, '-') })
      .select()
      .single();

    if (error) throw error;

    // Debug para o usuário verificar o projeto
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectHost = supabaseUrl ? new URL(supabaseUrl).host : 'desconhecido';

    return NextResponse.json(
      { 
        data, 
        mensagens: [
          'Categoria criada com sucesso!',
          `Verificado: Salvo no banco Supabase (${projectHost})`
        ] 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro no POST categories:', error);
    
    // Tratamento específico para constraint violations
    let errorMessage = 'Erro ao criar categoria.';
    
    if (error.message) {
      if (error.message.includes('categories_name_check')) {
        errorMessage = 'Nome da categoria deve ter entre 3 e 100 caracteres.';
      } else if (error.message.includes('categories_description_check')) {
        errorMessage = 'Descrição da categoria deve ter no máximo 500 caracteres.';
      } else if (error.message.includes('value too long for type character varying(100)')) {
        errorMessage = 'Nome da categoria deve ter no máximo 100 caracteres.';
      } else if (error.message.includes('value too long for type character varying(500)')) {
        errorMessage = 'Descrição da categoria deve ter no máximo 500 caracteres.';
      } else if (error.message.includes('violates check constraint')) {
        errorMessage = 'Dados inválidos. Verifique nome e descrição.';
      } else if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        if (error.message.includes('name')) {
          errorMessage = 'Já existe uma categoria com este nome.';
        } else {
          errorMessage = 'Categoria com dados duplicados.';
        }
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [errorMessage] 
      },
      { status: 400 }
    );
  }
}

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   patch:
 *     summary: Atualiza uma categoria existente
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *       404:
 *         description: Categoria não encontrada
 */
export async function PATCH(request, { params }) {
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

    // Para PATCH, pelo menos um campo deve ser fornecido
    if (!name && !description) {
      return NextResponse.json(
        { data: null, mensagens: ['Pelo menos um campo (name ou description) deve ser fornecido.'] },
        { status: 400 }
      );
    }

    // Obter ID da URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    // Verificar se categoria existe
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { data: null, mensagens: ['Categoria não encontrada.'] },
        { status: 404 }
      );
    }

    // Preparar dados de atualização
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    
    // Gerar slug apenas se o nome foi alterado
    if (name) {
      updateData.slug = name.toLowerCase().replace(/ /g, '-');
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { data, mensagens: ['Categoria atualizada com sucesso!'] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { data: null, mensagens: ['Erro ao atualizar categoria.'] },
      { status: 500 }
    );
  }
}
