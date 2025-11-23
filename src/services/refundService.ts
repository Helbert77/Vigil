import { supabase } from '@/integrations/supabase/client';

export const processAdRefund = async (adId: string, userId: string) => {
    const { data, error } = await supabase.functions.invoke('process-ad-refund', {
        body: { adId, userId },
    });

    if (error) {
        throw error;
    }

    if (data?.error) {
        throw new Error(data.error);
    }

    return data;
};
