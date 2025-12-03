-- Create table for room access requests
CREATE TABLE IF NOT EXISTS public.room_access_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status varchar(20) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(room_id, requester_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_room_access_requests_room_id ON public.room_access_requests(room_id);
CREATE INDEX IF NOT EXISTS idx_room_access_requests_requester_id ON public.room_access_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_room_access_requests_status ON public.room_access_requests(status);

-- Enable RLS
ALTER TABLE public.room_access_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests and room creators can view requests for their rooms
CREATE POLICY "Users can view relevant access requests" ON public.room_access_requests
  FOR SELECT USING (
    auth.uid() = requester_id OR 
    EXISTS (
      SELECT 1 FROM public.chat_rooms r 
      WHERE r.id = room_access_requests.room_id 
      AND r.created_by = auth.uid()
    )
  );

-- Policy: Users can create access requests
CREATE POLICY "Users can create access requests" ON public.room_access_requests
  FOR INSERT WITH CHECK (
    auth.uid() = requester_id
  );

-- Policy: Room creators can update access requests for their rooms
CREATE POLICY "Room creators can update access requests" ON public.room_access_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms r 
      WHERE r.id = room_access_requests.room_id 
      AND r.created_by = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.room_access_requests TO authenticated;

