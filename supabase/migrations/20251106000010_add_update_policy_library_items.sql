-- Migration: add UPDATE policy to library_items table

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

