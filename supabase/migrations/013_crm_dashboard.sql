-- ─────────────────────────────────────────────────────────────
-- CRM Dashboard schema upgrades
--
-- Adds:
--   1. profiles.role            → founder | assistant | student
--   2. subscription_leads CRM fields (assistant, follow-up dates, course
--      interested in, expanded status enum, notes alongside admin_note)
--   3. crm_activity_log         → who-did-what audit feed
--   4. helper RLS policies
-- ─────────────────────────────────────────────────────────────

-- 1) Role column on profiles --------------------------------------------------
do $$ begin
  create type public.user_role as enum ('founder', 'assistant', 'student');
exception when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists role public.user_role not null default 'student';

-- Backfill: every existing is_admin=true becomes founder; others stay student.
update public.profiles set role = 'founder' where is_admin = true and role = 'student';

-- Helper: is the caller a founder OR assistant?
create or replace function public.is_crm_staff(uid uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.profiles
    where id = uid and role in ('founder', 'assistant')
  )
$$;

create or replace function public.is_founder(uid uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.profiles
    where id = uid and role = 'founder'
  )
$$;

-- 2) Enrich subscription_leads for CRM workflow ------------------------------
alter table public.subscription_leads
  add column if not exists assigned_to_id    uuid references public.profiles(id) on delete set null,
  add column if not exists course_interested text,
  add column if not exists notes             text,
  add column if not exists last_contact_at   timestamptz,
  add column if not exists next_followup_at  timestamptz,
  add column if not exists is_vip            boolean not null default false;

create index if not exists subscription_leads_assigned_idx
  on public.subscription_leads (assigned_to_id, status);

create index if not exists subscription_leads_followup_idx
  on public.subscription_leads (next_followup_at)
  where next_followup_at is not null;

-- 3) Activity log -------------------------------------------------------------
-- Append-only audit feed. Every lead state change, payment approval, ticket
-- update etc. drops a row here so the founder can see who did what.
create table if not exists public.crm_activity_log (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid references public.profiles(id) on delete set null,
  actor_email   text,
  actor_role    text,
  action        text not null,       -- 'lead_status_changed', 'payment_approved', etc.
  entity_type   text not null,       -- 'lead' | 'payment' | 'support' | 'profile'
  entity_id     uuid,
  before_value  jsonb,
  after_value   jsonb,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists crm_activity_log_created_idx
  on public.crm_activity_log (created_at desc);

create index if not exists crm_activity_log_entity_idx
  on public.crm_activity_log (entity_type, entity_id);

create index if not exists crm_activity_log_actor_idx
  on public.crm_activity_log (actor_id, created_at desc);

alter table public.crm_activity_log enable row level security;

-- Read: only CRM staff. Write: only CRM staff (server-side via service role for
-- system events, but we also allow staff to insert via RPC).
drop policy if exists crm_activity_log_read on public.crm_activity_log;
create policy crm_activity_log_read on public.crm_activity_log
  for select using (public.is_crm_staff(auth.uid()));

drop policy if exists crm_activity_log_insert on public.crm_activity_log;
create policy crm_activity_log_insert on public.crm_activity_log
  for insert with check (public.is_crm_staff(auth.uid()));

-- 4) Expand RLS on subscription_leads for staff ------------------------------
-- Existing policies (anonymous insert + admin read/update) keep working;
-- we add the broader is_crm_staff() check so assistants (non-admin) can also
-- manage leads. Founders keep all powers via is_founder().
drop policy if exists subscription_leads_staff_select on public.subscription_leads;
create policy subscription_leads_staff_select on public.subscription_leads
  for select using (public.is_crm_staff(auth.uid()));

drop policy if exists subscription_leads_staff_update on public.subscription_leads;
create policy subscription_leads_staff_update on public.subscription_leads
  for update using (public.is_crm_staff(auth.uid()));

-- Only founders can delete leads.
drop policy if exists subscription_leads_founder_delete on public.subscription_leads;
create policy subscription_leads_founder_delete on public.subscription_leads
  for delete using (public.is_founder(auth.uid()));

-- 5) Activity log helper RPC (writes one row + returns id) -------------------
create or replace function public.log_crm_activity(
  p_action       text,
  p_entity_type  text,
  p_entity_id    uuid,
  p_before       jsonb default null,
  p_after        jsonb default null,
  p_metadata     jsonb default null
) returns uuid
language plpgsql security definer as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_role  text;
  v_id    uuid;
begin
  if v_actor is null then
    raise exception 'log_crm_activity requires an authenticated caller';
  end if;
  select email, role::text into v_email, v_role
    from public.profiles where id = v_actor;
  insert into public.crm_activity_log
    (actor_id, actor_email, actor_role, action, entity_type, entity_id,
     before_value, after_value, metadata)
  values
    (v_actor, v_email, v_role, p_action, p_entity_type, p_entity_id,
     p_before, p_after, p_metadata)
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.log_crm_activity(text,text,uuid,jsonb,jsonb,jsonb) to authenticated;
