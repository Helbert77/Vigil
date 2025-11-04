import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || "https://oprqgllsqtfdyjgvgovo.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY; // Chave de serviço necessária para operações administrativas

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY não encontrada nas variáveis de ambiente');
  console.log('💡 Para aplicar a migração, você precisa:');
  console.log('1. Obter a chave de serviço do Supabase Dashboard');
  console.log('2. Definir a variável de ambiente: set SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui');
  console.log('3. Executar novamente: node scripts/apply-migration.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  try {
    console.log('🚀 Iniciando aplicação da migração...');
    
    // Lê o arquivo de migração
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240101000000_create_account_deletion_requests.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Arquivo de migração carregado');
    
    // Aplica a migração
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erro ao aplicar migração:', error);
      return;
    }
    
    console.log('✅ Migração aplicada com sucesso!');
    
    // Verifica se a tabela foi criada
    const { data: tableCheck, error: checkError } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('⚠️  Tabela criada, mas ainda não há dados');
    } else if (checkError) {
      console.error('❌ Erro ao verificar tabela:', checkError);
    } else {
      console.log('✅ Tabela account_deletion_requests verificada e funcionando');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Função alternativa usando SQL direto
async function applyMigrationDirect() {
  try {
    console.log('🚀 Aplicando migração usando SQL direto...');
    
    // SQL para criar a tabela
    const createTableSQL = `
      -- Create account_deletion_requests table
      CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          scheduled_deletion_date TIMESTAMP WITH TIME ZONE NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'completed')),
          grace_period_days INTEGER NOT NULL DEFAULT 7,
          reason TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          cancelled_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.error('❌ Erro ao criar tabela:', createError);
      return;
    }
    
    console.log('✅ Tabela criada com sucesso!');
    
    // Criar índices
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_id ON public.account_deletion_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_status ON public.account_deletion_requests(status);
      CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_scheduled_date ON public.account_deletion_requests(scheduled_deletion_date);
    `;
    
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexesSQL });
    
    if (indexError) {
      console.warn('⚠️  Aviso ao criar índices:', indexError);
    } else {
      console.log('✅ Índices criados com sucesso!');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

async function applyLibraryItemsMigration() {
  try {
    console.log('📚 Aplicando migração da tabela library_items...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20241104120000_create_library_items.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    if (error) {
      console.error('❌ Erro ao criar/configurar library_items:', error);
      return;
    }

    console.log('✅ Tabela library_items criada/configurada com sucesso!');

    // Verifica se a tabela está acessível
    const { error: checkError } = await supabase.from('library_items').select('*').limit(1);
    if (checkError && checkError.code === 'PGRST116') {
      console.log('⚠️  Tabela criada, sem dados iniciais.');
    } else if (checkError) {
      console.error('❌ Erro ao verificar library_items:', checkError);
    } else {
      console.log('✅ Tabela library_items verificada e funcionando');
    }
  } catch (error) {
    console.error('❌ Erro inesperado na migração de library_items:', error);
  }
}

console.log('🔧 Script de Aplicação de Migração - Tabelas necessárias');
console.log('📋 Este script criará e configurará tabelas administrativas e de biblioteca');
console.log('');

// Executa as migrações necessárias
await applyMigrationDirect();
await applyLibraryItemsMigration();