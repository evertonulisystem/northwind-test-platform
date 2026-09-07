import { normalizeApiBody } from '@/lib/api-envelope';
// app/api/v1/categories/[id]/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

// === FUNÇÃO DE SLUG ===
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

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Busca uma categoria pelo ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 id: 1
 *                 name: Periféricos
 *                 description: Teclados, mouses e acessórios para PC
 *                 slug: perifericos
 *                 created_at: "2026-08-15T10:30:00.000Z"
 *                 updated_at: "2026-09-01T14:20:00.000Z"
 *               mensagens:
 *                 - "Categoria encontrada com sucesso."
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["ID da categoria inválido. Deve ser um número positivo."]
 *       401:
 *         description: Token ausente ou inválido
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
 *                   expires_at: "2026-09-05T10:00:00.000Z"
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["Categoria com ID 9999 não encontrada."]
 *       500:
 *         description: Erro interno ao buscar categoria
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["Erro interno ao buscar categoria."]
 */
export async function GET(request, { params }) {
  try {
    // Verificar autenticação
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        normalizeApiBody({
          data: null,
          mensagens: ['Token ausente'] 
        }),
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.error) {
      const message = payload?.message || 'Token inválido';
      return NextResponse.json(
        normalizeApiBody({
          data: null,
          mensagens: [message],
          expires_at: payload?.expires_at || null
        }),
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['ID da categoria inválido. Deve ser um número positivo.'] 
        }),
        { status: 400 }
      );
    }

    // Buscar categoria pelo ID
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', idNum)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar categoria:', error);
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['Erro interno ao buscar categoria.'] 
        }),
        { status: 500 }
      );
    }

    if (!category) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: [`Categoria com ID ${idNum} não encontrada.`] 
        }),
        { status: 404 }
      );
    }

    return NextResponse.json(normalizeApiBody({
      data: category,
      mensagens: ['Categoria encontrada com sucesso.']
    }));
  } catch (error) {
    return NextResponse.json(
      normalizeApiBody({
        data: null, 
        mensagens: ['Erro interno ao buscar categoria.'] 
      }),
      { status: 500 }
    );
  }
}

