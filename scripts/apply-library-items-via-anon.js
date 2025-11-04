import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Usa a anon key pública do projeto; a função exec_sql deve ser SECURITY DEFINER
const SUPABASE_URL = "https://oprqgllsqtfdyjgvgovo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyLibraryItemsViaAnon() {
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20241104120000_create_library_items.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📚 Aplicando criação de library_items via RPC exec_sql (anon) ...');

  const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
  if (error) {
    console.error('❌ Erro RPC exec_sql:', error);
    process.exit(1);
  }

  console.log('✅ SQL aplicado. Verificando tabela...');
  const { data, error: checkError } = await supabase.from('library_items').select('*').limit(1);
  if (checkError) {
    console.error('❌ Erro ao verificar library_items:', checkError);
    process.exit(1);
  }
  console.log('✅ Tabela library_items acessível. Resultado de verificação:', data);
}

applyLibraryItemsViaAnon().catch((err) => {
  console.error('❌ Erro inesperado:', err);
  process.exit(1);
});