-- ============================================
-- SCRIPT DE CORREÇÃO DE SEGURANÇA - VIGIL
-- Data: 01 de Fevereiro de 2026
-- ============================================
-- ATENÇÃO: Este script corrige vulnerabilidades críticas
-- Revisar antes de executar em produção
-- ============================================

BEGIN;

-- ============================================
-- 1. CORRIGIR POLÍTICAS RLS DA TABELA ANUNCIOS
-- ============================================

-- Remover políticas permissivas
DROP POLICY IF EXISTS "ads_delete" ON anuncios;
DROP POLICY IF EXISTS "ads_insert" ON anuncios;
DROP POLICY IF EXISTS "ads_update" ON anuncios;

-- Criar políticas restritivas
CREATE POLICY "Users can only delete their own ads"
ON anuncios FOR DELETE
USING (
  auth.uid() = advertiser_id OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Authenticated users can create ads"
ON anuncios FOR INSERT
WITH CHECK (
  auth.uid() = advertiser_id AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can only update their own ads"
ON anuncios FOR UPDATE
USING (
  auth.uid() = advertiser_id OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  auth.uid() = advertiser_id OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- ============================================
-- 2. CORRIGIR POLÍTICAS RLS DA TABELA TIMELINE_EVENTS
-- ============================================

-- Remover políticas permissivas
DROP POLICY IF EXISTS "timeline_events_admin_delete_policy" ON timeline_events;
DROP POLICY IF EXISTS "timeline_events_admin_insert_policy" ON timeline_events;
DROP POLICY IF EXISTS "timeline_events_admin_update_policy" ON timeline_events;

-- Criar políticas com verificação de role
CREATE POLICY "Only admins can delete timeline events"
ON timeline_events FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Only admins can insert timeline events"
ON timeline_events FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Only admins can update timeline events"
ON timeline_events FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- ============================================
-- 3. CORRIGIR POLÍTICA DE CRIAÇÃO DE COMUNIDADES
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can create communities" ON communities;

-- Limitar criação de comunidades (máximo 3 por usuário free, ilimitado para premium)
CREATE POLICY "Users can create communities with limits"
ON communities FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  (
    -- Admins podem criar ilimitado
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
    OR
    -- Usuários premium podem criar ilimitado
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND plan IN ('pro', 'premium')
    )
    OR
    -- Usuários free/basic podem criar até 3
    (
      SELECT COUNT(*) FROM communities WHERE creator_id = auth.uid()
    ) < 3
  )
);

-- ============================================
-- 4. CORRIGIR POLÍTICAS DE TABELAS DE GAMIFICAÇÃO
-- ============================================

-- USER_ACHIEVEMENTS
DROP POLICY IF EXISTS "System can insert user achievements" ON user_achievements;

CREATE POLICY "Only system can insert achievements"
ON user_achievements FOR INSERT
WITH CHECK (
  -- Apenas Edge Functions com service_role podem inserir
  auth.role() = 'service_role'
);

-- USER_GAMIFICATION
DROP POLICY IF EXISTS "System can insert gamification data" ON user_gamification;

CREATE POLICY "Only system can insert gamification data"
ON user_gamification FOR INSERT
WITH CHECK (
  auth.role() = 'service_role'
);

CREATE POLICY "Only system can update gamification data"
ON user_gamification FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- USER_MISSION_PROGRESS
DROP POLICY IF EXISTS "System can insert mission progress" ON user_mission_progress;

CREATE POLICY "Only system can insert mission progress"
ON user_mission_progress FOR INSERT
WITH CHECK (
  auth.role() = 'service_role'
);

CREATE POLICY "Only system can update mission progress"
ON user_mission_progress FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- XP_HISTORY
DROP POLICY IF EXISTS "System can insert XP history" ON xp_history;

CREATE POLICY "Only system can insert XP history"
ON xp_history FOR INSERT
WITH CHECK (
  auth.role() = 'service_role'
);

-- ============================================
-- 5. CORRIGIR POLÍTICAS DE MÉTRICAS DE ANÚNCIOS
-- ============================================

DROP POLICY IF EXISTS "ad_metrics_insert" ON ad_metrics;

CREATE POLICY "Only system can insert ad metrics"
ON ad_metrics FOR INSERT
WITH CHECK (
  auth.role() = 'service_role'
);

CREATE POLICY "Users can view their own ad metrics"
ON ad_metrics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM anuncios
    WHERE id = ad_metrics.ad_id AND advertiser_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- ============================================
-- 6. CORRIGIR POLÍTICAS DE CONVERSION EVENTS/METRICS
-- ============================================

DROP POLICY IF EXISTS "System can insert conversion events" ON conversion_events;
DROP POLICY IF EXISTS "System can manage conversion metrics" ON conversion_metrics;

CREATE POLICY "Only system can insert conversion events"
ON conversion_events FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only system can manage conversion metrics"
ON conversion_metrics FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- 7. CORRIGIR POLÍTICA DE MODERATION QUEUE
-- ============================================

DROP POLICY IF EXISTS "Users can insert reports to queue" ON moderation_queue;

CREATE POLICY "Authenticated users can report content"
ON moderation_queue FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.uid() = reporter_id AND
  -- Limitar a 10 reports por dia por usuário
  (
    SELECT COUNT(*)
    FROM moderation_queue
    WHERE reporter_id = auth.uid()
    AND created_at > NOW() - INTERVAL '24 hours'
  ) < 10
);

