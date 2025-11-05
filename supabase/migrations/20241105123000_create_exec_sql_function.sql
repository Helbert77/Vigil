-- Cria a função RPC exec_sql para aplicar migrações via PostgREST
-- ATENÇÃO: SECURITY DEFINER permite executar SQL com privilégios do owner da função.
-- Mantenha o uso restrito e monitore. Revise as grants conforme sua política.

create or replace function public.exec_sql(sql text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Executa o SQL recebido
  execute sql;
end;
$$;

-- Remover execução genérica de todos
revoke all on function public.exec_sql(text) from public;

-- Conceder execução conforme necessidade:
-- Se quiser permitir uso via anon (para scripts que já usam a anon key):
grant execute on function public.exec_sql(text) to anon;

-- Permitir também para usuários autenticados
grant execute on function public.exec_sql(text) to authenticated;

-- Opcional: se planeja usar apenas com chave de serviço, remova as linhas acima
-- e conceda apenas ao role interno adequado.
-- Exemplo (dependendo do ambiente Supabase):
-- grant execute on function public.exec_sql(text) to service_role;

comment on function public.exec_sql(text) is 'Executa SQL arbitrário para migrações controladas. Use com cautela e monitore.';