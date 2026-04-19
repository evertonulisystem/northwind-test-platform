// app/api/auth/register/route.js
import { supabase } from '@/lib/supabase';
import { generateToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export const dynamic = "force-dynamic";


/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(request) {
  try {
    // 1. Extrair dados do corpo da requisição
    const body = await request.json();
    const { full_name, email, password, confirmPassword } = body;

 // 2. Validar campos obrigatórios
    const missingFields = [];
    if (!full_name) missingFields.push('Nome completo é obrigatório');
    if (!email) missingFields.push('Email é obrigatório');
    if (!password) missingFields.push('Senha é obrigatória');
    if (!confirmPassword) missingFields.push('Confirmação de senha é obrigatória');

    if (missingFields.length > 0) {
      return Response.json(
        { 
          data: null,
          mensagens: missingFields
        },
        { status: 400 }
      );
    }

    // 3. Validar nome com regras avançadas
    const trimmedName = full_name.trim();
    if (trimmedName.length < 3) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Nome deve ter no mínimo 3 caracteres']
        },
        { status: 400 }
      );
    }

    if (trimmedName.length > 100) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Nome deve ter no máximo 100 caracteres']
        },
        { status: 400 }
      );
    }

    // Nome deve conter apenas letras e espaços
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(trimmedName)) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Nome deve conter apenas letras e espaços']
        },
        { status: 400 }
      );
    }

    // Não permite nomes com espaços duplicados
    if (/\s{2,}/.test(trimmedName)) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Nome não pode ter espaços duplicados']
        },
        { status: 400 }
      );
    }

    // 4. Validar formato de email avançado
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Formato de email inválido. Exemplo: usuario@dominio.com']
        },
        { status: 400 }
      );
    }

    // Email não pode começar ou terminar com pontos ou hífens
    if (/^[.-]|[.-]$/.test(trimmedEmail.split('@')[0])) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Email não pode começar ou terminar com ponto ou hífen']
        },
        { status: 400 }
      );
    }

    // Email não pode ter pontos consecutivos
    if (/\.{2,}/.test(trimmedEmail)) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Email não pode ter pontos consecutivos']
        },
        { status: 400 }
      );
    }

    if (trimmedEmail.length > 255) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Email deve ter no máximo 255 caracteres']
        },
        { status: 400 }
      );
    }

    // 5. Validar senha forte com regras avançadas
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Senha inválida', ...passwordErrors]
        },
        { status: 400 }
      );
    }

    // Senha não pode conter o email ou nome
    if (password.toLowerCase().includes(trimmedEmail.toLowerCase().split('@')[0])) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Senha não pode conter partes do seu email']
        },
        { status: 400 }
      );
    }

    if (password.toLowerCase().includes(trimmedName.toLowerCase().replace(/\s/g, ''))) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Senha não pode conter partes do seu nome']
        },
        { status: 400 }
      );
    }

    // 6. Validar confirmação de senha
    if (password !== confirmPassword) {
      return Response.json(
        { 
          data: null,
          mensagens: ['As senhas não coincidem. Verifique e tente novamente']
        },
        { status: 400 }
      );
    }

    // 7. Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Email já cadastrado. Tente fazer login ou use outro email']
        },
        { status: 409 }
      );
    }

    // 8. Criptografar senha
    const passwordHash = await bcrypt.hash(password, 12);

    // 9. Criar novo usuário no Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        role: 'customer', // Padrão para novos usuários
        is_active: true, // Ativado automaticamente
        last_login: null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao inserir usuário:', insertError);
      return Response.json(
        { 
          data: null,
          mensagens: ['Erro ao criar usuário. Tente novamente mais tarde']
        },
        { status: 500 }
      );
    }

    // 10. Gerar token JWT
    const token = generateToken(newUser);

    // 11. Retornar sucesso
    return Response.json({
      data: {
        token,
        user: {
          id: newUser.id,
          full_name: newUser.full_name,
          email: newUser.email,
          role: newUser.role
        }
      },
      mensagens: 'Usuário cadastrado com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro no registro:', error);
    return Response.json(
      { 
        data: null,
        mensagens: ['Erro interno do servidor. Tente novamente mais tarde']
      },
      { status: 500 }
    );
  }
}

/**
 * Função auxiliar: Valida senha forte
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 */
function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Mínimo de 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Pelo menos 1 letra maiúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Pelo menos 1 letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Pelo menos 1 número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>_+\-=\[\]';\\/`~]/.test(password)) {
    errors.push('Pelo menos 1 caractere especial');
  }

  return errors;
}