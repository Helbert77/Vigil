// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// Usa variáveis de ambiente quando disponíveis, com fallback para valores padrão
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  "https://oprqgllsqtfdyjgvgovo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw";

// ATENÇÃO: ESTA CHAVE É EXTREMAMENTE SENSÍVEL. NÃO USE NO CLIENTE WEB.
// Mantemos aqui apenas para referência/controlado e acesso em ambiente seguro.
// NUNCA importe esta constante em componentes/hooks do cliente.
export const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI2MjMwNCwiZXhwIjoyMDc0ODM4MzA0fQ.rwrHPtvHym918IMJQTgVt5ajp5eGyIBeKcDQI95wxkk";

// Cliente público (anon) para uso no navegador
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Opcional: cliente de serviço para ambientes seguros (Node/SSR/Workers)
// Evite chamar isto no navegador.
export const createServiceClient = () => {
  if (typeof window !== 'undefined') {
    console.warn('[segurança] Não use createServiceClient no navegador.');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
};
