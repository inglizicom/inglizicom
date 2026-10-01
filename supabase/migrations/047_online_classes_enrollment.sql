-- 047_online_classes_enrollment.sql
-- Online classes (cohorts) and class enrollment.
--
-- Five things that used to blur together are now separate, each with its own
-- table and its own rules:
--   course enrollment   lms_enrollments + lms_enrollment_history   access to LMS content
--   class enrollment    online_class_enrollments                    a seat in a live class
--   teacher assignment  teacher_students                            who follows a student
--   attendance          class_attendance                            per session, never implies enrollment
--   payment             crm_payments                                money, never implies enrollment
--
-- Production safety (applies cleanly on top of 046):
--   • Additive only: new tables, new nullable columns, new constraints that the
--     live data already satisfies (checked 2026-10-01). No existing row is rewritten.
--   • Existing class_sessions keep class_id = null. Nothing is inferred from
--     session titles or attendance — staff link sessions to a class, and enroll
--     students, from CRM → Online classes. Until then every legacy session keeps
--     working exactly as before (attendance by teacher assignment).
--   • lms_enrollments keeps its meaning — a row is course access — so the 16
--     portal functions that join it are untouched. Removing a course enrollment
--     still deletes the row; a trigger now archives it to lms_enrollment_history
--     first, so the history survives for reporting.

-- ════════════════════════════════════════════════════════════
-- 0. Helpers
-- ════════════════════════════════════════════════════════════

-- Morocco is the business clock (see 029_revenue_local_timezone.sql).
create or replace function public.casa_day_start(p_day date)
returns timestamptz language sql stable as $$
  select (p_day::timestamp) at time zone 'Africa/Casablanca'
$$;

create or replace function public.casa_date(p_ts timestamptz)
returns date language sql stable as $$
  select (p_ts at time zone 'Africa/Casablanca')::date
$$;

-- The caller's profile id, or null for service-role / SQL-editor sessions.
-- Safe to store in columns that reference profiles(id).
create or replace function public.current_profile_id()
returns uuid language sql stable security definer set search_path to 'public' as $$
  select id from public.profiles where id = auth.uid()
$$;

-- ════════════════════════════════════════════════════════════
-- 1. Course enrollment: explicit status + history
-- ════════════════════════════════════════════════════════════
-- A row in lms_enrollments = the student can open the course. Two statuses:
-- active, completed (finished, still has access). "Cancelled" is never a row
-- here: removal deletes the row (revoking access, as before) and the trigger
-- below archives it.

alter table public.lms_enrollments
  add column if not exists completed_at timestamptz,
  add column if not exists updated_at   timestamptz not null default now();

alter table public.lms_enrollments drop constraint if exists lms_enrollments_status_check;
alter table public.lms_enrollments
  add constraint lms_enrollments_status_check check (status in ('active', 'completed')) not valid;
alter table public.lms_enrollments validate constraint lms_enrollments_status_check;

create index if not exists lms_enrollments_enrolled_idx on public.lms_enrollments (enrolled_at);

create or replace function public.lms_enrollments_touch()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' then
    new.updated_at := now();
    if new.status = 'completed' and old.status <> 'completed' then
      new.completed_at := coalesce(new.completed_at, now());
    end if;
  elsif new.status = 'completed' then
    new.completed_at := coalesce(new.completed_at, now());
  end if;
  if new.status = 'active' then new.completed_at := null; end if;
  return new;
end $$;

drop trigger if exists trg_lms_enrollments_touch on public.lms_enrollments;
create trigger trg_lms_enrollments_touch before insert or update on public.lms_enrollments
  for each row execute function public.lms_enrollments_touch();

create table if not exists public.lms_enrollment_history (
  id             uuid primary key default gen_random_uuid(),
  enrollment_id  uuid not null,                 -- lms_enrollments.id it was
  course_id      uuid not null,                 -- no FK: the course may be retired later
  course_title   text,
  student_id     uuid not null references public.crm_students(id) on delete cascade,
  final_status   text not null,                 -- status at removal: active | completed
  enrolled_at    timestamptz not null,
  completed_at   timestamptz,
  ended_at       timestamptz not null default now(),
  end_reason     text,
  enrolled_by    uuid references public.profiles(id) on delete set null,
  ended_by       uuid references public.profiles(id) on delete set null,
  constraint lms_enrollment_history_final_status_check check (final_status in ('active', 'completed'))
);

create index if not exists lms_enrollment_history_student_idx  on public.lms_enrollment_history (student_id, ended_at desc);
create index if not exists lms_enrollment_history_course_idx   on public.lms_enrollment_history (course_id);
create index if not exists lms_enrollment_history_enrolled_idx on public.lms_enrollment_history (enrolled_at);

alter table public.lms_enrollment_history enable row level security;
drop policy if exists lms_enrollment_history_staff_read on public.lms_enrollment_history;
-- Read-only for staff. Rows are written by the archive trigger only.
create policy lms_enrollment_history_staff_read on public.lms_enrollment_history
  for select using (public.is_crm_staff(auth.uid()));

create or replace function public.archive_lms_enrollment()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  -- A hard delete of the student or the course cascades here: the record is
  -- gone for good, there is nothing to keep (and nothing to reference).
  if not exists (select 1 from crm_students where id = old.student_id) then return old; end if;
  if not exists (select 1 from lms_courses  where id = old.course_id)  then return old; end if;

  insert into lms_enrollment_history
    (enrollment_id, course_id, course_title, student_id, final_status,
     enrolled_at, completed_at, end_reason, enrolled_by, ended_by)
  select old.id, old.course_id, c.title, old.student_id, old.status,
         old.enrolled_at, old.completed_at,
         nullif(current_setting('app.enrollment_end_reason', true), ''),
         (select id from profiles where id = old.created_by),
         current_profile_id()
  from lms_courses c where c.id = old.course_id;
  return old;
end $$;

drop trigger if exists trg_lms_enrollments_archive on public.lms_enrollments;
create trigger trg_lms_enrollments_archive after delete on public.lms_enrollments
  for each row execute function public.archive_lms_enrollment();

-- ════════════════════════════════════════════════════════════
-- 2. Online classes and class enrollment
-- ════════════════════════════════════════════════════════════

create table if not exists public.online_classes (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  mode              text not null default 'group',
  teacher_id        uuid references public.profiles(id) on delete set null,
  course_id         uuid references public.lms_courses(id) on delete set null,
  level             text,
  status            text not null default 'active',
  starts_on         date,
  ends_on           date,
  capacity          integer,                -- null = unlimited (group); private is always 1
  waitlist_enabled  boolean not null default false,
  meeting_url       text,
  schedule_note     text,                   -- "Mon & Wed 18:00" — free text, sessions carry the real dates
  notes             text,
  archived_at       timestamptz,            -- hidden from day-to-day lists, kept for history
  archived_by       uuid references public.profiles(id) on delete set null,
  created_by        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint online_classes_title_check    check (length(btrim(title)) > 0),
  constraint online_classes_mode_check     check (mode in ('group', 'private')),
  constraint online_classes_status_check   check (status in ('active', 'completed', 'cancelled')),
  constraint online_classes_dates_check    check (ends_on is null or starts_on is null or ends_on >= starts_on),
  constraint online_classes_capacity_check check (capacity is null or capacity > 0),
  constraint online_classes_private_check  check (mode = 'group' or capacity = 1)
);

