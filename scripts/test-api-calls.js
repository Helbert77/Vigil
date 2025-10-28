import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = "https://oprqgllsqtfdyjgvgovo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para testar se uma tabela existe
async function testTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST205') {
        return { exists: false, error: 'Table not found' };
      } else if (error.code === 'PGRST116') {
        return { exists: true, error: 'Column issue', details: error.message };
      } else {
        return { exists: 'unknown', error: error.message };
      }
    }
    
    return { exists: true, error: null };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

// Função para testar se uma coluna existe em uma tabela
async function testColumnExists(tableName, columnName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('column')) {
        return { exists: false, error: 'Column not found' };
      } else if (error.code === 'PGRST205') {
        return { exists: false, error: 'Table not found' };
      } else {
        return { exists: 'unknown', error: error.message };
      }
    }
    
    return { exists: true, error: null };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

// Função principal de teste
async function runApiTests() {
  console.log('🧪 Iniciando testes de API...\n');

  // Teste 1: Verificar tabelas principais
  console.log('📋 Teste 1: Verificando existência de tabelas');
  const tables = ['posts', 'comments', 'profiles', 'reports', 'account_deletion_requests'];
  
  for (const table of tables) {
    const result = await testTableExists(table);
    const status = result.exists === true ? '✅' : result.exists === false ? '❌' : '⚠️';
    console.log(`${status} Tabela '${table}': ${result.exists === true ? 'Existe' : result.error}`);
  }

  console.log('\n📋 Teste 2: Verificando colunas específicas');
  
  // Teste 2: Verificar colunas que causam problemas
  const columnTests = [
    { table: 'comments', column: 'status' },
    { table: 'posts', column: 'status' },
    { table: 'reports', column: 'status' },
    { table: 'account_deletion_requests', column: 'user_id' },
    { table: 'account_deletion_requests', column: 'status' },
    { table: 'account_deletion_requests', column: 'scheduled_deletion_date' }
  ];

  for (const test of columnTests) {
    const result = await testColumnExists(test.table, test.column);
    const status = result.exists === true ? '✅' : result.exists === false ? '❌' : '⚠️';
    console.log(`${status} Coluna '${test.table}.${test.column}': ${result.exists === true ? 'Existe' : result.error}`);
  }

  console.log('\n📋 Teste 3: Testando consultas específicas que causaram erro');
  
  // Teste 3: Testar consultas específicas
  const testUserId = '7ab8c39c-1d29-40fe-a278-3b40654510c9';
  
  // Teste da consulta de account_deletion_requests
  try {
    const { data, error } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', testUserId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.log(`❌ Consulta account_deletion_requests: ${error.code} - ${error.message}`);
    } else {
      console.log(`✅ Consulta account_deletion_requests: Sucesso (${data?.length || 0} registros)`);
    }
  } catch (error) {
    console.log(`❌ Consulta account_deletion_requests: Erro inesperado - ${error.message}`);
  }

  // Teste da consulta de comments com status
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('id')
      .eq('user_id', testUserId)
      .eq('status', 'pending');
    
    if (error) {
      console.log(`❌ Consulta comments com status: ${error.code} - ${error.message}`);
    } else {
      console.log(`✅ Consulta comments com status: Sucesso (${data?.length || 0} registros)`);
    }
  } catch (error) {
    console.log(`❌ Consulta comments com status: Erro inesperado - ${error.message}`);
  }

  // Teste da consulta de comments sem status (alternativa)
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('id, created_at')
      .eq('user_id', testUserId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (error) {
      console.log(`❌ Consulta comments recentes: ${error.code} - ${error.message}`);
    } else {
      console.log(`✅ Consulta comments recentes: Sucesso (${data?.length || 0} registros)`);
    }
  } catch (error) {
    console.log(`❌ Consulta comments recentes: Erro inesperado - ${error.message}`);
  }

  console.log('\n📋 Teste 4: Verificando autenticação');
  
  // Teste 4: Verificar se conseguimos obter informações do usuário
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log(`⚠️  Autenticação: ${error.message} (esperado em ambiente de teste)`);
    } else if (user) {
      console.log(`✅ Autenticação: Usuário logado (${user.id})`);
    } else {
      console.log(`⚠️  Autenticação: Nenhum usuário logado (esperado em ambiente de teste)`);
    }
  } catch (error) {
    console.log(`❌ Autenticação: Erro inesperado - ${error.message}`);
  }

  console.log('\n🎯 Resumo dos Testes:');
  console.log('- Se account_deletion_requests não existe: Execute o script apply-migration.js');
  console.log('- Se comments.status não existe: Isso é normal, a função getPendingOperationsSafe foi criada para contornar isso');
  console.log('- Se posts.status não existe: Isso é normal, posts não têm status de pending');
  console.log('- Erros de autenticação são esperados em ambiente de teste sem login');
  
  console.log('\n✅ Testes concluídos!');
}

// Executar os testes
runApiTests().catch(console.error);