-- Tabela para anúncios ocultos pelo usuário
CREATE TABLE IF NOT EXISTS public.hidden_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_hidden_ads_user_id ON public.hidden_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_hidden_ads_ad_id ON public.hidden_ads(ad_id);

-- RLS
ALTER TABLE public.hidden_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hidden_ads_select" ON public.hidden_ads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "hidden_ads_insert" ON public.hidden_ads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "hidden_ads_delete" ON public.hidden_ads FOR DELETE USING (auth.uid() = user_id);

