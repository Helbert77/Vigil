import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

const UpdatePassword: React.FC = () => {
  const { t } = useTranslation(['password', 'common']);
  const { theme } = useTheme();
  const { addToast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Inicialização do componente
  useEffect(() => {
    // Marcar que estamos em fluxo de recuperação de senha
    (window as any).__isPasswordRecoveryFlow = true;
    
    // Verificar se há erro de auth capturado
    const authError = (window as any).__supabaseAuthError;
    if (authError) {
      // Mostrar mensagem de erro apropriada
      if (authError.errorCode === 'otp_expired') {
        setErrors([t('password:errors.recoveryLinkExpired')]);
        addToast(t('password:toasts.linkExpired'), 'error');
      } else {
        setErrors([authError.errorDescription || t('password:errors.recoveryLinkError')]);
        addToast(t('password:toasts.linkError'), 'error');
      }
      
      // Limpar o erro
      delete (window as any).__supabaseAuthError;
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }, [addToast]);

  // Função para calcular a força da senha
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    let label = '';
    let color = '';
    
    switch (score) {
      case 0:
      case 1:
        label = t('password:strength.veryWeak');
        color = 'bg-red-500';
        break;
      case 2:
        label = t('password:strength.weak');
        color = 'bg-orange-500';
        break;
      case 3:
        label = t('password:strength.medium');
        color = 'bg-yellow-500';
        break;
      case 4:
        label = t('password:strength.strong');
        color = 'bg-blue-500';
        break;
      case 5:
        label = t('password:strength.veryStrong');
        color = 'bg-green-500';
        break;
      default:
        label = t('password:strength.veryWeak');
        color = 'bg-red-500';
    }

    return { score, label, color, requirements };
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Validação completa da senha
  const validatePassword = (): string[] => {
    const errors: string[] = [];

    if (!password) {
      errors.push(t('password:errors.newPasswordRequired'));
    } else {
      if (password.length < 8) {
        errors.push(t('password:errors.minLength'));
      }
      if (password.length > 128) {
        errors.push(t('password:errors.maxLength'));
      }
      if (!/[A-Z]/.test(password)) {
        errors.push(t('password:errors.uppercaseRequired'));
      }
      if (!/[a-z]/.test(password)) {
        errors.push(t('password:errors.lowercaseRequired'));
      }
      if (!/[0-9]/.test(password)) {
        errors.push(t('password:errors.numberRequired'));
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push(t('password:errors.specialRequired'));
      }
    }

    if (!confirmPassword) {
      errors.push(t('password:errors.confirmRequired'));
    } else if (password !== confirmPassword) {
      errors.push(t('password:errors.passwordsDontMatch'));
    }

    return errors;
  };

  useEffect(() => {
    console.log('👂 [UPDATE_PASSWORD] Registrando listener de mudança de auth');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('🔔 [UPDATE_PASSWORD] Auth state changed!');
      console.log('📢 [UPDATE_PASSWORD] Evento:', event);
      console.log('👤 [UPDATE_PASSWORD] Sessão:', session ? 'EXISTE' : 'NULL');
      
      if (event === 'USER_UPDATED') {
        console.log('✅ [UPDATE_PASSWORD] USER_UPDATED detectado!');
        
        if (session) {
          console.log('✅ [UPDATE_PASSWORD] Sessão válida após update');
          console.log('👤 [UPDATE_PASSWORD] User:', session.user?.email);
          
          addToast(t('password:success.updated'), 'success');
          setSuccess(true);
          
          console.log('⏰ [UPDATE_PASSWORD] Aguardando 2s para redirecionar...');
          
          // Fazer logout e redirecionar para login
          setTimeout(async () => {
            console.log('🔄 [UPDATE_PASSWORD] Fazendo logout e redirecionando para Login...');
            
            // Limpar flag de recovery
            delete (window as any).__isPasswordRecoveryFlow;
            console.log('🧹 [UPDATE_PASSWORD] Flag de recovery removida');
            
            // Fazer logout para forçar novo login com nova senha
            await supabase.auth.signOut({ scope: 'local' });
            
            // Limpar o hash de recovery da URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Redirecionar para página de login
            window.location.href = '/';
            
            console.log('✅ [UPDATE_PASSWORD] Redirecionamento concluído');
          }, 2000);
        } else {
          console.warn('⚠️ [UPDATE_PASSWORD] USER_UPDATED mas sessão é NULL!');
        }
      }
    });

    return () => {
      console.log('🔇 [UPDATE_PASSWORD] Removendo listener de auth');
      subscription.unsubscribe();
    };
  }, [addToast]);

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setLoading(true);
    setErrors([]);

    const validationErrors = validatePassword();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }
    
    // Verificar sessão antes de tentar atualizar
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    if (!currentSession) {
      setErrors([t('password:errors.sessionExpired')]);
      addToast(t('password:toasts.sessionExpired'), 'error');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrors([error.message]);
        addToast(t('password:errors.updateError') + ' ' + error.message, 'error');
      }
    } catch (error: any) {
      setErrors([t('password:errors.unexpectedError')]);
      addToast(t('password:errors.unexpectedError'), 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-light-card dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('password:title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('password:subtitle')}</p>
        </div>

        {/* Mensagens de erro */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {errors.length === 1 ? t('password:errors.single') : `${errors.length} ${t('password:errors.multiple')}`}
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de sucesso */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {t('password:success.redirecting')}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          {/* Campo Nova Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('password:newPassword')}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={t('password:newPasswordPlaceholder')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Indicador de força da senha */}
            {password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{t('password:passwordStrength')}</span>
                  <span className={`text-xs font-medium ${passwordStrength.score >= 4 ? 'text-green-600 dark:text-green-400' : passwordStrength.score >= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <p className="mb-1">{t('password:requirements')}</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center ${passwordStrength.requirements.length ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.requirements.length ? '✓' : '○'}</span>
                      {t('password:minChars')}
                    </li>
                    <li className={`flex items-center ${passwordStrength.requirements.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.requirements.uppercase ? '✓' : '○'}</span>
                      {t('password:uppercase')}
                    </li>
                    <li className={`flex items-center ${passwordStrength.requirements.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.requirements.lowercase ? '✓' : '○'}</span>
                      {t('password:lowercase')}
                    </li>
                    <li className={`flex items-center ${passwordStrength.requirements.number ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.requirements.number ? '✓' : '○'}</span>
                      {t('password:number')}
                    </li>
                    <li className={`flex items-center ${passwordStrength.requirements.special ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.requirements.special ? '✓' : '○'}</span>
                      {t('password:special')}
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Campo Confirmar Senha */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('password:confirmPassword')}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={t('password:confirmPasswordPlaceholder')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{t('password:passwordsDontMatch')}</p>
            )}
            {confirmPassword && password === confirmPassword && password && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">{t('password:passwordsMatch')}</p>
            )}
          </div>

          {/* Botão de submissão */}
          <button
            type="submit"
            disabled={loading || passwordStrength.score < 4}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('password:updating')}
              </div>
            ) : (
              t('password:updateButton')
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('password:redirectMessage')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;