create index if not exists online_classes_teacher_idx on public.online_classes (teacher_id, status);
create index if not exists online_classes_course_idx  on public.online_classes (course_id) where course_id is not null;
create index if not exists online_classes_open_idx    on public.online_classes (status) where archived_at is null;

create table if not exists public.online_class_enrollments (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.online_classes(id) on delete restrict,
  student_id    uuid not null references public.crm_students(id) on delete cascade,
  status        text not null default 'active',
  enrolled_at   timestamptz not null default now(),   -- the enrollment date (trend charts use this)
  activated_at  timestamptz,                          -- when the seat became active (≠ enrolled_at after a waitlist)
  start_date    date,                                 -- first class the student attends
  end_date      date,                                 -- planned or actual last day
  ended_at      timestamptz,                          -- set when completed / cancelled
  end_reason    text,
  created_by    uuid references public.profiles(id) on delete set null,
  updated_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint online_class_enrollments_status_check check (status in ('active', 'waitlisted', 'completed', 'cancelled')),
  constraint online_class_enrollments_dates_check  check (end_date is null or start_date is null or end_date >= start_date)
);

-- One open seat (active or waitlisted) per student per class. Ended rows stay as
-- history, so a student can rejoin later with a fresh row.
create unique index if not exists online_class_enrollments_one_open
  on public.online_class_enrollments (class_id, student_id) where status in ('active', 'waitlisted');
create index if not exists online_class_enrollments_student_idx  on public.online_class_enrollments (student_id, status);
create index if not exists online_class_enrollments_class_idx    on public.online_class_enrollments (class_id, status);
create index if not exists online_class_enrollments_enrolled_idx on public.online_class_enrollments (enrolled_at);

create or replace function public.online_classes_guard()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_active int;
begin
  if new.teacher_id is not null
     and (tg_op = 'INSERT' or new.teacher_id is distinct from old.teacher_id)
     and not is_teacher(new.teacher_id) then
    raise exception 'Assigned teacher % is not a teacher account', new.teacher_id using errcode = '23514';
  end if;

  if new.mode = 'private' then new.capacity := 1; end if;

  if tg_op = 'UPDATE' then
    new.updated_at := now();
    if new.mode = 'private' and old.mode <> 'private' then
      select count(*) into v_active from online_class_enrollments where class_id = new.id and status = 'active';
      if v_active > 1 then
        raise exception 'A private class holds one student; this class has % active', v_active using errcode = '23514';
      end if;
    end if;
    if new.archived_at is not null and old.archived_at is null then
      new.archived_by := coalesce(new.archived_by, current_profile_id());
    elsif new.archived_at is null then
      new.archived_by := null;
    end if;
  else
    new.created_by := coalesce(new.created_by, current_profile_id());
  end if;
  return new;
end $$;

drop trigger if exists trg_online_classes_guard on public.online_classes;
create trigger trg_online_classes_guard before insert or update on public.online_classes
  for each row execute function public.online_classes_guard();

-- Capacity, waitlist and lifecycle rules for a seat. The class row is locked so
-- two concurrent enrollments cannot both take the last seat.
create or replace function public.online_class_enrollments_guard()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_class  online_classes%rowtype;
  v_cap    int;
  v_active int;
begin
  select * into v_class from online_classes where id = new.class_id for update;
  if not found then raise exception 'Class % not found', new.class_id using errcode = '23503'; end if;

  if tg_op = 'INSERT' then
    if v_class.archived_at is not null or v_class.status <> 'active' then
      raise exception 'Class "%" is not open for enrollment (status %)', v_class.title,
        case when v_class.archived_at is not null then 'archived' else v_class.status end using errcode = '23514';
    end if;
    if exists (select 1 from crm_students where id = new.student_id and deleted_at is not null) then
      raise exception 'Student % is deleted', new.student_id using errcode = '23514';
    end if;
    if new.status in ('completed', 'cancelled') then
      raise exception 'A new enrollment starts as active or waitlisted' using errcode = '23514';
    end if;
    if new.status = 'waitlisted' and not v_class.waitlist_enabled then
      raise exception 'Class "%" has no waitlist', v_class.title using errcode = '23514';
    end if;
    new.created_by := coalesce(new.created_by, current_profile_id());
  else
    if new.class_id <> old.class_id or new.student_id <> old.student_id then
      raise exception 'An enrollment cannot move to another class or student — end it and create a new one'
        using errcode = '23514';
    end if;
    if old.status in ('completed', 'cancelled') and new.status <> old.status then
      raise exception 'This enrollment has ended (%); create a new one to re-enroll', old.status using errcode = '23514';
    end if;
    new.updated_at := now();
    new.updated_by := current_profile_id();
  end if;

  -- Taking an active seat: check capacity (private = 1).
  if new.status = 'active' and (tg_op = 'INSERT' or old.status <> 'active') then
    v_cap := case when v_class.mode = 'private' then 1 else v_class.capacity end;
    if v_cap is not null then
      select count(*) into v_active from online_class_enrollments
       where class_id = new.class_id and status = 'active' and id <> new.id;
      if v_active >= v_cap then
        if tg_op = 'INSERT' and v_class.waitlist_enabled then
          new.status := 'waitlisted';
        else
          raise exception 'Class "%" is full (% of % seats)', v_class.title, v_active, v_cap using errcode = '23514';
        end if;
      end if;
    end if;
  end if;

  if new.status = 'active' and new.activated_at is null then
    new.activated_at := case when tg_op = 'INSERT' then new.enrolled_at else now() end;
  end if;
  if new.status in ('completed', 'cancelled') then
    new.ended_at := coalesce(new.ended_at, now());
    if new.status = 'completed' then new.end_date := coalesce(new.end_date, casa_date(new.ended_at)); end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_online_class_enrollments_guard on public.online_class_enrollments;
create trigger trg_online_class_enrollments_guard before insert or update on public.online_class_enrollments
  for each row execute function public.online_class_enrollments_guard();

-- ════════════════════════════════════════════════════════════
-- 3. Sessions belong to a class (optional, history preserved)
-- ════════════════════════════════════════════════════════════

alter table public.class_sessions
  add column if not exists class_id uuid references public.online_classes(id) on delete set null;
create index if not exists class_sessions_class_idx on public.class_sessions (class_id, starts_at) where class_id is not null;

