import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { Icon } from '@/components/icons/Icon';
import { EyeIcon } from '@/components/icons/EyeIcon';
import { EyeOffIcon } from '@/components/icons/EyeOffIcon';
import { useTranslation } from 'react-i18next';

// Ícones para os cartões de recursos
const UsersIcon = () => <Icon className="h-8 w-8 mb-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></Icon>;
const ShieldIcon = () => <Icon className="h-8 w-8 mb-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></Icon>;
const MessageSquareIcon = () => <Icon className="h-8 w-8 mb-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></Icon>;
const TrendingUpIcon = () => <Icon className="h-8 w-8 mb-4"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></Icon>;

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, children }) => (
  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg text-center flex flex-col items-center">
    {icon}
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-sm text-white/80">{children}</p>
  </div>
);

const Login: React.FC = () => {
  const { addToast } = useToast();
  const { t } = useTranslation(['auth', 'common', 'errors']);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para controlar visibilidade das senhas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      addToast(signInError.message, 'error');
    } else if (data.session) {
      await supabase.auth.setSession(data.session);

      // Configurar duração da sessão baseada na escolha do usuário
      if (keepLoggedIn) {
        // Manter conectado: armazenar preferência no localStorage
        localStorage.setItem('keepLoggedIn', 'true');
        localStorage.setItem('sessionExpiry', 'never');
      } else {
        // Não manter conectado: configurar timeout de inatividade
        localStorage.setItem('keepLoggedIn', 'false');
        const inactivityTimeout = 30 * 60 * 1000; // 30 minutos em millisegundos
        const expiryTime = Date.now() + inactivityTimeout;
        localStorage.setItem('sessionExpiry', expiryTime.toString());

        // Configurar timer para logout automático
        setTimeout(() => {
          const currentExpiry = localStorage.getItem('sessionExpiry');
          if (currentExpiry && currentExpiry !== 'never' && Date.now() >= parseInt(currentExpiry)) {
            try {
              supabase.auth.signOut();
              addToast(t('auth:sessionExpired'), 'info');
            } catch (error) {
              // Silenciar erros de logout automático
              // console.log('Logout automático por inatividade realizado');
              addToast(t('auth:sessionExpired'), 'info');
            }
          }
        }, inactivityTimeout);
      }
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetMessage(null);
    
    const redirectUrl = `${window.location.origin}/`;
    
    try {
      // Tentar usar edge function para email personalizado
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, username')
        .eq('email', resetEmail)
        .single();
      
      const userName = profile 
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
        : undefined;

      const { error: edgeError } = await supabase.functions.invoke('send-password-reset-email', {
        body: {
          email: resetEmail,
          userName,
          redirectTo: redirectUrl,
        },
      });

      if (edgeError) {
        // Se edge function falhar, usar método padrão do Supabase
        console.warn('Edge function falhou, usando método padrão:', edgeError);
        
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
          redirectTo: redirectUrl,
        });

        if (resetError) {
          throw resetError;
        }
      }

      // Sucesso!
      setResetMessage(t('auth:resetLinkSentMessage'));
      addToast(t('auth:resetLinkSent'), 'success');
      setIsResettingPassword(false);
    } catch (error: any) {
      setError(error.message || t('auth:errorSendingRecoveryEmail'));
      addToast(error.message || t('auth:errorSendingEmail'), 'error');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      const errorMsg = t('auth:passwordsDoNotMatch');
      setError(errorMsg);
      addToast(errorMsg, 'error');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      addToast(signUpError.message, 'error');
    } else {
      addToast(t('auth:accountCreatedSuccess'), 'success');
      setIsCreatingAccount(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setUsername('');
    }
    setLoading(false);
  };

  const renderFormContent = () => {
    if (isResettingPassword) {
      return (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('auth:resetPassword')}</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('auth:resetPasswordInstructions')}</p>
          </div>
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth:email')}</label>
              <input
                id="resetEmail"
                name="resetEmail"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-200"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {resetMessage && <p className="text-green-500 text-sm text-center">{resetMessage}</p>}
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50">
              {loading ? t('auth:sending') : t('auth:sendLink')}
            </button>
            <div className="text-center text-sm">
              <button type="button" onClick={() => setIsResettingPassword(false)} className="font-medium text-primary hover:text-gray-600 dark:hover:text-gray-400">{t('auth:backToLogin')}</button>
            </div>
          </form>
        </>
      );
    }

    if (isCreatingAccount) {
      return (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('auth:createAccount')}</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('auth:joinInvestigation')}</p>
          </div>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth:firstName')}</label>
                <input id="firstName" name="firstName" type="text" required className="mt-1 w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-200" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth:lastName')}</label>
                <input id="lastName" name="lastName" type="text" className="mt-1 w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-200" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="username-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth:username')}</label>
              <input
                id="username-signup"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="mt-1 w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-200"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth:email')}</label>
              <input
                id="email-signup"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth:password')}</label>
              <div className="relative">
                <input
                  id="password-signup"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="mt-1 w-full px-3 py-2 pr-10 border border-light-border dark:border-dark-border rounded-md shadow-sm bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth:confirmPassword')}</label>
              <div className="relative">
                <input
                  id="confirm-password-signup"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="mt-1 w-full px-3 py-2 pr-10 border border-light-border dark:border-dark-border rounded-md shadow-sm bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-2 px-4 rounded-md shadow-sm text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50">
              {loading ? t('auth:creatingAccount') : t('auth:createAccountButton')}
            </button>
            <div className="text-center text-sm">
              <p className="text-gray-600 dark:text-gray-400">{t('auth:alreadyHaveAccount')} <button type="button" onClick={() => setIsCreatingAccount(false)} className="font-medium text-primary hover:text-gray-600 dark:hover:text-gray-400">{t('auth:signIn')}</button></p>
            </div>
          </form>
        </>
      );
    }

    return (
      <>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('auth:welcomeBack')}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('auth:signInToAccount')}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth:email')}</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 appearance-none block w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth:password')}</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 pr-10 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="keep-logged-in" name="keep-logged-in" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded bg-light-bg dark:bg-dark-bg" checked={keepLoggedIn} onChange={(e) => setKeepLoggedIn(e.target.checked)} />
              <label htmlFor="keep-logged-in" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">{t('auth:keepLoggedIn')}</label>
            </div>
            <div className="text-sm">
              <button type="button" onClick={() => setIsResettingPassword(true)} className="font-medium text-primary hover:text-gray-600 dark:hover:text-gray-400">{t('auth:forgotPassword')}</button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50">
            {loading ? t('auth:signingIn') : t('auth:signIn')}
          </button>
          <div className="text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">{t('auth:dontHaveAccount')} <button type="button" onClick={() => setIsCreatingAccount(true)} className="font-medium text-primary hover:text-gray-600 dark:hover:text-gray-400">{t('auth:signUp')}</button></p>
          </div>
        </form>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Section: Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center order-2 md:order-1">
          <div className="mx-auto w-full max-w-md">
            <div className="flex justify-center mb-6">
              <LogoIcon className="h-24 w-24" />
            </div>
            {renderFormContent()}
          </div>
        </div>

        {/* Right Section: Features */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center items-center text-center bg-gradient-to-br from-purple-600 to-blue-500 text-white order-1 md:order-2">
          <h1 className="text-3xl font-bold mb-4">{t('auth:tagline')}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 w-full">
            <FeatureCard icon={<UsersIcon />} title={t('auth:features.activeCommunity')}>
              {t('auth:features.activeCommunityDesc')}
            </FeatureCard>
            <FeatureCard icon={<ShieldIcon />} title={t('auth:features.privacyFirst')}>
              {t('auth:features.privacyFirstDesc')}
            </FeatureCard>
            <FeatureCard icon={<MessageSquareIcon />} title={t('auth:features.meaningfulConversations')}>
              {t('auth:features.meaningfulConversationsDesc')}
            </FeatureCard>
            <FeatureCard icon={<TrendingUpIcon />} title={t('auth:features.trendingContent')}>
              {t('auth:features.trendingContentDesc')}
            </FeatureCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;