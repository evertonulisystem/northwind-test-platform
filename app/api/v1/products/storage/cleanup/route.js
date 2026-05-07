import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * @swagger
 * /api/v1/products/storage/cleanup:
 *   delete:
 *     summary: Apaga todos os arquivos de produtos (Cuidado!)
 *     description: Rota administrativa para limpeza de arquivos. Requer chave especial.
 *     tags: [Products]
 *     parameters:
 *       - in: header
 *         name: x-admin-key
 *         required: true
 *         schema:
 *           type: string
 *         description: Chave secreta do professor
 *     responses:
 *       200:
 *         description: Arquivos apagados
 *       403:
 *         description: Chave inválida
 */
export async function DELETE(request) {
  try {
    // 1. Proteção de Acesso (Só o dono da chave pode rodar isso)
    const adminKey = request.headers.get('x-admin-key');
    
    // Você pode colocar a senha que quiser aqui, ou usar a variável de ambiente.
    // Ex: no ThunderClient, envie o Header: x-admin-key: senha-secreta-do-everton
    const expectedKey = process.env.ADMIN_CLEANUP_KEY || 'senha-secreta-do-everton';

    if (!adminKey || adminKey !== expectedKey) {
      return NextResponse.json({ 
        data: null, 
        mensagens: ['Acesso negado. Você não tem permissão para limpar o storage. Passe a chave correta no header "x-admin-key".'] 
      }, { status: 403 });
    }

    const isVercel = !!process.env.VERCEL;

    if (isVercel) {
      // Na Vercel: Esvazia o bucket inteiro no Supabase usando API nativa do Supabase
      const { data, error } = await supabase.storage.emptyBucket('products');

      if (error) {
        console.error('Supabase emptyBucket error:', error);
        return NextResponse.json({ 
          data: null, 
          mensagens: [
            'Erro ao limpar o bucket no Supabase.', 
            error.message || JSON.stringify(error),
            'DICA: O seu usuário do Supabase precisa ter permissão de DELETE no bucket (Policies).'
          ] 
        }, { status: 500 });
      }

      return NextResponse.json({
        data: { origin: 'supabase' },
        mensagens: ['FAXINA CONCLUÍDA: Todos os arquivos do bucket "products" na nuvem foram apagados!']
      });

    } else {
      // No Localhost: Apaga a pasta física inteira
      const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads', 'products');
      
      try {
        await fs.rm(UPLOAD_DIR, { recursive: true, force: true });
      } catch (err) {
        // Se a pasta já não existir, ignora
        if (err.code !== 'ENOENT') throw err;
      }

      return NextResponse.json({
        data: { origin: 'localhost' },
        mensagens: ['FAXINA CONCLUÍDA: Todos os arquivos locais da pasta products foram apagados!']
      });
    }

  } catch (error) {
    console.error('Erro no cleanup:', error);
    return NextResponse.json({ data: null, mensagens: ['Erro interno ao executar a faxina.', error.message || String(error)] }, { status: 500 });
  }
}
