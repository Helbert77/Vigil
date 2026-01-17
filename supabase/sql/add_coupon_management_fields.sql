-- ========================================
-- ADICIONAR CAMPOS PARA GESTÃO DE CUPONS
-- ========================================

-- 1. Adicionar campos na tabela trial_coupons (se não existirem)
ALTER TABLE public.trial_coupons 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE public.trial_coupons 
ADD COLUMN IF NOT EXISTS max_uses INTEGER;

ALTER TABLE public.trial_coupons 
ADD COLUMN IF NOT EXISTS current_uses INTEGER DEFAULT 0;

ALTER TABLE public.trial_coupons 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_trial_coupons_active 
ON public.trial_coupons(is_active);

CREATE INDEX IF NOT EXISTS idx_trial_coupons_code_active 
ON public.trial_coupons(code, is_active);

CREATE INDEX IF NOT EXISTS idx_trial_coupons_plan 
ON public.trial_coupons(plan);

-- 3. Adicionar políticas RLS para admins gerenciarem cupons
DROP POLICY IF EXISTS "Admins can manage trial coupons" ON public.trial_coupons;
CREATE POLICY "Admins can manage trial coupons" 
ON public.trial_coupons 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- 4. Permitir que todos vejam cupons ativos (para validação)
DROP POLICY IF EXISTS "Anyone can view active trial coupons" ON public.trial_coupons;
CREATE POLICY "Anyone can view active trial coupons" 
ON public.trial_coupons 
FOR SELECT 
USING (is_active = true);

-- 5. Função para gerar códigos de cupom únicos
CREATE OR REPLACE FUNCTION generate_unique_coupon_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Gerar código aleatório de 8 caracteres
    new_code := upper(
      substring(
        md5(random()::text || clock_timestamp()::text) 
        from 1 for 8
      )
    );
    
    -- Verificar se já existe
    SELECT EXISTS(
      SELECT 1 FROM public.trial_coupons 
      WHERE code = new_code
    ) INTO code_exists;
    
    -- Se não existe, retornar o código
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para validar cupom (melhorada)
CREATE OR REPLACE FUNCTION validate_trial_coupon(
  coupon_code TEXT,
  user_id UUID DEFAULT auth.uid()
)
RETURNS JSON AS $$
DECLARE
  coupon_record RECORD;
  usage_count INTEGER;
  result JSON;
BEGIN
  -- Buscar cupom
  SELECT * INTO coupon_record
  FROM public.trial_coupons
  WHERE code = coupon_code
  AND is_active = true;
  
  -- Verificar se cupom existe
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Cupom não encontrado ou inativo'
    );
  END IF;
  
  -- Verificar validade temporal
  IF coupon_record.valid_from IS NOT NULL 
     AND coupon_record.valid_from > NOW() THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Cupom ainda não está válido'
    );
  END IF;
  
  IF coupon_record.valid_until IS NOT NULL 
     AND coupon_record.valid_until < NOW() THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Cupom expirado'
    );
  END IF;
  
  -- Verificar limite de usos
  IF coupon_record.max_uses IS NOT NULL THEN
    IF coupon_record.current_uses >= coupon_record.max_uses THEN
      RETURN json_build_object(
        'valid', false,
        'error', 'Cupom esgotado'
      );
    END IF;
  END IF;
  
  -- Verificar se usuário já usou este cupom
  SELECT COUNT(*) INTO usage_count
  FROM public.trial_coupon_usage
  WHERE coupon_id = coupon_record.id
  AND user_id = validate_trial_coupon.user_id;
  
  IF usage_count > 0 THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Você já usou este cupom'
    );
  END IF;
  
  -- Verificar se usuário já tem trial ativo
  -- (Esta verificação pode ser feita no frontend/Edge Function)
  
  -- Cupom válido
  RETURN json_build_object(
    'valid', true,
    'coupon', json_build_object(
      'id', coupon_record.id,
      'code', coupon_record.code,
      'plan', coupon_record.plan,
      'trialDays', coupon_record.trial_days
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger para atualizar current_uses automaticamente
CREATE OR REPLACE FUNCTION update_coupon_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.trial_coupons
    SET current_uses = current_uses + 1
    WHERE id = NEW.coupon_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.trial_coupons
    SET current_uses = GREATEST(current_uses - 1, 0)
    WHERE id = OLD.coupon_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS trigger_update_coupon_usage_count ON public.trial_coupon_usage;
CREATE TRIGGER trigger_update_coupon_usage_count
  AFTER INSERT OR DELETE ON public.trial_coupon_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_coupon_usage_count();

-- 8. View para relatórios de cupons
CREATE OR REPLACE VIEW coupon_usage_report AS
SELECT 
  tc.id,
  tc.code,
  tc.plan,
  tc.trial_days,
  tc.max_uses,
  tc.current_uses,
  tc.is_active,
  tc.valid_from,
  tc.valid_until,
  tc.created_at,
  COALESCE(usage_stats.total_conversions, 0) as total_conversions,
  CASE 
    WHEN tc.current_uses > 0 
    THEN (COALESCE(usage_stats.total_conversions, 0)::DECIMAL / tc.current_uses * 100)
    ELSE 0 
  END as conversion_rate
FROM public.trial_coupons tc
LEFT JOIN (
  SELECT 
    tcu.coupon_id,
    COUNT(*) as total_conversions
  FROM public.trial_coupon_usage tcu
  GROUP BY tcu.coupon_id
) usage_stats ON usage_stats.coupon_id = tc.id
ORDER BY tc.created_at DESC;

-- ========================================
-- COMENTÁRIOS PARA EXECUÇÃO
-- ========================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query > Cole este código > Run