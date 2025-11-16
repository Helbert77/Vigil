-- =====================================================
-- TABELAS PARA INTERAÇÕES COM COMENTÁRIOS DE ANÚNCIOS
-- =====================================================

-- Tabela para curtidas de comentários de anúncios
CREATE TABLE IF NOT EXISTS public.ad_comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES public.ad_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ad_comment_likes_user_id ON public.ad_comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_comment_likes_comment_id ON public.ad_comment_likes(comment_id);

-- RLS Policies para ad_comment_likes
ALTER TABLE public.ad_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver curtidas de comentários de anúncios"
  ON public.ad_comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem curtir comentários de anúncios"
  ON public.ad_comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover suas curtidas de comentários de anúncios"
  ON public.ad_comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================

-- Tabela para comentários de anúncios salvos
CREATE TABLE IF NOT EXISTS public.saved_ad_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES public.ad_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_saved_ad_comments_user_id ON public.saved_ad_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_ad_comments_comment_id ON public.saved_ad_comments(comment_id);

-- RLS Policies para saved_ad_comments
ALTER TABLE public.saved_ad_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus comentários de anúncios salvos"
  ON public.saved_ad_comments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem salvar comentários de anúncios"
  ON public.saved_ad_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover comentários de anúncios salvos"
  ON public.saved_ad_comments FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================

-- Adicionar coluna views_count na tabela ad_comments se não existir
ALTER TABLE public.ad_comments 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- =====================================================

-- Função para atualizar likes_count em ad_comments
CREATE OR REPLACE FUNCTION update_ad_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ad_comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ad_comments
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar likes_count automaticamente
DROP TRIGGER IF EXISTS trigger_update_ad_comment_likes_count ON public.ad_comment_likes;
CREATE TRIGGER trigger_update_ad_comment_likes_count
AFTER INSERT OR DELETE ON public.ad_comment_likes
FOR EACH ROW
EXECUTE FUNCTION update_ad_comment_likes_count();

-- =====================================================

-- Função para incrementar visualizações de comentários de anúncios
CREATE OR REPLACE FUNCTION increment_ad_comment_views(comment_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.ad_comments
  SET views_count = views_count + 1
  WHERE id = comment_id_param;
END;
$$ LANGUAGE plpgsql;

-- =====================================================

-- Função para atualizar comentário de anúncio
CREATE OR REPLACE FUNCTION update_ad_comment_text(comment_id_param UUID, new_text TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.ad_comments
  SET content = new_text, updated_at = NOW()
  WHERE id = comment_id_param;
END;
$$ LANGUAGE plpgsql;

-- =====================================================

-- Função para deletar comentário de anúncio
CREATE OR REPLACE FUNCTION delete_ad_comment(comment_id_param UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM public.ad_comments
  WHERE id = comment_id_param;
END;
$$ LANGUAGE plpgsql;