-- ============================================
-- 8. CORRIGIR POLÍTICAS DE CONVERSATION_PARTICIPANTS
-- ============================================

DROP POLICY IF EXISTS "cp_insert" ON conversation_participants;

CREATE POLICY "Users can only add themselves to conversations"
ON conversation_participants FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  -- Verificar se o usuário foi convidado ou é criador da conversa
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_participants.conversation_id
    AND (
      created_by = auth.uid() OR
      auth.uid() IN (
        SELECT user_id FROM conversation_participants
        WHERE conversation_id = conversation_participants.conversation_id
      )
    )
  )
);

-- ============================================
-- 9. CORRIGIR POLÍTICAS DE CONVERSATIONS
-- ============================================

DROP POLICY IF EXISTS "conv_insert" ON conversations;

CREATE POLICY "Authenticated users can create conversations"
ON conversations FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.uid() = created_by
);

-- ============================================
-- 10. ADICIONAR search_path A FUNÇÕES VULNERÁVEIS
-- ============================================

-- Funções de Cupom
ALTER FUNCTION public.increment_coupon_usage(UUID) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.generate_unique_coupon_code() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.validate_trial_coupon(TEXT) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_coupon_usage_count(UUID) 
SET search_path = public, pg_temp;

-- Funções de Gamificação
ALTER FUNCTION public.calculate_xp_for_level(INTEGER) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.add_xp_to_user(UUID, INTEGER, TEXT, UUID, TEXT) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.unlock_achievement(UUID, UUID) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_mission_progress(UUID, UUID, INTEGER) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_achievement_with_language(TEXT) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_mission_with_language(TEXT) 
SET search_path = public, pg_temp;

-- Funções de Chat
ALTER FUNCTION public.get_rooms_participant_counts() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_multiple_rooms_unread_counts(UUID[]) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_room_unread_count(UUID, UUID) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.mark_all_room_messages_deleted(UUID, UUID) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.add_user_to_deleted_by(UUID, UUID) 
SET search_path = public, pg_temp;

-- Funções de Anúncios
ALTER FUNCTION public.get_ads_performance(UUID) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_user_ad_metrics(UUID, DATE, DATE) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_daily_ad_metrics(UUID, DATE, DATE) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.check_and_pause_expired_ads() 
SET search_path = public, pg_temp;

-- Funções de Timeline
ALTER FUNCTION public.get_timeline_events_with_children() 
SET search_path = public, pg_temp;

-- Funções de Sistema
ALTER FUNCTION public.sync_user_email() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.import_cia_document(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) 
SET search_path = public, pg_temp;

ALTER FUNCTION public.generate_unique_invite_code() 
SET search_path = public, pg_temp;

-- Funções de Triggers
ALTER FUNCTION public.update_invitation_updated_at() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_chat_rooms_updated_at() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_conversations_updated_at() 
SET search_path = public, pg_temp;

ALTER FUNCTION public.trigger_cleanup_inactive_participants() 
SET search_path = public, pg_temp;

-- ============================================
-- 11. CRIAR ÍNDICES PARA MELHORAR PERFORMANCE DE RLS
-- ============================================

-- Índice para verificação de role de usuário (usado em muitas políticas)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(id, role) WHERE role IN ('admin', 'moderator');

-- Índice para verificação de plano de usuário
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(id, plan);

-- Índice para verificação de advertiser_id em anúncios
CREATE INDEX IF NOT EXISTS idx_anuncios_advertiser ON anuncios(advertiser_id);

-- Índice para verificação de creator_id em comunidades
CREATE INDEX IF NOT EXISTS idx_communities_creator ON communities(creator_id);

-- Índice para contagem de reports por usuário
CREATE INDEX IF NOT EXISTS idx_moderation_queue_reporter_created ON moderation_queue(reporter_id, created_at DESC);

-- ============================================
-- 12. CRIAR FUNÇÃO HELPER PARA VERIFICAR ADMIN
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
END;
$$;

-- ============================================
-- 13. CRIAR FUNÇÃO HELPER PARA VERIFICAR PLANO PREMIUM
-- ============================================

CREATE OR REPLACE FUNCTION public.is_premium_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND plan IN ('pro', 'premium')
  );
END;
$$;

-- ============================================
-- COMMIT DAS ALTERAÇÕES
-- ============================================

COMMIT;

-- ============================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- ============================================

-- Verificar políticas da tabela anuncios
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'anuncios';

-- Verificar políticas da tabela timeline_events
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'timeline_events';

-- Verificar funções com search_path configurado
SELECT 
  routine_name,
  routine_type,
  CASE 
    WHEN prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type,
  proconfig
FROM information_schema.routines
JOIN pg_proc ON proname = routine_name
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
