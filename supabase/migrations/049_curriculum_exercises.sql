-- 049_curriculum_exercises.sql
-- Curriculum exercises vs. staff-assigned tasks.
--
-- Decision: the existing lesson and unit fields stay the single source of truth
-- for curriculum exercises — no parallel exercise table that could drift:
--   lesson_quiz        lms_lessons.quiz (questions)            lesson → unit → course by FK
--   writing_prompt     lms_lessons.quiz.exercise.prompt
--   external_exercise  lms_lessons.exercise_url
--   unit_reading_quiz  lms_modules.reading_quiz
--   unit_exam          lms_modules.exam_quiz
--   unit_conversation  every unit (the correction gate requires a reviewed submission)
-- Because each item hangs off its lesson/unit row, a curriculum exercise cannot
-- be orphaned or sit under the wrong course. Staff-assigned tasks
-- (student_assignments) stay free-form and are labelled separately; they may now
-- point at a lesson, and their course is derived from it.
--
-- Progression gates are unchanged: student_can_access_lesson,
-- student_complete_lesson, unit exams and correction review are not touched.
-- Opening a link never completes anything — completion still comes only from a
-- passed quiz, an explicit "done", a passed unit exam or a reviewed submission.

-- Both quiz shapes found in production: { "questions": [...] } and a bare array.
create or replace function public.lms_quiz_question_count(q jsonb)
returns integer language sql immutable as $$
  select case
    when q is null then 0
    when jsonb_typeof(q) = 'array' then jsonb_array_length(q)
    when jsonb_typeof(q) = 'object' and jsonb_typeof(q->'questions') = 'array' then jsonb_array_length(q->'questions')
    else 0 end
$$;

create or replace view public.lms_curriculum_items with (security_invoker = true) as
  select m.course_id, m.id as module_id, m.module_order, l.id as lesson_id, l.lesson_order,
         x.kind, x.item_order, x.size
  from public.lms_lessons l
  join public.lms_modules m on m.id = l.module_id
  cross join lateral (values
    ('lesson_quiz',       1, public.lms_quiz_question_count(l.quiz)),
    ('writing_prompt',    2, case when jsonb_typeof(l.quiz) = 'object'
                                   and nullif(btrim(l.quiz->'exercise'->>'prompt'), '') is not null then 1 else 0 end),
    ('external_exercise', 3, case when nullif(btrim(l.exercise_url), '') is not null then 1 else 0 end)
  ) as x(kind, item_order, size)
  where x.size > 0
  union all
  select m.course_id, m.id, m.module_order, null::uuid, null::integer, x.kind, x.item_order, x.size
  from public.lms_modules m
  cross join lateral (values
    ('unit_reading_quiz', 10, public.lms_quiz_question_count(m.reading_quiz)),
    ('unit_exam',         11, public.lms_quiz_question_count(m.exam_quiz)),
    ('unit_conversation', 12, 1)
  ) as x(kind, item_order, size)
  where x.size > 0;

-- ════════════════════════════════════════════════════════════
-- Staff-assigned tasks: optional lesson link
-- ════════════════════════════════════════════════════════════

alter table public.student_assignments
  add column if not exists course_id uuid references public.lms_courses(id) on delete set null,
  add column if not exists lesson_id uuid references public.lms_lessons(id) on delete set null;

create index if not exists student_assignments_lesson_idx on public.student_assignments (lesson_id) where lesson_id is not null;

alter table public.student_assignments drop constraint if exists student_assignments_status_check;
alter table public.student_assignments
  add constraint student_assignments_status_check check (status in ('pending', 'in_progress', 'done')) not valid;
alter table public.student_assignments validate constraint student_assignments_status_check;

