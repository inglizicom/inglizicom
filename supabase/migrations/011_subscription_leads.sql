-- Subscription leads captured by the in-site subscribe modal.
-- Anonymous insert is allowed so visitors can subscribe before signing up.
-- Admins read/update to contact leads and mark them converted or rejected.

create table if not exists public.subscription_leads (
  id           uuid primary key default gen_random_uuid(),
  plan_id      text not null,
  level        text,
  full_name    text not null,
  phone        text not null,
  city         text not null,
  amount_mad   integer,
  status       text not null default 'new'
                 check (status in ('new','contacted','converted','rejected')),
  admin_note   text,
  created_at   timestamptz not null default now(),
  reviewed_by  uuid references auth.users(id) on delete set null,
  reviewed_at  timestamptz
);

create index if not exists subscription_leads_created_idx
  on public.subscription_leads (created_at desc);

create index if not exists subscription_leads_status_idx
  on public.subscription_leads (status, created_at desc);

alter table public.subscription_leads enable row level security;

drop policy if exists subscription_leads_anon_insert on public.subscription_leads;
drop policy if exists subscription_leads_admin_all   on public.subscription_leads;

-- Anyone (including anon visitors) can insert a lead — this is the funnel entry.
-- Only 'new' rows can be inserted from the client; admins set the rest.
create policy subscription_leads_anon_insert on public.subscription_leads
  for insert
  with check (status = 'new');

create policy subscription_leads_admin_all on public.subscription_leads
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
