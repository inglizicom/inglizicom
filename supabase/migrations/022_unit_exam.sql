-- ════════════════════════════════════════════════════════════════════════
-- Per-unit TEST (team-authored auto-graded quiz). To unlock the next unit a
-- student must now: finish the unit's lessons + PASS the unit test (≥60%) +
-- have the conversation submission reviewed by the team.
-- ════════════════════════════════════════════════════════════════════════

alter table lms_modules add column if not exists exam_quiz jsonb;  -- { questions:[{q,choices,answer,explain}] }

create table if not exists lms_unit_exam_results (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references crm_students(id) on delete cascade,
  module_id   uuid not null references lms_modules(id) on delete cascade,
  score       int  not null,
  total       int  not null,
  passed      boolean not null,
  answers     jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_unit_exam_results_student on lms_unit_exam_results(student_id, module_id);
alter table lms_unit_exam_results enable row level security;
drop policy if exists lms_unit_exam_results_staff on lms_unit_exam_results;
create policy lms_unit_exam_results_staff on lms_unit_exam_results for all using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));

-- helper: does a module have a real test?
create or replace function public.module_has_exam(p_module uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select coalesce(jsonb_array_length(exam_quiz->'questions'), 0) > 0 from lms_modules where id = p_module
$$;

-- student: fetch a unit test + whether they've already passed it
create or replace function public.student_unit_exam(p_token text, p_module_id uuid)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v_quiz jsonb; v_passed boolean;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return null; end if;
  select exam_quiz into v_quiz from lms_modules where id = p_module_id;
  select exists(select 1 from lms_unit_exam_results where student_id=v_id and module_id=p_module_id and passed) into v_passed;
  return jsonb_build_object('quiz', v_quiz, 'passed', v_passed);
end; $$;

-- student: record a unit-test attempt (pass ≥ 60%)
create or replace function public.student_submit_unit_exam(p_token text, p_module_id uuid, p_score int, p_total int, p_answers jsonb)
returns boolean language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v_pass boolean; v_title text;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return false; end if;
  v_pass := p_total > 0 and (p_score::numeric * 100 / p_total) >= 60;
  insert into lms_unit_exam_results (student_id, module_id, score, total, passed, answers)
  values (v_id, p_module_id, p_score, p_total, v_pass, p_answers);
  select title into v_title from lms_modules where id = p_module_id;
  insert into student_activity (student_id, event_type, entity_type, entity_id, entity_title)
  values (v_id, case when v_pass then 'passed_unit_exam' else 'failed_unit_exam' end, 'module', p_module_id::text, v_title);
  return v_pass;
end; $$;

-- extend the gate: previous unit's TEST must be passed too (when it has one)
create or replace function public.student_can_access_lesson(p_student uuid, p_lesson uuid)
returns boolean language plpgsql security definer set search_path to 'public' as $$
declare
  v_module uuid; v_order int; v_course uuid;
  v_prev uuid; v_prev_total int; v_prev_done int; v_prev_reviewed boolean; v_started boolean; v_exam_ok boolean;
begin
  if exists (select 1 from lms_lesson_progress
             where student_id = p_student and lesson_id = p_lesson and status = 'completed') then
    return true;
  end if;
  select l.module_id, m.module_order, m.course_id
    into v_module, v_order, v_course
  from lms_lessons l join lms_modules m on m.id = l.module_id
  where l.id = p_lesson;
  if v_module is null then return true; end if;
  if v_order <= (select min(module_order) from lms_modules where course_id = v_course) then
    return true;
  end if;
  select exists (
    select 1 from lms_lesson_progress lp join lms_lessons l on l.id = lp.lesson_id
    where lp.student_id = p_student and l.module_id = v_module and lp.status = 'completed'
  ) into v_started;
  if v_started then return true; end if;
  select id into v_prev from lms_modules
   where course_id = v_course and module_order < v_order
   order by module_order desc limit 1;
  if v_prev is null then return true; end if;
  select count(*) into v_prev_total from lms_lessons where module_id = v_prev;
  select count(*) into v_prev_done
    from lms_lesson_progress lp join lms_lessons l on l.id = lp.lesson_id
   where lp.student_id = p_student and l.module_id = v_prev and lp.status = 'completed';
  if v_prev_total = 0 or v_prev_done < v_prev_total then return false; end if;
  -- previous unit's TEST must be passed (only if that unit actually has a test)
  if module_has_exam(v_prev) then
    select exists(select 1 from lms_unit_exam_results where student_id=p_student and module_id=v_prev and passed) into v_exam_ok;
    if not v_exam_ok then return false; end if;
  end if;
  -- previous unit's conversation must be reviewed by the team
  select exists (
    select 1 from lms_submissions
    where student_id = p_student and module_id = v_prev and status = 'reviewed'
  ) into v_prev_reviewed;
  return v_prev_reviewed;
end; $$;

-- student: which units have a test + whether passed (for the path UI)
create or replace function public.student_unit_exams(p_token text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v jsonb;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'module_id', m.id,
           'passed', exists(select 1 from lms_unit_exam_results r where r.student_id = v_id and r.module_id = m.id and r.passed))), '[]'::jsonb)
    into v
  from lms_modules m
  where coalesce(jsonb_array_length(m.exam_quiz->'questions'), 0) > 0
    and m.course_id in (select course_id from lms_enrollments where student_id = v_id);
  return v;
end; $$;

grant execute on function public.module_has_exam(uuid) to authenticated, service_role;
grant execute on function public.student_unit_exams(text) to anon, authenticated, service_role;
grant execute on function public.student_unit_exam(text, uuid) to anon, authenticated, service_role;
grant execute on function public.student_submit_unit_exam(text, uuid, int, int, jsonb) to anon, authenticated, service_role;
