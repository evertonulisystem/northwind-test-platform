// app/api/auth/register/route.js
import { supabase } from '@/lib/supabase';
import { generateToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export const dynamic = "force-dynamic";


/**
 * POST /api/auth/register
 * Registra um novo usuário no sistema
 * 
 * Padrão de respostas:
 * - 201: { data: { token, user }, mensagens: "Sucesso" }
 * - 400: { data: null, mensagens: ["Erro 1", "Erro 2"] }
 * - 409: { data: null, mensagens: ["Email já cadastrado"] }
 * - 500: { data: null, mensagens: ["Erro interno"] }
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

    // 3. Validar nome
    if (full_name.trim().length < 2) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Nome deve ter no mínimo 2 caracteres']
        },
        { status: 400 }
      );
    }

    // 4. Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Formato de email incorreto. Exemplo: usuario@dominio.com']
        },
        { status: 400 }
      );
    }

    // 5. Validar senha forte
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