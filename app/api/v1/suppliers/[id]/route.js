// app/api/suppliers/[id]/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

/**
 * @swagger
 * /api/v1/suppliers/{id}:
 *   get:
 *     summary: Obtém detalhes de um fornecedor
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
 *         description: Detalhes do fornecedor
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

    // Busca detalhes do fornecedor
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', idNum)
      .single();

    if (error || !supplier) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Fornecedor com ID ${idNum} não encontrado.`] 
        },
        { status: 404 }
      );
    }

    // Ajustar o campo 'state' para 'uf' para manter consistência com o que o usuário espera e o Swagger define
    const formattedSupplier = {
      ...supplier,
      uf: supplier.state
    };
    delete formattedSupplier.state;

    return NextResponse.json({ 
      data: formattedSupplier,
      mensagens: ['Fornecedor encontrado com sucesso.']
    });
  } catch (error) {
    return NextResponse.json(
      { 
        data: null, 
        mensagens: ['Erro interno ao buscar detalhes do fornecedor.'] 
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/suppliers/{id}:
 *   put:
 *     summary: Atualiza um fornecedor existente
 *     tags: [Suppliers]
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
 *               - company_name
 *               - contact_name
 *               - email
 *               - phone
 *               - cnpj
 *               - uf
 *             properties:
 *               company_name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Tech Solutions Ltda"
 *               contact_name:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 80
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@techsolutions.com"
 *               phone:
 *                 type: string
 *                 pattern: "^\\([0-9]{2}\\) [0-9]{5}-[0-9]{4}$"
 *                 example: "(11) 98765-4321"
 *               cnpj:
 *                 type: string
 *                 pattern: "^[0-9]{14}$"
 *                 example: "12345678901234"
 *               uf:
 *                 type: string
 *                 pattern: "^[A-Z]{2}$"
 *                 example: "SP"
 *     responses:
 *       200:
 *         description: Fornecedor atualizado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Fornecedor não encontrado
 *       409:
 *         description: Email ou CNPJ duplicado
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

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Nenhum dado informado. Preencha os campos do fornecedor.'] 
        },
        { status: 400 }
      );
    }

    // Validação de campos obrigatórios
    const { company_name, contact_name, email, phone, cnpj, uf } = body;
    
    if (!company_name || !company_name.trim()) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Razão social da empresa é obrigatória.'] 
        },
        { status: 400 }
      );
    }

    if (!contact_name || !contact_name.trim()) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Nome do contato é obrigatório.'] 
        },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['E-mail do fornecedor é obrigatório.'] 
        },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Telefone do fornecedor é obrigatório.'] 
        },
        { status: 400 }
      );
    }

    if (!cnpj || !cnpj.trim()) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['CNPJ do fornecedor é obrigatório.'] 
        },
        { status: 400 }
      );
    }

    if (!uf || !uf.trim()) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['UF do fornecedor é obrigatória.'] 
        },
        { status: 400 }
      );
    }

    // Validação de tamanho
    if (company_name.trim().length < 3) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Razão social deve ter no mínimo 3 caracteres.'] 
        },
        { status: 400 }
      );
    }

    if (company_name.trim().length > 100) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Razão social deve ter no máximo 100 caracteres.'] 
        },
        { status: 400 }
      );
    }

    if (contact_name.trim().length < 5) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Nome do contato deve ter no mínimo 5 caracteres.'] 
        },
        { status: 400 }
      );
    }

    if (contact_name.trim().length > 80) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Nome do contato deve ter no máximo 80 caracteres.'] 
        },
        { status: 400 }
      );
    }

    // Validação de formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['E-mail inválido. Informe um e-mail válido.'] 
        },
        { status: 400 }
      );
    }

    const phoneRegex = /^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$/;
    if (!phoneRegex.test(phone.trim())) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Telefone inválido. Use o formato (XX) XXXXX-XXXX.'] 
        },
        { status: 400 }
      );
    }

    const cnpjRegex = /^[0-9]{14}$/;
    const cleanCnpj = cnpj.replace(/[^\d]/g, '');
    if (!cnpjRegex.test(cleanCnpj)) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['CNPJ inválido. Informe apenas os 14 números do CNPJ.'] 
        },
        { status: 400 }
      );
    }

    const ufRegex = /^[A-Z]{2}$/;
    if (!ufRegex.test(uf.trim().toUpperCase())) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['UF inválida. Informe a sigla de 2 letras do estado (ex: SP, RJ, MG).'] 
        },
        { status: 400 }
      );
    }

    // VERIFICA SE EXISTE
    const { data: existing, error: checkError } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', idNum)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existing) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Fornecedor com ID ${idNum} não encontrado.`] 
        },
        { status: 404 }
      );
    }

    // VERIFICA DUPLICIDADE (email) - exceto a si mesmo
    const { data: emailDuplicate } = await supabase
      .from('suppliers')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .neq('id', idNum)
      .maybeSingle();

    if (emailDuplicate) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Já existe um fornecedor com este e-mail.'] 
        },
        { status: 409 }
      );
    }

    // VERIFICA DUPLICIDADE (cnpj) - exceto a si mesmo
    const { data: cnpjDuplicate } = await supabase
      .from('suppliers')
      .select('id')
      .eq('cnpj', cleanCnpj)
      .neq('id', idNum)
      .maybeSingle();

    if (cnpjDuplicate) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Já existe um fornecedor com este CNPJ.'] 
        },
        { status: 409 }
      );
    }

    // ATUALIZA
    const { data, error } = await supabase
      .from('suppliers')
      .update({
        company_name: company_name.trim(),
        contact_name: contact_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        cnpj: cleanCnpj,
        state: uf.trim().toUpperCase()
      })
      .eq('id', idNum)
      .select()
      .single();

    if (error) {
      console.log('❌ Erro Supabase:', error);
      throw error;
    }

    return NextResponse.json(
      { 
        data, 
        mensagens: ['Fornecedor atualizado com sucesso!'] 
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [error.message || 'Erro ao atualizar fornecedor.'] 
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/suppliers/{id}:
 *   delete:
 *     summary: Exclui um fornecedor
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
 *         description: Fornecedor excluído
 *       404:
 *         description: Fornecedor não encontrado
 *       400:
 *         description: Fornecedor em uso
 */
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
          mensagens: ['ID do fornecedor inválido. Deve ser um número positivo.'] 
        },
        { status: 400 }
      );
    }

    // VERIFICA SE EXISTE
    const { data: existing, error: checkError } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', idNum)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existing) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: [`Fornecedor com ID ${idNum} não encontrado.`] 
        },
        { status: 404 }
      );
    }

    // VERIFICA SE ESTÁ EM USO
    const { data: productsUsing, error: checkUsageError } = await supabase
      .from('products')
      .select('id')
      .eq('supplier_id', idNum)
      .limit(1);

    if (checkUsageError) throw checkUsageError;

    if (productsUsing && productsUsing.length > 0) {
      return NextResponse.json(
        { 
          data: null, 
          mensagens: ['Não é possível excluir. Este fornecedor está sendo usado por produtos.'] 
        },
        { status: 400 }
      );
    }

    // DELETA
    const { error: deleteError } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', idNum);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      { 
        data: null, 
        mensagens: ['Fornecedor excluído com sucesso!'] 
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        data: null, 
        mensagens: [error.message || 'Erro ao excluir fornecedor.'] 
      },
      { status: 500 }
    );
  }
}
