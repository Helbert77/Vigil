import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'https://esm.sh/web-push@3.5.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VITE_VAPID_PUBLIC_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

webpush.setVapidDetails('mailto:admin@myvigil.co', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { userId, payload } = await req.json();
    if (!userId || !payload) return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400, headers: corsHeaders });
    const { data, error } = await supabase.from('push_subscriptions').select('subscription').eq('user_id', userId);
    if (error) throw error;
    const subs = (data || []).map((row: any) => row.subscription).filter(Boolean);
    await Promise.all(subs.map((sub: any) => webpush.sendNotification(sub, JSON.stringify(payload)).catch((e: any) => console.error('webpush error', e.message))));
    return new Response(JSON.stringify({ ok: true, sent: subs.length }), { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
