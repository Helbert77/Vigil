-- Criar função RPC para atualizar required_plan de comunidades
-- Execute este script no SQL Editor do Supabase

-- Remover função se já existir
DROP FUNCTION IF EXISTS update_community_required_plan(TEXT, TEXT);

-- Criar função RPC
CREATE OR REPLACE FUNCTION update_community_required_plan(
    p_community_id TEXT,
    p_required_plan TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_user_role TEXT;
    v_creator_id UUID;
BEGIN
    -- Obter o ID do usuário autenticado
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;
    
    -- Buscar o role do usuário e o creator_id da comunidade
    SELECT role INTO v_user_role
    FROM profiles
    WHERE id = v_user_id;
    
    SELECT creator_id INTO v_creator_id
    FROM communities
    WHERE id = p_community_id;
    
    -- Verificar se o usuário tem permissão
    IF v_creator_id = v_user_id OR v_user_role IN ('admin', 'moderator') THEN
        -- Atualizar o required_plan
        UPDATE communities
        SET required_plan = p_required_plan
        WHERE id = p_community_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Comunidade não encontrada';
        END IF;
    ELSE
        RAISE EXCEPTION 'Sem permissão para atualizar esta comunidade';
    END IF;
END;
$$;

-- Conceder permissão de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION update_community_required_plan(TEXT, TEXT) TO authenticated;

-- Comentário explicativo
COMMENT ON FUNCTION update_community_required_plan IS 'Atualiza o plano requerido de uma comunidade. Apenas o criador ou admin/moderador podem executar.';

