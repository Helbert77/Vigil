-- Tabela para comentários em anúncios
CREATE TABLE IF NOT EXISTS public.ad_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ad_comments_ad_id ON public.ad_comments(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_comments_user_id ON public.ad_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_comments_created_at ON public.ad_comments(created_at DESC);

-- RLS
ALTER TABLE public.ad_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_comments_select" ON public.ad_comments FOR SELECT USING (true);
CREATE POLICY "ad_comments_insert" ON public.ad_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ad_comments_update" ON public.ad_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ad_comments_delete" ON public.ad_comments FOR DELETE USING (auth.uid() = user_id);

-- Adicionar coluna comments_count na tabela ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Função para incrementar comments_count
CREATE OR REPLACE FUNCTION increment_ad_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ads SET comments_count = comments_count + 1 WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para decrementar comments_count
CREATE OR REPLACE FUNCTION decrement_ad_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ads SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.ad_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_increment_ad_comments ON public.ad_comments;
CREATE TRIGGER trigger_increment_ad_comments
  AFTER INSERT ON public.ad_comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_ad_comments();

DROP TRIGGER IF EXISTS trigger_decrement_ad_comments ON public.ad_comments;
CREATE TRIGGER trigger_decrement_ad_comments
  AFTER DELETE ON public.ad_comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_ad_comments();

