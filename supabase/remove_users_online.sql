-- Script para remover completamente o sistema de contagem de participantes online
-- Execute este script no Supabase SQL Editor

-- 1. Remover triggers que atualizam users_online
DROP TRIGGER IF EXISTS increment_room_count_on_join ON chat_room_participants;
DROP TRIGGER IF EXISTS decrement_room_count_on_leave ON chat_room_participants;

-- 2. Remover funções que são usadas pelos triggers
DROP FUNCTION IF EXISTS increment_room_count_on_join();
DROP FUNCTION IF EXISTS decrement_room_count_on_leave();

-- 3. Remover a coluna users_online da tabela chat_rooms
ALTER TABLE chat_rooms DROP COLUMN IF EXISTS users_online;

-- Verificação: Listar triggers restantes relacionados (se houver)
SELECT 
    trigger_name, 
    event_object_table, 
    action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'chat_room_participants';

