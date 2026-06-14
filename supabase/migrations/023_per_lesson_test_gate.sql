-- ════════════════════════════════════════════════════════════════════════
-- Per-lesson test gate: every real-quiz lesson must be PASSED (100%) before the
-- next lesson, enforced in the database. Also makes has_quiz truthful and
-- enforces in-order lesson completion within a unit.
-- ════════════════════════════════════════════════════════════════════════

-- has_quiz is true only when the lesson actually has questions
update lms_lessons set has_quiz = (coalesce(jsonb_array_length(quiz->'questions'), 0) > 0);

-- a real-quiz lesson can only be completed by passing it (100%, server-checked)
create or replace function public.student_complete_lesson(p_token text, p_lesson_id uuid)
returns boolean language plpgsql security definer set search_path to 'public' as $$
DECLARE v_id UUID; v_title TEXT; v_has_quiz boolean;
BEGIN
  SELECT id INTO v_id FROM crm_students WHERE verification_token = UPPER(TRIM(p_token)) AND deleted_at IS NULL;
  IF v_id IS NULL THEN RETURN FALSE; END IF;
  SELECT title, coalesce(jsonb_array_length(quiz->'questions'),0) > 0 INTO v_title, v_has_quiz FROM lms_lessons WHERE id = p_lesson_id;
  IF v_title IS NULL THEN RETURN FALSE; END IF;
  IF NOT student_can_access_lesson(v_id, p_lesson_id) THEN RETURN FALSE; END IF;
  IF v_has_quiz AND NOT EXISTS (
       SELECT 1 FROM lms_quiz_results WHERE student_id = v_id AND lesson_id = p_lesson_id AND passed
  ) THEN RETURN FALSE; END IF;
  INSERT INTO lms_lesson_progress (student_id, lesson_id, status, completed_at)
  VALUES (v_id, p_lesson_id, 'completed', NOW())
  ON CONFLICT (student_id, lesson_id) DO UPDATE SET status = 'completed', completed_at = NOW();
  INSERT INTO student_activity (student_id, event_type, entity_type, entity_id, entity_title)
  VALUES (v_id, 'completed_lesson', 'lesson', p_lesson_id::TEXT, v_title);
  RETURN TRUE;
END; $$;

create or replace function public.student_can_access_lesson(p_student uuid, p_lesson uuid)
returns boolean language plpgsql security definer set search_path to 'public' as $$
declare
  v_module uuid; v_order int; v_course uuid; v_lorder int; v_minorder int;
  v_prev uuid; v_prev_total int; v_prev_done int; v_prev_reviewed boolean; v_started boolean; v_exam_ok boolean;
begin
  if exists (select 1 from lms_lesson_progress
             where student_id = p_student and lesson_id = p_lesson and status = 'completed') then
    return true;
  end if;
  select l.module_id, l.lesson_order, m.module_order, m.course_id
    into v_module, v_lorder, v_order, v_course
  from lms_lessons l join lms_modules m on m.id = l.module_id
  where l.id = p_lesson;
  if v_module is null then return true; end if;
  if exists (
    select 1 from lms_lessons l2
    where l2.module_id = v_module and l2.lesson_order < v_lorder
      and not exists (select 1 from lms_lesson_progress lp
                      where lp.student_id = p_student and lp.lesson_id = l2.id and lp.status = 'completed')
  ) then return false; end if;
  select min(lesson_order) into v_minorder from lms_lessons where module_id = v_module;
  if v_lorder > v_minorder then return true; end if;
  if v_order <= (select min(module_order) from lms_modules where course_id = v_course) then return true; end if;
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
  if module_has_exam(v_prev) then
    select exists(select 1 from lms_unit_exam_results where student_id = p_student and module_id = v_prev and passed) into v_exam_ok;
    if not v_exam_ok then return false; end if;
  end if;
  select exists (
    select 1 from lms_submissions
    where student_id = p_student and module_id = v_prev and status = 'reviewed'
  ) into v_prev_reviewed;
  return v_prev_reviewed;
end; $$;
