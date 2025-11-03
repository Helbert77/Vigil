# Correção: AuthApiError "Invalid Refresh Token: Refresh Token Not Found"

## Descrição do Problema
- Em ambientes de desenvolvimento com HMR e variação de origem (porta/host), chamadas ao Supabase ocasionalmente disparavam `AuthApiError: Invalid Refresh Token: Refresh Token Not Found`.
- O erro ocorria durante tentativas internas de recuperação/refresh de sessão no cliente `@supabase/supabase-js`, gerando ruído no console e potenciais falhas em fluxos que dependem de sessão.

## Análise da Causa
- Stack trace indicava o método interno `_recoverAndRefresh` da biblioteca, acionado quando uma chamada autenticada recebe 401 e o cliente tenta refrescar o token.
- Em cenários onde não havia `refresh_token` persistido (ex.: mudança de origem, storage limpo, sessão expirada, ou estado inconsistente), a recuperação falhava e o erro era emitido.
- Pontos do código que podem provocar este comportamento:
  - `contexts/SessionContext.tsx`: obtenção da sessão via `supabase.auth.getSession()` e subsequente uso de dados do usuário.
  - Chamadas ao PostgREST/Funções (ex.: `src/services/api.ts`) que adicionam `Authorization` automaticamente quando há sessão.

## Detalhes da Implementação da Solução
1. **Wrapper Seguro de Sessão**
   - Criado `src/utils/supabaseAuthSafe.ts` com `getSessionSafe()` e `withAuthGuard()`:
     - Trata `AuthApiError` e mensagens de *Invalid Refresh Token*.
     - Em falha de refresh, executa `signOut()` para limpar estado e retorna `null` sem lançar.
     - Preserva o fluxo do aplicativo ao evitar throws em erros não-críticos.

2. **Integração no SessionContext**
   - Substituído o uso direto de `supabase.auth.getSession()` por `getSessionSafe()` em `contexts/SessionContext.tsx`.
   - Mantidas regras existentes de expiração/inatividade e recuperação de perfil.

3. **Testes Unitários**
   - Adicionados em `tests/authSafe.test.ts` cobrindo:
     - Refresh token inválido → retorna `null` e executa `signOut`.
     - Sessão válida → retorna sessão.
     - Erro genérico → retorna `null` sem lançar.
     - Guard de operações com/sem sessão.

## Impacto no Sistema
- **Preservação de funcionalidades**: Fluxos existentes de autenticação, expiração e UI permanecem inalterados.
- **Robustez**: Erros de refresh token deixam de quebrar o fluxo e são tratados de forma centralizada.
- **Observabilidade**: Logs via `Logger` documentam ocorrências sem poluir a UI.
- **Compatibilidade de testes**: Nenhum teste existente foi modificado; novos testes são auto contidos.

## Considerações e Próximos Passos
- Caso sejam necessários fluxos específicos (ex.: redirecionamento para login após *refresh* inválido), podem ser adicionados handlers em `SessionContext` para avisos ao usuário.
- Em ambientes móveis (Capacitor/React Native), considerar storage dedicado (`AsyncStorage`/`Capacitor Storage`) para persistência de sessão consistente.