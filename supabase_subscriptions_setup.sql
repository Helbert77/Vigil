-- ============================================================
-- CONFIGURAÇÃO COMPLETA DA TABELA SUBSCRIPTIONS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Criar extensão para UUID (se não existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar tabela subscriptions (se não existir)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro', 'premium')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annually')),
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    promotional_price BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Adicionar colunas se a tabela já existir (idempotente)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='billing_cycle') THEN
        ALTER TABLE subscriptions ADD COLUMN billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annually'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='current_period_start') THEN
        ALTER TABLE subscriptions ADD COLUMN current_period_start TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='current_period_end') THEN
        ALTER TABLE subscriptions ADD COLUMN current_period_end TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='trial_ends_at') THEN
        ALTER TABLE subscriptions ADD COLUMN trial_ends_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='stripe_customer_id') THEN
        ALTER TABLE subscriptions ADD COLUMN stripe_customer_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='stripe_subscription_id') THEN
        ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='promotional_price') THEN
        ALTER TABLE subscriptions ADD COLUMN promotional_price BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='updated_at') THEN
        ALTER TABLE subscriptions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_ends ON subscriptions(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);

-- 5. Habilitar RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. Remover políticas antigas (se existirem)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'subscriptions') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON subscriptions', pol.policyname);
    END LOOP;
END $$;

-- 7. Criar políticas RLS corretas
-- Política para SELECT: usuários podem ver apenas suas próprias subscriptions
CREATE POLICY subscriptions_select_own ON subscriptions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Política para INSERT: usuários podem criar apenas suas próprias subscriptions
CREATE POLICY subscriptions_insert_own ON subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuários podem atualizar apenas suas próprias subscriptions
CREATE POLICY subscriptions_update_own ON subscriptions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para DELETE: usuários podem deletar apenas suas próprias subscriptions
CREATE POLICY subscriptions_delete_own ON subscriptions
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 8. Criar função para calcular fim do período
CREATE OR REPLACE FUNCTION calculate_period_end(
    start_date TIMESTAMPTZ,
    cycle TEXT
) RETURNS TIMESTAMPTZ AS $$
BEGIN
    RETURN CASE cycle
        WHEN 'monthly' THEN start_date + INTERVAL '1 month'
        WHEN 'annually' THEN start_date + INTERVAL '1 year'
        ELSE start_date + INTERVAL '1 month'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 9. Criar função trigger para updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Criar trigger
DROP TRIGGER IF EXISTS set_updated_at ON subscriptions;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- 11. Garantir permissões
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO authenticated;

-- 12. Verificação final
SELECT 
    'Tabela subscriptions configurada com sucesso!' as message,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'subscriptions';

