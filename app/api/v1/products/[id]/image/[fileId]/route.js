import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads', 'products');

/**
 * @swagger
 * /api/v1/products/{id}/image/{fileId}:
 *   get:
 *     summary: Realiza o download de uma imagem PNG específica pelo seu ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do arquivo da imagem
 *     responses:
 *       200:
 *         description: Arquivo de imagem binário
 *       404:
 *         description: Imagem não encontrada
 */
export async function GET(request, { params }) {
  try {
    const { id, fileId } = await params;
    const idNum = parseInt(id, 10);
    const isVercel = !!process.env.VERCEL;

    let targetFileName = null;

    if (isVercel) {
      // Lista os arquivos e procura um que comece com o fileId
      const { data, error } = await supabase.storage.from('products').list(id.toString());
      if (data) {
        const file = data.find(f => f.name.startsWith(`${fileId}_`) && f.name.endsWith('.png'));
        if (file) targetFileName = file.name;
      }

      if (!targetFileName) {
        return NextResponse.json({ data: null, mensagens: ['Imagem não encontrada para este ID.'] }, { status: 404 });
      }

      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('products')
        .download(`${idNum}/${targetFileName}`);

      if (downloadError || !downloadData) {
        return NextResponse.json({ data: null, mensagens: ['Erro ao baixar a imagem do storage.'] }, { status: 404 });
      }

      const fileBuffer = Buffer.from(await downloadData.arrayBuffer());
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${targetFileName}"`,
        },
      });

    } else {
      const productDir = path.join(UPLOAD_DIR, id.toString());
      if (existsSync(productDir)) {
        const files = await fs.readdir(productDir);
        targetFileName = files.find(f => f.startsWith(`${fileId}_`) && f.endsWith('.png'));
      }

      if (!targetFileName) {
        return NextResponse.json({ data: null, mensagens: ['Imagem não encontrada para este ID.'] }, { status: 404 });
      }

      const filePath = path.join(productDir, targetFileName);
      const fileBuffer = await fs.readFile(filePath);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${targetFileName}"`,
        },
      });
    }

  } catch (error) {
    console.error('Erro no download de imagem por ID:', error);
    return NextResponse.json({ data: null, mensagens: ['Erro interno ao buscar a imagem.', error.message || String(error)] }, { status: 500 });
  }
}
