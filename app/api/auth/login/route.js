import { supabase } from '@/lib/supabase';
import { generateToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, full_name, role, is_active')
      .eq('email', email)
      .single();

    if (error || !user) {
      return Response.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    // Verifica se usuário está ativo
    if (!user.is_active) {
      return Response.json(
        { error: 'Usuário inativo' },
        { status: 403 }
      );
    }

    // Verifica senha
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return Response.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    // Atualiza last_login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Gera token
    const token = generateToken(user);

    return Response.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Erro no login:', error);
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}