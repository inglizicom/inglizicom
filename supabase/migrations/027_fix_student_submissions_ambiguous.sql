-- Fix: student_submissions threw "column reference id is ambiguous" (OUT-param
-- `id` collided with crm_students.id) → client got NO submissions → units never
-- showed as corrected/unlocked. Qualify the column.
create or replace function public.student_submissions(p_token text)
returns table(id uuid, module_id uuid, module_title text, conversation_text text, status text, feedback text, score integer, reviewed_at timestamptz, created_at timestamptz)
language plpgsql security definer set search_path to 'public' as $function$
declare v_id uuid;
begin
  select c.id into v_id from crm_students c where c.verification_token = upper(trim(p_token)) and c.deleted_at is null;
  if v_id is null then return; end if;
  return query
    select sub.id, sub.module_id, m.title, sub.conversation_text, sub.status, sub.feedback, sub.score, sub.reviewed_at, sub.created_at
    from lms_submissions sub join lms_modules m on m.id = sub.module_id
    where sub.student_id = v_id
    order by sub.created_at desc;
end; $function$;
