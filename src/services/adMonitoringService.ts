import { supabase } from '@/integrations/supabase/client';

/**
 * Serviço para monitoramento automático de anúncios
 * Verifica limites de budget, impressões e datas
 */

/**
 * Rastrear uma impressão (view) de anúncio
 * Versão simplificada para uso no hook
 */
export const trackImpression = async (adId: string, userId: string, userPlan: string): Promise<boolean> => {
  return trackAdImpression(adId);
};

/**
 * Rastrear um clique em anúncio
 * Nota: clicks_count não existe na tabela ainda - implementar no futuro se necessário
 */
export const trackClick = async (adId: string, userId: string): Promise<boolean> => {
  try {
    // TODO: Adicionar coluna clicks_count na tabela anuncios se necessário
    // Por enquanto, apenas retornamos true para não quebrar a aplicação
    // console.log('Click tracked for ad:', adId, 'by user:', userId);
    return true;
  } catch (error) {
    console.error('Error tracking click:', error);
    return false;
  }
};

/**
 * Rastrear uma impressão de anúncio
 * Verifica automaticamente se atingiu limites e pausa se necessário
 */
export const trackAdImpression = async (adId: string): Promise<boolean> => {
  try {
    // Buscar dados atuais do anúncio
    const { data: ad, error: fetchError } = await supabase
      .from('anuncios')
      .select('*')
      .eq('id', adId)
      .single();

    if (fetchError || !ad) {
      console.error('Ad not found:', adId);
      return false;
    }

    // Se já está pausado ou completado, não incrementar
    if (ad.status !== 'active' || ad.approval_status !== 'approved') {
      return false;
    }

    const newViewsCount = (ad.views_count || 0) + 1;

    // Verificar limites baseado no tipo de pagamento
    let shouldPause = false;
    let completionReason = null;

    if (ad.payment_type === 'package' && ad.max_impressions) {
      // Verificar se atingiu impressões máximas
      if (newViewsCount >= ad.max_impressions) {
        shouldPause = true;
        completionReason = 'impressions_reached';
      }
    } else if (ad.payment_type === 'cpm' && ad.budget) {
      // Calcular gasto atual (CPM = 8 EUR por 1.000 impressões)
      const costPerImpression = (ad.cpm_rate || 8) / 1000;
      const newSpent = newViewsCount * costPerImpression;

      // Verificar se atingiu orçamento
      if (newSpent >= ad.budget) {
        shouldPause = true;
        completionReason = 'budget_exhausted';
      }

      // Atualizar gasto
      const updateData: any = {
        views_count: newViewsCount,
        spent: newSpent,
      };

      if (shouldPause) {
        updateData.status = 'completed';
        updateData.completion_reason = completionReason;
      }

      const { error: updateError } = await supabase
        .from('anuncios')
        .update(updateData)
        .eq('id', adId);

      if (updateError) {
        console.error('Error updating ad:', updateError);
        return false;
      }

      return !shouldPause; // Retorna false se pausou

    } else {
      // Para outros tipos, apenas incrementar views
      const { error: updateError } = await supabase
        .from('anuncios')
        .update({ views_count: newViewsCount })
        .eq('id', adId);

      if (updateError) {
        console.error('Error updating ad:', updateError);
        return false;
      }

      return true;
    }

    // Para pacotes, atualizar views e pausar se necessário
    if (ad.payment_type === 'package') {
      const updateData: any = {
        views_count: newViewsCount,
      };

      if (shouldPause) {
        updateData.status = 'completed';
        updateData.completion_reason = completionReason;
      }

      const { error: updateError } = await supabase
        .from('anuncios')
        .update(updateData)
        .eq('id', adId);

      if (updateError) {
        console.error('Error updating ad:', updateError);
        return false;
      }

      return !shouldPause;
    }

    return true;

  } catch (error) {
    console.error('Error tracking ad impression:', error);
    return false;
  }
};

/**
 * Verificar e pausar anúncios expirados
 * Deve ser executado periodicamente via cron job
 */
