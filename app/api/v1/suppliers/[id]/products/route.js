// app/api/v1/suppliers/[id]/products/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

/**
 * @swagger
 * /api/v1/suppliers/{id}/products:
 *   get:
 *     summary: Lista produtos de um fornecedor
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade de itens por página
 *     responses:
 *       200:
 *         description: Lista de produtos do fornecedor
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Fornecedor não encontrado
 *       500:
 *         description: Erro interno
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
          mensagens: ['ID do fornecedor inválido. Deve ser um número positivo.'] 
        },
        { status: 400 }
      );
    }

    // Pegar parâmetros de paginação
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const start = (page - 1) * limit;

    // Primeiro, verifica se o fornecedor existe
    const { data: supplier, error: supError } = await supabase
      .from('suppliers')
      .select('id, company_name')
      .eq('id', idNum)
      .single();

    if (supError || !supplier) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Fornecedor com ID ${idNum} não encontrado.`] 
        },
        { status: 404 }
      );
    }

    const { data: products, error, count } = await supabase
      .from('products')
      .select(`
        id, name, price, stock_quantity, sku,
        categories (name),
        suppliers (company_name)
      `, { count: 'exact' })
      .eq('supplier_id', idNum)
      .order('name')
      .range(start, start + limit - 1);

    if (error) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [error.message] 
        },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ 
      data: products || [],
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      mensagens: products?.length > 0 
        ? [`${total} produtos encontrados para o fornecedor ${supplier.company_name}.`]
        : [`Nenhum produto cadastrado para o fornecedor ${supplier.company_name}.`]
    });
  } catch (error) {
    return NextResponse.json(
      { 
        data: null, 
        mensagens: ['Erro interno ao buscar produtos do fornecedor.'] 
      },
      { status: 500 }
    );
  }
}