// === GET /categories/{id}/products ===
// (Documentação JSDoc movida para: app/api/v1/categories/[id]/products/route.js)
// Evita duplicação. Apenas a função GET_products é declarada aqui para referência interna.
export async function GET_products(request, { params }) {
  try {
    // Verificar autenticação
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        normalizeApiBody({
          data: null,
          mensagens: ['Token ausente'] 
        }),
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.error) {
      const message = payload?.message || 'Token inválido';
      return NextResponse.json(
        normalizeApiBody({
          data: null,
          mensagens: [message],
          expires_at: payload?.expires_at || null
        }),
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['ID da categoria inválido. Deve ser um número positivo.'] 
        }),
        { status: 400 }
      );
    }

    // Primeiro, verifica se a categoria existe
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', idNum)
      .maybeSingle();

    if (catError || !category) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: [`Categoria com ID ${idNum} não encontrada.`] 
        }),
        { status: 404 }
      );
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name')
      .eq('category_id', idNum)
      .order('name');

    if (error) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: [error.message] 
        }),
        { status: 500 }
      );
    }

    return NextResponse.json(normalizeApiBody({
      data: products || [],
      mensagens: products?.length > 0 
        ? [`${products.length} produtos encontrados para a categoria ${category.name}.`]
        : [`Nenhum produto cadastrado para a categoria ${category.name}.`]
    }));
  } catch (error) {
    return NextResponse.json(
      normalizeApiBody({
        data: null, 
        mensagens: ['Erro interno ao buscar produtos da categoria.'] 
      }),
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria existente (PUT completo)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 25
 *                 example: "Eletrônicos Premium"
 *               description:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 40
 *                 example: "Produtos de tecnologia de alta qualidade"
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 id: 2
 *                 name: Eletrônicos Premium
 *                 description: Produtos de tecnologia de alta qualidade
 *                 slug: eletronicos-premium
 *                 created_at: "2026-08-10T09:00:00.000Z"
 *                 updated_at: "2026-09-06T12:20:00.000Z"
 *               mensagens:
 *                 - "Categoria atualizada com sucesso!"
 *       400:
 *         description: "Dados inválidos (ID, JSON, campos obrigatórios ou tamanhos)"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               IdInvalido:
 *                 summary: ID não é um número inteiro positivo
 *                 value:
 *                   data: null
 *                   mensagens: ["ID da categoria inválido. Deve ser um número positivo."]
 *               JsonInvalido:
 *                 summary: Corpo da requisição não é um JSON válido
 *                 value:
 *                   data: null
 *                   mensagens: ["Dados inválidos. Verifique se todos os campos foram preenchidos corretamente."]
 *               SemDados:
 *                 summary: Corpo da requisição vazio
 *                 value:
 *                   data: null
 *                   mensagens: ["Nenhum dado informado. Preencha os campos da categoria."]
 *               NomeObrigatorio:
 *                 summary: Campo name não informado ou vazio
 *                 value:
 *                   data: null
 *                   mensagens: ["Nome da categoria é obrigatório."]
 *               DescricaoObrigatoria:
 *                 summary: Campo description não informado ou vazio
 *                 value:
 *                   data: null
 *                   mensagens: ["Descrição da categoria é obrigatória."]
 *               NomeMuitoLongo:
 *                 summary: Nome com mais de 25 caracteres
 *                 value:
 *                   data: null
 *                   mensagens: ["Nome da categoria deve ter no máximo 25 caracteres."]
 *               DescricaoMuitoCurta:
 *                 summary: Descrição com menos de 6 caracteres
 *                 value:
 *                   data: null
 *                   mensagens: ["Descrição deve ter no mínimo 6 caracteres."]
 *               DescricaoMuitoLonga:
 *                 summary: Descrição com mais de 40 caracteres
 *                 value:
 *                   data: null
 *                   mensagens: ["Descrição deve ter no máximo 40 caracteres."]
 *       401:
 *         description: Token ausente ou inválido
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
 *                   expires_at: "2026-09-05T10:00:00.000Z"
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["Categoria com ID 9999 não encontrada."]
 *       409:
 *         description: Categoria duplicada - nome já existe
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["Já existe uma categoria com este nome."]
 *       500:
 *         description: Erro interno ao atualizar
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["timeout exceeded"]
 */
export async function PUT(request, { params }) {
  try {
    // Verificar autenticação
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        normalizeApiBody({
          data: null,
          mensagens: ['Token ausente'] 
        }),
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.error) {
      const message = payload?.message || 'Token inválido';
      return NextResponse.json(
        normalizeApiBody({
          data: null,
          mensagens: [message],
          expires_at: payload?.expires_at || null
        }),
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['ID da categoria inválido. Deve ser um número positivo.'] 
        }),
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.'] 
        }),
        { status: 400 }
      );
    }

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['Nenhum dado informado. Preencha os campos da categoria.'] 
        }),
        { status: 400 }
      );
    }

    // Validação de campos obrigatórios
    const { name, description } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['Nome da categoria é obrigatório.'] 
        }),
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['Descrição da categoria é obrigatória.'] 
        }),
        { status: 400 }
      );
    }

    // Validação de tamanho
    if (name.trim().length > 25) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['Nome da categoria deve ter no máximo 25 caracteres.'] 
        }),
        { status: 400 }
      );
    }

    if (description.trim().length < 6) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['Descrição deve ter no mínimo 6 caracteres.'] 
        }),
        { status: 400 }
      );
    }

    if (description.trim().length > 40) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['Descrição deve ter no máximo 40 caracteres.'] 
        }),
        { status: 400 }
      );
    }

    // VERIFICA SE EXISTE
    const { data: existing, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', idNum)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existing) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: [`Categoria com ID ${idNum} não encontrada.`] 
        }),
        { status: 404 }
      );
    }

    // VERIFICA DUPLICIDADE (nome) - exceto a si mesma
    const { data: duplicate } = await supabase
      .from('categories')
      .select('id')
      .eq('name', name.trim())
      .neq('id', idNum)
      .maybeSingle();

    if (duplicate) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['Já existe uma categoria com este nome.'] 
        }),
        { status: 409 }
      );
    }

    // ATUALIZA
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: name.trim(),
        description: description.trim()
      })
      .eq('id', idNum)
      .select()
      .maybeSingle();

    if (error) {
      if (error.message.includes('null value in column')) {
        return NextResponse.json(
          normalizeApiBody({
            data: null, 
            mensagens: ['Campos obrigatórios não foram preenchidos.'] 
          }),
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      normalizeApiBody({
        data, 
        mensagens: ['Categoria atualizada com sucesso!'] 
      }),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      normalizeApiBody({
        data: null, 
        mensagens: [error.message || 'Erro ao atualizar categoria.'] 
      }),
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Exclui uma categoria
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Categoria excluída com sucesso
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["Categoria excluída com sucesso!"]
 *       400:
 *         description: "ID inválido ou categoria em uso por produtos"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               IdInvalido:
 *                 summary: ID não é um número inteiro positivo
 *                 value:
 *                   data: null
 *                   mensagens: ["ID da categoria inválido. Deve ser um número positivo."]
 *               EmUso:
 *                 summary: Categoria vinculada a produtos (não pode excluir)
 *                 value:
 *                   data: null
 *                   mensagens: ["Não é possível excluir. Esta categoria está sendo usada por produtos."]
 *       401:
 *         description: Token ausente ou inválido
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
 *                   expires_at: "2026-09-05T10:00:00.000Z"
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["Categoria com ID 9999 não encontrada."]
 *       500:
 *         description: "Erro interno (incluindo violação de FK)"
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["Não é possível excluir esta categoria pois existem produtos vinculados a ela."]
 */
/**
 * @swagger
 * /api/v1/categories/{id}:
 *   patch:
 *     summary: Atualiza parcialmente uma categoria (PATCH - arquivo [id]/route.js)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 4
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 25
 *                 example: "Móveis e Decoração"
 *               description:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 200
 *                 example: "Móveis para casa, escritório e decoração em geral"
 *     responses:
 *       200:
 *         description: Categoria atualizada parcialmente com sucesso
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 id: 4
 *                 name: Móveis e Decoração
 *                 description: Móveis para casa, escritório e decoração em geral
 *                 slug: moveis-e-decoracao
 *                 created_at: "2026-08-20T08:00:00.000Z"
 *                 updated_at: "2026-09-06T12:30:00.000Z"
 *               mensagens:
 *                 - "Categoria atualizada parcialmente com sucesso!"
 *       400:
 *         description: "Dados inválidos (ID, JSON, campos vazios ou tamanhos)"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               IdInvalido:
 *                 summary: ID não é um número inteiro positivo
 *                 value:
 *                   data: null
 *                   mensagens: ["ID da categoria inválido. Deve ser um número positivo."]
 *               JsonInvalido:
 *                 summary: Corpo da requisição não é um JSON válido
 *                 value:
 *                   data: null
 *                   mensagens: ["Dados inválidos. Verifique se todos os campos foram preenchidos corretamente."]
 *               SemDados:
 *                 summary: Corpo da requisição vazio
 *                 value:
 *                   data: null
 *                   mensagens: ["Nenhum dado informado. Envie pelo menos um campo para atualizar."]
 *               NomeVazio:
 *                 summary: Nome enviado mas vazio
 *                 value:
 *                   data: null
 *                   mensagens: ["Nome da categoria não pode ser vazio."]
 *               NomeMuitoLongo:
 *                 summary: Nome com mais de 25 caracteres
 *                 value:
 *                   data: null
 *                   mensagens: ["Nome da categoria deve ter no máximo 25 caracteres."]
 *               DescricaoVazia:
 *                 summary: Descrição enviada mas vazia
 *                 value:
 *                   data: null
 *                   mensagens: ["Descrição da categoria não pode ser vazia."]
 *               DescricaoMuitoCurta:
 *                 summary: Descrição com menos de 6 caracteres
 *                 value:
 *                   data: null
 *                   mensagens: ["Descrição deve ter no mínimo 6 caracteres."]
 *               DescricaoMuitoLonga:
 *                 summary: Descrição com mais de 200 caracteres
 *                 value:
 *                   data: null
 *                   mensagens: ["Descrição deve ter no máximo 200 caracteres."]
 *       401:
 *         description: Token ausente ou inválido
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
 *                   expires_at: "2026-09-05T10:00:00.000Z"
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["Categoria com ID 9999 não encontrada."]
 *       409:
 *         description: Categoria duplicada - nome já existe
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["Já existe uma categoria com este nome."]
 *       500:
 *         description: Erro interno ao atualizar
 *         content:
 *           application/json:
 *             example:
 *               data: null
 *               mensagens: ["connection refused"]
 */
export async function PATCH(request, { params }) {
  try {
    // Verificar autenticação
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        normalizeApiBody({
          data: null,
          mensagens: ['Token ausente'] 
        }),
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.error) {
      const message = payload?.message || 'Token inválido';
      return NextResponse.json(
        normalizeApiBody({
          data: null,
          mensagens: [message],
          expires_at: payload?.expires_at || null
        }),
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['ID da categoria inválido. Deve ser um número positivo.'] 
        }),
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.'] 
        }),
        { status: 400 }
      );
    }

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['Nenhum dado informado. Envie pelo menos um campo para atualizar.'] 
        }),
        { status: 400 }
      );
    }

    // VERIFICA SE EXISTE
    const { data: existing, error: checkError } = await supabase
      .from('categories')
      .select('id, name, description')
      .eq('id', idNum)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existing) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: [`Categoria com ID ${idNum} não encontrada.`] 
        }),
        { status: 404 }
      );
    }

    console.log('🐛 DEBUG PATCH /api/categories/[id]');
    console.log('Categoria existente:', existing);
    console.log('Dados recebidos:', body);

    // Validação de campos (apenas os enviados)
    const { name, description } = body;
    const updateData = {};

    // Valida name se enviado
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return NextResponse.json(
          normalizeApiBody({
            data: null, 
            mensagens: ['Nome da categoria não pode ser vazio.'] 
          }),
          { status: 400 }
        );
      }

      if (name.trim().length > 25) {
        return NextResponse.json(
          normalizeApiBody({
            data: null, 
            mensagens: ['Nome da categoria deve ter no máximo 25 caracteres.'] 
          }),
          { status: 400 }
        );
      }

      // VERIFICA DUPLICIDADE (nome) - apenas se for diferente do atual
      if (name.trim() !== existing.name) {
        const { data: duplicate } = await supabase
          .from('categories')
          .select('id')
          .eq('name', name.trim())
          .neq('id', idNum)
          .maybeSingle();

        if (duplicate) {
          return NextResponse.json(
            normalizeApiBody({
              data: null, 
              mensagens: ['Já existe uma categoria com este nome.'] 
            }),
            { status: 409 }
          );
        }
      }

      updateData.name = name.trim();
      updateData.slug = generateSlug(name.trim());
    }

    // Valida description se enviado
    if (description !== undefined) {
      if (!description || !description.trim()) {
        return NextResponse.json(
          normalizeApiBody({
            data: null, 
            mensagens: ['Descrição da categoria não pode ser vazia.'] 
          }),
          { status: 400 }
        );
      }

      if (description.trim().length < 6) {
        return NextResponse.json(
          normalizeApiBody({
            data: null, 
            mensagens: ['Descrição deve ter no mínimo 6 caracteres.'] 
          }),
          { status: 400 }
        );
      }

      if (description.trim().length > 200) {
        return NextResponse.json(
          normalizeApiBody({
            data: null, 
            mensagens: ['Descrição deve ter no máximo 200 caracteres.'] 
          }),
          { status: 400 }
        );
      }

      updateData.description = description.trim();
    }

    // ATUALIZA APENAS OS CAMPOS ENVIADOS
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', idNum)
      .select()
      .maybeSingle();

    if (error) {
      console.log('❌ Erro Supabase PATCH:', error);
      throw error;
    }

    console.log('✅ Categoria atualizada com PATCH:', data);

    return NextResponse.json(
      normalizeApiBody({
        data, 
        mensagens: ['Categoria atualizada parcialmente com sucesso!'] 
      }),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      normalizeApiBody({
        data: null, 
        mensagens: [error.message || 'Erro ao atualizar categoria.'] 
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Verificar autenticação
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        normalizeApiBody({
          data: null,
          mensagens: ['Token ausente'] 
        }),
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.error) {
      const message = payload?.message || 'Token inválido';
      return NextResponse.json(
        normalizeApiBody({
          data: null,
          mensagens: [message],
          expires_at: payload?.expires_at || null
        }),
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['ID da categoria inválido. Deve ser um número positivo.'] 
        }),
        { status: 400 }
      );
    }

    // VERIFICA SE EXISTE
    const { data: existing, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', idNum)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existing) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: [`Categoria com ID ${idNum} não encontrada.`] 
        }),
        { status: 404 }
      );
    }

    // VERIFICA SE ESTÁ EM USO
    const { data: productsUsing, error: checkUsageError } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', idNum)
      .limit(1);

    if (checkUsageError) throw checkUsageError;

    if (productsUsing && productsUsing.length > 0) {
      return NextResponse.json(
        normalizeApiBody({
          data: null, 
          mensagens: ['Não é possível excluir. Esta categoria está sendo usada por produtos.'] 
        }),
        { status: 400 }
      );
    }

    // DELETA
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', idNum);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      normalizeApiBody({
        data: null, 
        mensagens: ['Categoria excluída com sucesso!'] 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no DELETE categories:', error);
    
    // Tratamento específico para constraint violations
    let errorMessage = 'Erro ao excluir categoria.';
    
    if (error.message) {
      if (error.message.includes('violates foreign key constraint')) {
        if (error.message.includes('products')) {
          errorMessage = 'Não é possível excluir esta categoria pois existem produtos vinculados a ela.';
        } else {
          errorMessage = 'Não é possível excluir esta categoria pois existem dados vinculados a ela.';
        }
      } else if (error.message.includes('is still referenced')) {
        errorMessage = 'Não é possível excluir esta categoria pois existem produtos vinculados a ela.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      normalizeApiBody({
        data: null, 
        mensagens: [errorMessage] 
      }),
      { status: 500 }
    );
  }
}