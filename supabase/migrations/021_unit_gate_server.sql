-- ════════════════════════════════════════════════════════════════════════
-- Server-side unit gate (paid-course integrity): a student cannot open or
-- complete a lesson in a unit until the PREVIOUS unit is fully completed AND
-- its exercise submission has been reviewed (scored) by the correction team.
-- Grandfathered ("new progress only"): re-opening an already-completed lesson
-- is always allowed, and a unit the student already started is not retro-locked.
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.student_can_access_lesson(p_student uuid, p_lesson uuid)
returns boolean language plpgsql security definer set search_path to 'public' as $$
declare
  v_module uuid; v_order int; v_course uuid;
  v_prev uuid; v_prev_total int; v_prev_done int; v_prev_reviewed boolean; v_started boolean;
begin
  -- already completed this lesson → always allow (idempotent / re-open)
  if exists (select 1 from lms_lesson_progress
             where student_id = p_student and lesson_id = p_lesson and status = 'completed') then
    return true;
  end if;

  select l.module_id, m.module_order, m.course_id
    into v_module, v_order, v_course
  from lms_lessons l join lms_modules m on m.id = l.module_id
  where l.id = p_lesson;
  if v_module is null then return true; end if;  -- unknown lesson: don't block

  -- first unit of the course → open
  if v_order <= (select min(module_order) from lms_modules where course_id = v_course) then
    return true;
  end if;

  -- grandfather: student already started this unit (has a completed lesson in it)
  select exists (
    select 1 from lms_lesson_progress lp join lms_lessons l on l.id = lp.lesson_id
    where lp.student_id = p_student and l.module_id = v_module and lp.status = 'completed'
  ) into v_started;
  if v_started then return true; end if;

  -- immediate previous unit
  select id into v_prev from lms_modules
   where course_id = v_course and module_order < v_order
   order by module_order desc limit 1;
  if v_prev is null then return true; end if;

  -- previous unit must be fully completed
  select count(*) into v_prev_total from lms_lessons where module_id = v_prev;
  select count(*) into v_prev_done
    from lms_lesson_progress lp join lms_lessons l on l.id = lp.lesson_id
   where lp.student_id = p_student and l.module_id = v_prev and lp.status = 'completed';
  if v_prev_total = 0 or v_prev_done < v_prev_total then return false; end if;

  -- previous unit's exercise must be reviewed by the team
  select exists (
    select 1 from lms_submissions
    where student_id = p_student and module_id = v_prev and status = 'reviewed'
  ) into v_prev_reviewed;
  return v_prev_reviewed;
end; $$;

create or replace function public.student_open_lesson(p_token text, p_lesson_id uuid)
returns boolean language plpgsql security definer set search_path to 'public' as $$
DECLARE v_id UUID; v_title TEXT;
BEGIN
  SELECT id INTO v_id FROM crm_students WHERE verification_token = UPPER(TRIM(p_token)) AND deleted_at IS NULL;
  IF v_id IS NULL THEN RETURN FALSE; END IF;
  SELECT title INTO v_title FROM lms_lessons WHERE id = p_lesson_id;
  IF v_title IS NULL THEN RETURN FALSE; END IF;
  IF NOT student_can_access_lesson(v_id, p_lesson_id) THEN RETURN FALSE; END IF;
  INSERT INTO lms_lesson_progress (student_id, lesson_id, status)
  VALUES (v_id, p_lesson_id, 'opened')
  ON CONFLICT (student_id, lesson_id) DO NOTHING;
  INSERT INTO student_activity (student_id, event_type, entity_type, entity_id, entity_title)
  VALUES (v_id, 'opened_lesson', 'lesson', p_lesson_id::TEXT, v_title);
  RETURN TRUE;
END; $$;

create or replace function public.student_complete_lesson(p_token text, p_lesson_id uuid)
returns boolean language plpgsql security definer set search_path to 'public' as $$
DECLARE v_id UUID; v_title TEXT;
BEGIN
  SELECT id INTO v_id FROM crm_students WHERE verification_token = UPPER(TRIM(p_token)) AND deleted_at IS NULL;
  IF v_id IS NULL THEN RETURN FALSE; END IF;
  SELECT title INTO v_title FROM lms_lessons WHERE id = p_lesson_id;
  IF v_title IS NULL THEN RETURN FALSE; END IF;
  IF NOT student_can_access_lesson(v_id, p_lesson_id) THEN RETURN FALSE; END IF;
  INSERT INTO lms_lesson_progress (student_id, lesson_id, status, completed_at)
  VALUES (v_id, p_lesson_id, 'completed', NOW())
  ON CONFLICT (student_id, lesson_id) DO UPDATE SET status = 'completed', completed_at = NOW();
  INSERT INTO student_activity (student_id, event_type, entity_type, entity_id, entity_title)
  VALUES (v_id, 'completed_lesson', 'lesson', p_lesson_id::TEXT, v_title);
  RETURN TRUE;
END; $$;
