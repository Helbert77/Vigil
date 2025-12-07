-- Atualizar a função create_notification_if_enabled para incluir o parâmetro metadata
-- que está sendo enviado pelo código frontend mas não está na assinatura da função

DROP FUNCTION IF EXISTS public.create_notification_if_enabled(uuid, uuid, text, uuid);

CREATE OR REPLACE FUNCTION public.create_notification_if_enabled(
  p_recipient_id uuid, 
  p_actor_id uuid, 
  p_type text, 
  p_post_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  recipient_settings jsonb;
  should_notify boolean;
BEGIN
  -- Não criar notificação se o ator e o destinatário forem a mesma pessoa
  IF p_actor_id = p_recipient_id THEN
    RETURN;
  END IF;

  -- Buscar as configurações de notificação do destinatário
  SELECT notifications_settings INTO recipient_settings
  FROM public.profiles
  WHERE id = p_recipient_id;

  -- Determinar se a notificação deve ser enviada com base no tipo
  -- O padrão é 'true' se a configuração não existir, para garantir a retrocompatibilidade
  CASE p_type
    WHEN 'like' THEN
      should_notify := COALESCE((recipient_settings ->> 'likes')::boolean, true);
    WHEN 'comment' THEN
      should_notify := COALESCE((recipient_settings ->> 'comments')::boolean, true);
    WHEN 'comment_like' THEN
      should_notify := COALESCE((recipient_settings ->> 'likes')::boolean, true);
    WHEN 'follow' THEN
      should_notify := COALESCE((recipient_settings ->> 'newFollowers')::boolean, true);
    WHEN 'mention' THEN
      should_notify := COALESCE((recipient_settings ->> 'comments')::boolean, true);
    WHEN 'message' THEN
      should_notify := COALESCE((recipient_settings ->> 'messages')::boolean, true);
    ELSE
      should_notify := true; -- Padrão para notificar para tipos desconhecidos (ad_approval, etc)
  END CASE;

  -- Se a configuração permitir, inserir a notificação
  IF should_notify THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, post_id, metadata)
    VALUES (p_recipient_id, p_actor_id, p_type, p_post_id, p_metadata);
  END IF;
END;
$function$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.create_notification_if_enabled TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification_if_enabled TO service_role;

