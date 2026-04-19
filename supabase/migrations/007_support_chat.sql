-- Phase 4: user ↔ admin support chat
-- Users open threads, exchange messages with admin. Admin can close/reopen.

create table if not exists public.support_threads (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  subject              text not null,
  status               text not null default 'open'
                         check (status in ('open', 'closed')),
  last_message_at      timestamptz not null default now(),
  last_message_preview text,
  unread_for_admin     boolean not null default true,
  unread_for_user      boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists support_threads_user_idx
  on public.support_threads (user_id, last_message_at desc);

create index if not exists support_threads_inbox_idx
  on public.support_threads (status, last_message_at desc);

create table if not exists public.support_messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references public.support_threads(id) on delete cascade,
  sender_id   uuid references auth.users(id) on delete set null,
  sender_role text not null check (sender_role in ('user', 'admin')),
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists support_messages_thread_idx
  on public.support_messages (thread_id, created_at asc);

-- Bump thread activity on each new message and flip unread flags
create or replace function public.bump_support_thread()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.support_threads
     set last_message_at      = new.created_at,
         last_message_preview = left(new.body, 140),
         updated_at           = now(),
         unread_for_admin     = case when new.sender_role = 'user'  then true  else false end,
         unread_for_user      = case when new.sender_role = 'admin' then true  else false end,
         status               = case
                                  when status = 'closed' and new.sender_role = 'user' then 'open'
                                  else status
                                end
   where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists on_support_message_insert on public.support_messages;
create trigger on_support_message_insert
  after insert on public.support_messages
  for each row execute function public.bump_support_thread();

-- Generic updated_at trigger
create or replace function public.set_updated_at_support_threads()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_support_thread_update on public.support_threads;
create trigger on_support_thread_update
  before update on public.support_threads
  for each row execute function public.set_updated_at_support_threads();

-- Row-level security
alter table public.support_threads  enable row level security;
alter table public.support_messages enable row level security;

drop policy if exists support_threads_owner_read   on public.support_threads;
drop policy if exists support_threads_owner_insert on public.support_threads;
drop policy if exists support_threads_owner_update on public.support_threads;
drop policy if exists support_threads_admin_all    on public.support_threads;

create policy support_threads_owner_read on public.support_threads
  for select using (auth.uid() = user_id);

create policy support_threads_owner_insert on public.support_threads
  for insert with check (auth.uid() = user_id);

-- Users can only clear their own unread flag
create policy support_threads_owner_update on public.support_threads
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy support_threads_admin_all on public.support_threads
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists support_messages_owner_read   on public.support_messages;
drop policy if exists support_messages_owner_insert on public.support_messages;
drop policy if exists support_messages_admin_all    on public.support_messages;

create policy support_messages_owner_read on public.support_messages
  for select using (
    exists (
      select 1 from public.support_threads t
      where t.id = support_messages.thread_id
        and t.user_id = auth.uid()
    )
  );

create policy support_messages_owner_insert on public.support_messages
  for insert with check (
    sender_role = 'user'
    and sender_id = auth.uid()
    and exists (
      select 1 from public.support_threads t
      where t.id = support_messages.thread_id
        and t.user_id = auth.uid()
        and t.status = 'open'
    )
  );

create policy support_messages_admin_all on public.support_messages
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