alter table public.class_sessions drop constraint if exists class_sessions_status_check;
alter table public.class_sessions
  add constraint class_sessions_status_check check (status in ('scheduled', 'live', 'done', 'cancelled')) not valid;
alter table public.class_sessions validate constraint class_sessions_status_check;

alter table public.class_sessions drop constraint if exists class_sessions_mode_check;
alter table public.class_sessions
  add constraint class_sessions_mode_check check (mode in ('group', 'private')) not valid;
alter table public.class_sessions validate constraint class_sessions_mode_check;

alter table public.class_sessions drop constraint if exists class_sessions_duration_check;
alter table public.class_sessions
  add constraint class_sessions_duration_check check (duration_min between 1 and 600) not valid;
alter table public.class_sessions validate constraint class_sessions_duration_check;

alter table public.class_attendance drop constraint if exists class_attendance_status_check;
alter table public.class_attendance
  add constraint class_attendance_status_check check (status in ('present', 'late', 'absent', 'excused')) not valid;
alter table public.class_attendance validate constraint class_attendance_status_check;

-- A teacher can attach a session only to a class they teach; the session takes
-- the class's mode and course so reports and analytics agree.
create or replace function public.class_sessions_guard()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_class   online_classes%rowtype;
  v_uid     uuid := auth.uid();
  v_staff   boolean := public.is_crm_staff(auth.uid());
begin
  if tg_op = 'UPDATE' and new.class_id is distinct from old.class_id
     and old.class_id is not null and v_uid is not null and not v_staff then
    raise exception 'Only staff can move a session to another class' using errcode = '42501';
  end if;

  if new.class_id is not null and (tg_op = 'INSERT' or new.class_id is distinct from old.class_id) then
    select * into v_class from online_classes where id = new.class_id;
    if not found then raise exception 'Class % not found', new.class_id using errcode = '23503'; end if;
    if v_uid is not null and not v_staff and v_class.teacher_id is distinct from v_uid then
      raise exception 'You can only schedule sessions for your own classes' using errcode = '42501';
    end if;
    new.mode      := v_class.mode;
    new.course_id := coalesce(v_class.course_id, new.course_id);
    new.level     := coalesce(new.level, v_class.level);
  end if;
  return new;
end $$;

drop trigger if exists trg_class_sessions_guard on public.class_sessions;
create trigger trg_class_sessions_guard before insert or update on public.class_sessions
  for each row execute function public.class_sessions_guard();

-- Attendance and reports are history. A session that has either can be
-- cancelled, not deleted — except when the teacher's account itself is being
-- deleted (the founder confirms that cascade explicitly in the CRM).
create or replace function public.class_sessions_keep_history()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if (exists (select 1 from class_attendance where session_id = old.id)
      or exists (select 1 from lesson_reports where session_id = old.id))
     and exists (select 1 from profiles where id = old.teacher_id) then
    raise exception 'This session has attendance or a report — cancel it instead of deleting it'
      using errcode = '23503';
  end if;
  return old;
end $$;

drop trigger if exists trg_class_sessions_keep_history on public.class_sessions;
create trigger trg_class_sessions_keep_history before delete on public.class_sessions
  for each row execute function public.class_sessions_keep_history();

-- ════════════════════════════════════════════════════════════
-- 4. Who a teacher may see and mark
-- ════════════════════════════════════════════════════════════

