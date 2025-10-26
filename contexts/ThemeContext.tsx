import React, { createContext, useEffect } from 'react';
import { useSession } from './SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user, refreshUser, loading } = useSession();
  const { addToast } = useToast();
  
  const theme: Theme = user?.theme || 'light';

  useEffect(() => {
    // Aplica o tema imediatamente, sem transição durante o carregamento inicial
    const root = window.document.documentElement;
    
    if (loading) {
      // Durante o carregamento, aplica o tema sem animação
      root.style.transition = 'none';
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      // Força um reflow para garantir que a mudança seja aplicada
      void root.offsetHeight;
    } else {
      // Após o carregamento, permite transições suaves
      root.style.transition = '';
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
    
    localStorage.removeItem('theme');
  }, [theme, loading]);

  const toggleTheme = async () => {
    if (!user) {
      addToast("Você precisa estar logado para mudar o tema.", "info");
      return;
    }

    const newTheme = theme === 'light' ? 'dark' : 'light';

    const { error } = await supabase
      .from('profiles')
      .update({ theme: newTheme })
      .eq('id', user.id);

    if (error) {
      addToast("Não foi possível salvar sua preferência de tema.", "error");
    } else {
      await refreshUser();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};