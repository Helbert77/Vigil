import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oprqgllsqtfdyjgvgovo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('🧪 Teste de inserção e exclusão em public.library_items');

  // 1) Inserir item de teste
  const newItem = {
    type: 'document',
    title: `Item de teste ${Date.now()}`,
    author: 'Teste',
    description: 'Item temporário para validar exclusão',
    tags: ['teste'],
  };

  const { data: inserted, error: insertError } = await supabase
    .from('library_items')
    .insert(newItem)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Erro ao inserir item:', insertError.code, insertError.message);
    return;
  }

  console.log('✅ Inserido:', inserted?.id);

  // 2) Excluir o item
  const { data: deleted, error: deleteError } = await supabase
    .from('library_items')
    .delete()
    .eq('id', inserted.id)
    .select('id');

  if (deleteError) {
    console.error('❌ Erro ao excluir item:', deleteError.code, deleteError.message);
    return;
  }

  console.log('✅ Excluído:', deleted?.[0]?.id || '(sem retorno)');
}

run().catch((e) => {
  console.error('Erro inesperado no teste:', e?.message || e);
  process.exit(1);
});