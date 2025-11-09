-- ============================================================================
-- IMPORTANTE: Execute este SQL no Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/oprqgllsqtfdyjgvgovo/sql/new
-- ============================================================================

-- Função para incrementar visualizações de posts
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = post_id;
END;
$$;

-- Função para incrementar visualizações de comentários
CREATE OR REPLACE FUNCTION increment_comment_views(comment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE comments
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = comment_id;
END;
$$;

-- Conceder permissões de execução
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_comment_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_comment_views(UUID) TO anon;

-- ============================================================================
-- Verificação (opcional - execute para confirmar que funcionou)
-- ============================================================================
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name IN ('increment_post_views', 'increment_comment_views');

