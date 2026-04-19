// app/api/v1/categories/[id]/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Lista produtos de uma categoria
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de produtos da categoria
 */
export async function GET(request, { params }) {
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

    const payload = await verifyToken(token);
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

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['ID da categoria inválido. Deve ser um número positivo.'] 
        },
        { status: 400 }
      );
    }

    // Primeiro, verifica se a categoria existe
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', idNum)
      .single();

    if (catError || !category) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Categoria com ID ${idNum} não encontrada.`] 
        },
        { status: 404 }
      );
    }

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id, name, price, stock_quantity, sku,
        suppliers (company_name)
      `)
      .eq('category_id', idNum)
      .order('name');

    if (error) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [error.message] 
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      data: products || [],
      mensagens: products?.length > 0 
        ? [`${products.length} produtos encontrados para a categoria ${category.name}.`]
        : [`Nenhum produto cadastrado para a categoria ${category.name}.`]
    });
  } catch (error) {
    return NextResponse.json(
      { 
        data: null, 
        mensagens: ['Erro interno ao buscar produtos da categoria.'] 
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
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
 *       200:
 *         description: Categoria atualizada
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Categoria não encontrada
 *       409:
 *         description: Categoria duplicada
 */
export async function PUT(request, { params }) {
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

    const payload = await verifyToken(token);
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

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['ID da categoria inválido. Deve ser um número positivo.'] 
        },
        { status: 400 }
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
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Nome da categoria é obrigatório.'] 
        },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
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

    // VERIFICA SE EXISTE
    const { data: existing, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', idNum)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existing) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Categoria com ID ${idNum} não encontrada.`] 
        },
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
        { 
          data: null, 
          mensagens: ['Já existe uma categoria com este nome.'] 
        },
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
      .single();

    if (error) {
      if (error.message.includes('null value in column')) {
        return NextResponse.json(
          { 
            data: null, 
            mensagens: ['Campos obrigatórios não foram preenchidos.'] 
          },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { 
        data, 
        mensagens: ['Categoria atualizada com sucesso!'] 
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [error.message || 'Erro ao atualizar categoria.'] 
      },
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
 *     responses:
 *       200:
 *         description: Categoria excluída
 *       404:
 *         description: Categoria não encontrada
 *       400:
 *         description: Categoria em uso
 */
/**
 * @swagger
 * /api/v1/categories/{id}:
 *   patch:
 *     summary: Atualiza parcialmente uma categoria
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
 *                 maxLength: 25
 *                 example: "Eletrônicos"
 *               description:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 40
 *                 example: "Produtos eletrônicos variados"
 *     responses:
 *       200:
 *         description: Categoria atualizada parcialmente
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Categoria não encontrada
 *       409:
 *         description: Categoria duplicada
 */
export async function PATCH(request, { params }) {
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

    const payload = await verifyToken(token);
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

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['ID da categoria inválido. Deve ser um número positivo.'] 
        },
        { status: 400 }
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
          mensagens: ['Nenhum dado informado. Envie pelo menos um campo para atualizar.'] 
        },
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
        { 
          data: null, 
          mensagens: [`Categoria com ID ${idNum} não encontrada.`] 
        },
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
          { 
            data: null, 
            mensagens: ['Nome da categoria não pode ser vazio.'] 
          },
          { status: 400 }
        );
      }

      if (name.trim().length > 25) {
        return NextResponse.json(
          { 
            data: null, 
            mensagens: ['Nome da categoria deve ter no máximo 25 caracteres.'] 
          },
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
            { 
              data: null, 
              mensagens: ['Já existe uma categoria com este nome.'] 
            },
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
          { 
            data: null, 
            mensagens: ['Descrição da categoria não pode ser vazia.'] 
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

      updateData.description = description.trim();
    }

    // ATUALIZA APENAS OS CAMPOS ENVIADOS
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', idNum)
      .select()
      .single();

    if (error) {
      console.log('❌ Erro Supabase PATCH:', error);
      throw error;
    }

    console.log('✅ Categoria atualizada com PATCH:', data);

    return NextResponse.json(
      { 
        data, 
        mensagens: ['Categoria atualizada parcialmente com sucesso!'] 
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [error.message || 'Erro ao atualizar categoria.'] 
      },
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
        { 
          data: null,
          mensagens: ['Token ausente'] 
        }, 
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
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

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['ID da categoria inválido. Deve ser um número positivo.'] 
        },
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
        { 
          data: null, 
          mensagens: [`Categoria com ID ${idNum} não encontrada.`] 
        },
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
        { 
          data: null, 
          mensagens: ['Não é possível excluir. Esta categoria está sendo usada por produtos.'] 
        },
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
      { 
        data: null, 
        mensagens: ['Categoria excluída com sucesso!'] 
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [error.message || 'Erro ao excluir categoria.'] 
      },
      { status: 500 }
    );
  }
}