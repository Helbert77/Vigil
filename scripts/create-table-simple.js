import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = "https://oprqgllsqtfdyjgvgovo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTableDirectly() {
  console.log('🔧 Tentando criar a tabela account_deletion_requests...');

  try {
    // Primeiro, vamos tentar uma consulta simples para ver se a tabela existe
    const { data, error } = await supabase
      .from('account_deletion_requests')
      .select('id')
      .limit(1);

    if (!error) {
      console.log('✅ Tabela account_deletion_requests já existe!');
      return;
    }

    if (error.code === 'PGRST205') {
      console.log('❌ Tabela account_deletion_requests não existe');
      console.log('📋 Para criar a tabela, você precisa:');
      console.log('');
      console.log('1. Acessar o Supabase Dashboard: https://supabase.com/dashboard');
      console.log('2. Ir para o seu projeto');
      console.log('3. Navegar para SQL Editor');
      console.log('4. Executar o seguinte SQL:');
      console.log('');
      console.log('-- Criar a tabela account_deletion_requests');
      console.log('CREATE TABLE IF NOT EXISTS public.account_deletion_requests (');
      console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
      console.log('  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,');
      console.log('  scheduled_deletion_date TIMESTAMP WITH TIME ZONE NOT NULL,');
      console.log('  status TEXT NOT NULL DEFAULT \'pending\' CHECK (status IN (\'pending\', \'cancelled\', \'completed\')),');
      console.log('  grace_period_days INTEGER NOT NULL DEFAULT 30,');
      console.log('  reason TEXT,');
      console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('  cancelled_at TIMESTAMP WITH TIME ZONE,');
      console.log('  completed_at TIMESTAMP WITH TIME ZONE');
      console.log(');');
      console.log('');
      console.log('-- Criar índices');
      console.log('CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_id ON public.account_deletion_requests(user_id);');
      console.log('CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_status ON public.account_deletion_requests(status);');
      console.log('CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_scheduled_date ON public.account_deletion_requests(scheduled_deletion_date);');
      console.log('');
      console.log('-- Habilitar RLS');
      console.log('ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;');
      console.log('');
      console.log('-- Políticas de segurança');
      console.log('CREATE POLICY "Users can view own deletion requests" ON public.account_deletion_requests FOR SELECT USING (auth.uid() = user_id);');
      console.log('CREATE POLICY "Users can create own deletion requests" ON public.account_deletion_requests FOR INSERT WITH CHECK (auth.uid() = user_id);');
      console.log('CREATE POLICY "Users can update own deletion requests" ON public.account_deletion_requests FOR UPDATE USING (auth.uid() = user_id);');
      console.log('');
      console.log('-- Trigger para updated_at');
      console.log('CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$');
      console.log('BEGIN');
      console.log('  NEW.updated_at = NOW();');
      console.log('  RETURN NEW;');
      console.log('END;');
      console.log('$$ language \'plpgsql\';');
      console.log('');
      console.log('CREATE TRIGGER update_account_deletion_requests_updated_at BEFORE UPDATE ON public.account_deletion_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();');
      console.log('');
      console.log('🎯 Após executar o SQL acima, execute novamente este script para verificar.');
    } else {
      console.log('❌ Erro inesperado:', error);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
  }
}

// Executar a verificação
createTableDirectly();