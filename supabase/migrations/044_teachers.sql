-- 044_teachers.sql
-- The teacher layer: teachers.inglizi.com
--
-- Run 043_teacher_role.sql FIRST, on its own (Postgres refuses to use a new enum
-- value in the transaction that added it).
--
-- Security shape — this is the whole point of the file:
--   • Every crm_* table is gated by is_crm_staff() = founder|assistant. A teacher
--     is NOT crm staff, so they get zero rows from crm_students, crm_payments,
--     subscription_leads and the revenue views by default. Nothing to unlock.
--   • A teacher reaches their students through teacher_my_students(), a security
--     definer RPC that returns only the columns a teacher needs — and a MASKED
--     phone number. The raw number never crosses the wire; messaging goes
--     through /api/teacher/wa, which 302s to WhatsApp server-side.
--   • Everything a teacher owns (sessions, reports, materials) is row-scoped to
--     teacher_id = auth.uid().
--
-- Tables: teacher_profiles · teacher_students · class_sessions ·
--         class_attendance · lesson_reports · teacher_materials · teacher_reviews

-- ─── 0. Helpers ──────────────────────────────────────────────

create or replace function public.is_teacher(uid uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists(
    select 1 from public.profiles
    where id = uid and role::text = 'teacher'
  )
$$;

create or replace function public.set_updated_at_teachers()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─── 1. Teacher profile ──────────────────────────────────────
-- One row per teaching account. Doubles as the public-facing tutor card:
-- headline, bio, specialties and the rating rolled up from teacher_reviews.

create table if not exists public.teacher_profiles (
  id               uuid primary key references public.profiles(id) on delete cascade,
  display_name     text,
  headline         text,                       -- "IELTS & Business English · 6 years"
  bio              text,
  avatar_url       text,                       -- student-files bucket
  levels           text[] not null default '{}',   -- A0 A1 A2 B1 B2 C1
  specialties      text[] not null default '{}',   -- conversation, exam prep, kids…
  languages        text[] not null default '{}',   -- Arabic, French, English
  whatsapp         text,
  pay_model        text not null default 'hourly', -- hourly|per_class|monthly|none
  hourly_rate_mad  numeric(10,2),                  -- phase 4; nullable on purpose
  availability     jsonb not null default '[]'::jsonb, -- [{day:1, from:'18:00', to:'20:00'}]
  hired_at         date not null default current_date,
  is_active        boolean not null default true,
  -- Rolled up from teacher_reviews by trigger — never write these by hand.
  rating_avg       numeric(3,2) not null default 0,
  rating_count     integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists teacher_profiles_active_idx on public.teacher_profiles (is_active);

drop trigger if exists trg_teacher_profiles_updated on public.teacher_profiles;
create trigger trg_teacher_profiles_updated before update on public.teacher_profiles
  for each row execute function public.set_updated_at_teachers();

alter table public.teacher_profiles enable row level security;

drop policy if exists teacher_profiles_staff  on public.teacher_profiles;
drop policy if exists teacher_profiles_self   on public.teacher_profiles;
drop policy if exists teacher_profiles_insert on public.teacher_profiles;
drop policy if exists teacher_profiles_update on public.teacher_profiles;

create policy teacher_profiles_staff  on public.teacher_profiles for all
  using (public.is_crm_staff(auth.uid())) with check (public.is_crm_staff(auth.uid()));
create policy teacher_profiles_self   on public.teacher_profiles for select
  using (id = auth.uid());
-- A teacher promoted by hand (rather than through /api/admin/create-teacher)
-- creates their own row the first time they open the space.
create policy teacher_profiles_insert on public.teacher_profiles for insert
  with check (id = auth.uid() and public.is_teacher(auth.uid()));
create policy teacher_profiles_update on public.teacher_profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- …but a teacher must not be able to write their own rating or their own pay.
-- The update policy above is column-blind, so a trigger pins those fields to
-- their previous values for anyone who isn't staff (or the rating refresher).
create or replace function public.guard_teacher_profile_fields()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if public.is_crm_staff(auth.uid()) then
    return new;                                    -- founder/assistant may set pay
  end if;
  if coalesce(current_setting('app.rating_refresh', true), '') <> 'on' then
    new.rating_avg   := old.rating_avg;
    new.rating_count := old.rating_count;
  end if;
  new.pay_model       := old.pay_model;
  new.hourly_rate_mad := old.hourly_rate_mad;
  new.hired_at        := old.hired_at;
  new.is_active       := old.is_active;
  return new;
end $$;

drop trigger if exists trg_teacher_profiles_guard on public.teacher_profiles;
create trigger trg_teacher_profiles_guard before update on public.teacher_profiles
  for each row execute function public.guard_teacher_profile_fields();

-- ─── 2. Assignment: which teacher holds which student ────────
-- A join table rather than a column on crm_students, so co-teaching and
-- handovers don't rewrite the student record.

create table if not exists public.teacher_students (
  id           uuid primary key default gen_random_uuid(),
  teacher_id   uuid not null references public.profiles(id) on delete cascade,
  student_id   uuid not null references public.crm_students(id) on delete cascade,
  is_active    boolean not null default true,
  assigned_at  timestamptz not null default now(),
  assigned_by  uuid references public.profiles(id) on delete set null,
  unique (teacher_id, student_id)
);

create index if not exists teacher_students_teacher_idx on public.teacher_students (teacher_id, is_active);
create index if not exists teacher_students_student_idx on public.teacher_students (student_id, is_active);

alter table public.teacher_students enable row level security;

drop policy if exists teacher_students_staff on public.teacher_students;
drop policy if exists teacher_students_own   on public.teacher_students;

create policy teacher_students_staff on public.teacher_students for all
  using (public.is_crm_staff(auth.uid())) with check (public.is_crm_staff(auth.uid()));
create policy teacher_students_own   on public.teacher_students for select
  using (teacher_id = auth.uid());

-- ─── 3. Class sessions ───────────────────────────────────────
-- Group cohorts and 1-on-1 privates in one table. meeting_url is free text so
-- WhatsApp video, Meet, Zoom or an in-person room all work.

create table if not exists public.class_sessions (
  id            uuid primary key default gen_random_uuid(),
  teacher_id    uuid not null references public.profiles(id) on delete cascade,
  course_id     uuid,                       -- lms_courses.id, unenforced (courses are optional)
  title         text not null,
  mode          text not null default 'group',      -- group|private
  level         text,
  starts_at     timestamptz not null,
  duration_min  integer not null default 60,
  meeting_url   text,
  location      text,
  status        text not null default 'scheduled',  -- scheduled|live|done|cancelled
  cancel_reason text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists class_sessions_teacher_idx on public.class_sessions (teacher_id, starts_at desc);
create index if not exists class_sessions_upcoming_idx on public.class_sessions (starts_at) where status = 'scheduled';

drop trigger if exists trg_class_sessions_updated on public.class_sessions;
create trigger trg_class_sessions_updated before update on public.class_sessions
  for each row execute function public.set_updated_at_teachers();

alter table public.class_sessions enable row level security;

drop policy if exists class_sessions_staff on public.class_sessions;
drop policy if exists class_sessions_own   on public.class_sessions;

create policy class_sessions_staff on public.class_sessions for all
  using (public.is_crm_staff(auth.uid())) with check (public.is_crm_staff(auth.uid()));
create policy class_sessions_own   on public.class_sessions for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- ─── 4. Attendance ───────────────────────────────────────────

create table if not exists public.class_attendance (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.class_sessions(id) on delete cascade,
  student_id  uuid not null references public.crm_students(id) on delete cascade,
  status      text not null default 'present',   -- present|late|absent|excused
  minutes     integer,
  note        text,
  marked_by   uuid references public.profiles(id) on delete set null,
  marked_at   timestamptz not null default now(),
  unique (session_id, student_id)
);

create index if not exists class_attendance_student_idx on public.class_attendance (student_id, marked_at desc);

alter table public.class_attendance enable row level security;

drop policy if exists class_attendance_staff on public.class_attendance;
drop policy if exists class_attendance_own   on public.class_attendance;

create policy class_attendance_staff on public.class_attendance for all
  using (public.is_crm_staff(auth.uid())) with check (public.is_crm_staff(auth.uid()));
create policy class_attendance_own   on public.class_attendance for all
  using (exists (select 1 from public.class_sessions s
                 where s.id = session_id and s.teacher_id = auth.uid()))
  with check (exists (select 1 from public.class_sessions s
                 where s.id = session_id and s.teacher_id = auth.uid()));

-- ─── 5. Lesson reports ───────────────────────────────────────
-- One per finished session. founder_note is the private channel — teachers write
-- it, the founder reads it, students never see any of this table.

create table if not exists public.lesson_reports (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null unique references public.class_sessions(id) on delete cascade,
  teacher_id      uuid not null references public.profiles(id) on delete cascade,
  covered         text not null,
  homework        text,
  materials_used  text,
  -- [{ student_id, participation: 1-5, needs_help: bool, note: text }]
  student_notes   jsonb not null default '[]'::jsonb,
  founder_note    text,
  submitted_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists lesson_reports_teacher_idx on public.lesson_reports (teacher_id, submitted_at desc);

drop trigger if exists trg_lesson_reports_updated on public.lesson_reports;
create trigger trg_lesson_reports_updated before update on public.lesson_reports
  for each row execute function public.set_updated_at_teachers();

alter table public.lesson_reports enable row level security;

drop policy if exists lesson_reports_staff on public.lesson_reports;
drop policy if exists lesson_reports_own   on public.lesson_reports;

create policy lesson_reports_staff on public.lesson_reports for all
  using (public.is_crm_staff(auth.uid())) with check (public.is_crm_staff(auth.uid()));
create policy lesson_reports_own   on public.lesson_reports for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- ─── 6. Materials ────────────────────────────────────────────
-- Files live in the existing student-files bucket under teachers/{teacher_id}/…
-- so nothing new has to be provisioned.

create table if not exists public.teacher_materials (
  id             uuid primary key default gen_random_uuid(),
  teacher_id     uuid not null references public.profiles(id) on delete cascade,
  course_id      uuid,
  title          text not null,
  description    text,
  file_path      text not null,
  file_type      text,
  size_bytes     bigint,
  level          text,
  unit_no        integer,
  visibility     text not null default 'students',  -- private|students|course
  download_count integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists teacher_materials_teacher_idx on public.teacher_materials (teacher_id, created_at desc);
create index if not exists teacher_materials_course_idx  on public.teacher_materials (course_id) where course_id is not null;

alter table public.teacher_materials enable row level security;

drop policy if exists teacher_materials_staff on public.teacher_materials;
drop policy if exists teacher_materials_own   on public.teacher_materials;

create policy teacher_materials_staff on public.teacher_materials for all
  using (public.is_crm_staff(auth.uid())) with check (public.is_crm_staff(auth.uid()));
create policy teacher_materials_own   on public.teacher_materials for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- Storage: a teacher may write only inside their own folder.
drop policy if exists teacher_files_rw on storage.objects;
create policy teacher_files_rw on storage.objects for all to authenticated
  using (
    bucket_id = 'student-files'
    and public.is_teacher(auth.uid())
    and name like 'teachers/' || auth.uid()::text || '/%'
  )
  with check (
    bucket_id = 'student-files'
    and public.is_teacher(auth.uid())
    and name like 'teachers/' || auth.uid()::text || '/%'
  );

-- ─── 7. Reviews ──────────────────────────────────────────────
-- Written by students from the student portal (token auth, via RPC below).
-- One review per student per teacher; re-submitting updates it.

create table if not exists public.teacher_reviews (
  id           uuid primary key default gen_random_uuid(),
  teacher_id   uuid not null references public.profiles(id) on delete cascade,
  student_id   uuid not null references public.crm_students(id) on delete cascade,
  rating       integer not null check (rating between 1 and 5),
  comment      text,
  is_published boolean not null default true,   -- founder can hide without deleting
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (teacher_id, student_id)
);

create index if not exists teacher_reviews_teacher_idx on public.teacher_reviews (teacher_id, created_at desc);

drop trigger if exists trg_teacher_reviews_updated on public.teacher_reviews;
create trigger trg_teacher_reviews_updated before update on public.teacher_reviews
  for each row execute function public.set_updated_at_teachers();

alter table public.teacher_reviews enable row level security;

drop policy if exists teacher_reviews_staff on public.teacher_reviews;
drop policy if exists teacher_reviews_own   on public.teacher_reviews;

create policy teacher_reviews_staff on public.teacher_reviews for all
  using (public.is_crm_staff(auth.uid())) with check (public.is_crm_staff(auth.uid()));
-- A teacher reads their own published reviews. They can never write one.
create policy teacher_reviews_own   on public.teacher_reviews for select
  using (teacher_id = auth.uid() and is_published = true);

-- Roll the average onto the profile so cards don't aggregate on every render.
create or replace function public.refresh_teacher_rating()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_teacher uuid;
begin
  v_teacher := coalesce(new.teacher_id, old.teacher_id);
  -- Tell guard_teacher_profile_fields() this write is the legitimate one.
  perform set_config('app.rating_refresh', 'on', true);
  update public.teacher_profiles p
     set rating_avg = coalesce((
           select round(avg(r.rating)::numeric, 2) from public.teacher_reviews r
           where r.teacher_id = v_teacher and r.is_published = true), 0),
         rating_count = (
           select count(*) from public.teacher_reviews r
           where r.teacher_id = v_teacher and r.is_published = true)
   where p.id = v_teacher;
  perform set_config('app.rating_refresh', 'off', true);
  return null;
end $$;

drop trigger if exists trg_teacher_rating on public.teacher_reviews;
create trigger trg_teacher_rating after insert or update or delete on public.teacher_reviews
  for each row execute function public.refresh_teacher_rating();

-- ─── 8. Teacher-facing RPCs ──────────────────────────────────

-- The roster. Phone is MASKED — the raw number never leaves the database for a
-- teacher. Messaging goes through /api/teacher/wa/[studentId].
create or replace function public.teacher_my_students()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',             s.id,
    'full_name',      s.full_name,
    'course',         s.course,
    'student_type',   s.student_type,
    'enrollment_date',s.enrollment_date,
    'is_active',      s.is_active,
    'avatar_url',     s.avatar_url,
    -- +2126••••••11 — enough to recognise, useless to harvest
    'phone_masked',   case when s.phone_number is null or length(s.phone_number) < 6 then null
                      else left(s.phone_number, 5) || '••••' || right(s.phone_number, 2) end,
    'assigned_at',    ts.assigned_at
  ) order by s.full_name), '[]'::jsonb)
  from public.teacher_students ts
  join public.crm_students s on s.id = ts.student_id
  where ts.teacher_id = auth.uid()
    and ts.is_active = true
    and s.deleted_at is null
    and public.is_teacher(auth.uid())
$$;

-- Everything the dashboard header needs, in one round trip.
create or replace function public.teacher_overview()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select case when not public.is_teacher(auth.uid()) then '{}'::jsonb else jsonb_build_object(
    'students_total', (select count(*) from public.teacher_students
                        where teacher_id = auth.uid() and is_active = true),
    'classes_month',  (select count(*) from public.class_sessions
                        where teacher_id = auth.uid() and status = 'done'
                          and starts_at >= date_trunc('month', now())),
    'hours_month',    (select coalesce(round(sum(duration_min)::numeric / 60, 1), 0) from public.class_sessions
                        where teacher_id = auth.uid() and status = 'done'
                          and starts_at >= date_trunc('month', now())),
    'upcoming',       (select count(*) from public.class_sessions
                        where teacher_id = auth.uid() and status = 'scheduled' and starts_at >= now()),
    -- finished classes still missing their report — the number that should sting
    'reports_owed',   (select count(*) from public.class_sessions s
                        where s.teacher_id = auth.uid() and s.status = 'done'
                          and not exists (select 1 from public.lesson_reports r where r.session_id = s.id)),
    'attendance_rate',(select case when count(*) = 0 then null
                        else round(100.0 * count(*) filter (where a.status in ('present','late')) / count(*)) end
                       from public.class_attendance a
                       join public.class_sessions s on s.id = a.session_id
                       where s.teacher_id = auth.uid()),
    'rating_avg',     (select rating_avg   from public.teacher_profiles where id = auth.uid()),
    'rating_count',   (select rating_count from public.teacher_profiles where id = auth.uid())
  ) end
$$;

-- ─── 9. Student-facing RPCs (token auth) ─────────────────────

-- The tutor cards a student sees in their portal.
create or replace function public.student_my_teachers(p_token text)
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',           p.id,
    'display_name', coalesce(tp.display_name, p.full_name),
    'headline',     tp.headline,
    'bio',          tp.bio,
    'avatar_url',   tp.avatar_url,
    'specialties',  tp.specialties,
    'rating_avg',   tp.rating_avg,
    'rating_count', tp.rating_count,
    'my_rating',    (select r.rating from public.teacher_reviews r
                      where r.teacher_id = p.id and r.student_id = ts.student_id)
  )), '[]'::jsonb)
  from public.crm_students s
  join public.teacher_students ts on ts.student_id = s.id and ts.is_active = true
  join public.profiles p          on p.id = ts.teacher_id
  left join public.teacher_profiles tp on tp.id = p.id
  where s.verification_token = upper(trim(p_token))
    and s.deleted_at is null and s.is_active = true
