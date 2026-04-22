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
 * /api/v1/products/{id}/pdf:
 *   post:
 *     summary: Realiza o upload de um arquivo PDF (manual/especificações) para o produto
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
 *                 description: Arquivo PDF
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

    // 3. Verificar existência do produto
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

    // Validar tipo (PDF)
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ data: null, mensagens: ['Apenas arquivos PDF são permitidos para documentos do produto.'] }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Caminho destino
    const productDir = path.join(UPLOAD_DIR, id.toString());
    await ensureDir(productDir);
    const filePath = path.join(productDir, 'manual.pdf');

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      data: {
        filename: 'manual.pdf',
        size: file.size,
        mimetype: file.type,
        productId: idNum,
        url: `/api/v1/products/${id}/pdf`
      },
      mensagens: ['Upload do PDF realizado com sucesso!']
    });

  } catch (error) {
    console.error('Erro no upload de PDF:', error);
    return NextResponse.json({ data: null, mensagens: ['Erro interno ao processar upload.'] }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/v1/products/{id}/pdf:
 *   get:
 *     summary: Realiza o download do PDF do produto
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
 *         description: Arquivo PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: PDF não encontrado
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const filePath = path.join(UPLOAD_DIR, id.toString(), 'manual.pdf');

    if (!existsSync(filePath)) {
      return NextResponse.json({ data: null, mensagens: ['PDF não encontrado para este produto. Realize o upload primeiro.'] }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="product-manual-${id}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Erro no download de PDF:', error);
    return NextResponse.json({ data: null, mensagens: ['Erro ao buscar PDF.'] }, { status: 500 });
  }
}
