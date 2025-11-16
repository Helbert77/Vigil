-- ========================================
-- SCRIPT COMPLETO: TABELAS DE ANÚNCIOS
-- Execute este arquivo no SQL Editor do Supabase
-- ========================================

-- 1. TABELA DE LIKES DE ANÚNCIOS
CREATE TABLE IF NOT EXISTS public.ad_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

CREATE INDEX IF NOT EXISTS idx_ad_likes_user_id ON public.ad_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_likes_ad_id ON public.ad_likes(ad_id);

ALTER TABLE public.ad_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ad_likes_select" ON public.ad_likes;
CREATE POLICY "ad_likes_select" ON public.ad_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "ad_likes_insert" ON public.ad_likes;
CREATE POLICY "ad_likes_insert" ON public.ad_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ad_likes_delete" ON public.ad_likes;
CREATE POLICY "ad_likes_delete" ON public.ad_likes FOR DELETE USING (auth.uid() = user_id);

-- 2. ADICIONAR COLUNAS DE CONTADORES NA TABELA ADS
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- 3. FUNÇÕES E TRIGGERS PARA LIKES
CREATE OR REPLACE FUNCTION increment_ad_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ads SET likes_count = likes_count + 1 WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_ad_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ads SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.ad_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

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

-- 4. TABELA DE ANÚNCIOS SALVOS
CREATE TABLE IF NOT EXISTS public.saved_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_ads_user_id ON public.saved_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_ads_ad_id ON public.saved_ads(ad_id);

ALTER TABLE public.saved_ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_ads_select" ON public.saved_ads;
CREATE POLICY "saved_ads_select" ON public.saved_ads FOR SELECT USING (true);

DROP POLICY IF EXISTS "saved_ads_insert" ON public.saved_ads;
CREATE POLICY "saved_ads_insert" ON public.saved_ads FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_ads_delete" ON public.saved_ads;
CREATE POLICY "saved_ads_delete" ON public.saved_ads FOR DELETE USING (auth.uid() = user_id);

-- 5. TABELA DE ANÚNCIOS OCULTOS
CREATE TABLE IF NOT EXISTS public.hidden_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

CREATE INDEX IF NOT EXISTS idx_hidden_ads_user_id ON public.hidden_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_hidden_ads_ad_id ON public.hidden_ads(ad_id);

ALTER TABLE public.hidden_ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hidden_ads_select" ON public.hidden_ads;
CREATE POLICY "hidden_ads_select" ON public.hidden_ads FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "hidden_ads_insert" ON public.hidden_ads;
CREATE POLICY "hidden_ads_insert" ON public.hidden_ads FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "hidden_ads_delete" ON public.hidden_ads;
CREATE POLICY "hidden_ads_delete" ON public.hidden_ads FOR DELETE USING (auth.uid() = user_id);

-- 6. FUNÇÃO PARA INCREMENTAR SHARES
CREATE OR REPLACE FUNCTION increment_ad_shares(ad_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.ads
  SET shares_count = shares_count + 1
  WHERE id = ad_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNÇÃO PARA INCREMENTAR VIEWS
CREATE OR REPLACE FUNCTION increment_ad_views(ad_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.ads
  SET views_count = views_count + 1
  WHERE id = ad_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TABELA DE COMENTÁRIOS EM ANÚNCIOS
CREATE TABLE IF NOT EXISTS public.ad_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  parent_comment_id UUID REFERENCES public.ad_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_comments_ad_id ON public.ad_comments(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_comments_user_id ON public.ad_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_comments_parent_id ON public.ad_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_ad_comments_created_at ON public.ad_comments(created_at DESC);

ALTER TABLE public.ad_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ad_comments_select" ON public.ad_comments;
CREATE POLICY "ad_comments_select" ON public.ad_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "ad_comments_insert" ON public.ad_comments;
CREATE POLICY "ad_comments_insert" ON public.ad_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ad_comments_update" ON public.ad_comments;
CREATE POLICY "ad_comments_update" ON public.ad_comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ad_comments_delete" ON public.ad_comments;
CREATE POLICY "ad_comments_delete" ON public.ad_comments FOR DELETE USING (auth.uid() = user_id);

-- 9. FUNÇÕES E TRIGGERS PARA COMENTÁRIOS
CREATE OR REPLACE FUNCTION increment_ad_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ads SET comments_count = comments_count + 1 WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_ad_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ads SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.ad_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

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

-- ========================================
-- FIM DO SCRIPT
-- ========================================
-- PRÓXIMO PASSO: Execute este script no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query > Cole este código > Run

