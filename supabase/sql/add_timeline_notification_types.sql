-- Add timeline moderation notification types
-- This allows notifications for timeline event moderation

-- First, drop the existing constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Recreate the constraint with the new types included
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'like',
  'comment',
  'follow',
  'comment_like',
  'mention',
  'message',
  'ad_approval_pending',
  'ad_approved',
  'ad_rejected',
  'chat_room_invitation',
  'room_access_request',
  'room_access_approved',
  'room_access_rejected',
  'timeline_moderation_pending',
  'timeline_approved',
  'timeline_rejected'
));

-- Verificar se a constraint foi atualizada corretamente
SELECT 'Timeline notification types added successfully!' AS status;

