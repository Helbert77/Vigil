import React, { useEffect } from 'react'; // Importar useEffect
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';

const UpdatePassword: React.FC = () => {
  const { theme } = useTheme();
  const { addToast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Detecta quando a senha é atualizada com sucesso
      if (event === 'USER_UPDATED') {
        if (session) {
          addToast('Sua senha foi atualizada com sucesso!', 'success');
          // Redirecionar para a página de login após a atualização bem-sucedida
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      }
      // Removido o tratamento de 'SIGNED_IN' para evitar login automático durante recovery
    });

    return () => subscription.unsubscribe();
  }, [addToast]); // Dependência para garantir que o efeito seja reexecutado se addToast mudar

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-light-card dark:bg-dark-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Atualizar Senha</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Insira sua nova senha abaixo.</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme={theme}
          view="update_password" // Define a visualização para atualização de senha
          // 'onSignedIn' foi removido, pois não é uma propriedade válida para este componente/view
        />
      </div>
    </div>
  );
};

export default UpdatePassword;