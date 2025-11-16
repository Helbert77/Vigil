-- Adicionar coluna views_count na tabela ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Função para incrementar views_count de anúncios
CREATE OR REPLACE FUNCTION increment_ad_views(ad_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.ads 
  SET views_count = views_count + 1 
  WHERE id = ad_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

