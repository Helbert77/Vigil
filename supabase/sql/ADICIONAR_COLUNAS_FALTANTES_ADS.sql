-- =====================================================
-- ADICIONAR COLUNAS FALTANTES NA TABELA ADS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Adicionar coluna advertiser_id se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ads' 
        AND column_name = 'advertiser_id'
    ) THEN
        ALTER TABLE public.ads ADD COLUMN advertiser_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Coluna advertiser_id adicionada';
    ELSE
        RAISE NOTICE '⚠️ Coluna advertiser_id já existe';
    END IF;
END $$;

-- Adicionar coluna advertiser_name se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ads' 
        AND column_name = 'advertiser_name'
    ) THEN
        ALTER TABLE public.ads ADD COLUMN advertiser_name TEXT;
        RAISE NOTICE '✅ Coluna advertiser_name adicionada';
    ELSE
        RAISE NOTICE '⚠️ Coluna advertiser_name já existe';
    END IF;
END $$;

-- Adicionar coluna advertiser_avatar se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ads' 
        AND column_name = 'advertiser_avatar'
    ) THEN
        ALTER TABLE public.ads ADD COLUMN advertiser_avatar TEXT;
        RAISE NOTICE '✅ Coluna advertiser_avatar adicionada';
    ELSE
        RAISE NOTICE '⚠️ Coluna advertiser_avatar já existe';
    END IF;
END $$;

-- Adicionar coluna budget se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ads' 
        AND column_name = 'budget'
    ) THEN
        ALTER TABLE public.ads ADD COLUMN budget NUMERIC DEFAULT 0;
        RAISE NOTICE '✅ Coluna budget adicionada';
    ELSE
        RAISE NOTICE '⚠️ Coluna budget já existe';
    END IF;
END $$;

-- Adicionar coluna updated_at se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ads' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.ads ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE '✅ Coluna updated_at adicionada';
    ELSE
        RAISE NOTICE '⚠️ Coluna updated_at já existe';
    END IF;
END $$;

-- Criar índice para advertiser_id
CREATE INDEX IF NOT EXISTS idx_ads_advertiser_id ON public.ads(advertiser_id);

-- Atualizar RLS policies
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT (todos podem ver)
DROP POLICY IF EXISTS "ads_select_all" ON public.ads;
CREATE POLICY "ads_select_all" ON public.ads
    FOR SELECT USING (true);

-- Policy para INSERT (apenas o próprio usuário)
DROP POLICY IF EXISTS "ads_insert_own" ON public.ads;
CREATE POLICY "ads_insert_own" ON public.ads
    FOR INSERT WITH CHECK (auth.uid() = advertiser_id);

-- Policy para UPDATE (apenas o próprio usuário)
DROP POLICY IF EXISTS "ads_update_own" ON public.ads;
CREATE POLICY "ads_update_own" ON public.ads
    FOR UPDATE USING (auth.uid() = advertiser_id);

-- Policy para DELETE (apenas o próprio usuário)
DROP POLICY IF EXISTS "ads_delete_own" ON public.ads;
CREATE POLICY "ads_delete_own" ON public.ads
    FOR DELETE USING (auth.uid() = advertiser_id);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_ads_updated_at ON public.ads;
CREATE TRIGGER trigger_update_ads_updated_at
    BEFORE UPDATE ON public.ads
    FOR EACH ROW
    EXECUTE FUNCTION update_ads_updated_at();

-- =====================================================
-- CRIAR FUNÇÕES DE MÉTRICAS
-- =====================================================

