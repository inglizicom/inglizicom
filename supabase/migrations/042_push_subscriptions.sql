-- ════════════════════════════════════════════════════════════════════════
-- 042: Web-push subscriptions — notifications outside the app (Duolingo-style)
--
-- One row per (device/browser) push endpoint, linked to a student so the CRM
-- can target notifications by level / subscription date / status. Rows are
-- written server-side with the service-role key (the /api/push/subscribe route);
-- staff read them for targeting + device counts.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid references public.crm_students(id) on delete cascade,
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

comment on table public.push_subscriptions is 'Web-push endpoints for app notifications, linked to crm_students.';

create index if not exists push_subscriptions_student_idx on public.push_subscriptions (student_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "staff read push subs" on public.push_subscriptions;
create policy "staff read push subs"
  on public.push_subscriptions for select
  using (is_crm_staff(auth.uid()));
