// app/api/auth/register/route.js
import { supabase } from '@/lib/supabase';
import { generateToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/register
 * Registra um novo usuário no sistema
 */
export async function POST(request) {
  try {
    // 1. Extrair dados do corpo da requisição
    const body = await request.json();
    const { full_name, email, password, confirmPassword } = body;

    // 2. Validar campos obrigatórios
    if (!full_name || !email || !password || !confirmPassword) {
      return Response.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // 3. Validar nome
    if (full_name.trim().length < 2) {
      return Response.json(
        { error: 'Nome deve ter no mínimo 2 caracteres' },
        { status: 400 }
      );
    }

    // 4. Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // 5. Validar senha forte
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return Response.json(
        { 
          error: 'Senha inválida', 
          details: passwordErrors 
        },
        { status: 400 }
      );
    }

    // 6. Validar confirmação de senha
    if (password !== confirmPassword) {
      return Response.json(
        { error: 'As senhas não coincidem' },
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
        { error: 'Email já cadastrado' },
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
        role: 'customer', // Padrão para novos usuários ver se pode na tabela users do supabase
        is_active: true, // Ativado automaticamente
        last_login: null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao inserir usuário:', insertError);
      return Response.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    // 10. Gerar token JWT
    const token = generateToken(newUser);

    // 11. Retornar sucesso
    return Response.json({
      message: 'Usuário cadastrado com sucesso',
      token,
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Erro no registro:', error);
    return Response.json(
      { error: 'Erro interno do servidor' },
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