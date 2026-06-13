-- owner_students(): include crm_students.id in each list so the Command Center
-- can deep-link a row to /sales/students/[id]. (Replaces the 018 version.)
create or replace function public.owner_students()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v jsonb;
begin
  if not is_founder(auth.uid()) then return null; end if;
  with last_act as (
    select s.id, s.full_name, s.verification_token, s.is_active, s.enrollment_type,
      (select max(a.created_at) from student_activity a where a.student_id = s.id) as last_at,
      coalesce((select sum(coins_amount) from coin_transactions ct where ct.student_id = s.id), 0) as coins,
      coalesce((select current_streak from student_streaks st where st.student_id = s.id), 0) as streak
    from crm_students s where s.deleted_at is null
  ),
  scored as (
    select *, case when last_at is null then 999 else extract(day from now() - last_at)::int end as days_inactive from last_act
  )
  select jsonb_build_object(
    'inactive_3', (select count(*) from scored where days_inactive >= 3 and days_inactive < 7),
    'inactive_7', (select count(*) from scored where days_inactive >= 7 and days_inactive < 14),
    'inactive_14', (select count(*) from scored where days_inactive >= 14 and days_inactive < 30),
    'inactive_30', (select count(*) from scored where days_inactive >= 30),
    'at_risk_list', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', full_name, 'token', verification_token, 'days', days_inactive,
        'risk', case when days_inactive >= 14 then 'high' when days_inactive >= 7 then 'medium' else 'low' end) order by days_inactive desc), '[]'::jsonb)
       from (select * from scored where is_active and days_inactive >= 7 order by days_inactive desc limit 30) r),
    'top_coins', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', full_name, 'coins', coins) order by coins desc), '[]'::jsonb)
       from (select * from scored where coins > 0 order by coins desc limit 10) r),
    'top_streak', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', full_name, 'streak', streak) order by streak desc), '[]'::jsonb)
       from (select * from scored where streak > 0 order by streak desc limit 10) r),
    'most_active', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', full_name, 'days', days_inactive) order by days_inactive asc), '[]'::jsonb)
       from (select * from scored where last_at is not null order by days_inactive asc limit 10) r)
  ) into v;
  return v;
end; $$;
