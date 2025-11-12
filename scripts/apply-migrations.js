import { createClient } from '@supabase/supabase-js';

// Configuração fixa do Supabase (frontend anon key)
const SUPABASE_URL = 'https://oprqgllsqtfdyjgvgovo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SQL das migrações relevantes
const SQL_CREATE_LIBRARY_ITEMS = `
  create extension if not exists pgcrypto;

  create table if not exists public.library_items (
    id uuid primary key default gen_random_uuid(),
    type text not null check (type in ('ebook','article','magazine','document')),
    title text not null,
    author text not null,
    description text,
    cover_url text,
    date timestamptz not null default now(),
    published_date timestamptz,
    category text,
    tags text[],
    read_url text,
    download_url text,
    downloads integer not null default 0,
    views integer not null default 0,
    created_at timestamptz not null default now()
  );

  alter table public.library_items enable row level security;

  do $$
  begin
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'library_items' and policyname = 'library_items_select'
    ) then
      create policy "library_items_select" on public.library_items
        for select using (true);
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'library_items' and policyname = 'library_items_insert'
    ) then
      create policy "library_items_insert" on public.library_items
        for insert with check (true);
    end if;
  end $$;

  create index if not exists idx_library_items_type on public.library_items(type);
  create index if not exists idx_library_items_date on public.library_items(date);
  create index if not exists idx_library_items_tags on public.library_items using gin (tags);
`;

const SQL_ADD_MEDIA_COLUMN = `
  do $$
  begin
    if not exists (
      select 1 from information_schema.columns 
      where table_schema = 'public' 
        and table_name = 'library_items' 
        and column_name = 'media'
    ) then
      alter table public.library_items add column media text;
    end if;
  end $$;
`;

const SQL_ADD_UPDATE_DELETE_POLICIES = `
  do $$
  begin
    if not exists (
      select 1 from pg_policies 
      where schemaname = 'public' 
        and tablename = 'library_items' 
        and policyname = 'library_items_update'
    ) then
      create policy "library_items_update" on public.library_items
        for update using (true);
    end if;

    if not exists (
      select 1 from pg_policies 
      where schemaname = 'public' 
        and tablename = 'library_items' 
        and policyname = 'library_items_delete'
    ) then
      create policy "library_items_delete" on public.library_items
        for delete using (true);
    end if;
  end $$;
`;

// Tabelas para Web Push e tokens nativos
const SQL_CREATE_PUSH_TABLES = `
  create extension if not exists pgcrypto;

  create table if not exists public.push_subscriptions (
    user_id uuid primary key,
    subscription jsonb not null,
    created_at timestamptz not null default now()
  );

  alter table public.push_subscriptions enable row level security;

  -- Edge Functions usam service role; não expomos políticas a anon

  create table if not exists public.device_tokens (
    user_id uuid not null,
    platform text not null check (platform in ('android','ios')),
    token text not null,
    created_at timestamptz not null default now(),
    primary key (user_id, platform)
  );

  alter table public.device_tokens enable row level security;
`;

async function tryExec(sql, label) {
  console.log(`\n➡️ Executando: ${label}`);
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error(`❌ Falhou: ${label}`);
    console.error(`   Código: ${error.code || 'n/a'}`);
    console.error(`   Mensagem: ${error.message}`);
    throw new Error(`Falha em '${label}': ${error.message}`);
  }
  console.log(`✅ Sucesso: ${label}`);
}

async function run() {
  console.log('🚀 Aplicando migrações/políticas via RPC exec_sql');

  // Teste rápido: verificar se a função exec_sql parece acessível
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: 'select 1' });
    if (error) {
      console.error('⚠️ Não foi possível executar exec_sql.');
      console.error(`   Código: ${error.code || 'n/a'}`);
      console.error(`   Mensagem: ${error.message}`);
      console.error('   Dica: crie a função exec_sql pelo SQL Editor no Dashboard e conceda GRANT EXECUTE para anon/authenticated.');
      return;
    }
  } catch (e) {
    console.error('⚠️ Erro inesperado ao testar exec_sql:', e?.message || e);
    return;
  }

  // Executar passos idempotentes
  await tryExec(SQL_CREATE_LIBRARY_ITEMS, 'Criar tabela library_items e políticas básicas');
  await tryExec(SQL_ADD_MEDIA_COLUMN, 'Adicionar coluna media a library_items');
  await tryExec(SQL_ADD_UPDATE_DELETE_POLICIES, 'Criar políticas UPDATE/DELETE em library_items');
  await tryExec(SQL_CREATE_PUSH_TABLES, 'Criar tabelas push_subscriptions e device_tokens');

  console.log('\n🎉 Concluído. Revise no Dashboard as políticas e a estrutura da tabela.');
}

run().catch((err) => {
  console.error('Erro geral na aplicação de migrações:', err?.message || err);
  process.exit(1);
});
