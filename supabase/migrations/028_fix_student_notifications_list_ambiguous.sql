-- Fix: student_notifications_list had the same "id ambiguous" bug → client got
-- NO notifications → no bell badge and no correction popup. Qualify the column.
create or replace function public.student_notifications_list(p_token text)
returns table(id uuid, type text, title text, body text, tab text, is_read boolean, created_at timestamptz)
language plpgsql security definer set search_path to 'public' as $function$
declare v_id uuid;
begin
  select c.id into v_id from crm_students c where c.verification_token = upper(trim(p_token)) and c.deleted_at is null;
  if v_id is null then return; end if;
  return query select n.id, n.type, n.title, n.body, n.tab, n.is_read, n.created_at
    from student_notifications n where n.student_id = v_id
    order by n.created_at desc limit 50;
end; $function$;
