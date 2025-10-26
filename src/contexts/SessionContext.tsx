import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from "@/types";

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
    console.log('%c[SessionContext] Iniciando getSessionAndProfile...', 'color: blue; font-weight: bold;');
    setLoading(true);

    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
        console.error('[SessionContext] Erro ao obter sessão:', sessionError);
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
    }
    
    setSession(currentSession);
    console.log('[SessionContext] Sessão obtida:', currentSession);

    if (currentSession?.user) {
      console.log(`[SessionContext] Sessão encontrada para o usuário ID: ${currentSession.user.id}. Buscando perfil...`);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();
      
      if (profileError) {
          console.error('%c[SessionContext] CRÍTICO: Erro ao buscar perfil:', 'color: red; font-weight: bold;', profileError);
          setUser(null);
          setLoading(false);
          return;
      }

      console.log('%c[SessionContext] Dados do perfil obtidos do BD:', 'color: green; font-weight: bold;', profile);
      
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
        console.log('%c[SessionContext] Objeto final appUser criado:', 'color: green; font-weight: bold;', appUser);
        setUser(appUser);
      } else {
        console.warn('[SessionContext] Sessão de usuário existe, mas nenhum perfil foi encontrado no BD.');
        setUser(null);
      }
    } else {
      console.log('[SessionContext] Nenhuma sessão ativa encontrada.');
      setUser(null);
    }
    setLoading(false);
    console.log('%c[SessionContext] Finalizado getSessionAndProfile.', 'color: blue; font-weight: bold;');
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