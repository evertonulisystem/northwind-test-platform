// app/api/auth/validate/route.js
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/v1/auth/validate:
 *   post:
 *     summary: Validar campos de formulário via API
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - field
 *               - value
 *             properties:
 *               field:
 *                 type: string
 *                 enum: [email, password]
 *                 example: "email"
 *               value:
 *                 type: string
 *                 example: "test@example.com"
 *     responses:
 *       200:
 *         description: Campo validado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Campo válido"
 *       400:
 *         description: Campo inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email inválido"
 */

export async function POST(request) {
  try {
    console.log('🐛 DEBUG VALIDATION API - Iniciando validação');
    
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.log('❌ Erro ao parsear JSON:', jsonError);
      return NextResponse.json(
        { valid: false, message: 'Erro ao processar requisição. Verifique o formato do JSON.' },
        { status: 400 }
      );
    }

    const { field, value } = body;
    
    console.log('🐛 DEBUG VALIDATION API - Campo:', field, 'Valor:', value);

    // Validação básica dos parâmetros
    if (!field || !value) {
      console.log('❌ Campo ou valor ausente');
      return NextResponse.json(
        { valid: false, message: 'Campo e valor são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação por campo
    let validationResult;
    
    switch (field) {
      case 'email':
        validationResult = validateEmail(value);
        break;
      case 'password':
        validationResult = validatePassword(value);
        break;
      default:
        console.log('❌ Campo não suportado:', field);
        return NextResponse.json(
          { valid: false, message: 'Campo não suportado para validação' },
          { status: 400 }
        );
    }

    console.log('🐛 DEBUG VALIDATION API - Resultado:', validationResult);
    
    return NextResponse.json(validationResult);

  } catch (error) {
    console.error('❌ Erro geral na validação:', error);
    return NextResponse.json(
      { valid: false, message: 'Erro interno de validação' },
      { status: 500 }
    );
  }
}

function validateEmail(email) {
  console.log('🔍 Validando email:', email);
  
  // Verificar se é string
  if (typeof email !== 'string') {
    return { valid: false, message: 'Email deve ser um texto' };
  }

  // Verificar se está vazio
  if (!email.trim()) {
    return { valid: false, message: 'Email é obrigatório' };
  }

  // Verificar comprimento mínimo
  if (email.trim().length < 5) {
    return { valid: false, message: 'Email deve ter pelo menos 5 caracteres' };
  }

  // Verificar comprimento máximo
  if (email.trim().length > 100) {
    return { valid: false, message: 'Email deve ter no máximo 100 caracteres' };
  }

  // Regex de validação de email (simplificada)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  console.log('🔍 DEBUG EMAIL - Email:', email.trim());
  console.log('🔍 DEBUG EMAIL - Test resultado:', emailRegex.test(email.trim()));
  
  if (!emailRegex.test(email.trim())) {
    console.log('❌ DEBUG EMAIL - Falhou na regex');
    return { valid: false, message: 'Formato de email inválido. Use: nome@dominio.com' };
  }

  console.log('✅ Email válido:', email);
  return { valid: true, message: 'Email válido' };
}

function validatePassword(password) {
  console.log('🔍 Validando senha');
  
  // Verificar se é string
  if (typeof password !== 'string') {
    return { valid: false, message: 'Senha deve ser um texto' };
  }

  // Verificar se está vazia
  if (!password.trim()) {
    return { valid: false, message: 'Senha é obrigatória' };
  }

  // Verificar comprimento mínimo
  if (password.length < 6) {
    return { valid: false, message: 'Senha deve ter pelo menos 6 caracteres' };
  }

  // Verificar comprimento máximo
  if (password.length > 50) {
    return { valid: false, message: 'Senha deve ter no máximo 50 caracteres' };
  }

  // Verificar se contém apenas espaços
  if (password.trim().length === 0) {
    return { valid: false, message: 'Senha não pode conter apenas espaços' };
  }

  // Validações de complexidade (opcionais, mas boas práticas)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Se não tiver nenhuma das validações básicas
  if (!hasUpperCase && !hasLowerCase && !hasNumbers) {
    return { valid: false, message: 'Senha deve conter letras ou números' };
  }

  console.log('✅ Senha válida');
  return { valid: true, message: 'Senha válida' };
}
