import { supabase } from '@/integrations/supabase/client';

/**
 * Serviço para aprovação e rejeição de anúncios
 * Apenas admins e moderadores podem usar estas funções
 */

export interface ApproveAdParams {
  adId: string;
  adminId: string;
}

export interface RejectAdParams {
  adId: string;
  adminId: string;
  reason: string;
}

/**
 * Aprovar um anúncio
 */
export const approveAd = async ({ adId, adminId }: ApproveAdParams) => {
  try {
    const now = new Date().toISOString();

    // Buscar anúncio para verificar se precisa definir start_date
    const { data: ad } = await supabase
      .from('anuncios')
      .select('start_date, payment_type')
      .eq('id', adId)
      .single();

    const updateData: any = {
      approval_status: 'approved',
      approved_by: adminId,
      approved_at: now,
      status: 'active',
    };

    // Se não tem start_date definida (anúncios CPM), definir agora
    if (!ad?.start_date) {
      updateData.start_date = now;
    }

    const { data, error } = await supabase
      .from('anuncios')
      .update(updateData)
      .eq('id', adId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // TODO: Enviar notificação para o anunciante
    // await sendNotification(ad.advertiser_id, 'Seu anúncio foi aprovado!');

    return { data, error: null };
  } catch (error: any) {
    console.error('Error approving ad:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Rejeitar um anúncio e processar reembolso
 */
export const rejectAd = async ({ adId, adminId, reason }: RejectAdParams) => {
  try {
    const now = new Date().toISOString();

    // Buscar dados do anúncio para processar reembolso
    const { data: ad } = await supabase
      .from('anuncios')
      .select('stripe_payment_intent_id, advertiser_id, title')
      .eq('id', adId)
      .single();

    if (!ad) {
      throw new Error('Anúncio não encontrado');
    }

    // Atualizar status do anúncio
    const { data, error } = await supabase
      .from('anuncios')
      .update({
        approval_status: 'rejected',
        approved_by: adminId,
        approved_at: now,
        rejection_reason: reason,
        status: 'paused',
      })
      .eq('id', adId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Processar reembolso no Stripe
    if (ad.stripe_payment_intent_id) {
      try {
        // TODO: Implementar chamada ao Stripe para criar refund
        // Isso deve ser feito via Edge Function por segurança
        console.log('TODO: Process refund for payment intent:', ad.stripe_payment_intent_id);
        
        // await fetch(`${SUPABASE_URL}/functions/v1/process-ad-refund`, {
        //   method: 'POST',
        //   body: JSON.stringify({
        //     paymentIntentId: ad.stripe_payment_intent_id,
        //     adId: adId,
        //   }),
        // });
      } catch (refundError) {
        console.error('Error processing refund:', refundError);
        // Não falhar a rejeição se o reembolso falhar
        // Apenas logar para processamento manual
      }
    }

    // TODO: Enviar notificação para o anunciante
    // await sendNotification(ad.advertiser_id, `Seu anúncio "${ad.title}" foi rejeitado. Motivo: ${reason}`);

    return { data, error: null };
  } catch (error: any) {
    console.error('Error rejecting ad:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Buscar anúncios pendentes de aprovação
 */
export const fetchPendingAds = async (filters?: {
  packageType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    let query = supabase
      .from('anuncios')
      .select('*, profiles!anuncios_advertiser_id_fkey(username, avatarUrl)', { count: 'exact' })
      .eq('approval_status', 'pending_approval')
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false });

    if (filters?.packageType) {
      query = query.eq('package_type', filters.packageType);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return { data, error: null, count };
  } catch (error: any) {
    console.error('Error fetching pending ads:', error);
    return { data: null, error: error.message, count: 0 };
  }
};

/**
 * Buscar histórico de aprovações de um admin/moderador
 */
export const fetchApprovalHistory = async (adminId: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('anuncios')
      .select('*')
      .eq('approved_by', adminId)
      .order('approved_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching approval history:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Buscar estatísticas de aprovação
 */
export const fetchApprovalStats = async () => {
  try {
    const { data: pending } = await supabase
      .from('anuncios')
      .select('id', { count: 'exact', head: true })
      .eq('approval_status', 'pending_approval')
      .eq('payment_status', 'paid');

    const { data: approved } = await supabase
      .from('anuncios')
      .select('id', { count: 'exact', head: true })
      .eq('approval_status', 'approved');

    const { data: rejected } = await supabase
      .from('anuncios')
      .select('id', { count: 'exact', head: true })
      .eq('approval_status', 'rejected');

    return {
      pending: pending?.length || 0,
      approved: approved?.length || 0,
      rejected: rejected?.length || 0,
    };
  } catch (error: any) {
    console.error('Error fetching approval stats:', error);
    return { pending: 0, approved: 0, rejected: 0 };
  }
};

