-- Add 'chat_room_invitation' to the notifications type constraint
-- This allows notifications for chat room invitations

-- First, drop the existing constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Recreate the constraint with the new type included
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
  'chat_room_invitation'
));

