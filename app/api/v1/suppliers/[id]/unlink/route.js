// app/api/v1/suppliers/[id]/unlink/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = "force-dynamic";

/**
 * @typedef {Object} UnlinkRequest
 * @property {number[]} product_ids - Array de IDs dos produtos a serem desvinculados
 */

/**
 * @typedef {Object} UnlinkParams
 * @property {string} id - ID do fornecedor como string
 */

/**
 * @typedef {Object} UnlinkResponse
 * @property {Object} data - Dados da resposta
 * @property {number} data.updated_count - Quantidade de produtos atualizados
 * @property {Array} data.updated_products - Lista de produtos atualizados
 * @property {number} data.supplier_id - ID do fornecedor
 * @property {string[]} mensagens - Mensagens de status
 */

/**
 * Remove fornecedor de múltiplos produtos
 * @param {Request<UnlinkRequest>} request - Requisição HTTP com product_ids no body
 * @param {{ params: UnlinkParams }} params - Parâmetros da URL contendo ID do fornecedor
 * @returns {Promise<NextResponse<UnlinkResponse>>} Resposta com resultado da operação
 * @example
 * // Exemplo de requisição
 * POST /api/v1/suppliers/123/unlink
 * Content-Type: application/json
 * Authorization: Bearer token
 * {
 *   "product_ids": [1, 2, 3]
 * }
 * @example
 * // Exemplo de resposta de sucesso
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *     "updated_count": 3,
 *     "updated_products": [
 *       {"id": 1, "name": "Produto A", "supplier_id": null},
 *       {"id": 2, "name": "Produto B", "supplier_id": null},
 *       {"id": 3, "name": "Produto C", "supplier_id": null}
 *     ],
 *     "supplier_id": 123
 *   },
 *   "mensagens": ["3 produto(s) desvinculado(s) do fornecedor com sucesso!"]
 * }
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
