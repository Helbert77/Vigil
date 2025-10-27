import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

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
  const { theme } = useTheme();
  const { addToast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        label = 'Muito Fraca';
        color = 'bg-red-500';
        break;
      case 2:
        label = 'Fraca';
        color = 'bg-orange-500';
        break;
      case 3:
        label = 'Média';
        color = 'bg-yellow-500';
        break;
      case 4:
        label = 'Forte';
        color = 'bg-blue-500';
        break;
      case 5:
        label = 'Muito Forte';
        color = 'bg-green-500';
        break;
      default:
        label = 'Muito Fraca';
        color = 'bg-red-500';
    }

    return { score, label, color, requirements };
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Validação completa da senha
  const validatePassword = (): string[] => {
    const errors: string[] = [];

    if (!password) {
      errors.push('A nova senha é obrigatória.');
    } else {
      if (password.length < 8) {
        errors.push('A senha deve ter no mínimo 8 caracteres.');
      }
      if (password.length > 128) {
        errors.push('A senha deve ter no máximo 128 caracteres.');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('A senha deve conter pelo menos uma letra maiúscula.');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('A senha deve conter pelo menos uma letra minúscula.');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('A senha deve conter pelo menos um número.');
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('A senha deve conter pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;:,.<>?).');
      }
    }

    if (!confirmPassword) {
      errors.push('A confirmação de senha é obrigatória.');
    } else if (password !== confirmPassword) {
      errors.push('As senhas não correspondem.');
    }

    return errors;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'USER_UPDATED') {
        if (session) {
          addToast('Senha atualizada com sucesso! Você será redirecionado automaticamente.', 'success');
          setSuccess(true);
          
          // Usar navegação programática sem recarregamento
          setTimeout(() => {
            // Limpar o hash de recovery da URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Disparar evento customizado para notificar o App.tsx sobre mudança de página
            const event = new CustomEvent('navigate', { detail: { page: 'Home' } });
            window.dispatchEvent(event);
          }, 2000);
        }
      }
    });

    return () => subscription.unsubscribe();
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

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrors([error.message]);
        addToast('Erro ao atualizar senha: ' + error.message, 'error');
      }
    } catch (error) {
      setErrors(['Erro inesperado ao atualizar senha.']);
      addToast('Erro inesperado ao atualizar senha.', 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-light-card dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Redefinir Senha</h1>
          <p className="text-gray-600 dark:text-gray-400">Crie uma nova senha segura para sua conta.</p>
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
                  {errors.length === 1 ? 'Erro encontrado:' : `${errors.length} erros encontrados:`}
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
                  Senha atualizada com sucesso! Redirecionando...
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          {/* Campo Nova Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nova Senha *
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
                placeholder="Digite sua nova senha"
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
                  <span className="text-xs text-gray-600 dark:text-gray-400">Força da senha:</span>
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
                  <p className="mb-1">Requisitos:</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center ${passwordStrength.requirements.length ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.requirements.length ? '✓' : '○'}</span>
                      Mínimo 8 caracteres
                    </li>
                    <li className={`flex items-center ${passwordStrength.requirements.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.requirements.uppercase ? '✓' : '○'}</span>
                      Uma letra maiúscula
                    </li>
                    <li className={`flex items-center ${passwordStrength.requirements.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.requirements.lowercase ? '✓' : '○'}</span>
                      Uma letra minúscula
                    </li>
                    <li className={`flex items-center ${passwordStrength.requirements.number ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.requirements.number ? '✓' : '○'}</span>
                      Um número
                    </li>
                    <li className={`flex items-center ${passwordStrength.requirements.special ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.requirements.special ? '✓' : '○'}</span>
                      Um caractere especial
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Campo Confirmar Senha */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmar Nova Senha *
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
                placeholder="Confirme sua nova senha"
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
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">As senhas não correspondem</p>
            )}
            {confirmPassword && password === confirmPassword && password && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">✓ Senhas correspondem</p>
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
                Atualizando senha...
              </div>
            ) : (
              'Atualizar Senha'
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Após atualizar sua senha, você será redirecionado para fazer login novamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;