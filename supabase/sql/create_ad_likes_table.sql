-- Tabela para likes de anúncios (equivalente a post_likes)
CREATE TABLE IF NOT EXISTS public.ad_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ad_likes_user_id ON public.ad_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_likes_ad_id ON public.ad_likes(ad_id);

-- RLS
ALTER TABLE public.ad_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_likes_select" ON public.ad_likes FOR SELECT USING (true);
CREATE POLICY "ad_likes_insert" ON public.ad_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ad_likes_delete" ON public.ad_likes FOR DELETE USING (auth.uid() = user_id);

-- Adicionar coluna likes_count na tabela ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- Função para incrementar likes_count
CREATE OR REPLACE FUNCTION increment_ad_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ads SET likes_count = likes_count + 1 WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para decrementar likes_count
CREATE OR REPLACE FUNCTION decrement_ad_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ads SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.ad_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_increment_ad_likes ON public.ad_likes;
CREATE TRIGGER trigger_increment_ad_likes
  AFTER INSERT ON public.ad_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_ad_likes();

DROP TRIGGER IF EXISTS trigger_decrement_ad_likes ON public.ad_likes;
CREATE TRIGGER trigger_decrement_ad_likes
  AFTER DELETE ON public.ad_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_ad_likes();

