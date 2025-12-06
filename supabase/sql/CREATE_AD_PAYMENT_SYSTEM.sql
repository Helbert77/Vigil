-- ============================================
-- SISTEMA DE ANÚNCIOS PAGOS - VIGIL
-- ============================================
-- Este script cria toda a estrutura necessária para o sistema de anúncios pagos
-- incluindo pacotes, créditos, aprovações e monitoramento

-- ============================================
-- 1. ADICIONAR COLUNAS NA TABELA ANUNCIOS
-- ============================================

ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'free' CHECK (payment_type IN ('free', 'package', 'cpm', 'credits'));
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS package_type VARCHAR(20) CHECK (package_type IN ('bronze', 'silver', 'gold', 'platinum') OR package_type IS NULL);
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2);
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS spent DECIMAL(10,2) DEFAULT 0;
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS cpm_rate DECIMAL(10,2) DEFAULT 8.00;
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS max_impressions INTEGER;
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS approval_status VARCHAR(30) DEFAULT 'pending_approval' CHECK (approval_status IN ('pending_approval', 'approved', 'rejected'));
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS completion_reason VARCHAR(30) CHECK (completion_reason IN ('duration_ended', 'budget_exhausted', 'impressions_reached', 'manual_pause') OR completion_reason IS NULL);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_anuncios_payment_status ON anuncios(payment_status);
CREATE INDEX IF NOT EXISTS idx_anuncios_approval_status ON anuncios(approval_status);
CREATE INDEX IF NOT EXISTS idx_anuncios_package_type ON anuncios(package_type);
CREATE INDEX IF NOT EXISTS idx_anuncios_approved_by ON anuncios(approved_by);
CREATE INDEX IF NOT EXISTS idx_anuncios_stripe_session_id ON anuncios(stripe_session_id);

-- ============================================
-- 2. CRIAR TABELA AD_PACKAGES
-- ============================================

CREATE TABLE IF NOT EXISTS ad_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL CHECK (name IN ('bronze', 'silver', 'gold', 'platinum')),
  display_name VARCHAR(50) NOT NULL,
  duration_days INTEGER NOT NULL,
  max_impressions INTEGER NOT NULL,
  price_eur DECIMAL(10,2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  stripe_price_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ad_packages_name ON ad_packages(name);
CREATE INDEX IF NOT EXISTS idx_ad_packages_is_active ON ad_packages(is_active);

-- ============================================
-- 3. CRIAR TABELA USER_AD_CREDITS
-- ============================================

CREATE TABLE IF NOT EXISTS user_ad_credits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0 CHECK (balance >= 0),
  total_purchased DECIMAL(10,2) DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_ad_credits_user_id ON user_ad_credits(user_id);

-- ============================================
-- 4. CRIAR TABELA AD_CREDIT_TRANSACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS ad_credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES anuncios(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'refund')),
  stripe_payment_intent_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ad_credit_transactions_user_id ON ad_credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_credit_transactions_ad_id ON ad_credit_transactions(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_credit_transactions_created_at ON ad_credit_transactions(created_at DESC);

-- ============================================
-- 5. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE ad_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ad_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_credit_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5.1 POLÍTICAS PARA AD_PACKAGES
-- ============================================

-- Todos podem ler pacotes ativos
DROP POLICY IF EXISTS "ad_packages_select_public" ON ad_packages;
CREATE POLICY "ad_packages_select_public" ON ad_packages
  FOR SELECT
  USING (is_active = true);

-- Apenas admins podem inserir/atualizar/deletar
DROP POLICY IF EXISTS "ad_packages_admin_all" ON ad_packages;
CREATE POLICY "ad_packages_admin_all" ON ad_packages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin')
    )
  );

-- ============================================
-- 5.2 POLÍTICAS PARA USER_AD_CREDITS
-- ============================================

-- Usuários podem ver apenas seus próprios créditos
DROP POLICY IF EXISTS "user_ad_credits_select_own" ON user_ad_credits;
CREATE POLICY "user_ad_credits_select_own" ON user_ad_credits
  FOR SELECT
  USING (user_id = auth.uid());

-- Sistema pode inserir/atualizar (via service_role)
-- Usuários não podem modificar diretamente seus créditos

-- ============================================
-- 5.3 POLÍTICAS PARA AD_CREDIT_TRANSACTIONS
-- ============================================

-- Usuários podem ver apenas suas próprias transações
DROP POLICY IF EXISTS "ad_credit_transactions_select_own" ON ad_credit_transactions;
CREATE POLICY "ad_credit_transactions_select_own" ON ad_credit_transactions
  FOR SELECT
  USING (user_id = auth.uid());

-- Sistema pode inserir (via service_role)
-- Usuários não podem modificar transações

-- ============================================
-- 5.4 ATUALIZAR POLÍTICAS DA TABELA ANUNCIOS
-- ============================================

-- Usuários podem ver seus próprios anúncios (qualquer status)
DROP POLICY IF EXISTS "anuncios_select_own" ON anuncios;
CREATE POLICY "anuncios_select_own" ON anuncios
  FOR SELECT
  USING (advertiser_id = auth.uid());

