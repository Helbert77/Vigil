-- ============================================
-- SISTEMA DE MODERAÇÃO PARA EVENTOS DA TIMELINE
-- Execute este SQL manualmente no Supabase
-- ============================================

-- 1. Criar tabela SEPARADA para moderação de eventos da timeline
-- NÃO interfere com moderation_queue existente
CREATE TABLE IF NOT EXISTS public.timeline_moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados do evento submetido
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('politics', 'science', 'health', 'religion', 'technology', 'society')),
  description TEXT,
  country TEXT,
  source_1 TEXT,
  source_2 TEXT,
  event_date TEXT,
  image_url TEXT,
  
  -- Metadados de moderação
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_timeline_mod_queue_status ON public.timeline_moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_timeline_mod_queue_author ON public.timeline_moderation_queue(author_id);
CREATE INDEX IF NOT EXISTS idx_timeline_mod_queue_created ON public.timeline_moderation_queue(created_at DESC);

-- 3. Adicionar campo created_by na tabela timeline_events (para rastreamento)
ALTER TABLE public.timeline_events 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Índice para consultas
CREATE INDEX IF NOT EXISTS idx_timeline_events_created_by 
ON public.timeline_events(created_by);

-- 4. RLS Policies para timeline_moderation_queue
ALTER TABLE public.timeline_moderation_queue ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes se houver (para evitar conflitos)
DROP POLICY IF EXISTS "Users can view own submissions" ON public.timeline_moderation_queue;
DROP POLICY IF EXISTS "Moderators can view all" ON public.timeline_moderation_queue;
DROP POLICY IF EXISTS "Authenticated users can insert" ON public.timeline_moderation_queue;
DROP POLICY IF EXISTS "Moderators can update" ON public.timeline_moderation_queue;

-- Usuários podem ver apenas suas próprias submissões
CREATE POLICY "Users can view own submissions"
  ON public.timeline_moderation_queue FOR SELECT
  USING (auth.uid() = author_id);

-- Moderadores e admins podem ver tudo
CREATE POLICY "Moderators can view all"
  ON public.timeline_moderation_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Usuários autenticados podem inserir
CREATE POLICY "Authenticated users can insert"
  ON public.timeline_moderation_queue FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Apenas moderadores podem atualizar
CREATE POLICY "Moderators can update"
  ON public.timeline_moderation_queue FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- 5. Comentários para documentação
COMMENT ON TABLE public.timeline_moderation_queue IS 'Fila de moderação para eventos da timeline - separada da moderation_queue existente';
COMMENT ON COLUMN public.timeline_moderation_queue.status IS 'Status: pending (aguardando), approved (aprovado), rejected (rejeitado)';
COMMENT ON COLUMN public.timeline_moderation_queue.author_id IS 'ID do usuário que submeteu o evento';
COMMENT ON COLUMN public.timeline_moderation_queue.reviewed_by IS 'ID do moderador que revisou o evento';

-- Verificar se a tabela foi criada corretamente
SELECT 'Timeline moderation system created successfully!' AS status;
