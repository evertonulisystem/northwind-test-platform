import { supabase } from '@/lib/supabase';
import { generateToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, full_name, phone, birth_date, access_code } = body;

    // Validações básicas
    if (!email || !password || !full_name || !access_code) {
      return Response.json(
        { error: 'Email, senha, nome completo e código de acesso são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica código de acesso
    const validAccessCode = process.env.ACCESS_CODE || 'QATEST2025';
    if (access_code !== validAccessCode) {
      return Response.json(
        { error: 'Código de acesso inválido' },
        { status: 403 }
      );
    }

    // Verifica se email já existe
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

    // Hash da senha
    const password_hash = await bcrypt.hash(password, 10);

    // Insere usuário
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        full_name,
        phone,
        birth_date,
        access_code,
        role: 'customer',
        email_verified: false,
        is_active: true
      })
      .select('id, email, full_name, role')
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return Response.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    // Gera token JWT
    const token = generateToken(user);

    return Response.json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Erro no register:', error);
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}