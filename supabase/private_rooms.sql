create extension if not exists pgcrypto;

alter table public.chat_rooms add column if not exists is_public boolean default true;
alter table public.chat_rooms add column if not exists created_by uuid references auth.users(id);

create table if not exists public.chat_room_invitations (
  id uuid default gen_random_uuid() primary key,
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_id uuid not null references auth.users(id) on delete cascade,
  status varchar(20) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(room_id, invitee_id)
);

create index if not exists idx_invitations_room_id on public.chat_room_invitations(room_id);
create index if not exists idx_invitations_invitee_id on public.chat_room_invitations(invitee_id);
create index if not exists idx_invitations_status on public.chat_room_invitations(status);

alter table public.chat_rooms enable row level security;
alter table public.chat_room_participants enable row level security;
alter table public.chat_room_invitations enable row level security;

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_rooms' and policyname = 'Authenticated users can view chat rooms'
  ) then
    drop policy "Authenticated users can view chat rooms" on public.chat_rooms;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_rooms' and policyname = 'Users can view accessible chat rooms'
  ) then
    drop policy "Users can view accessible chat rooms" on public.chat_rooms;
  end if;
end $$;

create policy "Users can view accessible chat rooms" on public.chat_rooms
  for select using (
    auth.role() = 'authenticated' and (
      is_public = true or (
        is_public = false and (
          created_by = auth.uid() or exists (
            select 1 from public.chat_room_participants p where p.room_id = chat_rooms.id and p.user_id = auth.uid()
          ) or exists (
            select 1 from public.chat_room_invitations i where i.room_id = chat_rooms.id and i.invitee_id = auth.uid()
          )
        )
      )
    )
  );

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_room_participants' and policyname = 'Users can join chat rooms'
  ) then
    drop policy "Users can join chat rooms" on public.chat_room_participants;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_room_participants' and policyname = 'Users can join accessible chat rooms'
  ) then
    drop policy "Users can join accessible chat rooms" on public.chat_room_participants;
  end if;
end $$;

create policy "Users can join accessible chat rooms" on public.chat_room_participants
  for insert with check (
    auth.uid() = user_id and (
      exists (select 1 from public.chat_rooms r where r.id = room_id and r.is_public = true) or exists (
        select 1 from public.chat_rooms r
        left join public.chat_room_invitations i on i.room_id = r.id and i.invitee_id = auth.uid()
        where r.id = room_id and r.is_public = false and (
          r.created_by = auth.uid() or i.id is not null
        )
      )
    )
  );

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_room_invitations' and policyname = 'Users can view their invitations'
  ) then
    drop policy "Users can view their invitations" on public.chat_room_invitations;
  end if;
end $$;

create policy "Users can view their invitations" on public.chat_room_invitations
  for select using (
    auth.uid() = inviter_id or auth.uid() = invitee_id
  );

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_room_invitations' and policyname = 'Room creators can send invitations'
  ) then
    drop policy "Room creators can send invitations" on public.chat_room_invitations;
  end if;
end $$;

create policy "Room creators can send invitations" on public.chat_room_invitations
  for insert with check (
    auth.uid() = inviter_id and exists (
      select 1 from public.chat_rooms r where r.id = room_id and r.created_by = auth.uid() and r.is_public = false
    )
  );

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chat_room_invitations' and policyname = 'Invitees can update invitation status'
  ) then
    drop policy "Invitees can update invitation status" on public.chat_room_invitations;
  end if;
end $$;

create policy "Invitees can update invitation status" on public.chat_room_invitations
  for update using (
    auth.uid() = invitee_id
  );

grant select on public.chat_room_invitations to authenticated;
grant insert on public.chat_room_invitations to authenticated;
grant update on public.chat_room_invitations to authenticated;
