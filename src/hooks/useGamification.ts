import { useCallback } from 'react';
import * as api from '@/src/services/api';
import { useToast } from '@/hooks/useToast';

export const useGamification = (userId: string | undefined) => {
  const { addToast } = useToast();

  // Adicionar XP ao usuário
  const addXP = useCallback(async (params: {
    xpAmount: number;
    sourceType: string;
    sourceId?: string;
    description?: string;
    showToast?: boolean;
  }) => {
    if (!userId) return null;

    try {
      const { data, error } = await api.addXPToUser({
        userId,
        xpAmount: params.xpAmount,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        description: params.description,
      });

      if (error) {
        console.error('[useGamification] Error adding XP:', error);
        return null;
      }

      // Mostrar toast se solicitado
      if (params.showToast !== false) {
        addToast(`+${params.xpAmount} XP 🌟`, 'success');
      }

      // Se subiu de nível, mostrar notificação especial
      if (data?.leveled_up) {
        addToast(`🎊 Parabéns! Você alcançou o Nível ${data.new_level}!`, 'success');
      }

      return data;
    } catch (error) {
      console.error('[useGamification] Exception adding XP:', error);
      return null;
    }
  }, [userId, addToast]);

  // Desbloquear conquista
  const unlockAchievement = useCallback(async (achievementCode: string) => {
    if (!userId) return null;

    try {
      const { data, error } = await api.unlockAchievement(userId, achievementCode);

      if (error) {
        console.error('[useGamification] Error unlocking achievement:', error);
        return null;
      }

      // Se desbloqueou com sucesso, mostrar notificação
      if (data?.success) {
        const achievement = data.achievement;
        addToast(
          `🏆 Conquista Desbloqueada: ${achievement.name} (+${achievement.xp_reward} XP)`,
          'success'
        );

        // Se subiu de nível com a conquista
        if (data.xp_result?.leveled_up) {
          addToast(`🎊 Você alcançou o Nível ${data.xp_result.new_level}!`, 'success');
        }
      }

      return data;
    } catch (error) {
      console.error('[useGamification] Exception unlocking achievement:', error);
      return null;
    }
  }, [userId, addToast]);

  // Atualizar progresso de missão
  const updateMissionProgress = useCallback(async (missionId: string, increment: number = 1) => {
    if (!userId) return null;

    try {
      const { data, error } = await api.updateMissionProgress(userId, missionId, increment);

      if (error) {
        console.error('[useGamification] Error updating mission:', error);
        return null;
      }

      // Se completou a missão, mostrar notificação
      if (data?.completed && !data?.already_completed) {
        addToast(`✅ Missão Completada! (+${data.xp_result?.xp_amount || 0} XP)`, 'success');

        // Se subiu de nível
        if (data.xp_result?.leveled_up) {
          addToast(`🎊 Você alcançou o Nível ${data.xp_result.new_level}!`, 'success');
        }
      }

      return data;
    } catch (error) {
      console.error('[useGamification] Exception updating mission:', error);
      return null;
    }
  }, [userId, addToast]);

  // Registrar evento de conversão
  const trackConversion = useCallback(async (eventType: string, eventData?: Record<string, any>) => {
    if (!userId) return null;

    try {
      const { error } = await api.trackConversionEvent({
        userId,
        eventType,
        eventData,
      });

      if (error) {
        console.error('[useGamification] Error tracking conversion:', error);
        return null;
      }

      return true;
    } catch (error) {
      console.error('[useGamification] Exception tracking conversion:', error);
      return null;
    }
  }, [userId]);

  // Verificar e desbloquear conquistas baseadas em contadores
  const checkAchievements = useCallback(async (type: string, count: number) => {
    if (!userId) return;

    // Mapeamento de conquistas por tipo e contagem
    const achievementMap: Record<string, Record<number, string>> = {
      posts: {
        1: 'first_post',
        50: 'content_creator',
        200: 'prolific_writer',
      },
      likes_received: {
        100: 'popular',
        500: 'liked',
      },
      comments_made: {
        100: 'conversationalist',
      },
      followers: {
        50: 'influencer',
        200: 'mega_influencer',
      },
      communities_created: {
        3: 'community_builder',
      },
      communities_joined: {
        1: 'first_community_join',
        10: 'social_butterfly',
      },
      media_posts: {
        50: 'media_master',
      },
      comments_received: {
        100: 'commented',
      },
    };

    const achievements = achievementMap[type];
    if (achievements && achievements[count]) {
      await unlockAchievement(achievements[count]);
    }
  }, [userId, unlockAchievement]);

  return {
    addXP,
    unlockAchievement,
    updateMissionProgress,
    trackConversion,
    checkAchievements,
  };
};