-- The current teacher of the class.
create or replace function public.teacher_owns_class(p_class uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (select 1 from online_classes c
                 where c.id = p_class and c.teacher_id = auth.uid() and c.teacher_id is not null)
     and public.is_teacher(auth.uid())
$$;

-- Owner, or a teacher who delivered (or is scheduled for) one of its sessions.
create or replace function public.teacher_can_view_class(p_class uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select public.is_teacher(auth.uid()) and (
    exists (select 1 from online_classes c where c.id = p_class and c.teacher_id = auth.uid())
    or exists (select 1 from class_sessions s where s.class_id = p_class and s.teacher_id = auth.uid()))
$$;

-- Was this enrollment a seat in the class at the moment the session started?
-- Waitlisted students never are; ended seats count only for sessions before the end.
create or replace function public.enrollment_covers(p_status text, p_ended_at timestamptz, p_at timestamptz)
returns boolean language sql immutable as $$
  select p_status in ('active', 'completed', 'cancelled')
     and (p_ended_at is null or p_ended_at > p_at)
$$;

-- May the calling teacher record attendance for this student in this session?
--   class session  → the student held a seat in that class when it started
--   legacy session → (no class) the student is actively assigned to the teacher
create or replace function public.teacher_can_mark(p_session uuid, p_student uuid)
returns boolean language plpgsql stable security definer set search_path to 'public' as $$
declare v_s class_sessions%rowtype;
begin
  if not is_teacher(auth.uid()) then return false; end if;
  select * into v_s from class_sessions where id = p_session and teacher_id = auth.uid();
  if not found then return false; end if;
  if v_s.class_id is null then
    return exists (select 1 from teacher_students
                   where teacher_id = auth.uid() and student_id = p_student and is_active);
  end if;
  return exists (select 1 from online_class_enrollments e
                 where e.class_id = v_s.class_id and e.student_id = p_student
                   and enrollment_covers(e.status, e.ended_at, v_s.starts_at));
end $$;

-- Server-side check for /api/teacher/wa (service role only): does this teacher
-- currently teach this student, by assignment or by an active class seat?
create or replace function public.teacher_can_reach_student(p_teacher uuid, p_student uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select public.is_teacher(p_teacher) and exists (select 1 from crm_students s where s.id = p_student and s.deleted_at is null)
     and (exists (select 1 from teacher_students where teacher_id = p_teacher and student_id = p_student and is_active)
          or exists (select 1 from online_class_enrollments e join online_classes c on c.id = e.class_id
                     where c.teacher_id = p_teacher and e.student_id = p_student and e.status = 'active'))
$$;

-- ════════════════════════════════════════════════════════════
-- 5. Row level security
-- ════════════════════════════════════════════════════════════

alter table public.online_classes enable row level security;
alter table public.online_class_enrollments enable row level security;

drop policy if exists online_classes_staff        on public.online_classes;
drop policy if exists online_classes_teacher_read on public.online_classes;
create policy online_classes_staff on public.online_classes for all
  using (public.is_crm_staff(auth.uid())) with check (public.is_crm_staff(auth.uid()));
-- Teachers read their classes; creating, editing and staffing them stays in the CRM.
create policy online_classes_teacher_read on public.online_classes for select
  using (public.teacher_can_view_class(id));

drop policy if exists online_class_enrollments_staff        on public.online_class_enrollments;
drop policy if exists online_class_enrollments_teacher_read on public.online_class_enrollments;
create policy online_class_enrollments_staff on public.online_class_enrollments for all
  using (public.is_crm_staff(auth.uid())) with check (public.is_crm_staff(auth.uid()));
-- Only the current teacher sees the raw roster rows (ids, dates, status).
-- Names and masked phones come through teacher_class_roster().
create policy online_class_enrollments_teacher_read on public.online_class_enrollments for select
  using (public.teacher_owns_class(class_id));

-- Sessions: the old FOR ALL policy let a teacher delete a session and, with it,
-- its attendance and report. Split it and keep deletion to untouched sessions.
drop policy if exists class_sessions_own        on public.class_sessions;
drop policy if exists class_sessions_own_select on public.class_sessions;
drop policy if exists class_sessions_own_insert on public.class_sessions;
drop policy if exists class_sessions_own_update on public.class_sessions;
drop policy if exists class_sessions_own_delete on public.class_sessions;
create policy class_sessions_own_select on public.class_sessions for select
  using (teacher_id = auth.uid());
create policy class_sessions_own_insert on public.class_sessions for insert
  with check (teacher_id = auth.uid() and public.is_teacher(auth.uid()));
create policy class_sessions_own_update on public.class_sessions for update
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy class_sessions_own_delete on public.class_sessions for delete
  using (teacher_id = auth.uid() and status = 'scheduled');

-- Attendance: the old policy accepted any student id on the teacher's session.
-- Now the student must be on that session's roster. Teachers correct marks,
-- they never delete them.
drop policy if exists class_attendance_own        on public.class_attendance;
drop policy if exists class_attendance_own_select on public.class_attendance;
drop policy if exists class_attendance_own_insert on public.class_attendance;
drop policy if exists class_attendance_own_update on public.class_attendance;
create policy class_attendance_own_select on public.class_attendance for select
  using (exists (select 1 from public.class_sessions s where s.id = session_id and s.teacher_id = auth.uid()));
create policy class_attendance_own_insert on public.class_attendance for insert
  with check (public.teacher_can_mark(session_id, student_id));
create policy class_attendance_own_update on public.class_attendance for update
  using (exists (select 1 from public.class_sessions s where s.id = session_id and s.teacher_id = auth.uid()))
  with check (public.teacher_can_mark(session_id, student_id));

create or replace function public.class_attendance_stamp()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  -- A teacher's mark is always signed by that teacher.
  if auth.uid() is not null and not public.is_crm_staff(auth.uid()) then
    new.marked_by := auth.uid();
    new.marked_at := now();
  end if;
  return new;
end $$;

drop trigger if exists trg_class_attendance_stamp on public.class_attendance;
create trigger trg_class_attendance_stamp before insert or update on public.class_attendance
  for each row execute function public.class_attendance_stamp();

-- Reports: the old policy checked only teacher_id, so a teacher could file a
-- report against another teacher's session id. Tie it to the session.
drop policy if exists lesson_reports_own        on public.lesson_reports;
drop policy if exists lesson_reports_own_select on public.lesson_reports;
drop policy if exists lesson_reports_own_insert on public.lesson_reports;
drop policy if exists lesson_reports_own_update on public.lesson_reports;
create policy lesson_reports_own_select on public.lesson_reports for select
  using (teacher_id = auth.uid());
create policy lesson_reports_own_insert on public.lesson_reports for insert
  with check (teacher_id = auth.uid()
              and exists (select 1 from public.class_sessions s where s.id = session_id and s.teacher_id = auth.uid()));
create policy lesson_reports_own_update on public.lesson_reports for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid()
              and exists (select 1 from public.class_sessions s where s.id = session_id and s.teacher_id = auth.uid()));

-- ════════════════════════════════════════════════════════════
-- 6. Student timeline: every enrollment / assignment change is logged
-- ════════════════════════════════════════════════════════════

create or replace function public.log_student_event(
  p_student uuid, p_type text, p_title text, p_body text default null,
  p_before jsonb default null, p_after jsonb default null)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if not exists (select 1 from crm_students where id = p_student) then return; end if;
  insert into crm_student_events (student_id, actor_id, actor_email, event_type, title, body, before_val, after_val)
  values (p_student, current_profile_id(), (select email from profiles where id = auth.uid()),
          p_type, p_title, p_body, p_before, p_after);
end $$;

create or replace function public.log_class_enrollment_event()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_title text;
begin
  select title into v_title from online_classes where id = new.class_id;
  if tg_op = 'INSERT' then
    perform log_student_event(new.student_id, 'class_enrolled',
      case when new.status = 'waitlisted' then 'قائمة انتظار: ' else 'تسجيل في قسم: ' end || coalesce(v_title, '—'),
      null, null, jsonb_build_object('class_id', new.class_id, 'status', new.status));
  elsif new.status is distinct from old.status then
    perform log_student_event(new.student_id, 'class_enrollment_status',
      'تغيير حالة التسجيل في ' || coalesce(v_title, '—') || ': ' || old.status || ' → ' || new.status,
      new.end_reason, jsonb_build_object('status', old.status), jsonb_build_object('status', new.status));
  end if;
  return null;
end $$;

drop trigger if exists trg_online_class_enrollments_log on public.online_class_enrollments;
create trigger trg_online_class_enrollments_log after insert or update on public.online_class_enrollments
  for each row execute function public.log_class_enrollment_event();

create or replace function public.log_course_enrollment_event()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_title text;
begin
  select title into v_title from lms_courses where id = coalesce(new.course_id, old.course_id);
  if tg_op = 'INSERT' then
    perform log_student_event(new.student_id, 'course_enrolled', 'تسجيل في دورة: ' || coalesce(v_title, '—'));
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    perform log_student_event(new.student_id, 'course_enrollment_status',
      'دورة ' || coalesce(v_title, '—') || ': ' || old.status || ' → ' || new.status);
  elsif tg_op = 'DELETE' then
    perform log_student_event(old.student_id, 'course_unenrolled', 'إلغاء التسجيل من دورة: ' || coalesce(v_title, '—'),
      nullif(current_setting('app.enrollment_end_reason', true), ''));
  end if;
  return null;
end $$;

drop trigger if exists trg_lms_enrollments_log on public.lms_enrollments;
create trigger trg_lms_enrollments_log after insert or update or delete on public.lms_enrollments
  for each row execute function public.log_course_enrollment_event();

create or replace function public.log_teacher_assignment_event()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_name text;
begin
  select coalesce(tp.display_name, p.full_name, p.email) into v_name
    from profiles p left join teacher_profiles tp on tp.id = p.id where p.id = new.teacher_id;
  if tg_op = 'INSERT' or new.is_active is distinct from old.is_active then
    perform log_student_event(new.student_id,
      case when new.is_active then 'teacher_assigned' else 'teacher_unassigned' end,
      case when new.is_active then 'إسناد إلى الأستاذ: ' else 'إلغاء إسناد الأستاذ: ' end || coalesce(v_name, '—'));
  end if;
  return null;
end $$;

drop trigger if exists trg_teacher_students_log on public.teacher_students;
create trigger trg_teacher_students_log after insert or update on public.teacher_students
  for each row execute function public.log_teacher_assignment_event();

-- ════════════════════════════════════════════════════════════
-- 7. Teacher-facing RPCs
-- ════════════════════════════════════════════════════════════

-- Phone mask used everywhere a teacher sees a number.
create or replace function public.mask_phone(p text)
returns text language sql immutable as $$
  select case when p is null or length(p) < 6 then null else left(p, 5) || '••••' || right(p, 2) end
$$;

-- The roster: students assigned to me, plus students holding an active seat in
-- a class I teach. Each row says why the student is here.
create or replace function public.teacher_my_students()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  with assigned as (
    select ts.student_id, ts.assigned_at from teacher_students ts
    where ts.teacher_id = auth.uid() and ts.is_active
  ),
  seated as (
    select e.student_id,
           jsonb_agg(jsonb_build_object('class_id', c.id, 'title', c.title, 'mode', c.mode) order by c.title) as classes
    from online_class_enrollments e join online_classes c on c.id = e.class_id
    where c.teacher_id = auth.uid() and e.status = 'active' and c.archived_at is null
    group by e.student_id
  ),
  ids as (select student_id from assigned union select student_id from seated)
  select case when not public.is_teacher(auth.uid()) then '[]'::jsonb else coalesce(jsonb_agg(jsonb_build_object(
    'id',              s.id,
    'full_name',       s.full_name,
    'course',          s.course,
    'student_type',    s.student_type,
    'enrollment_date', s.enrollment_date,
    'is_active',       s.is_active,
    'avatar_url',      s.avatar_url,
    'phone_masked',    mask_phone(s.phone_number),
    'assigned',        a.student_id is not null,
    'assigned_at',     a.assigned_at,
    'classes',         coalesce(st.classes, '[]'::jsonb)
  ) order by s.full_name), '[]'::jsonb) end
  from ids
  join crm_students s on s.id = ids.student_id and s.deleted_at is null
  left join assigned a on a.student_id = ids.student_id
  left join seated  st on st.student_id = ids.student_id
$$;

create or replace function public.teacher_my_classes()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select case when not public.is_teacher(auth.uid()) then '[]'::jsonb else coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'title', c.title, 'mode', c.mode, 'level', c.level, 'status', c.status,
    'course_id', c.course_id, 'course_title', lc.title,
    'starts_on', c.starts_on, 'ends_on', c.ends_on, 'capacity', c.capacity,
    'meeting_url', c.meeting_url, 'schedule_note', c.schedule_note,
    'is_owner', c.teacher_id = auth.uid(),
    'archived', c.archived_at is not null,
    'active_count',     (select count(*) from online_class_enrollments e where e.class_id = c.id and e.status = 'active'),
    'waitlisted_count', (select count(*) from online_class_enrollments e where e.class_id = c.id and e.status = 'waitlisted'),
    'sessions_done',    (select count(*) from class_sessions s where s.class_id = c.id and s.teacher_id = auth.uid() and s.status = 'done'),
    'reports_owed',     (select count(*) from class_sessions s where s.class_id = c.id and s.teacher_id = auth.uid() and s.status = 'done'
                           and not exists (select 1 from lesson_reports r where r.session_id = s.id)),
    'next_session_at',  (select min(s.starts_at) from class_sessions s where s.class_id = c.id and s.teacher_id = auth.uid()
                           and s.status in ('scheduled', 'live') and s.starts_at >= now() - interval '1 hour')
  ) order by (c.archived_at is not null), c.status, c.title), '[]'::jsonb) end
  from online_classes c
  left join lms_courses lc on lc.id = c.course_id
  where public.teacher_can_view_class(c.id)
