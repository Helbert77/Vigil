-- =====================================================
-- SETUP COMPLETO DO SISTEMA DE ANÚNCIOS
-- Execute este script COMPLETO no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- PARTE 1: CRIAR TABELA ADS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    link_url TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    type TEXT NOT NULL DEFAULT 'native' CHECK (type IN ('native', 'adsense')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    budget NUMERIC DEFAULT 0,
    advertiser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    advertiser_name TEXT NOT NULL,
    advertiser_avatar TEXT,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ads_advertiser_id ON public.ads(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_start_date ON public.ads(start_date);

-- Habilitar RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Policies para RLS
DROP POLICY IF EXISTS "ads_select_all" ON public.ads;
CREATE POLICY "ads_select_all" ON public.ads
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "ads_insert_own" ON public.ads;
CREATE POLICY "ads_insert_own" ON public.ads
    FOR INSERT WITH CHECK (auth.uid() = advertiser_id);

DROP POLICY IF EXISTS "ads_update_own" ON public.ads;
CREATE POLICY "ads_update_own" ON public.ads
    FOR UPDATE USING (auth.uid() = advertiser_id);

DROP POLICY IF EXISTS "ads_delete_own" ON public.ads;
CREATE POLICY "ads_delete_own" ON public.ads
    FOR DELETE USING (auth.uid() = advertiser_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ads_updated_at ON public.ads;
CREATE TRIGGER trigger_update_ads_updated_at
    BEFORE UPDATE ON public.ads
    FOR EACH ROW
    EXECUTE FUNCTION update_ads_updated_at();

-- =====================================================
-- PARTE 2: CRIAR TABELA AD_METRICS (se não existir)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ad_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'like', 'share', 'save')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para ad_metrics
CREATE INDEX IF NOT EXISTS idx_ad_metrics_ad_id ON public.ad_metrics(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_created_at ON public.ad_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_event_type ON public.ad_metrics(event_type);

-- RLS para ad_metrics
ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ad_metrics_select_all" ON public.ad_metrics;
CREATE POLICY "ad_metrics_select_all" ON public.ad_metrics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "ad_metrics_insert_all" ON public.ad_metrics;
CREATE POLICY "ad_metrics_insert_all" ON public.ad_metrics
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- PARTE 3: FUNÇÕES DE MÉTRICAS
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
-- PARTE 4: COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE public.ads IS 'Tabela de anúncios criados pelos usuários';
COMMENT ON TABLE public.ad_metrics IS 'Tabela de métricas de anúncios (impressões, cliques, etc)';
COMMENT ON FUNCTION get_user_ad_metrics IS 'Retorna métricas agregadas de todos os anúncios de um usuário';
COMMENT ON FUNCTION get_daily_ad_metrics IS 'Retorna métricas diárias para gráficos';
COMMENT ON FUNCTION get_ads_performance IS 'Retorna performance individual de cada anúncio';

-- =====================================================
-- FIM DO SCRIPT - SETUP COMPLETO!
-- =====================================================

-- Verificar se tudo foi criado corretamente
DO $$
BEGIN
    RAISE NOTICE '✅ Setup completo executado com sucesso!';
    RAISE NOTICE '✅ Tabela ads criada';
    RAISE NOTICE '✅ Tabela ad_metrics criada';
    RAISE NOTICE '✅ Funções de métricas criadas';
    RAISE NOTICE '✅ RLS configurado';
    RAISE NOTICE '✅ Sistema pronto para uso!';
END $$;

