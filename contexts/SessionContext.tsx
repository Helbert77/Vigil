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
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (!profile) {
          setUser(null);
        } else {
          // Buscar dados de subscription para verificar trial e cancelamento
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('status, trial_ends_at, cancel_at_period_end, current_period_end, canceled_at')
            .eq('user_id', currentSession.user.id)
            .single();

          const dateSource = profile.created_at || profile.updated_at || currentSession.user.created_at;
          const createdAtDate = dateSource ? new Date(dateSource) : new Date();

          const appUser: User = {
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
            username: profile.username,
            avatarUrl: profile.avatar_url || '',
            bannerUrl: profile.banner_url || '',
            bio: profile.bio || '',
            joinDate: `Joined ${createdAtDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
            createdAt: dateSource,
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
            subscription_status: subscription?.status || 'active',
            trial_ends_at: subscription?.trial_ends_at || null,
            cancel_at_period_end: subscription?.cancel_at_period_end || false,
            current_period_end: subscription?.current_period_end || null,
            canceled_at: subscription?.canceled_at || null,
          };

          setUser(appUser);
          
          // Gamificação: Verificar login diário
          try {
            const { data: gamification } = await supabase
              .from('user_gamification')
              .select('last_login_date')
              .eq('user_id', appUser.id)
              .single();
            
            const today = new Date().toISOString().split('T')[0];
            const lastLogin = gamification?.last_login_date;
            
            // Se não logou hoje, processar ação de login
            if (!lastLogin || lastLogin !== today) {
              await supabase.functions.invoke('process-gamification-action', {
                body: {
                  userId: appUser.id,
                  actionType: 'login',
                  metadata: {
                    description: 'Login diário',
                  },
                },
              });
              
              // Atualizar data do último login
              await supabase
                .from('user_gamification')
                .upsert({
                  user_id: appUser.id,
                  last_login_date: today,
                }, { onConflict: 'user_id' });
            }
          } catch (gamError) {
            // Não bloquear login se gamificação falhar
            console.error('[SessionContext] Gamification error:', gamError);
          }
        }
      } catch {
        // Silenciar erros de rede (ERR_ABORTED / Failed to fetch) sem quebrar fluxo
        setUser(null);
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
      // Primeiro, verificar parâmetros salvos (antes do hash ser limpo)
      if ((window as any).__supabaseHashParams?.type === 'recovery') {
        return true;
      }
      
      // Fallback: verificar hash atual
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
        // Limpar parâmetros salvos após usar
        if ((window as any).__supabaseHashParams) {
          delete (window as any).__supabaseHashParams;
        }
        
        setLoading(false);
        return;
      }
      
      // Durante recuperação de senha, não fazer login automático no USER_UPDATED
      // O UpdatePassword.tsx vai fazer logout e redirecionar para login
      const isInPasswordRecoveryFlow = (window as any).__isPasswordRecoveryFlow;
      if (_event === 'USER_UPDATED' && isInPasswordRecoveryFlow) {
        setLoading(false);
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
