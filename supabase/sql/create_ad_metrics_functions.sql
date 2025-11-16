-- =====================================================
-- FUNÇÕES SQL PARA AGREGAR MÉTRICAS DE ANÚNCIOS
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
  -- Calcular data de início
  v_start_date := NOW() - (p_days_interval || ' days')::INTERVAL;
  
  -- Agregar todas as métricas
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

-- Adicionar coluna budget na tabela ads se não existir
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS budget NUMERIC DEFAULT 0;

-- Comentário nas funções
COMMENT ON FUNCTION get_user_ad_metrics IS 'Retorna métricas agregadas de todos os anúncios de um usuário';
COMMENT ON FUNCTION get_daily_ad_metrics IS 'Retorna métricas diárias para gráficos';
COMMENT ON FUNCTION get_ads_performance IS 'Retorna performance individual de cada anúncio';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

