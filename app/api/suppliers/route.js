// app/api/suppliers/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Lista todos os fornecedores
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de fornecedores
 */
export async function GET(request) {
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
    if (!payload) {
      return NextResponse.json(
        { 
          data: null,
          mensagens: ['Token inválido'] 
        }, 
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('company_name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(
      { data, message: 'Fornecedores carregados com sucesso!' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { data: null, message: 'Erro ao carregar fornecedores' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/suppliers:
 *   post:
 *     summary: Adiciona um novo fornecedor
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
 *       201:
 *         description: Fornecedor criado
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email ou CNPJ duplicado
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
    if (!payload) {
      return NextResponse.json(
        { 
          data: null,
          mensagens: ['Token inválido'] 
        }, 
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { data: null, message: 'Dados inválidos. Verifique se todos os campos foram preenchidos corretamente.' },
        { status: 400 }
      );
    }

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { data: null, message: 'Nenhum dado informado. Preencha os campos do fornecedor.' },
        { status: 400 }
      );
    }

    // Validação de campos obrigatórios
    const { company_name, contact_name, email, phone, cnpj, uf } = body;
    
    console.log('🐛 DEBUG POST /api/suppliers');
    console.log('Body recebido:', body);
    
    if (!company_name || !company_name.trim()) {
      return NextResponse.json(
        { data: null, message: 'Razão social da empresa é obrigatória.' },
        { status: 400 }
      );
    }

    if (!contact_name || !contact_name.trim()) {
      return NextResponse.json(
        { data: null, message: 'Nome do contato é obrigatório.' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { data: null, message: 'E-mail do fornecedor é obrigatório.' },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { data: null, message: 'Telefone do fornecedor é obrigatório.' },
        { status: 400 }
      );
    }

    if (!cnpj || !cnpj.trim()) {
      return NextResponse.json(
        { data: null, message: 'CNPJ do fornecedor é obrigatório.' },
        { status: 400 }
      );
    }

    if (!uf || !uf.trim()) {
      return NextResponse.json(
        { data: null, message: 'UF do fornecedor é obrigatória.' },
        { status: 400 }
      );
    }

    // Validação de tamanho
    if (company_name.trim().length < 3) {
      return NextResponse.json(
        { data: null, message: 'Razão social deve ter no mínimo 3 caracteres.' },
        { status: 400 }
      );
    }

    if (company_name.trim().length > 100) {
      return NextResponse.json(
        { data: null, message: 'Razão social deve ter no máximo 100 caracteres.' },
        { status: 400 }
      );
    }

    if (contact_name.trim().length < 5) {
      return NextResponse.json(
        { data: null, message: 'Nome do contato deve ter no mínimo 5 caracteres.' },
        { status: 400 }
      );
    }

    if (contact_name.trim().length > 80) {
      return NextResponse.json(
        { data: null, message: 'Nome do contato deve ter no máximo 80 caracteres.' },
        { status: 400 }
      );
    }

    // Validação de formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { data: null, message: 'E-mail inválido. Informe um e-mail válido.' },
        { status: 400 }
      );
    }

    const phoneRegex = /^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$/;
    if (!phoneRegex.test(phone.trim())) {
      return NextResponse.json(
        { data: null, message: 'Telefone inválido. Use o formato (XX) XXXXX-XXXX.' },
        { status: 400 }
      );
    }

    const cnpjRegex = /^[0-9]{14}$/;
    const cleanCnpj = cnpj.replace(/[^\d]/g, '');
    if (!cnpjRegex.test(cleanCnpj)) {
      return NextResponse.json(
        { data: null, message: 'CNPJ inválido. Informe apenas os 14 números do CNPJ.' },
        { status: 400 }
      );
    }

    const ufRegex = /^[A-Z]{2}$/;
    if (!ufRegex.test(uf.trim().toUpperCase())) {
      return NextResponse.json(
        { data: null, message: 'UF inválida. Informe a sigla de 2 letras do estado (ex: SP, RJ, MG).' },
        { status: 400 }
      );
    }

    // VERIFICA DUPLICIDADE (email)
    const { data: emailExisting } = await supabase
      .from('suppliers')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (emailExisting) {
      return NextResponse.json(
        { data: null, message: 'Já existe um fornecedor com este e-mail.' },
        { status: 409 }
      );
    }

    // VERIFICA DUPLICIDADE (cnpj)
    const { data: cnpjExisting } = await supabase
      .from('suppliers')
      .select('id')
      .eq('cnpj', cleanCnpj)
      .maybeSingle();

    if (cnpjExisting) {
      return NextResponse.json(
        { data: null, message: 'Já existe um fornecedor com este CNPJ.' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        company_name: company_name.trim(),
        contact_name: contact_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        cnpj: cleanCnpj,
        state: uf.trim().toUpperCase()
      })
      .select()
      .single();

    if (error) {
      console.log('❌ Erro Supabase:', error);
      throw error;
    }

    return NextResponse.json(
      { data, message: 'Fornecedor criado com sucesso!' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { data: null, message: error.message || 'Erro ao criar fornecedor' },
      { status: 500 }
    );
  }
}