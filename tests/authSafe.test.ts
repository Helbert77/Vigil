import { getSessionSafe, withAuthGuard } from '../src/utils/supabaseAuthSafe';
import { supabase } from '../integrations/supabase/client';
import { AuthApiError } from '@supabase/supabase-js';

describe('supabaseAuthSafe', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('getSessionSafe retorna null e realiza signOut quando refresh token é inválido', async () => {
    const signOutMock = jest.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: null } as any);
    jest.spyOn(supabase.auth, 'getSession').mockRejectedValue(new AuthApiError('Invalid Refresh Token: Refresh Token Not Found', 400, 'invalid_refresh_token'));

    const session = await getSessionSafe();
    expect(session).toBeNull();
    expect(signOutMock).toHaveBeenCalled();
  });

  test('getSessionSafe retorna sessão válida quando disponível', async () => {
    const sessionObj = { user: { id: 'u1' }, access_token: 'at', refresh_token: 'rt' } as any;
    jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({ data: { session: sessionObj }, error: null } as any);

    const session = await getSessionSafe();
    expect(session).toEqual(sessionObj);
  });

  test('getSessionSafe retorna null em erro genérico sem lançar', async () => {
    jest.spyOn(supabase.auth, 'getSession').mockRejectedValue(new Error('Network error'));
    const session = await getSessionSafe();
    expect(session).toBeNull();
  });

  test('withAuthGuard executa função quando há sessão válida e protege contra erros', async () => {
    const sessionObj = { user: { id: 'u2' }, access_token: 'at', refresh_token: 'rt' } as any;
    jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({ data: { session: sessionObj }, error: null } as any);

    const result = await withAuthGuard(async (session: any) => {
      expect(session).toEqual(sessionObj);
      return 'ok';
    });
    expect(result).toBe('ok');
  });

  test('withAuthGuard retorna null quando não há sessão', async () => {
    jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({ data: { session: null }, error: null } as any);
    const result = await withAuthGuard(async () => 'ok');
    expect(result).toBeNull();
  });
});