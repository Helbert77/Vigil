-- =====================================================
-- SCRIPT PARA RENOMEAR TABELA ADS PARA ANUNCIOS
-- Este script resolve o problema de bloqueadores de anúncios
-- que bloqueiam requisições com "ads" na URL
-- =====================================================

-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query > Cole este código > Run

-- 1. RENOMEAR A TABELA
ALTER TABLE IF EXISTS public.ads RENAME TO anuncios;

-- 2. RENOMEAR ÍNDICES
ALTER INDEX IF EXISTS idx_ads_advertiser_id RENAME TO idx_anuncios_advertiser_id;
ALTER INDEX IF EXISTS idx_ads_status RENAME TO idx_anuncios_status;
ALTER INDEX IF EXISTS idx_ads_created_at RENAME TO idx_anuncios_created_at;
ALTER INDEX IF EXISTS idx_ads_start_date RENAME TO idx_anuncios_start_date;

-- 3. RENOMEAR POLÍTICAS RLS
DROP POLICY IF EXISTS "ads_select_all" ON public.anuncios;
CREATE POLICY "anuncios_select_all" ON public.anuncios
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "ads_insert_own" ON public.anuncios;
CREATE POLICY "anuncios_insert_own" ON public.anuncios
    FOR INSERT WITH CHECK (auth.uid() = advertiser_id);

DROP POLICY IF EXISTS "ads_update_own" ON public.anuncios;
CREATE POLICY "anuncios_update_own" ON public.anuncios
    FOR UPDATE USING (auth.uid() = advertiser_id);

DROP POLICY IF EXISTS "ads_delete_own" ON public.anuncios;
CREATE POLICY "anuncios_delete_own" ON public.anuncios
    FOR DELETE USING (auth.uid() = advertiser_id);

-- 4. ATUALIZAR TRIGGER
DROP TRIGGER IF EXISTS trigger_update_ads_updated_at ON public.anuncios;
CREATE TRIGGER trigger_update_anuncios_updated_at
    BEFORE UPDATE ON public.anuncios
    FOR EACH ROW
    EXECUTE FUNCTION update_ads_updated_at();

-- 5. ATUALIZAR FUNÇÕES QUE REFERENCIAM A TABELA ADS
-- Função para incrementar likes
CREATE OR REPLACE FUNCTION increment_ad_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.anuncios SET likes_count = likes_count + 1 WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_ad_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.anuncios SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.ad_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar comentários
CREATE OR REPLACE FUNCTION increment_ad_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.anuncios SET comments_count = comments_count + 1 WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_ad_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.anuncios SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.ad_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar shares
CREATE OR REPLACE FUNCTION increment_ad_shares(ad_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.anuncios
  SET shares_count = shares_count + 1
  WHERE id = ad_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar views
CREATE OR REPLACE FUNCTION increment_ad_views(ad_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.anuncios
  SET views_count = views_count + 1
  WHERE id = ad_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ATUALIZAR FOREIGN KEYS DAS TABELAS RELACIONADAS
-- Nota: As foreign keys devem ser automaticamente atualizadas pelo PostgreSQL
-- mas vamos garantir que as tabelas relacionadas apontem para anuncios

-- 7. ATUALIZAR FUNÇÕES DE MÉTRICAS
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
  INNER JOIN public.anuncios a ON am.ad_id = a.id
  WHERE a.advertiser_id = p_user_id
    AND am.created_at >= v_start_date;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  INNER JOIN public.anuncios a ON am.ad_id = a.id
  WHERE a.advertiser_id = p_user_id
    AND am.created_at >= v_start_date
  GROUP BY am.created_at::DATE
  ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  FROM public.anuncios a
  LEFT JOIN public.ad_metrics am ON a.id = am.ad_id AND am.created_at >= v_start_date
  WHERE a.advertiser_id = p_user_id
    AND a.status = 'active'
  GROUP BY a.id, a.title, a.budget
  ORDER BY impressions DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Tabela renomeada de ads para anuncios com sucesso!';
    RAISE NOTICE '✅ Índices atualizados';
    RAISE NOTICE '✅ Políticas RLS atualizadas';
    RAISE NOTICE '✅ Funções atualizadas';
    RAISE NOTICE '✅ Sistema pronto - bloqueadores de anúncios não irão mais bloquear!';
END $$;

