-- =============================================================
-- CRM Full Schema — Migration 014
-- admin.inglizi.com internal business operating system
-- =============================================================

-- ─── 1. Lead field upgrades ─────────────────────────────────
-- Proper enumerations for the sales funnel fields that were
-- previously free-text or missing.

alter table public.subscription_leads
  -- Source: where this lead came from (replaces legacy "source" text).
  -- Old rows keep their value; new rows use one of the preset slugs.
  add column if not exists lead_source      text,          -- tiktok|instagram|facebook|youtube|website|whatsapp|referral|other
  add column if not exists course           text,          -- a0a1|a1a2|a2b1|private|bootcamp|other
  add column if not exists lead_type        text,          -- course|private_class
  add column if not exists lost_reason      text,          -- too_expensive|no_time|no_reply|not_serious|other_school|wants_installment|other
  add column if not exists pending_payment  boolean not null default false; -- quick flag for the "Pending Payment" column

-- Back-fill lead_source from the legacy "source" column so existing data
-- remains usable in the new dropdowns.
update public.subscription_leads
  set lead_source = source
where lead_source is null and source is not null;

create index if not exists subscription_leads_lead_source_idx
  on public.subscription_leads (lead_source, created_at desc);
create index if not exists subscription_leads_course_idx
  on public.subscription_leads (course, created_at desc);

-- ─── 2. Lead timeline events ────────────────────────────────
-- Append-only log of everything that happens to a single lead.
-- Drives the "Lead Timeline" UI in the detail drawer.
-- More granular than crm_activity_log (which is system-wide).

