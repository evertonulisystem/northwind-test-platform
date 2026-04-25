// app/api/v1/suppliers/[id]/unlink/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/v1/suppliers/{id}/unlink:
 *   post:
 *     summary: Remove fornecedor de múltiplos produtos
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_ids
 *             properties:
 *               product_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Fornecedor removido dos produtos com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Fornecedor não encontrado
 *       500:
 *         description: Erro interno
 */
export async function POST(request, { params }) {
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
          mensagens: ['ID do fornecedor inválido. Deve ser um número positivo.'] 
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

    if (!body || !body.product_ids || !Array.isArray(body.product_ids) || body.product_ids.length === 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['IDs dos produtos são obrigatórios e devem ser um array não vazio.'] 
        },
        { status: 400 }
      );
    }

    // Verificar se fornecedor existe
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', idNum)
      .single();

    if (supplierError || !supplier) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Fornecedor com ID ${idNum} não encontrado.`] 
        },
        { status: 404 }
      );
    }

    // Validar IDs dos produtos
    const validIds = body.product_ids.filter(id => 
      typeof id === 'number' && id > 0 && Number.isInteger(id)
    );

    if (validIds.length === 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Nenhum ID de produto válido fornecido.'] 
        },
        { status: 400 }
      );
    }

    // Verificar se os produtos existem e pertencem ao fornecedor
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, supplier_id')
      .in('id', validIds)
      .eq('supplier_id', idNum);

    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Erro ao verificar produtos.'] 
        },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Nenhum produto encontrado vinculado a este fornecedor.'] 
        },
        { status: 404 }
      );
    }

    const productIdsToUpdate = products.map(p => p.id);

    // Atualizar todos os produtos em uma única transação
    const { data: updatedProducts, error: updateError } = await supabase
      .from('products')
      .update({ supplier_id: null })
      .in('id', productIdsToUpdate)
      .select('id, name, supplier_id');

    if (updateError) {
      console.error('❌ Erro ao desvincular produtos:', updateError);
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Erro ao desvincular produtos do fornecedor.'] 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        data: {
          updated_count: updatedProducts?.length || 0,
          updated_products: updatedProducts || [],
          supplier_id: idNum
        }, 
        mensagens: [`${updatedProducts?.length || 0} produto(s) desvinculado(s) do fornecedor com sucesso!`] 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [error.message || 'Erro interno ao processar desvinculamento.'] 
      },
      { status: 500 }
    );
  }
}
