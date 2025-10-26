import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';

interface PresenceContextType {
  onlineUserIds: string[];
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useSession();
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('global-presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel.on('presence', { event: 'sync' }, () => {
      const newState = channel.presenceState();
      const userIds = Object.keys(newState).map(key => (newState[key][0] as any).user_id).filter(Boolean);
      setOnlineUserIds(userIds);
    });

    channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      const joinedUserIds = newPresences.map(p => (p as any).user_id).filter(Boolean);
      setOnlineUserIds(prev => [...new Set([...prev, ...joinedUserIds])]);
    });

    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      const leftUserIds = leftPresences.map(p => (p as any).user_id).filter(Boolean);
      setOnlineUserIds(prev => prev.filter(id => !leftUserIds.includes(id)));
    });

    if (user.showActivityStatus) {
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString(), user_id: user.id });
        }
      });
    } else {
      channel.subscribe();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <PresenceContext.Provider value={{ onlineUserIds }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
};