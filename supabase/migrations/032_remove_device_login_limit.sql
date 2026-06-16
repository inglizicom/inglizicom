-- 032_remove_device_login_limit.sql
-- Cancel the device-login limit (too many lock-out complaints). Students may now
-- log in from any number of devices. We STILL record each device (watermark / CRM
-- tracking) and STILL log out students an admin deactivates or removes — only the
-- per-device cap and the device-mismatch session-kick are gone.

create or replace function public.student_login(p_token text, p_device_id text, p_label text, p_ua text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v_exists boolean;
begin
  select id into v_id
  from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return jsonb_build_object('ok', false, 'reason', 'invalid'); end if;
  if p_device_id is null or length(p_device_id) < 8 then return jsonb_build_object('ok', false, 'reason', 'invalid_device'); end if;

  select true into v_exists from student_devices where student_id = v_id and device_id = p_device_id;
  if v_exists then
    update student_devices set last_seen = now(), label = coalesce(p_label, label), user_agent = coalesce(p_ua, user_agent)
      where student_id = v_id and device_id = p_device_id;
  else
    -- device limit removed: any device may log in; still recorded for tracking/watermark
    insert into student_devices (student_id, device_id, label, user_agent) values (v_id, p_device_id, p_label, p_ua);
  end if;
  return jsonb_build_object('ok', true);
end; $$;

create or replace function public.student_device_valid(p_token text, p_device_id text)
returns boolean language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return false; end if;   -- still log out deactivated / removed students
  -- device limit cancelled: keep the session open on any device; just refresh last_seen if known
  update student_devices set last_seen = now() where student_id = v_id and device_id = p_device_id;
  return true;
end; $$;

grant execute on function public.student_login(text, text, text, text) to anon, authenticated;
grant execute on function public.student_device_valid(text, text) to anon, authenticated;