$$;

-- A class roster. The owner sees every seat (with history); a substitute sees
-- only the students who held a seat during a session they taught.
create or replace function public.teacher_class_roster(p_class_id uuid)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v_owner boolean;
begin
  if not teacher_can_view_class(p_class_id) then
    raise exception 'Not your class' using errcode = '42501';
  end if;
  v_owner := teacher_owns_class(p_class_id);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'enrollment_id', e.id, 'student_id', s.id, 'full_name', s.full_name, 'avatar_url', s.avatar_url,
      'phone_masked', mask_phone(s.phone_number), 'status', e.status,
      'enrolled_at', e.enrolled_at, 'start_date', e.start_date, 'end_date', e.end_date, 'ended_at', e.ended_at,
      'attendance', (select jsonb_build_object(
          'marked',  count(*),
          'present', count(*) filter (where a.status in ('present', 'late')),
          'absent',  count(*) filter (where a.status = 'absent'))
        from class_attendance a join class_sessions cs on cs.id = a.session_id
        where cs.class_id = p_class_id and a.student_id = s.id)
    ) order by (e.status <> 'active'), s.full_name)
    from online_class_enrollments e
    join crm_students s on s.id = e.student_id and s.deleted_at is null
    where e.class_id = p_class_id
      and (v_owner or exists (
        select 1 from class_sessions cs
        where cs.class_id = p_class_id and cs.teacher_id = auth.uid()
          and enrollment_covers(e.status, e.ended_at, cs.starts_at)))
  ), '[]'::jsonb);
end $$;

-- The attendance sheet for one session: exactly the students who belong in it
-- (see teacher_can_mark), plus anyone already marked so old marks stay visible.
-- Staff may call it for any session.
create or replace function public.session_roster(p_session_id uuid)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v_s class_sessions%rowtype; v_teacher uuid;
begin
  select * into v_s from class_sessions where id = p_session_id;
  if not found then raise exception 'Session not found' using errcode = '42501'; end if;
  if not (is_crm_staff(auth.uid()) or (is_teacher(auth.uid()) and v_s.teacher_id = auth.uid())) then
    raise exception 'Not your session' using errcode = '42501';
  end if;
  v_teacher := v_s.teacher_id;
  return coalesce((
    with eligible as (
      select e.student_id from online_class_enrollments e
      where v_s.class_id is not null and e.class_id = v_s.class_id
        and enrollment_covers(e.status, e.ended_at, v_s.starts_at)
      union
      select ts.student_id from teacher_students ts
      where v_s.class_id is null and ts.teacher_id = v_teacher and ts.is_active
    ),
    marked as (select a.student_id, a.status, a.note from class_attendance a where a.session_id = p_session_id),
    ids as (select student_id from eligible union select student_id from marked)
    select jsonb_agg(jsonb_build_object(
      'student_id', s.id, 'full_name', s.full_name, 'avatar_url', s.avatar_url,
      'eligible', exists (select 1 from eligible el where el.student_id = s.id),
      'attendance', m.status, 'note', m.note
    ) order by s.full_name)
    from ids
    join crm_students s on s.id = ids.student_id and s.deleted_at is null
    left join marked m on m.student_id = s.id
  ), '[]'::jsonb);
end $$;

