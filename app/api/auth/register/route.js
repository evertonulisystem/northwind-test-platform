// app/api/auth/register/route.js
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt';

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { full_name, email, password, phone, address, birth_date } = body;

    // Validação
    if (!full_name || !email || !password) {
      return Response.json({ error: 'Nome, email e senha obrigatórios' }, { status: 400 });
    }

    // Verifica se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return Response.json({ error: 'Email já cadastrado' }, { status: 409 });
    }

    // Hash da senha
    const password_hash = await bcrypt.hash(password, 10);

    // Insere usuário
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        full_name,
        email,
        password_hash,
        phone: phone || null,
        address: address || null,
        birth_date: birth_date || null,
        role: 'customer', // default
        is_active: true
      })
      .select('id, email, full_name, role')
      .single();

    if (error) throw error;

    const token = generateToken(user);

    const response = Response.json({
      message: 'Cadastro realizado com sucesso',
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
    });

    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
}