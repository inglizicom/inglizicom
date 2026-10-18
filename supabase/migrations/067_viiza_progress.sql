-- 067_viiza_progress.sql
-- VIIZA interactive (/viiza): a student's progress follows them from device
-- to device and staff can see it. One row per student:
--
--   viiza_progress.data   { seen: { stop: [sections] }, done: [stops],
--                           best: { "stop:key" | "part:n": score } }
--
-- The app writes it through its server route (/api/viiza/progress) with the
-- service role, after checking the student's signed session, so the
-- browser never writes the table. Staff read it (the CRM's VIIZA card).
--
-- Re-running this file is a no-op.

create table if not exists public.viiza_progress (
  student_id  uuid primary key references public.crm_students(id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.viiza_progress enable row level security;
drop policy if exists viiza_progress_staff_read on public.viiza_progress;
create policy viiza_progress_staff_read on public.viiza_progress
  for select using (public.is_crm_staff(auth.uid()));
revoke insert, update, delete on public.viiza_progress from anon, authenticated;
revoke all on public.viiza_progress from anon;
