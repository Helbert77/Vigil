import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase via chave de serviço
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://oprqgllsqtfdyjgvgovo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada nas variáveis de ambiente');
  console.log('💡 Defina a variável antes de executar:');
  console.log('   PowerShell (sessão): $env:SUPABASE_SERVICE_ROLE_KEY="SUA_CHAVE_AQUI"');
  console.log('   PowerShell (persistente usuário): [Environment]::SetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY","SUA_CHAVE_AQUI","User")');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function ensureBucket(bucketName, options = { public: true }) {
  try {
    console.log(`🔍 Verificando bucket '${bucketName}'...`);
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }

    const exists = (buckets || []).some(b => b.name === bucketName);
    if (exists) {
      console.log(`✅ Bucket '${bucketName}' já existe.`);
      return;
    }

    console.log(`📦 Criando bucket '${bucketName}' (public=${options.public})...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, options);
    if (createError) {
      console.error('❌ Erro ao criar bucket:', createError);
      return;
    }

    console.log(`✅ Bucket '${bucketName}' criado com sucesso.`);
  } catch (err) {
    console.error('❌ Erro inesperado ao garantir bucket:', err);
  }
}

(async () => {
  console.log('🔧 Garantindo bucket de storage necessário...');
  await ensureBucket('library-media', { public: true });
})();