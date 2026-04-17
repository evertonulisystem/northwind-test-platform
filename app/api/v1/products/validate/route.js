// app/api/products/validate/route.js
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

/**
 * @swagger
 * /api/products/validate:
 *   post:
 *     summary: Valida dados de produto antes de salvar
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Mouse Gamer RGB"
 *               price:
 *                 type: number
 *                 example: 299.90
 *               stock_quantity:
 *                 type: integer
 *                 example: 50
 *               sku:
 *                 type: string
 *                 example: "MGP-2024"
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               supplier_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Validação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *                 warnings:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["SKU em formato não padrão"]
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Considerar adicionar descrição"]
 *       401:
 *         description: Não autorizado
 *       400:
 *         description: Dados inválidos
 */
export async function POST(request) {
  console.log('=== DEBUG POST /api/products/validate ===');
  
  try {
    // Verificar autenticação
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { 
          valid: false,
          errors: ['Token ausente'],
          warnings: [],
          suggestions: []
        }, 
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { 
          valid: false,
          errors: ['Token inválido'],
          warnings: [],
          suggestions: []
        }, 
        { status: 401 }
      );
    }

    // Parse do corpo da requisição
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { 
          valid: false,
          errors: ['JSON inválido'],
          warnings: [],
          suggestions: ['Verifique o formato do JSON enviado']
        }, 
        { status: 400 }
      );
    }

    const errors = [];
    const warnings = [];
    const suggestions = [];

    // === VALIDAÇÕES DE CAMPOS OBRIGATÓRIOS ===
    const requiredFields = ['name', 'price', 'stock_quantity', 'sku'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      errors.push(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`);
    }

    // === VALIDAÇÃO DO NOME ===
    if (body.name) {
      const name = body.name.trim();
      
      if (name.length < 6) {
        errors.push('Nome deve ter no mínimo 6 caracteres');
      }
      
      if (name.length > 40) {
        errors.push('Nome deve ter no máximo 40 caracteres');
      }
      
      if (/\d/.test(name)) {
        errors.push('Nome não pode conter números');
      }
      
      if (/[^a-zA-Z\s]/.test(name)) {
        errors.push('Nome não pode conter caracteres especiais');
      }
      
      if (/\s{2,}/.test(name)) {
        errors.push('Nome não pode ter espaços duplicados');
      }
      
      if (!/^[A-Z]/.test(name)) {
        warnings.push('Nome deve começar com letra maiúscula');
      }
    }

    // === VALIDAÇÃO DO PREÇO ===
    if (body.price !== undefined) {
      const price = parseFloat(body.price);
      
      if (isNaN(price)) {
        errors.push('Preço deve ser um número válido');
      } else if (price <= 0) {
        errors.push('Preço deve ser maior que zero');
      } else if (price > 999999.99) {
        errors.push('Preço não pode exceder R$ 999.999,99');
      } else if (price < 1) {
        warnings.push('Preço muito baixo, verifique o valor');
      } else if (price > 10000) {
        warnings.push('Preço muito alto, pode impactar vendas');
      }
    }

    // === VALIDAÇÃO DO ESTOQUE ===
    if (body.stock_quantity !== undefined) {
      const stock = parseInt(body.stock_quantity);
      
      if (isNaN(stock)) {
        errors.push('Estoque deve ser um número inteiro');
      } else if (stock < 0) {
        errors.push('Estoque não pode ser negativo');
      } else if (stock > 999) {
        errors.push('Estoque não pode exceder 999 unidades');
      } else if (stock < 5) {
        warnings.push('Estoque baixo, considere repor em breve');
      } else if (stock > 500) {
        warnings.push('Estoque muito alto, pode gerar custos de armazenagem');
      }
    }

    // === VALIDAÇÃO DO SKU ===
    if (body.sku) {
      const sku = body.sku.trim().toUpperCase();
      
      if (sku.length < 5) {
        errors.push('SKU deve ter no mínimo 5 caracteres');
      }
      
      if (sku.length > 20) {
        errors.push('SKU deve ter no máximo 20 caracteres');
      }
      
      if (!/^[A-Z0-9-]+$/.test(sku)) {
        errors.push('SKU deve conter apenas letras maiúsculas, números e hífen');
      }
      
      if (!/^[A-Z]/.test(sku)) {
        errors.push('SKU deve começar com letra maiúscula');
      }
      
      if (sku.includes('--')) {
        errors.push('SKU não pode ter hífens duplicados');
      }
      
      // Verificar SKU duplicado
      const { data: existingSku } = await supabase
        .from('products')
        .select('id')
        .eq('sku', sku)
        .maybeSingle();

      if (existingSku) {
        errors.push('SKU já cadastrado no sistema');
      }
    }

    // === VALIDAÇÃO DA CATEGORIA ===
    if (body.category_id) {
      const categoryId = parseInt(body.category_id);
      
      if (isNaN(categoryId) || categoryId <= 0) {
        errors.push('ID da categoria deve ser um número positivo');
      } else {
        // Verificar se categoria existe
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('id', categoryId)
          .maybeSingle();

        if (!category) {
          errors.push('Categoria informada não existe');
        }
      }
    } else {
      warnings.push('Categoria não informada, produto ficará sem categoria');
      suggestions.push('Adicione uma categoria para melhor organização');
    }

    // === VALIDAÇÃO DO FORNECEDOR ===
    if (body.supplier_id) {
      const supplierId = parseInt(body.supplier_id);
      
      if (isNaN(supplierId) || supplierId <= 0) {
        errors.push('ID do fornecedor deve ser um número positivo');
      } else {
        // Verificar se fornecedor existe
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('id')
          .eq('id', supplierId)
          .maybeSingle();

        if (!supplier) {
          errors.push('Fornecedor informado não existe');
        }
      }
    } else {
      warnings.push('Fornecedor não informado, produto ficará sem fornecedor');
      suggestions.push('Adicione um fornecedor para melhor controle de estoque');
    }

    // === VALIDAÇÕES ADICIONAIS ===
    
    // Verificar se nome já existe (caso seja edição)
    if (body.name && body.id) {
      const { data: existingName } = await supabase
        .from('products')
        .select('id')
        .eq('name', body.name.trim())
        .neq('id', body.id)
        .maybeSingle();

      if (existingName) {
        errors.push('Já existe um produto com este nome');
      }
    }

    // Sugestões baseadas no tipo de produto
    if (body.name) {
      const nameLower = body.name.toLowerCase();
      
      if (nameLower.includes('mouse') || nameLower.includes('teclado')) {
        suggestions.push('Considere adicionar informações de compatibilidade');
      }
      
      if (nameLower.includes('gamer') || nameLower.includes('gaming')) {
        suggestions.push('Produtos gamer podem ter margens maiores');
      }
      
      if (nameLower.includes('usb') || nameLower.includes('bluetooth')) {
        suggestions.push('Adicione informações de conectividade');
      }
    }

    // === RESULTADO FINAL ===
    const isValid = errors.length === 0;
    
    console.log(`Validação concluída: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
    console.log(`Erros: ${errors.length}, Avisos: ${warnings.length}, Sugestões: ${suggestions.length}`);

    return NextResponse.json({
      valid: isValid,
      errors,
      warnings,
      suggestions,
      message: isValid ? 'Produto válido para cadastro' : 'Corrija os erros antes de prosseguir'
    });

  } catch (error) {
    console.error('Erro na validação:', error);
    return NextResponse.json(
      { 
        valid: false,
        errors: ['Erro interno na validação'],
        warnings: [],
        suggestions: ['Tente novamente em instantes']
      }, 
      { status: 500 }
    );
  }
}
