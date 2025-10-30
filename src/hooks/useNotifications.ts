import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification, User } from '@/types';
import { useToast } from '@/hooks/useToast';
import * as api from '@/src/services/api';

export const useNotifications = (appUser: User | null, allUsers: User[]) => {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!appUser) return;
    try {
      const { data, error } = await api.fetchNotifications(appUser.id);
      if (error) throw error;
      const formattedNotifications: Notification[] = data.filter((n: any) => n.actor).map((n: any) => ({
        id: n.id, type: n.type, post_id: n.post_id, is_read: n.is_read, created_at: n.created_at,
        actor: {
          id: n.actor.id, name: `${n.actor.first_name || ''} ${n.actor.last_name || ''}`.trim() || n.actor.username,
          username: n.actor.username, avatarUrl: n.actor.avatar_url || `https://picsum.photos/seed/${n.actor.id}/100/100`,
          joinDate: '', followingCount: 0, followersCount: 0, plan: n.actor.plan || 'free', role: n.actor.role || 'user',
        }
      }));
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
        (payload) => {
          const actor = allUsers.find(u => u.id === payload.new.actor_id);
          if (!actor) return;
          const newNotification: Notification = {
            id: payload.new.id, type: payload.new.type, post_id: payload.new.post_id, is_read: payload.new.is_read, created_at: payload.new.created_at,
            actor: { ...actor }
          };
          setNotifications(prev => [newNotification, ...prev]);
          addToast(`Nova notificação de ${newNotification.actor.name}!`, 'info');
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