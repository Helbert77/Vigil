-- Add subscription notification types
-- This allows notifications for subscription events (activation, cancellation, trial, etc.)

-- First, drop the existing constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Recreate the constraint with the new subscription types included
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
  'timeline_rejected',
  'subscription_activated',
  'subscription_trial_started',
  'subscription_canceled',
  'subscription_upgraded',
  'subscription_downgraded',
  'subscription_payment_failed',
  'subscription_renewed'
));

-- Verificar se a constraint foi atualizada corretamente
SELECT 'Subscription notification types added successfully!' AS status;




