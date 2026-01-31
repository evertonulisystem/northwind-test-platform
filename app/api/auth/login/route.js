import { supabase } from '@/lib/supabase';
import { generateToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login de usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       401:
 *         description: Email ou senha inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Usuário inativo
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
    let body;
    let email, password;

    // Lê o body apenas uma vez como texto
    const text = await request.text();
    console.log('🐛 DEBUG LOGIN - Raw body:', text);

    // Tenta fazer parse como JSON primeiro
    try {
      body = JSON.parse(text);
      console.log('🐛 DEBUG LOGIN - Parsed as JSON:', body);
      email = body.email;
      password = body.password;
    } catch (jsonError) {
      console.log('🐛 DEBUG LOGIN - JSON failed, trying form-data...');
      
      // Se JSON falhar, tenta parse como form-data
      const params = new URLSearchParams(text);
      email = params.get('email');
      password = params.get('password');
      
      body = { email, password };
      console.log('🐛 DEBUG LOGIN - Parsed as form-data:', { email, password });
    }

    console.log('🐛 DEBUG LOGIN - Final parsed data:', { email, password });

    if (!email || !password) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Email e senha são obrigatórios']
        },
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
        { 
          data: null,
          mensagens: ['Email ou senha inválidos']
        },
        { status: 401 }
      );
    }

    // Verifica se usuário está ativo
    if (!user.is_active) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Usuário inativo']
        },
        { status: 403 }
      );
    }

    // Verifica senha
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return Response.json(
        { 
          data: null,
          mensagens: ['Email ou senha inválidos']
        },
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
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      },
      mensagens: 'Login realizado com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro no login:', error);
    return Response.json(
      { 
        data: null,
        mensagens: ['Erro interno do servidor']
      },
      { status: 500 }
    );
  }
}