create table if not exists public.crm_lead_events (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid not null references public.subscription_leads(id) on delete cascade,
  actor_id     uuid references public.profiles(id) on delete set null,
  actor_email  text,
  event_type   text not null,      -- created|status_changed|note_added|contacted|followup_set|payment_added|converted_to_student|file_uploaded
  title        text not null,      -- human-readable headline shown in the timeline
  body         text,               -- optional detail / note text
  before_value jsonb,
  after_value  jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists crm_lead_events_lead_id_idx
  on public.crm_lead_events (lead_id, created_at desc);

alter table public.crm_lead_events enable row level security;

drop policy if exists crm_lead_events_read   on public.crm_lead_events;
drop policy if exists crm_lead_events_insert on public.crm_lead_events;

create policy crm_lead_events_read   on public.crm_lead_events for select using (public.is_crm_staff(auth.uid()));
create policy crm_lead_events_insert on public.crm_lead_events for insert with check (public.is_crm_staff(auth.uid()));

-- ─── 3. Students ────────────────────────────────────────────
-- A student is a lead that has PAID. We keep the lead record but
-- create a richer student record for ongoing relationship management.

create table if not exists public.crm_students (
  id                uuid primary key default gen_random_uuid(),
  lead_id           uuid unique references public.subscription_leads(id) on delete set null,
  full_name         text not null,
  phone_number      text,                        -- stored as text, never stripped of +
  course            text,                        -- matches the lead.course enum slugs
  student_type      text not null default 'course_student',  -- course_student|private_student
  enrollment_date   date not null default current_date,
  -- Payment tracking
  payment_status    text not null default 'paid',            -- paid|pending|overdue
  total_paid_mad    numeric(10,2) default 0,
  -- Private class fields (null for course_student)
  monthly_fee_mad   numeric(10,2),
  next_payment_date date,
  -- Meta
  notes             text,
  is_active         boolean not null default true,
  added_by_id       uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists crm_students_course_idx    on public.crm_students (course, is_active);
create index if not exists crm_students_payment_idx   on public.crm_students (next_payment_date) where next_payment_date is not null;
create index if not exists crm_students_type_idx      on public.crm_students (student_type, is_active);

alter table public.crm_students enable row level security;

drop policy if exists crm_students_read   on public.crm_students;
drop policy if exists crm_students_write  on public.crm_students;
drop policy if exists crm_students_delete on public.crm_students;

create policy crm_students_read   on public.crm_students for select using (public.is_crm_staff(auth.uid()));
create policy crm_students_write  on public.crm_students for all    using (public.is_crm_staff(auth.uid()));
create policy crm_students_delete on public.crm_students for delete using (public.is_founder(auth.uid()));

-- ─── 4. CRM payments (granular, per lead) ───────────────────
-- Richer than the existing "payments" table (which is tied to user_plans).
-- These are tied to leads/students and handle both one-time + monthly.

create table if not exists public.crm_payments (
  id                  uuid primary key default gen_random_uuid(),
  lead_id             uuid references public.subscription_leads(id) on delete set null,
  student_id          uuid references public.crm_students(id) on delete set null,
  payment_type        text not null,           -- course_one_time|private_monthly
  course_or_service   text,
  amount_mad          numeric(10,2) not null,
  payment_status      text not null default 'pending',  -- pending|paid|declined
  payment_date        date,
  next_payment_date   date,                    -- private classes only
  receipt_url         text,                    -- Supabase Storage URL
  notes               text,
  added_by_id         uuid references public.profiles(id) on delete set null,
  approved_by_id      uuid references public.profiles(id) on delete set null,
  approved_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists crm_payments_lead_idx      on public.crm_payments (lead_id, created_at desc);
create index if not exists crm_payments_student_idx   on public.crm_payments (student_id, created_at desc);
create index if not exists crm_payments_status_idx    on public.crm_payments (payment_status, created_at desc);
create index if not exists crm_payments_date_idx      on public.crm_payments (payment_date desc);
create index if not exists crm_payments_next_idx      on public.crm_payments (next_payment_date) where next_payment_date is not null;

alter table public.crm_payments enable row level security;

create policy crm_payments_staff_read  on public.crm_payments for select using (public.is_crm_staff(auth.uid()));
create policy crm_payments_staff_write on public.crm_payments for all    using (public.is_crm_staff(auth.uid()));
create policy crm_payments_owner_del   on public.crm_payments for delete using (public.is_founder(auth.uid()));

-- ─── 5. Assistant access codes ──────────────────────────────
-- Pre-auth gate: before the standard Supabase auth, an assistant must
-- enter a valid code. Codes are one-time or multi-use, set by the founder.

create table if not exists public.assistant_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  label       text,                              -- human description, e.g. "Sara's code"
  uses_left   integer default null,              -- null = unlimited
  used_count  integer not null default 0,
  expires_at  timestamptz,
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.assistant_codes enable row level security;
create policy assistant_codes_founder on public.assistant_codes for all using (public.is_founder(auth.uid()));

-- ─── 6. Helper RPCs ─────────────────────────────────────────

-- Auto-create a student when a lead status changes to 'paid'.
create or replace function public.convert_lead_to_student(
  p_lead_id   uuid,
  p_actor_id  uuid default auth.uid()
) returns uuid
language plpgsql security definer as $$
declare
  v_lead    record;
  v_student uuid;
begin
  select * into v_lead from public.subscription_leads where id = p_lead_id;
  if not found then raise exception 'Lead % not found', p_lead_id; end if;

  -- Idempotent: don't create duplicate student if already exists.
  select id into v_student from public.crm_students where lead_id = p_lead_id;
  if v_student is not null then return v_student; end if;

  insert into public.crm_students
    (lead_id, full_name, phone_number, course, student_type, payment_status, added_by_id)
  values
    (p_lead_id,
     v_lead.full_name,
     v_lead.phone,
     coalesce(v_lead.course, v_lead.course_interested),
     case when v_lead.lead_type = 'private_class' then 'private_student' else 'course_student' end,
     'paid',
     p_actor_id)
  returning id into v_student;

  -- Write a timeline event on the lead.
  insert into public.crm_lead_events
    (lead_id, actor_id, actor_email, event_type, title)
  values
    (p_lead_id, p_actor_id,
     (select email from public.profiles where id = p_actor_id),
     'converted_to_student',
     'Lead converted to student 🎓');

  return v_student;
end;
$$;

grant execute on function public.convert_lead_to_student(uuid, uuid) to authenticated;

-- ─── 7. Lead event helper RPC ───────────────────────────────
create or replace function public.log_lead_event(
  p_lead_id    uuid,
  p_event_type text,
  p_title      text,
  p_body       text    default null,
  p_before     jsonb   default null,
  p_after      jsonb   default null
) returns uuid
language plpgsql security definer as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_id    uuid;
begin
  select email into v_email from public.profiles where id = v_actor;
  insert into public.crm_lead_events
    (lead_id, actor_id, actor_email, event_type, title, body, before_value, after_value)
  values
    (p_lead_id, v_actor, v_email, p_event_type, p_title, p_body, p_before, p_after)
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.log_lead_event(uuid,text,text,text,jsonb,jsonb) to authenticated;

-- Revenue view — drives the analytics and dashboard revenue cards.
create or replace view public.crm_revenue_view as
select
  p.id,
  p.lead_id,
  p.student_id,
  p.payment_type,
  p.amount_mad,
  p.payment_status,
  p.payment_date,
  p.course_or_service,
  p.added_by_id,
  date_trunc('day',   p.payment_date::timestamptz) as day,
  date_trunc('week',  p.payment_date::timestamptz) as week,
  date_trunc('month', p.payment_date::timestamptz) as month,
  date_trunc('year',  p.payment_date::timestamptz) as year
from public.crm_payments p
where p.payment_status = 'paid'
  and p.payment_date is not null;
