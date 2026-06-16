-- 031_course_catalog.sql
-- Public catalog of published courses, used by the student course-picker (to show
-- ALL courses — enrolled ones open, the rest locked so students discover them) and
-- by the marketing pricing page. SECURITY DEFINER so it bypasses the staff-only RLS
-- on lms_courses; it returns only non-sensitive, published catalog info.
create or replace function public.course_catalog()
returns jsonb language sql security definer set search_path to 'public' stable as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'title', c.title, 'level', c.level, 'description', c.description,
    'units', (select count(*) from lms_modules m where m.course_id = c.id)
  ) order by c.level nulls last, c.created_at), '[]'::jsonb)
  from lms_courses c
  where coalesce(c.is_published, false) = true;
$$;
grant execute on function public.course_catalog() to anon, authenticated;
