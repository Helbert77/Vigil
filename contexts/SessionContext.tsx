import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getSessionAndProfile = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    setSession(currentSession);

    if (currentSession?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();
      
      if (profile) {
        const appUser: User = {
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
          username: profile.username,
          avatarUrl: profile.avatar_url || '',
          bannerUrl: profile.banner_url || '',
          bio: profile.bio,
          joinDate: `Joined ${new Date(currentSession.user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          followingCount: profile.following_count || 0,
          followersCount: profile.followers_count || 0,
          theme: profile.theme || 'light',
          notifications: profile.notifications_settings || { likes: true, comments: true, newFollowers: false, messages: true },
          mutedWords: profile.muted_words || [],
          showSensitiveContent: profile.show_sensitive_content ?? false,
          showActivityStatus: profile.show_activity_status ?? true,
          profileViewMode: profile.profile_view_mode || 'list',
          role: profile.role || 'user',
          plan: profile.plan || 'free',
        };
        setUser(appUser);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || _event === 'USER_UPDATED') {
        getSessionAndProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getSessionAndProfile]);

  const value = {
    session,
    user,
    loading,
    refreshUser: getSessionAndProfile,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};