create or replace function public.student_assignments_link()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  -- A linked task always carries its lesson's course, so it can't drift.
  if new.lesson_id is not null then
    select m.course_id into new.course_id
      from lms_lessons l join lms_modules m on m.id = l.module_id where l.id = new.lesson_id;
  end if;
  if new.status = 'done' then
    new.is_done := true;
    new.completed_at := coalesce(new.completed_at, now());
  elsif tg_op = 'UPDATE' and old.status = 'done' then
    new.is_done := false;
    new.completed_at := null;
  end if;
  return new;
end $$;

drop trigger if exists trg_student_assignments_link on public.student_assignments;
create trigger trg_student_assignments_link before insert or update on public.student_assignments
  for each row execute function public.student_assignments_link();

-- ════════════════════════════════════════════════════════════
-- Student dashboard: every exercise under its real unit and lesson
-- ════════════════════════════════════════════════════════════

create or replace function public.student_exercise_board(p_token text, p_course_id uuid default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return jsonb_build_object('found', false); end if;

  return (
    with
    courses as (
      select c.id, c.title from lms_enrollments e join lms_courses c on c.id = e.course_id
      where e.student_id = v_id and (p_course_id is null or c.id = p_course_id)
    ),
    lessons as (
      select l.id, l.module_id, l.title, l.lesson_order, l.lesson_type,
             coalesce(lp.status, 'not_started') as lesson_status,
             student_can_access_lesson(v_id, l.id) as unlocked
      from lms_lessons l
      join lms_modules m on m.id = l.module_id
      join courses c on c.id = m.course_id
      left join lms_lesson_progress lp on lp.lesson_id = l.id and lp.student_id = v_id
    ),
    items as (
      select i.*,
        case i.kind
          when 'lesson_quiz' then
            case when exists (select 1 from lms_quiz_results r where r.student_id = v_id and r.lesson_id = i.lesson_id and r.passed) then 'passed'
                 when exists (select 1 from lms_quiz_results r where r.student_id = v_id and r.lesson_id = i.lesson_id) then 'attempted'
                 else 'not_started' end
          when 'writing_prompt' then
            case when ls.lesson_status = 'completed' then 'completed' else 'not_started' end
          when 'external_exercise' then
            -- opening the link is "in progress"; only completing the lesson completes it
            case ls.lesson_status when 'completed' then 'completed' when 'opened' then 'in_progress' else 'not_started' end
          when 'unit_reading_quiz' then
            case when exists (select 1 from student_activity a where a.student_id = v_id
                               and a.event_type = 'completed_reading_quiz' and a.entity_id = i.module_id::text)
                 then 'completed' else 'not_started' end
          when 'unit_exam' then
            case when exists (select 1 from lms_unit_exam_results r where r.student_id = v_id and r.module_id = i.module_id and r.passed) then 'passed'
                 when exists (select 1 from lms_unit_exam_results r where r.student_id = v_id and r.module_id = i.module_id) then 'failed'
                 else 'not_started' end
          when 'unit_conversation' then
            coalesce((select case s.status when 'reviewed' then 'reviewed' else 'pending_review' end
                        from lms_submissions s where s.student_id = v_id and s.module_id = i.module_id
                        order by s.created_at desc limit 1), 'not_started')
        end as status,
        case i.kind
          when 'lesson_quiz' then jsonb_build_object(
            'questions', i.size,
            -- only the { questions } shape is enforced by the lesson gate today
            'gates_lesson', (select jsonb_typeof(l.quiz) = 'object' from lms_lessons l where l.id = i.lesson_id),
            'best_score', (select max(r.score) from lms_quiz_results r where r.student_id = v_id and r.lesson_id = i.lesson_id),
            'attempts',   (select count(*) from lms_quiz_results r where r.student_id = v_id and r.lesson_id = i.lesson_id))
          when 'unit_exam' then jsonb_build_object(
            'questions', i.size,
            'attempts', (select count(*) from lms_unit_exam_results r where r.student_id = v_id and r.module_id = i.module_id))
          when 'unit_conversation' then (
            select jsonb_build_object('score', s.score, 'submitted_at', s.created_at, 'reviewed_at', s.reviewed_at)
            from lms_submissions s where s.student_id = v_id and s.module_id = i.module_id
            order by s.created_at desc limit 1)
          when 'external_exercise' then jsonb_build_object(
            'url', (select l.exercise_url from lms_lessons l where l.id = i.lesson_id))
          else jsonb_build_object('size', i.size)
        end as detail,
        ls.unlocked
      from lms_curriculum_items i
      join courses c on c.id = i.course_id
      left join lessons ls on ls.id = i.lesson_id
    )
    select jsonb_build_object(
      'found', true,
      'courses', coalesce((select jsonb_agg(jsonb_build_object('course_id', id, 'title', title) order by title) from courses), '[]'::jsonb),
      'units', coalesce((
        select jsonb_agg(jsonb_build_object(
          'module_id', m.id, 'course_id', m.course_id, 'title', m.title, 'order', m.module_order,
          'lessons', coalesce((
            select jsonb_agg(jsonb_build_object(
              'lesson_id', l.id, 'title', l.title, 'order', l.lesson_order, 'type', l.lesson_type,
              'lesson_status', l.lesson_status, 'unlocked', l.unlocked,
              'items', coalesce((
                select jsonb_agg(jsonb_build_object('kind', it.kind,
                  'status', case when not l.unlocked and it.status = 'not_started' then 'locked' else it.status end,
                  'detail', it.detail) order by it.item_order)
                from items it where it.lesson_id = l.id), '[]'::jsonb))
              order by l.lesson_order)
            from lessons l where l.module_id = m.id), '[]'::jsonb),
          'unit_items', coalesce((
            select jsonb_agg(jsonb_build_object('kind', it.kind, 'status', it.status, 'detail', it.detail) order by it.item_order)
            from items it where it.module_id = m.id and it.lesson_id is null), '[]'::jsonb))
          order by m.course_id, m.module_order)
        from lms_modules m join courses c on c.id = m.course_id), '[]'::jsonb),
      'tasks', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', a.id, 'title', a.title, 'description', a.description, 'link_url', a.link_url,
          'status', a.status, 'category', a.category, 'due_date', a.due_date, 'completed_at', a.completed_at,
          'created_at', a.created_at, 'lesson_id', a.lesson_id, 'lesson_title', l.title,
          'module_id', m.id, 'module_title', m.title, 'course_id', a.course_id, 'course_title', c.title)
          order by (a.status = 'done'), a.due_date nulls last, a.created_at desc)
        from student_assignments a
        left join lms_lessons l on l.id = a.lesson_id
        left join lms_modules m on m.id = l.module_id
        left join lms_courses c on c.id = a.course_id
        where a.student_id = v_id
          and (p_course_id is null or a.course_id is null or a.course_id = p_course_id)), '[]'::jsonb),
      'summary', jsonb_build_object(
        'curriculum_total', (select count(*) from items),
        'curriculum_done',  (select count(*) from items where status in ('passed', 'completed', 'reviewed')),
        'tasks_total',      (select count(*) from student_assignments a where a.student_id = v_id),
        'tasks_done',       (select count(*) from student_assignments a where a.student_id = v_id and a.status = 'done'))
    )
  );