-- Dashboard header. Month boundaries now follow Morocco time like the rest of
-- the app (they were UTC).
create or replace function public.teacher_overview()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select case when not public.is_teacher(auth.uid()) then '{}'::jsonb else jsonb_build_object(
    'students_total', (select count(*) from (
                          select student_id from teacher_students where teacher_id = auth.uid() and is_active
                          union
                          select e.student_id from online_class_enrollments e join online_classes c on c.id = e.class_id
                          where c.teacher_id = auth.uid() and e.status = 'active') u
                        join crm_students s on s.id = u.student_id and s.deleted_at is null),
    'assigned_students', (select count(*) from teacher_students ts join crm_students s on s.id = ts.student_id
                          where ts.teacher_id = auth.uid() and ts.is_active and s.deleted_at is null),
    'class_students', (select count(distinct e.student_id) from online_class_enrollments e
                         join online_classes c on c.id = e.class_id
                         join crm_students s on s.id = e.student_id and s.deleted_at is null
                        where c.teacher_id = auth.uid() and e.status = 'active'),
    'classes_active', (select count(*) from online_classes
                        where teacher_id = auth.uid() and status = 'active' and archived_at is null),
    'classes_month',  (select count(*) from public.class_sessions
                        where teacher_id = auth.uid() and status = 'done'
                          and starts_at >= casa_now_trunc('month')),
    'hours_month',    (select coalesce(round(sum(duration_min)::numeric / 60, 1), 0) from public.class_sessions
                        where teacher_id = auth.uid() and status = 'done'
                          and starts_at >= casa_now_trunc('month')),
    'upcoming',       (select count(*) from public.class_sessions
                        where teacher_id = auth.uid() and status = 'scheduled' and starts_at >= now()),
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

-- ════════════════════════════════════════════════════════════
-- 8. Student portal: a class teacher teaches you too
-- ════════════════════════════════════════════════════════════

create or replace function public.student_teacher_ids(p_student uuid)
returns setof uuid language sql stable security definer set search_path to 'public' as $$
  select teacher_id from teacher_students where student_id = p_student and is_active
  union
  select c.teacher_id from online_class_enrollments e join online_classes c on c.id = e.class_id
  where e.student_id = p_student and e.status in ('active', 'completed') and c.teacher_id is not null
$$;

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
                      where r.teacher_id = p.id and r.student_id = s.id)
  )), '[]'::jsonb)
  from public.crm_students s
  cross join lateral public.student_teacher_ids(s.id) t(teacher_id)
  join public.profiles p on p.id = t.teacher_id
  left join public.teacher_profiles tp on tp.id = p.id
  where s.verification_token = upper(trim(p_token))
    and s.deleted_at is null and s.is_active = true
$$;

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

  -- The assignment / class-seat check is what stops review stuffing.
  if p_teacher_id is null or not exists (select 1 from public.student_teacher_ids(v_student) t where t = p_teacher_id) then
    return jsonb_build_object('ok', false, 'error', 'You can only review a teacher who teaches you.');
  end if;

  insert into public.teacher_reviews (teacher_id, student_id, rating, comment)
  values (p_teacher_id, v_student, p_rating, nullif(trim(coalesce(p_comment, '')), ''))
  on conflict (teacher_id, student_id) do update
    set rating = excluded.rating, comment = excluded.comment, updated_at = now();

  return jsonb_build_object('ok', true);
end $$;

-- ════════════════════════════════════════════════════════════
-- 9. Staff RPCs (founder + assistant)
-- ════════════════════════════════════════════════════════════

create or replace function public.require_staff()
returns void language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public.is_crm_staff(auth.uid()) then
    raise exception 'Staff only' using errcode = '42501';
  end if;
end $$;

-- Bulk class enrollment. One result per student; a duplicate or a full class
-- does not abort the rest.
create or replace function public.staff_enroll_class(
  p_class_id uuid, p_student_ids uuid[], p_enrolled_on date default null,
  p_start_date date default null, p_waitlist boolean default false)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_sid uuid; v_out jsonb := '[]'::jsonb; v_row online_class_enrollments%rowtype;
  v_at timestamptz := case when p_enrolled_on is null then now()
                           else casa_day_start(p_enrolled_on) + interval '12 hours' end;
begin
  perform require_staff();
  if p_enrolled_on is not null and p_enrolled_on > casa_date(now()) then
    raise exception 'Enrollment date cannot be in the future' using errcode = '22023';
  end if;
  foreach v_sid in array coalesce(p_student_ids, '{}'::uuid[]) loop
    begin
      if not exists (select 1 from crm_students where id = v_sid and deleted_at is null) then
        v_out := v_out || jsonb_build_object('student_id', v_sid, 'result', 'not_found');
        continue;
      end if;
      if exists (select 1 from online_class_enrollments
                 where class_id = p_class_id and student_id = v_sid and status in ('active', 'waitlisted')) then
        v_out := v_out || jsonb_build_object('student_id', v_sid, 'result', 'duplicate');
        continue;
      end if;
      insert into online_class_enrollments (class_id, student_id, status, enrolled_at, start_date)
      values (p_class_id, v_sid, case when p_waitlist then 'waitlisted' else 'active' end, v_at, p_start_date)
      returning * into v_row;
      v_out := v_out || jsonb_build_object('student_id', v_sid, 'result', v_row.status, 'enrollment_id', v_row.id);
    exception
      when unique_violation then
        v_out := v_out || jsonb_build_object('student_id', v_sid, 'result', 'duplicate');
      when check_violation or foreign_key_violation then
        v_out := v_out || jsonb_build_object('student_id', v_sid, 'result', 'error', 'message', sqlerrm);
    end;
  end loop;
  return v_out;
end $$;

