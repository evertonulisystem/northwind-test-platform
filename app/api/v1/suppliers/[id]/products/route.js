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

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id, name, price, stock_quantity, sku,
        categories (name),
        suppliers (company_name)
      `)
      .eq('supplier_id', idNum)
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
        ? [`${products.length} produtos encontrados para o fornecedor ${supplier.company_name}.`]
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