-- Função para buscar métricas agregadas de um usuário
CREATE OR REPLACE FUNCTION get_user_ad_metrics(
  p_user_id UUID,
  p_days_interval INTEGER DEFAULT 7
)
RETURNS JSON AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_result JSON;
BEGIN
  v_start_date := NOW() - (p_days_interval || ' days')::INTERVAL;
  
  SELECT json_build_object(
    'total_impressions', COALESCE(SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END), 0),
    'total_clicks', COALESCE(SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END), 0),
    'total_likes', COALESCE(SUM(CASE WHEN event_type = 'like' THEN 1 ELSE 0 END), 0),
    'total_shares', COALESCE(SUM(CASE WHEN event_type = 'share' THEN 1 ELSE 0 END), 0),
    'total_saves', COALESCE(SUM(CASE WHEN event_type = 'save' THEN 1 ELSE 0 END), 0),
    'total_engagement', COALESCE(
      SUM(CASE WHEN event_type IN ('like', 'share', 'save') THEN 1 ELSE 0 END), 
      0
    ),
    'ctr', CASE 
      WHEN SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END) > 0 
      THEN ROUND(
        (SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END)::NUMERIC / 
         SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END)::NUMERIC) * 100, 
        2
      )
      ELSE 0 
    END,
    'engagement_rate', CASE 
      WHEN SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END) > 0 
      THEN ROUND(
        (SUM(CASE WHEN event_type IN ('like', 'share', 'save') THEN 1 ELSE 0 END)::NUMERIC / 
         SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END)::NUMERIC) * 100, 
        2
      )
      ELSE 0 
    END
  ) INTO v_result
  FROM public.ad_metrics am
  INNER JOIN public.ads a ON am.ad_id = a.id
  WHERE a.advertiser_id = p_user_id
    AND am.created_at >= v_start_date;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar métricas diárias
CREATE OR REPLACE FUNCTION get_daily_ad_metrics(
  p_user_id UUID,
  p_days_interval INTEGER DEFAULT 7
)
RETURNS TABLE (
  date DATE,
  impressions BIGINT,
  clicks BIGINT,
  engagement BIGINT
) AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
BEGIN
  v_start_date := NOW() - (p_days_interval || ' days')::INTERVAL;
  
  RETURN QUERY
  SELECT 
    am.created_at::DATE as date,
    COUNT(*) FILTER (WHERE am.event_type = 'impression') as impressions,
    COUNT(*) FILTER (WHERE am.event_type = 'click') as clicks,
    COUNT(*) FILTER (WHERE am.event_type IN ('like', 'share', 'save')) as engagement
  FROM public.ad_metrics am
  INNER JOIN public.ads a ON am.ad_id = a.id
  WHERE a.advertiser_id = p_user_id
    AND am.created_at >= v_start_date
  GROUP BY am.created_at::DATE
  ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar performance por anúncio
CREATE OR REPLACE FUNCTION get_ads_performance(
  p_user_id UUID,
  p_days_interval INTEGER DEFAULT 7
)
RETURNS TABLE (
  ad_id UUID,
  ad_title TEXT,
  impressions BIGINT,
  clicks BIGINT,
  engagement BIGINT,
  ctr NUMERIC,
  cost NUMERIC,
  cpc NUMERIC
) AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
BEGIN
  v_start_date := NOW() - (p_days_interval || ' days')::INTERVAL;
  
  RETURN QUERY
  SELECT 
    a.id as ad_id,
    a.title as ad_title,
    COUNT(*) FILTER (WHERE am.event_type = 'impression') as impressions,
    COUNT(*) FILTER (WHERE am.event_type = 'click') as clicks,
    COUNT(*) FILTER (WHERE am.event_type IN ('like', 'share', 'save')) as engagement,
    CASE 
      WHEN COUNT(*) FILTER (WHERE am.event_type = 'impression') > 0 
      THEN ROUND(
        (COUNT(*) FILTER (WHERE am.event_type = 'click')::NUMERIC / 
         COUNT(*) FILTER (WHERE am.event_type = 'impression')::NUMERIC) * 100, 
        2
      )
      ELSE 0 
    END as ctr,
    COALESCE(a.budget, 0) as cost,
    CASE 
      WHEN COUNT(*) FILTER (WHERE am.event_type = 'click') > 0 
      THEN ROUND(
        COALESCE(a.budget, 0)::NUMERIC / 
        COUNT(*) FILTER (WHERE am.event_type = 'click')::NUMERIC, 
        2
      )
      ELSE 0 
    END as cpc
  FROM public.ads a
  LEFT JOIN public.ad_metrics am ON a.id = am.ad_id AND am.created_at >= v_start_date
  WHERE a.advertiser_id = p_user_id
    AND a.status = 'active'
  GROUP BY a.id, a.title, a.budget
  ORDER BY impressions DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Colunas adicionadas com sucesso!';
    RAISE NOTICE '✅ Índices criados';
    RAISE NOTICE '✅ RLS policies configuradas';
    RAISE NOTICE '✅ Funções de métricas criadas';
    RAISE NOTICE '✅ Sistema pronto para uso!';
END $$;

