// actions/productActions.js
'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar:', error);
    return { success: false };
  }

  revalidatePath('/products');
  return { success: true };
}