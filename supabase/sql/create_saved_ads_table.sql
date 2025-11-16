-- Tabela para anúncios salvos (equivalente a saved_posts)
CREATE TABLE IF NOT EXISTS public.saved_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_saved_ads_user_id ON public.saved_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_ads_ad_id ON public.saved_ads(ad_id);

-- RLS
ALTER TABLE public.saved_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_ads_select" ON public.saved_ads FOR SELECT USING (true);
CREATE POLICY "saved_ads_insert" ON public.saved_ads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_ads_delete" ON public.saved_ads FOR DELETE USING (auth.uid() = user_id);