end $$;

-- ════════════════════════════════════════════════════════════
-- Audit: missing exercises, orphans, course/module mismatches
-- ════════════════════════════════════════════════════════════
-- severity: error   — breaks a student's path or a gate
--           warning — likely a mistake, or a gate silently not enforced
--           info    — worth knowing, allowed

create or replace function public.curriculum_exercise_audit()
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v jsonb;
begin
  perform require_staff();
  with issues as (
    -- Lesson with nothing to practise.
    select case when l.lesson_type in ('quiz', 'exercise') then 'error' else 'warning' end as severity,
           'lesson_missing_exercise' as kind, m.course_id, m.id as module_id, l.id as lesson_id, null::uuid as ref_id,
           'Lesson type "' || l.lesson_type || '" has no quiz questions, writing prompt or exercise link' as detail
    from lms_lessons l join lms_modules m on m.id = l.module_id
    where not exists (select 1 from lms_curriculum_items i where i.lesson_id = l.id)
    union all
    -- has_quiz drives the portal's quiz button; it must match the questions.
    select 'warning', 'has_quiz_mismatch', m.course_id, m.id, l.id, null,
           'has_quiz = ' || l.has_quiz || ' but the lesson has ' || lms_quiz_question_count(l.quiz) || ' question(s)'
    from lms_lessons l join lms_modules m on m.id = l.module_id
    where l.has_quiz <> (lms_quiz_question_count(l.quiz) > 0)
    union all
    -- Bare-array quizzes render, but student_complete_lesson only enforces { questions }.
    select 'warning', 'quiz_not_gating', m.course_id, m.id, l.id, null,
           'Quiz stored as a bare array: students see it, but passing it is not required to complete the lesson'
    from lms_lessons l join lms_modules m on m.id = l.module_id
    where jsonb_typeof(l.quiz) = 'array' and lms_quiz_question_count(l.quiz) > 0
    union all
    -- A question whose answer index points outside its choices can never be answered correctly.
    select 'error', 'quiz_bad_answer', m.course_id, m.id, l.id, null,
           'Question ' || (q.ord) || ': answer index ' || coalesce(q.val->>'answer', 'null') || ' outside ' ||
           case when jsonb_typeof(q.val->'choices') = 'array' then jsonb_array_length(q.val->'choices') else 0 end || ' choice(s)'
    from lms_lessons l join lms_modules m on m.id = l.module_id
    cross join lateral jsonb_array_elements(case jsonb_typeof(l.quiz) when 'array' then l.quiz
                                                when 'object' then case when jsonb_typeof(l.quiz->'questions') = 'array'
                                                                        then l.quiz->'questions' else '[]'::jsonb end
                                                else '[]'::jsonb end)
         with ordinality as q(val, ord)
    where jsonb_typeof(q.val) = 'object'
      and case when coalesce(jsonb_typeof(q.val->'choices'), '') <> 'array' then true
               when coalesce(q.val->>'answer', '') !~ '^\d+$' then true
               else (q.val->>'answer')::int >= jsonb_array_length(q.val->'choices') end
    union all
    -- An empty unit blocks the next unit forever (student_can_access_lesson needs every lesson done).
    select 'error', 'unit_without_lessons', m.course_id, m.id, null, null,
           'Unit has no lessons — students cannot get past it'
    from lms_modules m where not exists (select 1 from lms_lessons l where l.module_id = m.id)
    union all
    select 'info', 'unit_without_exam', m.course_id, m.id, null, null,
           'Unit has no end-of-unit test (allowed; the exam step links to the public test bank)'
    from lms_modules m where lms_quiz_question_count(m.exam_quiz) = 0
    union all
    -- Two lessons sharing a position make "the previous lesson" ambiguous.
    select 'warning', 'duplicate_lesson_order', m.course_id, m.id, null, null,
           'Lessons share position ' || d.lesson_order || ' (' || d.n || ' lessons)'
    from (select module_id, lesson_order, count(*) n from lms_lessons group by 1, 2 having count(*) > 1) d
    join lms_modules m on m.id = d.module_id
    union all
    -- Staff task linked to a lesson of a course the student is not enrolled in.
    select 'warning', 'task_outside_enrollment', a.course_id, l.module_id, a.lesson_id, a.id,
           'Task "' || a.title || '" points to a course this student is not enrolled in'
    from student_assignments a join lms_lessons l on l.id = a.lesson_id
    join crm_students s on s.id = a.student_id and s.deleted_at is null
    where a.course_id is not null
      and not exists (select 1 from lms_enrollments e where e.student_id = a.student_id and e.course_id = a.course_id)
    union all
    -- Legacy free-text course on a task that matches no course.
    select 'info', 'task_unknown_course_label', null, null, null, a.id,
           'Task "' || a.title || '" has course label "' || a.course || '" that matches no course'
    from student_assignments a
    where a.course_id is null and nullif(btrim(a.course), '') is not null
      and not exists (select 1 from lms_courses c where lower(c.title) = lower(btrim(a.course)))
    union all
    -- Course ids stored without a foreign key.
    select 'warning', 'session_unknown_course', s.course_id, null, null, s.id,
           'Session "' || s.title || '" references a course that no longer exists'
    from class_sessions s where s.course_id is not null and not exists (select 1 from lms_courses c where c.id = s.course_id)
    union all
    select 'warning', 'material_unknown_course', t.course_id, null, null, t.id,
           'Material "' || t.title || '" references a course that no longer exists'
    from teacher_materials t where t.course_id is not null and not exists (select 1 from lms_courses c where c.id = t.course_id)
    union all
    select 'warning', 'session_class_course_mismatch', s.course_id, null, null, s.id,
           'Session "' || s.title || '" is in class "' || oc.title || '" but points to a different course'
    from class_sessions s join online_classes oc on oc.id = s.class_id
    where s.course_id is not null and oc.course_id is not null and s.course_id <> oc.course_id
    union all
    -- Vocabulary tied to a unit of another course.
    select 'warning', 'vocab_module_course_mismatch', w.course_id, w.module_id, null, w.id,
           'Word "' || w.en || '" belongs to a unit of another course'
    from vocab_words w join lms_modules m on m.id = w.module_id
    where w.course_id is not null and m.course_id <> w.course_id
  )
  select jsonb_build_object(
    'generated_at', now(),
    'summary', jsonb_build_object(
      'error',   (select count(*) from issues where severity = 'error'),
      'warning', (select count(*) from issues where severity = 'warning'),
      'info',    (select count(*) from issues where severity = 'info'),
      'lessons', (select count(*) from lms_lessons),
      'lessons_with_exercise', (select count(distinct lesson_id) from lms_curriculum_items where lesson_id is not null)),
    'issues', coalesce((
      select jsonb_agg(jsonb_build_object(
        'severity', i.severity, 'kind', i.kind, 'detail', i.detail, 'ref_id', i.ref_id,
        'course_id', i.course_id, 'course_title', c.title,
        'module_id', i.module_id, 'module_title', m.title, 'module_order', m.module_order,
        'lesson_id', i.lesson_id, 'lesson_title', l.title, 'lesson_order', l.lesson_order)
        order by case i.severity when 'error' then 0 when 'warning' then 1 else 2 end,
                 c.title nulls last, m.module_order nulls last, l.lesson_order nulls last, i.kind)
      from issues i
      left join lms_courses c on c.id = i.course_id
      left join lms_modules m on m.id = i.module_id
      left join lms_lessons l on l.id = i.lesson_id), '[]'::jsonb)
  ) into v;
  return v;
end $$;

-- Lessons for the "link this task to a lesson" picker (staff).
create or replace function public.staff_lesson_options(p_course_id uuid)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  perform require_staff();
  return coalesce((
    select jsonb_agg(jsonb_build_object('lesson_id', l.id, 'lesson_title', l.title, 'lesson_order', l.lesson_order,
                                        'module_id', m.id, 'module_title', m.title, 'module_order', m.module_order)
                     order by m.module_order, l.lesson_order)
    from lms_lessons l join lms_modules m on m.id = l.module_id where m.course_id = p_course_id), '[]'::jsonb);
end $$;

revoke execute on function public.curriculum_exercise_audit(), public.staff_lesson_options(uuid) from public, anon;
revoke execute on function public.student_assignments_link() from public, anon, authenticated;
grant execute on function public.student_exercise_board(text, uuid) to anon, authenticated;
