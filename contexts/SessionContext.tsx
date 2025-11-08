import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { getSessionSafe } from '../src/utils/supabaseAuthSafe';
import { User } from '../types';

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
    // Verificar se a sessão expirou antes de buscar
    const keepLoggedIn = localStorage.getItem('keepLoggedIn');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    
    if (keepLoggedIn === 'false' && sessionExpiry && sessionExpiry !== 'never') {
      const expiryTime = parseInt(sessionExpiry);
      if (Date.now() >= expiryTime) {
        // Sessão expirou, fazer logout
        localStorage.removeItem('keepLoggedIn');
        localStorage.removeItem('sessionExpiry');
        try {
          // Logout local para evitar erros de rede durante navegação/expiração
          await supabase.auth.signOut({ scope: 'local' });
        } catch (error) {
          // Silenciar erros de logout automático
          console.log('Logout automático realizado (conexão pode ter sido interrompida)');
        }
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
    }
    
    const currentSession = await getSessionSafe();
    setSession(currentSession);

    if (currentSession?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();
      
      if (profile) {
        // LOGS: Mapear dados brutos do perfil
        console.log('🔍 [SessionContext] Dados brutos do profile:', {
          profile_created_at: profile.created_at,
          profile_updated_at: profile.updated_at,
          auth_user_created_at: currentSession.user.created_at,
          profile_id: profile.id
        });
        
        // CORRIGIDO: Usar múltiplas fontes em ordem de prioridade
        // 1. profile.created_at (se existir)
        // 2. profile.updated_at (mesma data segundo usuário)
        // 3. auth.users.created_at (backup)
        // 4. Date.now() (último recurso)
        const dateSource = profile.created_at || profile.updated_at || currentSession.user.created_at;
        const createdAtDate = dateSource ? new Date(dateSource) : new Date();
        
        console.log('📅 [SessionContext] Processamento da data:', {
          profile_created_at_raw: profile.created_at,
          profile_updated_at_raw: profile.updated_at,
          auth_user_created_at_raw: currentSession.user.created_at,
          dateSource_used: dateSource,
          createdAtDate_parsed: createdAtDate.toISOString(),
          joinDate_formatted: `Joined ${createdAtDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          is_using_fallback: !dateSource
        });
        
        const appUser: User = {
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
          username: profile.username,
          avatarUrl: profile.avatar_url || '',
          bannerUrl: profile.banner_url || '',
          bio: profile.bio || '', // Garantir que não seja null
          joinDate: `Joined ${createdAtDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          createdAt: dateSource, // Usar a fonte que tiver dados
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
        
        console.log('✅ [SessionContext] appUser final:', {
          joinDate: appUser.joinDate,
          createdAt: appUser.createdAt,
          id: appUser.id,
          username: appUser.username
        });
        
        setUser(appUser);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    
    // Verificar se estamos em um fluxo de recuperação de senha
    const isPasswordRecovery = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      return params.get('type') === 'recovery';
    };

    // Só buscar perfil se não estivermos em recuperação de senha
    if (!isPasswordRecovery()) {
      getSessionAndProfile();
    } else {
      setLoading(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      
      // Durante recuperação de senha, não fazer login automático no SIGNED_IN inicial
      if (isPasswordRecovery() && _event === 'SIGNED_IN') {
        setLoading(false);
        return;
      }
      
      // Para USER_UPDATED durante password recovery, fazer login automático
      if (_event === 'USER_UPDATED' && isPasswordRecovery()) {
        // Limpar o hash de recovery da URL para permitir login normal
        window.history.replaceState({}, document.title, window.location.pathname);
        getSessionAndProfile();
        return;
      }
      
      if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || _event === 'USER_UPDATED') {
        getSessionAndProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getSessionAndProfile]);

  // Sistema de monitoramento de inatividade
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let lastActivity = Date.now();

    const checkSessionExpiry = () => {
      const keepLoggedIn = localStorage.getItem('keepLoggedIn');
      const sessionExpiry = localStorage.getItem('sessionExpiry');
      
      if (session && keepLoggedIn === 'false' && sessionExpiry && sessionExpiry !== 'never') {
        const expiryTime = parseInt(sessionExpiry);
        if (Date.now() >= expiryTime) {
          try {
            // Logout local evita chamada de rede que pode ser abortada
            supabase.auth.signOut({ scope: 'local' });
          } catch (error) {
            // Silenciar erros de logout por inatividade
            console.log('Logout por inatividade realizado (conexão pode ter sido interrompida)');
          }
          localStorage.removeItem('sessionExpiry');
          localStorage.removeItem('keepLoggedIn');
        }
      }
    };

    const resetInactivityTimer = () => {
      const keepLoggedIn = localStorage.getItem('keepLoggedIn');
      
      if (session && keepLoggedIn === 'false') {
        lastActivity = Date.now();
        const inactivityTimeout = 30 * 60 * 1000; // 30 minutos
        const newExpiryTime = Date.now() + inactivityTimeout;
        localStorage.setItem('sessionExpiry', newExpiryTime.toString());
        
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(checkSessionExpiry, inactivityTimeout);
      }
    };

    const handleActivity = () => {
      resetInactivityTimer();
    };

    if (session) {
      // Verificar expiração na inicialização
      checkSessionExpiry();
      
      // Configurar timer se não for "manter conectado"
      const keepLoggedIn = localStorage.getItem('keepLoggedIn');
      if (keepLoggedIn === 'false') {
        resetInactivityTimer();
        
        // Monitorar atividade do usuário
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
          document.addEventListener(event, handleActivity, true);
        });

        return () => {
          clearTimeout(inactivityTimer);
          events.forEach(event => {
            document.removeEventListener(event, handleActivity, true);
          });
        };
      }
    }

    return () => {
      clearTimeout(inactivityTimer);
    };
  }, [session]);

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