$$;

-- A student rates the teacher who actually teaches them — the assignment check
-- is what stops review stuffing.
create or replace function public.submit_teacher_review(
  p_token text, p_teacher_id uuid, p_rating integer, p_comment text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_student uuid;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    return jsonb_build_object('ok', false, 'error', 'Rating must be between 1 and 5.');
  end if;

  select id into v_student from public.crm_students
   where verification_token = upper(trim(p_token))
     and deleted_at is null and is_active = true;
  if v_student is null then
    return jsonb_build_object('ok', false, 'error', 'We could not find your student account.');
  end if;

  if not exists (select 1 from public.teacher_students
                  where teacher_id = p_teacher_id and student_id = v_student and is_active = true) then
    return jsonb_build_object('ok', false, 'error', 'You can only review a teacher who teaches you.');
  end if;

  insert into public.teacher_reviews (teacher_id, student_id, rating, comment)
  values (p_teacher_id, v_student, p_rating, nullif(trim(coalesce(p_comment, '')), ''))
  on conflict (teacher_id, student_id) do update
    set rating = excluded.rating, comment = excluded.comment, updated_at = now();

  return jsonb_build_object('ok', true);
end $$;

-- ─── 10. Founder-facing RPC ──────────────────────────────────
-- The comparison table: every teacher, with the numbers that matter.
create or replace function public.teachers_scoreboard()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select case when not public.is_crm_staff(auth.uid()) then '[]'::jsonb else coalesce(jsonb_agg(t order by t->>'display_name'), '[]'::jsonb) end
  from (
    select jsonb_build_object(
      'id',            p.id,
      'display_name',  coalesce(tp.display_name, p.full_name, p.email),
      'email',         p.email,
      'headline',      tp.headline,
      'avatar_url',    tp.avatar_url,
      'is_active',     coalesce(tp.is_active, true),
      'hired_at',      tp.hired_at,
      'rating_avg',    coalesce(tp.rating_avg, 0),
      'rating_count',  coalesce(tp.rating_count, 0),
      'students',      (select count(*) from public.teacher_students ts
                         where ts.teacher_id = p.id and ts.is_active = true),
      'classes_month', (select count(*) from public.class_sessions s
                         where s.teacher_id = p.id and s.status = 'done'
                           and s.starts_at >= date_trunc('month', now())),
      'hours_month',   (select coalesce(round(sum(s.duration_min)::numeric / 60, 1), 0) from public.class_sessions s
                         where s.teacher_id = p.id and s.status = 'done'
                           and s.starts_at >= date_trunc('month', now())),
      'reports_owed',  (select count(*) from public.class_sessions s
                         where s.teacher_id = p.id and s.status = 'done'
                           and not exists (select 1 from public.lesson_reports r where r.session_id = s.id)),
      'attendance_rate', (select case when count(*) = 0 then null
                           else round(100.0 * count(*) filter (where a.status in ('present','late')) / count(*)) end
                          from public.class_attendance a
                          join public.class_sessions s on s.id = a.session_id
                          where s.teacher_id = p.id)
    ) as t
    from public.profiles p
    left join public.teacher_profiles tp on tp.id = p.id
    where p.role::text = 'teacher'
  ) scored
$$;

grant execute on function public.teacher_my_students()      to authenticated;
grant execute on function public.teacher_overview()         to authenticated;
grant execute on function public.teachers_scoreboard()      to authenticated;
grant execute on function public.student_my_teachers(text)  to anon, authenticated;
grant execute on function public.submit_teacher_review(text, uuid, integer, text) to anon, authenticated;
