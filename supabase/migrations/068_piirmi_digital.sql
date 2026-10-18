-- 068_piirmi_digital.sql
-- PIIRMI interactive (/piirmi): the everyday textbook (A1 → A2) as a
-- clickable app, sold like VIIZA interactive (066, 067) and with the same
-- sign-in (the student's token, the same session cookie). Its own date and
-- its own progress, so each book is sold, and followed, on its own:
--
--   crm_students.piirmi_access_until   the last day the student may use it
--                                      (Morocco day); null = not bought
--   piirmi_progress                    one row per student, the shape of
--                                      viiza_progress; written by the app's
--                                      server route, read by staff
--
-- Re-running this file is a no-op.

alter table public.crm_students add column if not exists piirmi_access_until date;

comment on column public.crm_students.piirmi_access_until is
  'PIIRMI interactive (/piirmi): the last day the student may use it (Africa/Casablanca). Null = no access.';

create table if not exists public.piirmi_progress (
  student_id  uuid primary key references public.crm_students(id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.piirmi_progress enable row level security;
drop policy if exists piirmi_progress_staff_read on public.piirmi_progress;
create policy piirmi_progress_staff_read on public.piirmi_progress
  for select using (public.is_crm_staff(auth.uid()));
revoke insert, update, delete on public.piirmi_progress from anon, authenticated;
revoke all on public.piirmi_progress from anon;
