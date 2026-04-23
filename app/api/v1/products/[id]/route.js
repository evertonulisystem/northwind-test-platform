// app/api/products/[id]/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

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

// === GET (BUSCAR POR ID) ===
/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Busca um produto pelo ID
 *     tags: [Products]
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
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
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
          mensagens: ['ID do produto inválido. Deve ser um número positivo.'] 
        },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id, name, price, stock_quantity, sku, category_id, supplier_id, slug,
        categories(name), suppliers(company_name)
      `)
      .eq('id', idNum)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Produto com ID ${idNum} não encontrado.`] 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      data: product,
      mensagens: ['Produto carregado com sucesso.']
    });
  } catch (error) {
    return NextResponse.json(
      { 
        data: null, 
        mensagens: ['Erro interno ao buscar produto.'] 
      },
      { status: 500 }
    );
  }
}

// === PUT (EDITAR) ===
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
    const body = await request.json();

    console.log('PUT /api/products/[id] - ID:', id);
    console.log('PUT /api/products/[id] - typeof id:', typeof id);
    console.log('Body recebido:', body);

    const idNum = parseInt(id, 10);
    console.log('ID convertido:', idNum, 'isNaN:', isNaN(idNum));
    
    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['ID do produto inválido. Deve ser um número positivo.'] 
        },
        { status: 400 }
      );
    }

    // 1. VALIDA SKU
    const sku = body.sku?.trim();
    if (!sku) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['SKU é obrigatório.'] 
        },
        { status: 400 }
      );
    }

    // 2. VERIFICA SKU DUPLICADO
    const { data: skuExists } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .neq('id', idNum)
      .maybeSingle();

    if (skuExists) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Já existe outro produto com esse SKU.'] 
        },
        { status: 409 }
      );
    }

    // 3. BUSCA PRODUTO ATUAL
    const { data: current, error: fetchError } = await supabase
      .from('products')
      .select('name, slug')
      .eq('id', idNum);

    if (fetchError) {
      console.error('Erro ao buscar produto:', fetchError);
      throw fetchError;
    }
    if (!current || current.length === 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Produto com ID ${idNum} não encontrado.`] 
        },
        { status: 404 }
      );
    }

    const currentProduct = current[0];
    console.log('Produto atual no banco:', currentProduct);

    // 4. DECIDE SLUG
    let slug = currentProduct.slug;
    if (body.name && body.name !== currentProduct.name) {
      slug = generateSlug(body.name);
      console.log('Novo slug gerado:', slug);

      const { data: slugExists } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .neq('id', idNum)
        .maybeSingle();

      if (slugExists) {
        return NextResponse.json(
          { 
            data: null, 
            mensagens: ['Já existe outro produto com esse nome/slug.'] 
          },
          { status: 409 }
        );
      }
    }

    // 5. FORÇA O UPDATE (com log)
    console.log('Executando UPDATE com:', {
      name: body.name,
      price: body.price,
      stock_quantity: body.stock_quantity,
      sku: sku,
      category_id: body.category_id || null,
      supplier_id: body.supplier_id || null,
      slug: slug,
    });

    const { error: updateError } = await supabase
      .from('products')
      .update({
        name: body.name,
        price: body.price,
        stock_quantity: body.stock_quantity,
        sku: sku,
        category_id: body.category_id || null,
        supplier_id: body.supplier_id || null,
        slug: slug,
      })
      .eq('id', idNum);

    if (updateError) {
      console.error('ERRO NO UPDATE:', updateError);
      throw updateError;
    }

    console.log('UPDATE executado com sucesso');

    // 6. BUSCA O PRODUTO NOVAMENTE
    const { data: updated, error: selectError } = await supabase
      .from('products')
      .select(`
        id, name, price, stock_quantity, sku, category_id, supplier_id, slug,
        categories(name), suppliers(company_name)
      `)
      .eq('id', idNum)
      .single();

    if (selectError) {
      console.error('Erro ao buscar após update:', selectError);
      throw selectError;
    }

    console.log('Produto após update:', updated);

    return NextResponse.json(
      { 
        data: updated, 
        mensagens: ['Produto atualizado com sucesso!'] 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro fatal no PUT:', error);
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [error.message || 'Erro ao atualizar produto.'] 
      },
      { status: 500 }
    );
  }
}

// === PATCH (ATUALIZAÇÃO PARCIAL) ===
/**
 * @swagger
 *   patch:
 *     summary: Atualiza parcialmente um produto
 *     tags: [Products]
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
 *                 description: Nome do produto
 *               price:
 *                 type: number
 *                 description: Preço do produto
 *               stock_quantity:
 *                 type: integer
 *                 description: Quantidade em estoque
 *               sku:
 *                 type: string
 *                 description: SKU do produto
 *               category_id:
 *                 type: integer
 *                 description: ID da categoria
 *               supplier_id:
 *                 type: integer
 *                 description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Produto não encontrado
 *       409:
 *         description: SKU ou slug duplicado
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
    const body = await request.json();

    console.log('PATCH /api/products/[id] - ID:', id);
    console.log('PATCH /api/products/[id] - Body recebido:', body);

    const idNum = parseInt(id, 10);
    
    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['ID do produto inválido. Deve ser um número positivo.'] 
        },
        { status: 400 }
      );
    }

    // Para PATCH, pelo menos um campo deve ser fornecido
    const { name, price, stock_quantity, sku, category_id, supplier_id } = body;
    
    if (!name && price === undefined && stock_quantity === undefined && !sku && category_id === undefined && supplier_id === undefined) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Pelo menos um campo deve ser fornecido para atualização.'] 
        },
        { status: 400 }
      );
    }

    // BUSCA PRODUTO ATUAL
    const { data: current, error: fetchError } = await supabase
      .from('products')
      .select('name, slug, sku, price, stock_quantity, category_id, supplier_id')
      .eq('id', idNum)
      .single();

    if (fetchError || !current) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Produto com ID ${idNum} não encontrado.`] 
        },
        { status: 404 }
      );
    }

    console.log('Produto atual no banco:', current);

    // PREPARAR DADOS DE ATUALIZAÇÃO
    const updateData = {};
    let slug = current.slug;

    // Validar e adicionar campos fornecidos
    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return NextResponse.json(
          { 
            data: null, 
            mensagens: ['Nome não pode estar vazio.'] 
          },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
      
      // Gerar novo slug se o nome mudou
      if (name.trim() !== current.name) {
        slug = generateSlug(name.trim());
        updateData.slug = slug;
        
        // Verificar slug duplicado
        const { data: slugExists } = await supabase
          .from('products')
          .select('id')
          .eq('slug', slug)
          .neq('id', idNum)
          .maybeSingle();

        if (slugExists) {
          return NextResponse.json(
            { 
              data: null, 
              mensagens: ['Já existe outro produto com esse nome/slug.'] 
            },
            { status: 409 }
          );
        }
      }
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return NextResponse.json(
          { 
            data: null, 
            mensagens: ['Preço deve ser um número positivo.'] 
          },
          { status: 400 }
        );
      }
      updateData.price = price;
    }

    if (stock_quantity !== undefined) {
      if (typeof stock_quantity !== 'number' || stock_quantity < 0) {
        return NextResponse.json(
          { 
            data: null, 
            mensagens: ['Quantidade em estoque deve ser um número inteiro positivo.'] 
          },
          { status: 400 }
        );
      }
      updateData.stock_quantity = stock_quantity;
    }

    if (sku !== undefined) {
      const skuTrimmed = sku?.trim();
      if (!skuTrimmed) {
        return NextResponse.json(
          { 
            data: null, 
            mensagens: ['SKU não pode estar vazio.'] 
          },
          { status: 400 }
        );
      }
      
      // Verificar SKU duplicado apenas se foi alterado
      if (skuTrimmed !== current.sku) {
        const { data: skuExists } = await supabase
          .from('products')
          .select('id')
          .eq('sku', skuTrimmed)
          .neq('id', idNum)
          .maybeSingle();

        if (skuExists) {
          return NextResponse.json(
            { 
              data: null, 
              mensagens: ['Já existe outro produto com esse SKU.'] 
            },
            { status: 409 }
          );
        }
      }
      updateData.sku = skuTrimmed;
    }

    if (category_id !== undefined) {
      if (category_id !== null && (typeof category_id !== 'number' || category_id <= 0)) {
        return NextResponse.json(
          { 
            data: null, 
            mensagens: ['ID da categoria deve ser um número positivo ou nulo.'] 
          },
          { status: 400 }
        );
      }
      updateData.category_id = category_id;
    }

    if (supplier_id !== undefined) {
      if (supplier_id !== null && (typeof supplier_id !== 'number' || supplier_id <= 0)) {
        return NextResponse.json(
          { 
            data: null, 
            mensagens: ['ID do fornecedor deve ser um número positivo ou nulo.'] 
          },
          { status: 400 }
        );
      }
      updateData.supplier_id = supplier_id;
    }

    console.log('Executando PATCH com:', updateData);

    // EXECUTAR UPDATE PARCIAL
    const { error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', idNum);

    if (updateError) {
      console.error('ERRO NO PATCH:', updateError);
      throw updateError;
    }

    console.log('PATCH executado com sucesso');

    // BUSCA O PRODUTO ATUALIZADO
    const { data: updated, error: selectError } = await supabase
      .from('products')
      .select(`
        id, name, price, stock_quantity, sku, category_id, supplier_id, slug,
        categories(name), suppliers(company_name)
      `)
      .eq('id', idNum)
      .single();

    if (selectError) {
      console.error('Erro ao buscar após patch:', selectError);
      throw selectError;
    }

    console.log('Produto após patch:', updated);

    return NextResponse.json(
      { 
        data: updated, 
        mensagens: ['Produto atualizado com sucesso!'] 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro fatal no PATCH:', error);
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [error.message || 'Erro ao atualizar produto.'] 
      },
      { status: 500 }
    );
  }
}

// === DELETE ===
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
          mensagens: ['ID do produto inválido. Deve ser um número positivo.'] 
        },
        { status: 400 }
      );
    }

    // VERIFICA SE EXISTE
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', idNum)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existing) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Produto com ID ${idNum} não encontrado.`] 
        },
        { status: 404 }
      );
    }

    // DELETA
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', idNum);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      { 
        data: null, 
        mensagens: ['Produto excluído com sucesso!'] 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no DELETE:', error);
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [error.message || 'Erro ao excluir produto.'] 
      },
      { status: 500 }
    );
  }
}