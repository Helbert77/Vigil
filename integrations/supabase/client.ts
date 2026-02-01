// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// Usa variáveis de ambiente quando disponíveis, com fallback para valores padrão
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  "https://oprqgllsqtfdyjgvgovo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw";

// CAPTURAR hash ANTES do Supabase consumir
const hashBeforeSupabase = window.location.hash;

// Salvar parâmetros importantes do hash ANTES do Supabase consumir
if (hashBeforeSupabase) {
  const params = new URLSearchParams(hashBeforeSupabase.substring(1));
  const typeParam = params.get('type');
  const hasAccessToken = params.has('access_token');
  
  // Salvar para ser lido pelo App.tsx
  if (typeof window !== 'undefined') {
    (window as any).__supabaseHashParams = {
      type: typeParam,
      hasAccessToken,
    };
  }
}

// Verificar se há erro no hash
if (hashBeforeSupabase.includes('error=')) {
  const params = new URLSearchParams(hashBeforeSupabase.substring(1));
  const error = params.get('error');
  const errorCode = params.get('error_code');
  const errorDescription = params.get('error_description');
  
  // Salvar erro para ser lido pelo componente
  if (typeof window !== 'undefined') {
    (window as any).__supabaseAuthError = {
      error,
      errorCode,
      errorDescription: errorDescription?.replace(/\+/g, ' '),
    };
  }
}

// Cliente público (anon) para uso no navegador
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: false, // ❌ DESABILITADO - vamos processar manualmente
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    log_level: 'error', // Disable verbose logging
  },
  global: {
    headers: {
      'x-client-info': 'vigil-web',
    },
  },
});

// Processar tokens do hash MANUALMENTE após criar o cliente
if (hashBeforeSupabase && hashBeforeSupabase.includes('access_token')) {
  // Extrair tokens do hash
  const params = new URLSearchParams(hashBeforeSupabase.substring(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  
  if (accessToken && refreshToken) {
    // Definir sessão manualmente
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    }).then(({ error }) => {
      if (!error) {
        // Limpar hash da URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });
  }
}
