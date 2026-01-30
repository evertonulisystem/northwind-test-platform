// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs'; // Criptografia de senha
import { validateEmail, validatePassword } from '@/lib/validators'; // Reutilizável

// Mock database (substituir por Prisma/Sequelize em produção)
const users = []; // Em produção: import db from '@/lib/db'

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

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

    // CRIPTOGRAFAR senha (CRUCIAL para segurança)
    const hashedPassword = await hash(password, 12);

    // CRIAR usuário
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser); // Em produção: await db.user.create({ ... })

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        userId: newUser.id
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