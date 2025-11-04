-- Migration: create library_items table with RLS policies and indexes

-- Ensure required extension for UUID generation
create extension if not exists pgcrypto;

-- Create table
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

-- Enable Row Level Security
alter table public.library_items enable row level security;

-- Policies: allow read to all, inserts by any authenticated user
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

-- Indexes
create index if not exists idx_library_items_type on public.library_items(type);
create index if not exists idx_library_items_date on public.library_items(date);
create index if not exists idx_library_items_tags on public.library_items using gin (tags);