-- Lifecycle of one seat: promote from waitlist, complete, cancel (with reason).
create or replace function public.staff_set_class_enrollment(
  p_enrollment_id uuid, p_status text, p_reason text default null,
  p_start_date date default null, p_end_date date default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_row online_class_enrollments%rowtype;
begin
  perform require_staff();
  if p_status not in ('active', 'waitlisted', 'completed', 'cancelled') then
    raise exception 'Unknown status %', p_status using errcode = '22023';
  end if;
  update online_class_enrollments
     set status     = p_status,
         end_reason = coalesce(nullif(btrim(p_reason), ''), end_reason),
         start_date = coalesce(p_start_date, start_date),
         end_date   = coalesce(p_end_date, end_date)
   where id = p_enrollment_id
  returning * into v_row;
  if not found then raise exception 'Enrollment not found' using errcode = '22023'; end if;
  return to_jsonb(v_row);
end $$;

-- Bulk course enrollment (same semantics as the single "enroll" button).
create or replace function public.staff_enroll_course(p_course_id uuid, p_student_ids uuid[])
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_new int; v_valid int;
begin
  perform require_staff();
  if not exists (select 1 from lms_courses where id = p_course_id) then
    raise exception 'Course not found' using errcode = '22023';
  end if;
  select count(*) into v_valid from crm_students
   where id = any(coalesce(p_student_ids, '{}'::uuid[])) and deleted_at is null;
  with ins as (
    insert into lms_enrollments (course_id, student_id, status, created_by)
    select p_course_id, s.id, 'active', current_profile_id()
    from crm_students s
    where s.id = any(coalesce(p_student_ids, '{}'::uuid[])) and s.deleted_at is null
    on conflict (course_id, student_id) do nothing
    returning 1)
  select count(*) into v_new from ins;
  return jsonb_build_object('enrolled', v_new, 'already', v_valid - v_new,
                            'not_found', coalesce(cardinality(p_student_ids), 0) - v_valid);
end $$;

-- Remove a course enrollment (revokes access; archived with the reason).
create or replace function public.staff_end_course_enrollment(p_student_id uuid, p_course_id uuid, p_reason text default null)
returns boolean language plpgsql security definer set search_path to 'public' as $$
begin
  perform require_staff();
  perform set_config('app.enrollment_end_reason', coalesce(nullif(btrim(p_reason), ''), ''), true);
  delete from lms_enrollments where student_id = p_student_id and course_id = p_course_id;
  perform set_config('app.enrollment_end_reason', '', true);
  return found;
end $$;

create or replace function public.staff_set_course_enrollment_status(p_student_id uuid, p_course_id uuid, p_status text)
returns boolean language plpgsql security definer set search_path to 'public' as $$
begin
  perform require_staff();
  update lms_enrollments set status = p_status where student_id = p_student_id and course_id = p_course_id;
  return found;
end $$;

-- Bulk teacher assignment (or un-assignment). Returns rows changed.
create or replace function public.staff_assign_teacher(p_teacher_id uuid, p_student_ids uuid[], p_active boolean default true)
returns integer language plpgsql security definer set search_path to 'public' as $$
declare v_n int;
begin
  perform require_staff();
  if not is_teacher(p_teacher_id) then raise exception 'Not a teacher account' using errcode = '22023'; end if;
  if p_active then
    with up as (
      insert into teacher_students (teacher_id, student_id, assigned_by, is_active, assigned_at)
      select p_teacher_id, s.id, current_profile_id(), true, now()
      from crm_students s where s.id = any(coalesce(p_student_ids, '{}'::uuid[])) and s.deleted_at is null
      on conflict (teacher_id, student_id) do update
        set is_active = true, assigned_by = excluded.assigned_by, assigned_at = now()
        where teacher_students.is_active = false
      returning 1)
    select count(*) into v_n from up;
  else
    update teacher_students set is_active = false
     where teacher_id = p_teacher_id and student_id = any(coalesce(p_student_ids, '{}'::uuid[])) and is_active;
    get diagnostics v_n = row_count;
  end if;
  return v_n;
end $$;

-- Attach existing sessions to a class (or detach with p_class_id = null).
create or replace function public.staff_link_sessions(p_class_id uuid, p_session_ids uuid[])
returns integer language plpgsql security definer set search_path to 'public' as $$
declare v_n int;
begin
  perform require_staff();
  update class_sessions set class_id = p_class_id where id = any(coalesce(p_session_ids, '{}'::uuid[]));
  get diagnostics v_n = row_count;
  return v_n;
end $$;

-- Students who were marked in this class's sessions but hold no seat. A review
-- list for staff — nothing is enrolled automatically.
create or replace function public.staff_class_attendance_without_enrollment(p_class_id uuid)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  perform require_staff();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'student_id', s.id, 'full_name', s.full_name,
      'marks', x.marks, 'present', x.present, 'first_at', x.first_at, 'last_at', x.last_at) order by s.full_name)
    from (
      select a.student_id, count(*) marks, count(*) filter (where a.status in ('present', 'late')) present,
             min(cs.starts_at) first_at, max(cs.starts_at) last_at
      from class_attendance a join class_sessions cs on cs.id = a.session_id
      where cs.class_id = p_class_id
      group by a.student_id
    ) x
    join crm_students s on s.id = x.student_id and s.deleted_at is null
    where not exists (select 1 from online_class_enrollments e
                      where e.class_id = p_class_id and e.student_id = x.student_id and e.status <> 'waitlisted')
  ), '[]'::jsonb);
end $$;

-- Everything the student profile shows about enrollment, in one call.
create or replace function public.staff_student_enrollments(p_student_id uuid)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  perform require_staff();
  return jsonb_build_object(
    'courses', coalesce((
      select jsonb_agg(x order by (x->>'status') = 'cancelled', x->>'enrolled_at' desc) from (
        select jsonb_build_object('id', e.id, 'course_id', e.course_id, 'title', c.title, 'level', c.level,
          'status', e.status, 'enrolled_at', e.enrolled_at, 'completed_at', e.completed_at, 'ended_at', null,
          'end_reason', null, 'current', true) as x
        from lms_enrollments e join lms_courses c on c.id = e.course_id
        where e.student_id = p_student_id
        union all
        select jsonb_build_object('id', h.id, 'course_id', h.course_id, 'title', coalesce(c.title, h.course_title), 'level', c.level,
          'status', case when h.final_status = 'completed' then 'completed' else 'cancelled' end,
          'enrolled_at', h.enrolled_at, 'completed_at', h.completed_at, 'ended_at', h.ended_at,
          'end_reason', h.end_reason, 'current', false)
        from lms_enrollment_history h left join lms_courses c on c.id = h.course_id
        where h.student_id = p_student_id) q), '[]'::jsonb),
    'classes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id, 'class_id', c.id, 'title', c.title, 'mode', c.mode, 'class_status', c.status,
        'archived', c.archived_at is not null, 'status', e.status, 'enrolled_at', e.enrolled_at,
        'start_date', e.start_date, 'end_date', e.end_date, 'ended_at', e.ended_at, 'end_reason', e.end_reason,
        'teacher_id', c.teacher_id, 'teacher_name', coalesce(tp.display_name, p.full_name, p.email),
        'course_title', lc.title)
        order by (e.status in ('completed', 'cancelled')), e.enrolled_at desc)
      from online_class_enrollments e
      join online_classes c on c.id = e.class_id
      left join profiles p on p.id = c.teacher_id
      left join teacher_profiles tp on tp.id = c.teacher_id
      left join lms_courses lc on lc.id = c.course_id
      where e.student_id = p_student_id), '[]'::jsonb),
    'teachers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'teacher_id', ts.teacher_id, 'name', coalesce(tp.display_name, p.full_name, p.email),
        'is_active', ts.is_active, 'assigned_at', ts.assigned_at) order by ts.is_active desc, ts.assigned_at desc)
      from teacher_students ts
      join profiles p on p.id = ts.teacher_id
      left join teacher_profiles tp on tp.id = ts.teacher_id
      where ts.student_id = p_student_id), '[]'::jsonb)
  );
end $$;

