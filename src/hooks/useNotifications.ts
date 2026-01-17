import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Notification as AppNotification, User } from '@/types';
import { useToast } from '@/hooks/useToast';
import * as api from '@/src/services/api';

const _notifiedIds = new Set<string>();
let _lastShownTs = 0;

export const useNotifications = (appUser: User | null, allUsers: User[]) => {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!appUser) return;
    try {
      const { data, error } = await api.fetchNotifications(appUser.id);
      if (error) throw error;
      const formattedNotifications: AppNotification[] = data
        .map((n: any) => {
          // Para notificações sem actor (sistema), usar o próprio usuário
          let actor = n.actor;
          if (!actor && n.actor_id === appUser.id) {
            actor = {
              id: appUser.id,
              first_name: appUser.name.split(' ')[0],
              last_name: appUser.name.split(' ').slice(1).join(' '),
              username: appUser.username,
              avatar_url: appUser.avatarUrl,
              plan: appUser.plan,
              role: appUser.role || 'user',
            };
          }
          
          if (!actor) return null; // Pular notificações sem actor válido
          
          return {
            id: n.id, 
            type: n.type, 
            post_id: n.post_id, 
            is_read: n.is_read, 
            created_at: n.created_at,
            metadata: n.metadata || undefined,
            actor: {
              id: actor.id, 
              name: `${actor.first_name || ''} ${actor.last_name || ''}`.trim() || actor.username,
              username: actor.username, 
              avatarUrl: actor.avatar_url || `https://picsum.photos/seed/${actor.id}/100/100`,
              joinDate: '', 
              followingCount: 0, 
              followersCount: 0, 
              plan: actor.plan || 'free', 
              role: actor.role || 'user',
            }
          };
        })
        .filter((n: any) => n !== null); // Remover nulls
      setNotifications(formattedNotifications);
    } catch (error) {
      // Error log removed for production
    }
  }, [appUser]);

  useEffect(() => {
    if (appUser) {
      fetchNotifications();
      const notificationsChannel = supabase.channel('public:notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${appUser.id}` },
          async (payload) => {
            let actor = allUsers.find(u => u.id === payload.new.actor_id);

            // Se actor não está em allUsers, buscar do banco
            if (!actor) {
              const { data: actorProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', payload.new.actor_id)
                .single();

              if (actorProfile) {
                actor = {
                  id: actorProfile.id,
                  name: `${actorProfile.first_name || ''} ${actorProfile.last_name || ''}`.trim() || actorProfile.username,
                  username: actorProfile.username,
                  avatarUrl: actorProfile.avatar_url || `https://picsum.photos/seed/${actorProfile.id}/100/100`,
                  joinDate: '',
                  followingCount: 0,
                  followersCount: 0,
                  plan: actorProfile.plan || 'free',
                  role: actorProfile.role || 'user',
                };
              }
            }

            // Para notificações de sistema (assinatura, etc), usar o próprio usuário como actor se não encontrado
            if (!actor && payload.new.actor_id === appUser.id) {
              actor = {
                id: appUser.id,
                name: appUser.name,
                username: appUser.username,
                avatarUrl: appUser.avatarUrl,
                joinDate: appUser.joinDate,
                followingCount: appUser.followingCount,
                followersCount: appUser.followersCount,
                plan: appUser.plan,
                role: appUser.role || 'user',
              };
            }

            if (!actor) return;

            const newNotification: AppNotification = {
              id: payload.new.id, type: payload.new.type, post_id: payload.new.post_id, is_read: payload.new.is_read, created_at: payload.new.created_at,
              metadata: payload.new.metadata || undefined,
              actor: { ...actor }
            };
            setNotifications(prev => [newNotification, ...prev]);
            addToast(`Nova notificação de ${newNotification.actor.name}!`, 'info');
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              const hidden = document.visibilityState === 'hidden' || !document.hasFocus();
              const now = Date.now();
              const canShow = hidden && (now - _lastShownTs > 15000) && !_notifiedIds.has(newNotification.id);
              if (canShow) {
                try {
                  new Notification('Nova notificação', {
                    body: `${newNotification.actor.name} enviou uma ${newNotification.type}`,
                    icon: '/logo.png',
                    tag: `notif-${newNotification.id}`,
                  });
                  if (navigator?.vibrate) navigator.vibrate([20]);
                } catch { }
                _lastShownTs = now;
                _notifiedIds.add(newNotification.id);
              }
            }
          })
        .subscribe();
      return () => { supabase.removeChannel(notificationsChannel); };
    }
  }, [appUser, allUsers, addToast, fetchNotifications]);

  useEffect(() => {
    setUnreadNotificationsCount(notifications.filter(n => !n.is_read).length);
  }, [notifications]);

  const handleClearNotifications = useCallback(async () => {
    if (!appUser) return;
    const originalNotifications = [...notifications];
    setNotifications([]);
    try {
      const { error } = await api.clearAllNotifications(appUser.id);
      if (error) throw error;
    } catch (error) {
      addToast('Falha ao limpar notificações.', 'error');
      setNotifications(originalNotifications);
    }
  }, [appUser, addToast, notifications]);

  const markNotificationsAsRead = useCallback(async () => {
    if (!appUser || unreadNotificationsCount === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await api.markAllNotificationsAsRead(appUser.id);
    } catch (error) {
      // Silently fail, not critical for user - error log removed for production
    }
  }, [appUser, unreadNotificationsCount]);

  return { notifications, unreadNotificationsCount, handleClearNotifications, markNotificationsAsRead };
};
