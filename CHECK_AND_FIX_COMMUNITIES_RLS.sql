-- Verificar e corrigir políticas RLS da tabela communities
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a coluna required_plan existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'communities' 
        AND column_name = 'required_plan'
    ) THEN
        ALTER TABLE communities 
        ADD COLUMN required_plan TEXT DEFAULT 'all' CHECK (required_plan IN ('all', 'basic+', 'pro+', 'premium'));
        
        UPDATE communities 
        SET required_plan = 'all' 
        WHERE required_plan IS NULL;
    END IF;
END $$;

-- 2. Verificar se a coluna creator_id existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'communities' 
        AND column_name = 'creator_id'
    ) THEN
        ALTER TABLE communities 
        ADD COLUMN creator_id UUID REFERENCES profiles(id);
    END IF;
END $$;

-- 3. Remover políticas RLS restritivas que podem estar bloqueando updates
DROP POLICY IF EXISTS "communities_update_restricted" ON communities;
DROP POLICY IF EXISTS "communities_update_owner_only" ON communities;

-- 4. Criar política RLS permissiva para UPDATE
-- Permite que usuários autenticados atualizem comunidades que criaram
DROP POLICY IF EXISTS "communities_update_policy" ON communities;
CREATE POLICY "communities_update_policy" ON communities
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            creator_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'moderator')
            )
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            creator_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'moderator')
            )
        )
    );

-- 5. Garantir que a política de SELECT existe
DROP POLICY IF EXISTS "communities_select_policy" ON communities;
CREATE POLICY "communities_select_policy" ON communities
    FOR SELECT
    USING (true);

-- 6. Garantir que a política de INSERT existe
DROP POLICY IF EXISTS "communities_insert_policy" ON communities;
CREATE POLICY "communities_insert_policy" ON communities
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 7. Verificar se RLS está habilitado
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- 8. Atualizar comunidades existentes sem creator_id
UPDATE communities 
SET creator_id = (
    SELECT user_id 
    FROM user_communities 
    WHERE community_id = communities.id 
    ORDER BY joined_at ASC 
    LIMIT 1
)
WHERE creator_id IS NULL;

