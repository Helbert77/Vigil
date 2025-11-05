-- Migration: add media column to library_items table (idempotent)

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

-- Optional: no index needed; field stores a URL or storage path