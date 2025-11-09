-- Script SQL para adicionar colunas required_plan e creator_id à tabela communities
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna required_plan
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS required_plan TEXT DEFAULT 'all' CHECK (required_plan IN ('all', 'basic+', 'pro+', 'premium'));

-- Adicionar coluna creator_id
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES profiles(id);

-- Atualizar comunidades existentes para 'all' (todos podem acessar)
UPDATE communities 
SET required_plan = 'all' 
WHERE required_plan IS NULL;

-- Comentários explicativos
COMMENT ON COLUMN communities.required_plan IS 'Plano mínimo requerido para acessar a comunidade: all (todos), basic+ (basic, pro, premium), pro+ (pro, premium), premium (apenas premium)';
COMMENT ON COLUMN communities.creator_id IS 'ID do usuário que criou a comunidade';

