import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads', 'products');

// Aux para garantir diretório
async function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * @swagger
 * /api/v1/products/{id}/image:
 *   post:
 *     summary: Realiza o upload de uma imagem PNG para o produto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem PNG (máximo 2MB)
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *       400:
 *         description: Arquivo inválido ou ausente
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Produto não encontrado
 */
export async function POST(request, { params }) {
  try {
    // 1. Identificar produto
    const { id } = await params;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json({ data: null, mensagens: ['ID do produto inválido.'] }, { status: 400 });
    }

    // 2. Verificar autenticação
    const token = getTokenFromRequest(request);
    const payload = await verifyToken(token);
    if (!payload || payload.error) {
      return NextResponse.json({ data: null, mensagens: [payload?.message || 'Token inválido'] }, { status: 401 });
    }

    // 3. Verificar existência do produto (opcional mas recomendado)
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', idNum)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ data: null, mensagens: [`Produto com ID ${idNum} não encontrado.`] }, { status: 404 });
    }

    // 4. Processar Upload
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ data: null, mensagens: ['Nenhum arquivo enviado ou campo "file" ausente.'] }, { status: 400 });
    }

    // Validar tipo (PNG)
    if (!file.type.includes('png') && !file.name.toLowerCase().endsWith('.png')) {
      return NextResponse.json({ data: null, mensagens: ['Apenas arquivos PNG são permitidos para imagem do produto.'] }, { status: 400 });
    }

    // Validar tamanho (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        data: null, 
        mensagens: [`Arquivo muito grande. Tamanho máximo permitido: 2MB. Tamanho atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`] 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Caminho destino
    const productDir = path.join(UPLOAD_DIR, id.toString());
    await ensureDir(productDir);
    const filePath = path.join(productDir, 'image.png');

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      data: {
        filename: 'image.png',
        size: file.size,
        mimetype: file.type,
        productId: idNum,
        url: `/api/v1/products/${id}/image`
      },
      mensagens: ['Upload da imagem realizado com sucesso!']
    });

  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    return NextResponse.json({ data: null, mensagens: ['Erro interno ao processar upload.'] }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/v1/products/{id}/image:
 *   get:
 *     summary: Realiza o download da imagem PNG do produto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Arquivo de imagem
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Imagem não encontrada
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const filePath = path.join(UPLOAD_DIR, id.toString(), 'image.png');

    if (!existsSync(filePath)) {
      return NextResponse.json({ data: null, mensagens: ['Imagem não encontrada para este produto. Realize o upload primeiro.'] }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="product-image-${id}.png"`,
      },
    });

  } catch (error) {
    console.error('Erro no download de imagem:', error);
    return NextResponse.json({ data: null, mensagens: ['Erro ao buscar imagem.'] }, { status: 500 });
  }
}