-- The "Online classes" list.
create or replace function public.staff_online_classes(p_include_archived boolean default false)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  perform require_staff();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', c.id, 'title', c.title, 'mode', c.mode, 'level', c.level, 'status', c.status,
      'teacher_id', c.teacher_id, 'teacher_name', coalesce(tp.display_name, p.full_name, p.email),
      'course_id', c.course_id, 'course_title', lc.title,
      'starts_on', c.starts_on, 'ends_on', c.ends_on, 'capacity', c.capacity, 'waitlist_enabled', c.waitlist_enabled,
      'meeting_url', c.meeting_url, 'schedule_note', c.schedule_note, 'notes', c.notes,
      'archived_at', c.archived_at, 'created_at', c.created_at,
      'active_count',     (select count(*) from online_class_enrollments e join crm_students s on s.id = e.student_id and s.deleted_at is null
                            where e.class_id = c.id and e.status = 'active'),
      'waitlisted_count', (select count(*) from online_class_enrollments e join crm_students s on s.id = e.student_id and s.deleted_at is null
                            where e.class_id = c.id and e.status = 'waitlisted'),
      'sessions_done',     (select count(*) from class_sessions s where s.class_id = c.id and s.status = 'done'),
      'sessions_upcoming', (select count(*) from class_sessions s where s.class_id = c.id and s.status in ('scheduled', 'live') and s.starts_at >= now()),
      'next_session_at',   (select min(s.starts_at) from class_sessions s where s.class_id = c.id and s.status in ('scheduled', 'live') and s.starts_at >= now())
    ) order by (c.archived_at is not null), (c.status <> 'active'), c.title)
    from online_classes c
    left join profiles p on p.id = c.teacher_id
    left join teacher_profiles tp on tp.id = c.teacher_id
    left join lms_courses lc on lc.id = c.course_id
    where p_include_archived or c.archived_at is null
  ), '[]'::jsonb);
end $$;

-- One class: roster (staff see full names and real phones, as elsewhere in the
-- CRM) and the session schedule with attendance and report status.
create or replace function public.staff_online_class_detail(p_class_id uuid)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  perform require_staff();
  return (
    select jsonb_build_object(
      'class', to_jsonb(c) || jsonb_build_object(
        'teacher_name', coalesce(tp.display_name, p.full_name, p.email), 'course_title', lc.title),
      'roster', coalesce((
        select jsonb_agg(jsonb_build_object(
          'enrollment_id', e.id, 'student_id', s.id, 'full_name', s.full_name, 'phone_number', s.phone_number,
          'avatar_url', s.avatar_url, 'status', e.status, 'enrolled_at', e.enrolled_at, 'activated_at', e.activated_at,
          'start_date', e.start_date, 'end_date', e.end_date, 'ended_at', e.ended_at, 'end_reason', e.end_reason,
          'attendance', (select jsonb_build_object(
              'marked', count(*), 'present', count(*) filter (where a.status in ('present', 'late')),
              'absent', count(*) filter (where a.status = 'absent'))
            from class_attendance a join class_sessions cs on cs.id = a.session_id
            where cs.class_id = c.id and a.student_id = s.id))
          order by case e.status when 'active' then 0 when 'waitlisted' then 1 when 'completed' then 2 else 3 end,
                   e.enrolled_at)
        from online_class_enrollments e
        join crm_students s on s.id = e.student_id and s.deleted_at is null
        where e.class_id = c.id), '[]'::jsonb),
      'sessions', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', s.id, 'title', s.title, 'starts_at', s.starts_at, 'duration_min', s.duration_min,
          'status', s.status, 'cancel_reason', s.cancel_reason, 'teacher_id', s.teacher_id,
          'teacher_name', coalesce(stp.display_name, sp.full_name, sp.email),
          'marks', (select count(*) from class_attendance a where a.session_id = s.id),
          'present', (select count(*) from class_attendance a where a.session_id = s.id and a.status in ('present', 'late')),
          'has_report', exists (select 1 from lesson_reports r where r.session_id = s.id))
          order by s.starts_at)
        from class_sessions s
        left join profiles sp on sp.id = s.teacher_id
        left join teacher_profiles stp on stp.id = s.teacher_id
        where s.class_id = c.id), '[]'::jsonb)
    )
    from online_classes c
    left join profiles p on p.id = c.teacher_id
    left join teacher_profiles tp on tp.id = c.teacher_id
    left join lms_courses lc on lc.id = c.course_id
    where c.id = p_class_id
  );
end $$;

-- Sessions not attached to any class yet (legacy and ad-hoc), for linking.
create or replace function public.staff_unlinked_sessions()
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  perform require_staff();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', s.id, 'title', s.title, 'mode', s.mode, 'level', s.level, 'starts_at', s.starts_at,
      'status', s.status, 'teacher_id', s.teacher_id,
      'teacher_name', coalesce(tp.display_name, p.full_name, p.email),
      'marks', (select count(*) from class_attendance a where a.session_id = s.id)) order by s.starts_at desc)
    from class_sessions s
    left join profiles p on p.id = s.teacher_id
    left join teacher_profiles tp on tp.id = s.teacher_id
    where s.class_id is null
  ), '[]'::jsonb);
end $$;

-- ════════════════════════════════════════════════════════════
-- 10. Grants
-- ════════════════════════════════════════════════════════════
-- Every RPC above checks the caller itself; anon never needs them.

revoke execute on function
  public.teacher_my_students(), public.teacher_my_classes(), public.teacher_class_roster(uuid),
  public.session_roster(uuid), public.teacher_overview(),
  public.staff_enroll_class(uuid, uuid[], date, date, boolean),
  public.staff_set_class_enrollment(uuid, text, text, date, date),
  public.staff_enroll_course(uuid, uuid[]),
  public.staff_end_course_enrollment(uuid, uuid, text),
  public.staff_set_course_enrollment_status(uuid, uuid, text),
  public.staff_assign_teacher(uuid, uuid[], boolean),
  public.staff_link_sessions(uuid, uuid[]),
  public.staff_class_attendance_without_enrollment(uuid),
  public.staff_student_enrollments(uuid),
  public.staff_online_classes(boolean),
  public.staff_online_class_detail(uuid),
  public.staff_unlinked_sessions(),
  public.require_staff()
  from public, anon;

-- Internal helpers: not callable through the API at all.
revoke execute on function
  public.teacher_can_reach_student(uuid, uuid),
  public.log_student_event(uuid, text, text, text, jsonb, jsonb),
  public.archive_lms_enrollment(),
  public.log_class_enrollment_event(), public.log_course_enrollment_event(), public.log_teacher_assignment_event(),
  public.online_classes_guard(), public.online_class_enrollments_guard(),
  public.class_sessions_guard(), public.class_sessions_keep_history(), public.class_attendance_stamp(),
  public.student_teacher_ids(uuid)
  from public, anon, authenticated;
grant execute on function public.teacher_can_reach_student(uuid, uuid) to service_role;
