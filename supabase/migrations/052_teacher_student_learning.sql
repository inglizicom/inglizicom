-- 052_teacher_student_learning.sql
-- A teacher's view of one student's learning: course progress, where they are
-- in the curriculum, practice and exam results, weekly activity, streak and
-- certificates — for the student profile page (/teacher/students/[id]).
--
-- Access: the caller must be a teacher and the student must be on that
-- teacher's roster (teacher_roster: assigned ∪ active class seat — the same
-- rule as the teacher home and roster). Anyone else gets NULL, never an error
-- that would confirm the student exists.
--
-- Deliberately NOT returned: payments, phone number, any crm_* field beyond
-- what teacher_my_students() already exposes. Read-only, no table changes.

create or replace function public.teacher_student_learning(p_student uuid)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_course   uuid;
  v_title    text;
  v_level    text;
  v_unit     text;
  v_lesson   text;
  v_module   uuid;
  v_has_exam boolean;
  v_total    int := 0;
  v_done     int := 0;
  v_tz       constant text := 'Africa/Casablanca';
  v_week0    date := date_trunc('week', (now() at time zone v_tz))::date;   -- Monday of this week
begin
  if p_student is null or not public.is_teacher(auth.uid())
     or not exists (select 1 from public.teacher_roster(auth.uid()) r where r.student_id = p_student) then
    return null;
  end if;

  -- The current course: the most recent active course enrollment.
  select le.course_id, lc.title, lc.level
    into v_course, v_title, v_level
    from lms_enrollments le join lms_courses lc on lc.id = le.course_id
   where le.student_id = p_student and le.status = 'active'
   order by le.enrolled_at desc
   limit 1;

  if v_course is not null then
    select count(*),
           count(*) filter (where exists (select 1 from lms_lesson_progress lp
                                           where lp.student_id = p_student and lp.lesson_id = l.id and lp.status = 'completed'))
      into v_total, v_done
      from lms_lessons l join lms_modules m on m.id = l.module_id
     where m.course_id = v_course;

    -- Where they are: the first lesson, in curriculum order, not yet completed.
    select l.title, m.title, m.id, (m.exam_quiz is not null)
      into v_lesson, v_unit, v_module, v_has_exam
      from lms_lessons l join lms_modules m on m.id = l.module_id
     where m.course_id = v_course
       and not exists (select 1 from lms_lesson_progress lp
                        where lp.student_id = p_student and lp.lesson_id = l.id and lp.status = 'completed')
     order by m.module_order, l.lesson_order
     limit 1;
  end if;

  return jsonb_build_object(
    'course', case when v_course is null then null else jsonb_build_object(
      'id',            v_course,
      'title',         v_title,
      'level',         v_level,
      'lessons_total', v_total,
      'lessons_done',  v_done,
      'progress_pct',  case when v_total > 0 then round(100.0 * v_done / v_total)::int else 0 end,
      'unit',          v_unit,
      'lesson',        v_lesson,
      'next_milestone', case
                          when v_module is null then null
                          when v_has_exam and not exists (
                            select 1 from lms_unit_exam_results x
                             where x.student_id = p_student and x.module_id = v_module and x.passed)
                            then 'امتحان ' || v_unit
                          else 'إنهاء ' || v_unit
                        end
    ) end,

    'lessons_completed', (select count(*) from lms_lesson_progress
                           where student_id = p_student and status = 'completed'),
    'last_lesson_at',    (select max(completed_at) from lms_lesson_progress
                           where student_id = p_student and status = 'completed'),
    'quizzes_passed',    (select count(distinct lesson_id) from lms_quiz_results
                           where student_id = p_student and passed),
    'quiz_avg',          (select round(avg(100.0 * score / nullif(total, 0)))::int from lms_quiz_results
                           where student_id = p_student),
    'exams_passed',      (select count(distinct module_id) from lms_unit_exam_results
                           where student_id = p_student and passed),
    'exam_avg',          (select round(avg(100.0 * score / nullif(total, 0)))::int from lms_unit_exam_results
                           where student_id = p_student),
    'tasks_done',        (select count(*) from student_assignments
                           where student_id = p_student and status = 'done'),
    'practice_correct',  (select count(*) from student_challenge_attempts
                           where student_id = p_student and is_correct),
    'active_days_7',     (select count(distinct (created_at at time zone v_tz)::date) from student_activity
                           where student_id = p_student and created_at >= now() - interval '7 days'),
    'minutes_7',         (select coalesce(sum(duration_sec), 0) / 60 from student_activity
                           where student_id = p_student and created_at >= now() - interval '7 days'),
    'last_active_at',    (select max(created_at) from student_activity where student_id = p_student),

    -- Lessons completed per week, eight weeks ending this one (Morocco weeks).
    'weekly', (select jsonb_agg(jsonb_build_object('week', w::date, 'lessons', (
                 select count(*) from lms_lesson_progress lp
                  where lp.student_id = p_student and lp.status = 'completed'
                    and (lp.completed_at at time zone v_tz)::date >= w::date
                    and (lp.completed_at at time zone v_tz)::date <  w::date + 7)) order by w)
               from generate_series(v_week0 - 49, v_week0, interval '7 days') w),

    'streak', (select jsonb_build_object('current', current_streak, 'longest', longest_streak)
                 from student_streaks where student_id = p_student),

    'certificates', coalesce((
      select jsonb_agg(c order by c->>'issued_at' desc) from (
        select jsonb_build_object('id', sc.id, 'title', sc.title, 'issued_at', sc.created_at, 'serial', sc.serial) c
          from student_certificates sc where sc.student_id = p_student
        union all
        select jsonb_build_object('id', lc.id, 'title', 'شهادة المستوى ' || lc.level, 'issued_at', lc.created_at, 'serial', null)
          from lms_certificates lc where lc.student_id = p_student and lc.passed
      ) t), '[]'::jsonb)
  );
end $$;

revoke execute on function public.teacher_student_learning(uuid) from public, anon;
grant execute on function public.teacher_student_learning(uuid) to authenticated;
