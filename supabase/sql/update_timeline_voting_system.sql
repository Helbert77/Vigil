-- Adicionar novos campos de votação
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS user_votes JSONB DEFAULT '{}';

-- Remover campos obsoletos
ALTER TABLE timeline_events DROP COLUMN IF EXISTS impact;
ALTER TABLE timeline_events DROP COLUMN IF EXISTS status;
ALTER TABLE timeline_events DROP COLUMN IF EXISTS evidence_level;
ALTER TABLE timeline_events DROP COLUMN IF EXISTS social_damage;
ALTER TABLE timeline_events DROP COLUMN IF EXISTS verification_priority;

-- Remover ou atualizar função RPC obsoleta (se existir)
DROP FUNCTION IF EXISTS get_timeline_events_with_children();

-- Habilitar RLS na tabela timeline_events
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT para todos os usuários autenticados
DROP POLICY IF EXISTS "timeline_events_select_policy" ON timeline_events;
CREATE POLICY "timeline_events_select_policy" ON timeline_events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir INSERT para todos os usuários autenticados
DROP POLICY IF EXISTS "timeline_events_insert_policy" ON timeline_events;
CREATE POLICY "timeline_events_insert_policy" ON timeline_events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir UPDATE para todos os usuários autenticados (para votos)
DROP POLICY IF EXISTS "timeline_events_update_policy" ON timeline_events;
CREATE POLICY "timeline_events_update_policy" ON timeline_events
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir DELETE apenas para admins e moderadores
DROP POLICY IF EXISTS "timeline_events_delete_policy" ON timeline_events;
CREATE POLICY "timeline_events_delete_policy" ON timeline_events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Realtime já está habilitado para timeline_events
-- ALTER PUBLICATION supabase_realtime ADD TABLE timeline_events;

-- Criar nova função RPC atualizada (opcional - o código agora usa query direta)
CREATE OR REPLACE FUNCTION get_timeline_events_with_children()
RETURNS TABLE (
  id uuid,
  title text,
  year integer,
  category text,
  description text,
  country text,
  parent_id uuid,
  x_position numeric,
  y_position numeric,
  children_ids uuid[],
  source_1 text,
  source_2 text,
  event_date date,
  image_url text,
  upvotes integer,
  downvotes integer,
  user_votes jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    te.id,
    te.title,
    te.year,
    te.category,
    te.description,
    te.country,
    te.parent_id,
    te.x_position,
    te.y_position,
    te.children_ids,
    te.source_1,
    te.source_2,
    te.event_date,
    te.image_url,
    COALESCE(te.upvotes, 0) as upvotes,
    COALESCE(te.downvotes, 0) as downvotes,
    COALESCE(te.user_votes, '{}'::jsonb) as user_votes,
    te.created_at,
    te.updated_at
  FROM timeline_events te
  ORDER BY te.year ASC;
END;
$$ LANGUAGE plpgsql;