-- Admins e moderadores podem ver anúncios pendentes de aprovação
DROP POLICY IF EXISTS "anuncios_select_pending_admin" ON anuncios;
CREATE POLICY "anuncios_select_pending_admin" ON anuncios
  FOR SELECT
  USING (
    approval_status = 'pending_approval'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Todos podem ver anúncios aprovados e ativos (mantém a política existente)
DROP POLICY IF EXISTS "anuncios_select_active_approved" ON anuncios;
CREATE POLICY "anuncios_select_active_approved" ON anuncios
  FOR SELECT
  USING (status = 'active' AND approval_status = 'approved');

-- Usuários podem atualizar apenas seus próprios anúncios (mantém a política existente)
-- Mas não podem modificar approval_status, approved_by, approved_at

-- Admins e moderadores podem atualizar approval_status
DROP POLICY IF EXISTS "anuncios_update_approval_admin" ON anuncios;
CREATE POLICY "anuncios_update_approval_admin" ON anuncios
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- ============================================
-- 6. INSERIR PACOTES PADRÃO
-- ============================================

INSERT INTO ad_packages (name, display_name, duration_days, max_impressions, price_eur, features)
VALUES
  (
    'bronze',
    'Bronze',
    7,
    5000,
    9.90,
    '["7 dias de exposição", "5.000 impressões garantidas", "Suporte por email"]'::jsonb
  ),
  (
    'silver',
    'Prata',
    15,
    15000,
    24.90,
    '["15 dias de exposição", "15.000 impressões garantidas", "Destaque em 3 comunidades", "Suporte prioritário"]'::jsonb
  ),
  (
    'gold',
    'Ouro',
    30,
    50000,
    49.90,
    '["30 dias de exposição", "50.000 impressões garantidas", "Destaque em todas as comunidades", "Relatório detalhado", "Suporte prioritário"]'::jsonb
  ),
  (
    'platinum',
    'Platina',
    60,
    150000,
    99.90,
    '["60 dias de exposição", "150.000 impressões garantidas", "Destaque premium", "Pin no topo por 3 dias", "Relatório completo com insights", "Suporte VIP 24/7"]'::jsonb
  )
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  duration_days = EXCLUDED.duration_days,
  max_impressions = EXCLUDED.max_impressions,
  price_eur = EXCLUDED.price_eur,
  features = EXCLUDED.features,
  updated_at = NOW();

-- ============================================
-- 7. FUNÇÕES AUXILIARES
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ad_packages
DROP TRIGGER IF EXISTS update_ad_packages_updated_at ON ad_packages;
CREATE TRIGGER update_ad_packages_updated_at
  BEFORE UPDATE ON ad_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_ad_credits
DROP TRIGGER IF EXISTS update_user_ad_credits_updated_at ON user_ad_credits;
CREATE TRIGGER update_user_ad_credits_updated_at
  BEFORE UPDATE ON user_ad_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. FUNÇÃO PARA VERIFICAR E PAUSAR ANÚNCIOS EXPIRADOS
-- ============================================

CREATE OR REPLACE FUNCTION check_and_pause_expired_ads()
RETURNS void AS $$
BEGIN
  -- Encerrar anúncios que atingiram a data de término
  UPDATE anuncios
  SET 
    status = 'ended',
    completion_reason = 'duration_ended'
  WHERE 
    status IN ('active', 'paused')
    AND approval_status = 'approved'
    AND end_date IS NOT NULL
    AND end_date < NOW()
    AND status != 'ended';

  -- Encerrar anúncios de pacote que atingiram impressões máximas
  UPDATE anuncios
  SET 
    status = 'ended',
    completion_reason = 'impressions_reached'
  WHERE 
    status IN ('active', 'paused')
    AND approval_status = 'approved'
    AND payment_type = 'package'
    AND max_impressions IS NOT NULL
    AND views_count >= max_impressions
    AND status != 'ended';

  -- Encerrar anúncios CPM que esgotaram o orçamento
  UPDATE anuncios
  SET 
    status = 'ended',
    completion_reason = 'budget_exhausted'
  WHERE 
    status IN ('active', 'paused')
    AND approval_status = 'approved'
    AND payment_type = 'cpm'
    AND budget IS NOT NULL
    AND spent >= budget
    AND status != 'ended';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Verificar criação das tabelas
DO $$
BEGIN
  RAISE NOTICE 'Tabelas criadas com sucesso:';
  RAISE NOTICE '- ad_packages';
  RAISE NOTICE '- user_ad_credits';
  RAISE NOTICE '- ad_credit_transactions';
  RAISE NOTICE 'Colunas adicionadas em anuncios';
  RAISE NOTICE 'Políticas RLS configuradas';
  RAISE NOTICE 'Pacotes padrão inseridos';
  RAISE NOTICE '';
  RAISE NOTICE 'Execute este SQL no Supabase SQL Editor';
  RAISE NOTICE 'Depois, configure os produtos no Stripe Dashboard';
END $$;

