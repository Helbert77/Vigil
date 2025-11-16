import { createClient } from '@supabase/supabase-js';

// Configuração fixa do Supabase (frontend anon key)
const SUPABASE_URL = 'https://oprqgllsqtfdyjgvgovo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SQL para criar tabela de anúncios
const SQL_CREATE_ADS_TABLE = `
  create extension if not exists pgcrypto;

  create table if not exists public.ads (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null,
    image_url text,
    video_url text,
    link_url text not null,
    advertiser_name text not null,
    advertiser_avatar text,
    type text not null default 'native' check (type in ('native', 'adsense')),
    status text not null default 'active' check (status in ('active', 'paused', 'ended')),
    start_date timestamptz not null default now(),
    end_date timestamptz,
    target_audience jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  alter table public.ads enable row level security;

  do $$
  begin
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'ads' and policyname = 'ads_select'
    ) then
      create policy "ads_select" on public.ads
        for select using (true);
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'ads' and policyname = 'ads_insert'
    ) then
      create policy "ads_insert" on public.ads
        for insert with check (true);
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'ads' and policyname = 'ads_update'
    ) then
      create policy "ads_update" on public.ads
        for update using (true);
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'ads' and policyname = 'ads_delete'
    ) then
      create policy "ads_delete" on public.ads
        for delete using (true);
    end if;
  end $$;

  create index if not exists idx_ads_status on public.ads(status);
  create index if not exists idx_ads_dates on public.ads(start_date, end_date);
  create index if not exists idx_ads_type on public.ads(type);
`;

// SQL para criar tabela de métricas de anúncios
const SQL_CREATE_AD_METRICS_TABLE = `
  create extension if not exists pgcrypto;

  create table if not exists public.ad_metrics (
    id uuid primary key default gen_random_uuid(),
    ad_id uuid not null,
    user_id uuid,
    event_type text not null check (event_type in ('impression', 'click', 'like', 'share', 'save')),
    created_at timestamptz not null default now(),
    user_plan text,
    feed_type text check (feed_type in ('main', 'community')),
    community_id uuid
  );

  alter table public.ad_metrics enable row level security;

  do $$
  begin
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'ad_metrics' and policyname = 'ad_metrics_insert'
    ) then
      create policy "ad_metrics_insert" on public.ad_metrics
        for insert with check (true);
    end if;

    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'ad_metrics' and policyname = 'ad_metrics_select'
    ) then
      create policy "ad_metrics_select" on public.ad_metrics
        for select using (true);
    end if;
  end $$;

  create index if not exists idx_ad_metrics_ad_id on public.ad_metrics(ad_id);
  create index if not exists idx_ad_metrics_event on public.ad_metrics(event_type);
  create index if not exists idx_ad_metrics_user on public.ad_metrics(user_id);
  create index if not exists idx_ad_metrics_created on public.ad_metrics(created_at);
`;

// SQL para adicionar foreign key (executado separadamente para evitar erros se já existir)
const SQL_ADD_FOREIGN_KEY = `
  do $$
  begin
    if not exists (
      select 1 from information_schema.table_constraints 
      where constraint_name = 'ad_metrics_ad_id_fkey'
        and table_name = 'ad_metrics'
    ) then
      alter table public.ad_metrics 
        add constraint ad_metrics_ad_id_fkey 
        foreign key (ad_id) references public.ads(id) on delete cascade;
    end if;
  end $$;
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
  console.log('🚀 Criando tabelas de anúncios via RPC exec_sql');

  // Teste rápido: verificar se a função exec_sql está acessível
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

  // Executar criação das tabelas
  await tryExec(SQL_CREATE_ADS_TABLE, 'Criar tabela ads com políticas RLS');
  await tryExec(SQL_CREATE_AD_METRICS_TABLE, 'Criar tabela ad_metrics com políticas RLS');
  await tryExec(SQL_ADD_FOREIGN_KEY, 'Adicionar foreign key ad_metrics -> ads');

  console.log('\n🎉 Tabelas de anúncios criadas com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('   1. Verifique as tabelas no Dashboard do Supabase');
  console.log('   2. Insira alguns anúncios de teste na tabela ads');
  console.log('   3. As métricas serão rastreadas automaticamente quando os anúncios forem exibidos');
}

run().catch((err) => {
  console.error('Erro geral na criação das tabelas:', err?.message || err);
  process.exit(1);
});

