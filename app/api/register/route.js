// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { generateToken } from '@/lib/jwt'; // 👈 IMPORTAR generateToken
import { validateEmail, validatePassword } from '@/lib/validators';

// Mock database (substituir por Prisma/Sequelize em produção)
const users = [];

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    // VALIDAÇÃO 1: Campos obrigatórios
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // VALIDAÇÃO 2: Formato de email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // VALIDAÇÃO 3: Senha forte
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // VERIFICAÇÃO: Email já existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // CRIPTOGRAFAR senha
    const hashedPassword = await hash(password, 12);

    // CRIAR usuário
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      full_name: full_name || email.split('@')[0],
      role: 'user',
      is_active: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // 🔥 GERAR TOKEN JWT (ISSO ESTAVA FALTANDO!)
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    console.log('✅ Usuário registrado com sucesso:', newUser.email);

    // RETORNAR token junto com os dados
    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.full_name,
            role: newUser.role
          },
          token // 👈 TOKEN JWT AQUI!
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}