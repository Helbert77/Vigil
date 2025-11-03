import { supabase } from '../../integrations/supabase/client';
import { AuthApiError, Session } from '@supabase/supabase-js';
import { logger } from './Logger';

/**
 * Recupera a sessão de forma segura, tratando casos de Refresh Token ausente/ inválido
 * sem quebrar o fluxo do app. Em falha, retorna null e tenta realizar signOut
 * para limpar qualquer estado inconsistente.
 */
export async function getSessionSafe(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data?.session ?? null;
  } catch (err: any) {
    const message = String(err?.message || 'Unknown error');

    // Detecta erro de refresh token ausente/ inválido
    const isInvalidRefreshToken =
      err instanceof AuthApiError || message.includes('Invalid Refresh Token');

    if (isInvalidRefreshToken) {
      logger.warn('Sessão inválida: Refresh Token não encontrado. Limpando estado.', err, 'auth', 'getSessionSafe');
      try {
        // Tenta limpar sessão para evitar loops de refresh
        await supabase.auth.signOut();
      } catch (signOutError) {
        logger.info('Falha ao realizar signOut após erro de refresh token. Prosseguindo.', signOutError, 'auth', 'getSessionSafe');
      }
      return null;
    }

    // Não lança para preservar o fluxo do app
    logger.error('Falha ao recuperar sessão (não crítica). Prosseguindo sem sessão.', err, 'auth', 'getSessionSafe');
    return null;
  }
}

/**
 * Executa uma operação que requer sessão válida, protegendo contra erros de refresh.
 * Se não houver sessão, retorna null sem lançar exceção.
 */
export async function withAuthGuard<T>(fn: (session: Session) => Promise<T>): Promise<T | null> {
  const session = await getSessionSafe();
  if (!session) return null;
  try {
    return await fn(session);
  } catch (err) {
    const message = String((err as any)?.message || 'Unknown error');
    if (message.includes('Invalid Refresh Token')) {
      try { await supabase.auth.signOut(); } catch {}
      logger.warn('Operação protegida abortada: refresh token inválido. Sessão limpa.', err, 'auth', 'withAuthGuard');
      return null;
    }
    logger.error('Erro em operação protegida. Mantendo fluxo sem quebrar UI.', err, 'auth', 'withAuthGuard');
    return null;
  }
}