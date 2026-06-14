-- Per-unit conversation TASK (translate sentences + write a short conversation),
-- shown to the student in the submission panel. AI-seeded via scripts/gen-unit-tasks.mjs.
alter table lms_modules add column if not exists conversation_prompt text;

create or replace function public.student_unit_task(p_token text, p_module_id uuid)
returns text language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v text;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return null; end if;
  select conversation_prompt into v from lms_modules where id = p_module_id;
  return v;
end; $$;
grant execute on function public.student_unit_task(text, uuid) to anon, authenticated, service_role;