export const checkAndPauseExpiredAds = async (): Promise<number> => {
  try {
    const now = new Date().toISOString();

    // Buscar anúncios ativos que passaram da data de término
    const { data: expiredAds, error } = await supabase
      .from('anuncios')
      .select('id')
      .eq('status', 'active')
      .eq('approval_status', 'approved')
      .not('end_date', 'is', null)
      .lt('end_date', now);

    if (error) {
      console.error('Error fetching expired ads:', error);
      return 0;
    }

    if (!expiredAds || expiredAds.length === 0) {
      return 0;
    }

    // Pausar todos os anúncios expirados
    const { error: updateError } = await supabase
      .from('anuncios')
      .update({
        status: 'completed',
        completion_reason: 'duration_ended',
      })
      .in('id', expiredAds.map(ad => ad.id));

    if (updateError) {
      console.error('Error pausing expired ads:', updateError);
      return 0;
    }

    // console.log(`Paused ${expiredAds.length} expired ads`);
    return expiredAds.length;

  } catch (error) {
    console.error('Error in checkAndPauseExpiredAds:', error);
    return 0;
  }
};

/**
 * Verificar status de um anúncio (se deve continuar sendo exibido)
 */
export const shouldShowAd = async (adId: string): Promise<boolean> => {
  try {
    const { data: ad, error } = await supabase
      .from('anuncios')
      .select('status, approval_status, end_date, max_impressions, views_count, budget, spent, payment_type')
      .eq('id', adId)
      .single();

    if (error || !ad) {
      return false;
    }

    // Verificar status básico
    if (ad.status !== 'active' || ad.approval_status !== 'approved') {
      return false;
    }

    // Verificar data de término
    if (ad.end_date && new Date(ad.end_date) < new Date()) {
      return false;
    }

    // Verificar impressões máximas (pacotes)
    if (ad.payment_type === 'package' && ad.max_impressions) {
      if ((ad.views_count || 0) >= ad.max_impressions) {
        return false;
      }
    }

    // Verificar orçamento (CPM)
    if (ad.payment_type === 'cpm' && ad.budget) {
      if ((ad.spent || 0) >= ad.budget) {
        return false;
      }
    }

    return true;

  } catch (error) {
    console.error('Error checking if should show ad:', error);
    return false;
  }
};

/**
 * Obter métricas de um anúncio
 */
export const getAdMetrics = async (adId: string) => {
  try {
    const { data: ad, error } = await supabase
      .from('anuncios')
      .select('*')
      .eq('id', adId)
      .single();

    if (error || !ad) {
      return null;
    }

    const metrics = {
      views: ad.views_count || 0,
      likes: ad.likes_count || 0,
      shares: ad.shares_count || 0,
      comments: ad.comments_count || 0,
      spent: ad.spent || 0,
      budget: ad.budget || 0,
      maxImpressions: ad.max_impressions || 0,
      ctr: ad.views_count > 0 ? ((ad.likes_count || 0) / ad.views_count * 100).toFixed(2) : '0.00',
      budgetUsed: ad.budget > 0 ? ((ad.spent || 0) / ad.budget * 100).toFixed(2) : '0.00',
      impressionsUsed: ad.max_impressions > 0 ? ((ad.views_count || 0) / ad.max_impressions * 100).toFixed(2) : '0.00',
    };

    return metrics;

  } catch (error) {
    console.error('Error getting ad metrics:', error);
    return null;
  }
};

/**
 * Pausar manualmente um anúncio
 */
export const pauseAd = async (adId: string, reason: 'manual_pause' | 'budget_exhausted' | 'impressions_reached' | 'duration_ended') => {
  try {
    const { data, error } = await supabase
      .from('anuncios')
      .update({
        status: 'completed',
        completion_reason: reason,
      })
      .eq('id', adId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };

  } catch (error: any) {
    console.error('Error pausing ad:', error);
    return { data: null, error: error.message };
  }
};
