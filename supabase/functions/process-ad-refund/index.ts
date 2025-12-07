// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { adId, userId } = await req.json();

        if (!adId || !userId) {
            throw new Error('Missing adId or userId');
        }

        // 1. Verificar se o anúncio existe e pertence ao usuário
        const { data: ad, error: adError } = await supabase
            .from('anuncios')
            .select('*')
            .eq('id', adId)
            .single();

        if (adError || !ad) {
            throw new Error('Ad not found');
        }

        if (ad.advertiser_id !== userId) {
            throw new Error('Unauthorized');
        }

        // 2. Verificar se o anúncio foi rejeitado
        if (ad.approval_status !== 'rejected') {
            throw new Error('Ad is not rejected');
        }

        // 3. Verificar se já foi reembolsado
        if (ad.payment_status === 'refunded') {
            throw new Error('Ad already refunded');
        }

        // 4. Verificar se tem um Payment Intent
        if (!ad.stripe_payment_intent_id) {
            throw new Error('No payment intent found for this ad');
        }

        // 5. Processar reembolso no Stripe
        const refund = await stripe.refunds.create({
            payment_intent: ad.stripe_payment_intent_id,
            reason: 'requested_by_customer',
            metadata: {
                ad_id: adId,
                user_id: userId,
                reason: 'ad_rejected_refund'
            }
        });

        // 6. Atualizar status no banco de dados
        const { error: updateError } = await supabase
            .from('anuncios')
            .update({
                payment_status: 'refunded',
                status: 'ended',
                updated_at: new Date().toISOString()
            })
            .eq('id', adId);

        if (updateError) {
            console.error('Error updating ad status:', updateError);
        }

        return new Response(JSON.stringify({ success: true, refundId: refund.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('Error processing refund:', error);
        // Retornar 200 mesmo em caso de erro de lógica de negócio para que o cliente possa ler a mensagem de erro
        // Erros 400/500 muitas vezes são mascarados pelo cliente do Supabase ou CORS
        return new Response(JSON.stringify({ error: error.message, details: error }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }
});
