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
 *     summary: Realiza o upload de uma imagem PNG para o produto (gera nome único)
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

    const timestamp = Date.now();
    const safeName = file.name ? file.name.replace(/[^a-zA-Z0-9.\-]/g, '_') : 'image.png';
    const filename = `${timestamp}_${safeName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isVercel = !!process.env.VERCEL;

    if (isVercel) {
      // Usar Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(`${idNum}/${filename}`, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return NextResponse.json({ data: null, mensagens: ['Erro ao fazer upload para o storage na nuvem.', uploadError.message || JSON.stringify(uploadError)] }, { status: 500 });
      }
    } else {
      // Caminho destino local (fallback)
      const productDir = path.join(UPLOAD_DIR, id.toString());
      await ensureDir(productDir);
      const filePath = path.join(productDir, filename);
      await fs.writeFile(filePath, buffer);
    }

    return NextResponse.json({
      data: {
        filename: filename,
        size: file.size,
        mimetype: file.type,
        productId: idNum,
        url: `/api/v1/products/${id}/image?file=${filename}`
      },
      mensagens: ['Upload da imagem realizado com sucesso!']
    });

  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    return NextResponse.json({ data: null, mensagens: ['Erro interno ao processar upload.', error.message || String(error)] }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/v1/products/{id}/image:
 *   get:
 *     summary: Lista as imagens PNG do produto ou realiza o download de uma específica
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: file
 *         required: false
 *         schema:
 *           type: string
 *         description: Nome do arquivo para download. Se omitido, retorna a lista de imagens do produto.
 *     responses:
 *       200:
 *         description: Lista de arquivos (se sem query `file`) ou o arquivo de imagem binário (se com query `file`)
 *       404:
 *         description: Imagem não encontrada
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const idNum = parseInt(id, 10);
    const isVercel = !!process.env.VERCEL;

    // Obter o nome do arquivo pela query string
    const url = new URL(request.url);
    const fileName = url.searchParams.get('file');

    if (!fileName) {
      // Retornar lista de imagens se não especificar o arquivo
      let filesList = [];
      if (isVercel) {
        const { data, error } = await supabase.storage.from('products').list(id.toString());
        if (data) {
          filesList = data.filter(f => f.name.endsWith('.png')).map(f => ({
            filename: f.name,
            url: `/api/v1/products/${id}/image?file=${f.name}`
          }));
        }
      } else {
        const productDir = path.join(UPLOAD_DIR, id.toString());
        if (existsSync(productDir)) {
          const files = await fs.readdir(productDir);
          filesList = files.filter(f => f.endsWith('.png')).map(f => ({
            filename: f,
            url: `/api/v1/products/${id}/image?file=${f}`
          }));
        }
      }
      return NextResponse.json({ data: filesList, mensagens: ['Lista de imagens recuperada com sucesso.'] });
    }

    // Se informou fileName, realiza o download
    const safeFileName = path.basename(fileName); // Evitar path traversal
    let fileBuffer;

    if (isVercel) {
      const { data, error } = await supabase.storage
        .from('products')
        .download(`${idNum}/${safeFileName}`);

      if (error || !data) {
        return NextResponse.json({ data: null, mensagens: ['Imagem não encontrada para este produto.'] }, { status: 404 });
      }
      fileBuffer = Buffer.from(await data.arrayBuffer());
    } else {
      const filePath = path.join(UPLOAD_DIR, id.toString(), safeFileName);

      if (!existsSync(filePath)) {
        return NextResponse.json({ data: null, mensagens: ['Imagem não encontrada para este produto.'] }, { status: 404 });
      }

      fileBuffer = await fs.readFile(filePath);
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${safeFileName}"`,
      },
    });

  } catch (error) {
    console.error('Erro no download/listagem de imagem:', error);
    return NextResponse.json({ data: null, mensagens: ['Erro ao buscar imagem.', error.message || String(error)] }, { status: 500 });
  }
}
