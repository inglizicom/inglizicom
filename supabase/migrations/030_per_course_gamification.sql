-- 030_per_course_gamification.sql
-- Coins, rewards and the weekly leaderboard were global per student, so a student
-- enrolled in several courses (A0-A1, A1-A2, …) saw ONE shared balance and ONE
-- shared leaderboard. Make them per-course: every coin transaction is attributed
-- to a course, and balance/leaderboard/rewards are scoped to the selected course.
-- coin_transactions.related_course_id already exists (and _award already accepts
-- a course) — it just wasn't being filled or filtered.

-- ── 1. Backfill course on existing coins ──────────────────────────────────────
-- Derive the real course from the linked lesson/module where possible…
update coin_transactions ct set related_course_id = m.course_id
  from lms_modules m where ct.related_course_id is null and ct.related_module_id = m.id;
update coin_transactions ct set related_course_id = m.course_id
  from lms_lessons l join lms_modules m on m.id = l.module_id
  where ct.related_course_id is null and ct.related_lesson_id = l.id;
-- …everything else (challenges, vocab, streak, admin) → the foundational A0-A1 course.
update coin_transactions set related_course_id = '60cc80e4-ac2e-4927-ad0e-fa495c1cba3b'
  where related_course_id is null;

-- ── 2. Weekly leaderboard view becomes per-course (Morocco week) ──────────────
create or replace view leaderboard_weekly as
  select student_id,
         sum(coins_amount) as week_points,
         count(*) filter (where action_type like 'challenge%') as challenges,
         related_course_id as course_id
  from coin_transactions
  where created_at >= date_trunc('week', now() at time zone 'Africa/Casablanca') at time zone 'Africa/Casablanca'
  group by student_id, related_course_id;

-- ── 3. Earn: attribute every award to the lesson/module's course ──────────────
drop function if exists student_earn(text, text, uuid, uuid);
create or replace function public.student_earn(p_token text, p_action text, p_lesson uuid default null, p_module uuid default null, p_course uuid default null)
 returns integer language plpgsql security definer set search_path to 'public'
as $function$
declare v_id uuid; v_amt int := 0; v_mod uuid; v_done int; v_total int; v_course uuid;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return 0; end if;
  -- course is authoritative from the content; fall back to the caller's selected course
  v_course := p_course;
  if p_lesson is not null then select m.course_id into v_course from lms_lessons l join lms_modules m on m.id = l.module_id where l.id = p_lesson; end if;
  if v_course is null and p_module is not null then select course_id into v_course from lms_modules where id = p_module; end if;
  if p_action = 'open_lesson' then
    if not exists (select 1 from lms_lesson_progress where student_id = v_id and lesson_id = p_lesson) then return 0; end if;
    v_amt := _award(v_id, 'open_lesson', 10, v_course, p_lesson, null, 'system', null, 'open_lesson:' || p_lesson);
  elsif p_action = 'complete_lesson' then
    if not exists (select 1 from lms_lesson_progress where student_id = v_id and lesson_id = p_lesson and status = 'completed') then return 0; end if;
    select module_id into v_mod from lms_lessons where id = p_lesson;
    v_amt := _award(v_id, 'complete_lesson', 25, v_course, p_lesson, v_mod, 'system', null, 'complete_lesson:' || p_lesson);
    select count(*), count(*) filter (where lp.status = 'completed') into v_total, v_done
      from lms_lessons l left join lms_lesson_progress lp on lp.lesson_id = l.id and lp.student_id = v_id where l.module_id = v_mod;
    if v_total > 0 and v_done >= v_total then perform _award(v_id, 'complete_unit', 100, v_course, null, v_mod, 'system', null, 'complete_unit:' || v_mod); end if;
  elsif p_action = 'complete_quiz' then
    if not exists (select 1 from lms_quiz_results where student_id = v_id and lesson_id = p_lesson and passed) then return 0; end if;
    v_amt := _award(v_id, 'complete_quiz', 50, v_course, p_lesson, null, 'system', null, 'complete_quiz:' || p_lesson);
  elsif p_action = 'complete_reading' then
    if not exists (select 1 from student_activity where student_id = v_id and event_type = 'completed_reading_quiz' and entity_id = p_module::text) then return 0; end if;
    v_amt := _award(v_id, 'complete_reading', 15, v_course, null, p_module, 'system', null, 'complete_reading:' || p_module);
  end if;
  return v_amt;
end; $function$;

-- ── 4. Balance / rewards / claim scoped to the selected course ────────────────
drop function if exists student_coins(text);
create or replace function public.student_coins(p_token text, p_course uuid default null)
 returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_id uuid; v_bal int; v_cur record; v_next record; v_recent jsonb;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return null; end if;
  select coalesce(sum(coins_amount), 0) into v_bal from coin_transactions where student_id = v_id and (p_course is null or related_course_id = p_course);
  select * into v_cur from rewards where is_active and min_coins <= v_bal order by min_coins desc limit 1;
  select * into v_next from rewards where is_active and min_coins > v_bal order by min_coins asc limit 1;
  select coalesce(jsonb_agg(jsonb_build_object('action', action_type, 'amount', coins_amount, 'source', source, 'notes', notes, 'at', created_at) order by created_at desc), '[]'::jsonb)
    into v_recent from (select * from coin_transactions where student_id = v_id and (p_course is null or related_course_id = p_course) order by created_at desc limit 20) r;
  return jsonb_build_object('balance', v_bal, 'level', coalesce(v_cur.level_name, 'Bronze'), 'level_min', coalesce(v_cur.min_coins, 0),
    'next_level', v_next.level_name, 'next_min', v_next.min_coins,
    'to_next', case when v_next.min_coins is null then 0 else v_next.min_coins - v_bal end,
    'progress', case when v_next.min_coins is null then 100 else round((v_bal - coalesce(v_cur.min_coins,0))::numeric / nullif(v_next.min_coins - coalesce(v_cur.min_coins,0),0) * 100) end,
    'recent', v_recent);
end; $function$;

drop function if exists student_rewards_status(text);
create or replace function public.student_rewards_status(p_token text, p_course uuid default null)
 returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_id uuid; v_bal int; v jsonb;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return '[]'::jsonb; end if;
  select coalesce(sum(coins_amount), 0) into v_bal from coin_transactions where student_id = v_id and (p_course is null or related_course_id = p_course);
  select coalesce(jsonb_agg(jsonb_build_object('id', r.id, 'level', r.level_name, 'min_coins', r.min_coins, 'title', r.reward_title, 'desc', r.reward_desc,
    'unlocked', v_bal >= r.min_coins, 'progress', least(100, round(v_bal::numeric / nullif(r.min_coins,0) * 100)),
    'claim_status', (select rc.status from reward_claims rc where rc.student_id = v_id and rc.reward_id = r.id order by rc.created_at desc limit 1)) order by r.sort_order), '[]'::jsonb) into v
  from rewards r where r.is_active and r.reward_title is not null;
  return v;
end; $function$;

drop function if exists student_claim_reward(text, uuid);
create or replace function public.student_claim_reward(p_token text, p_reward_id uuid, p_course uuid default null)
 returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_id uuid; v_bal int; v_min int; v_title text;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return jsonb_build_object('ok', false, 'reason', 'invalid'); end if;
  select min_coins, reward_title into v_min, v_title from rewards where id = p_reward_id and is_active;
  if v_title is null then return jsonb_build_object('ok', false, 'reason', 'no_reward'); end if;
  select coalesce(sum(coins_amount), 0) into v_bal from coin_transactions where student_id = v_id and (p_course is null or related_course_id = p_course);
  if v_bal < v_min then return jsonb_build_object('ok', false, 'reason', 'locked'); end if;
  if exists (select 1 from reward_claims where student_id = v_id and reward_id = p_reward_id and status in ('pending','approved','used')) then return jsonb_build_object('ok', false, 'reason', 'already'); end if;
  insert into reward_claims (student_id, reward_id, status, coins_at_claim) values (v_id, p_reward_id, 'pending', v_bal);
  insert into student_activity (student_id, event_type, entity_type, entity_id, entity_title) values (v_id, 'reward_claim', 'reward', p_reward_id::text, v_title);
  return jsonb_build_object('ok', true);
end; $function$;

-- ── 5. Leaderboard scoped to the selected course ─────────────────────────────
drop function if exists student_leaderboard_weekly(text);
create or replace function public.student_leaderboard_weekly(p_token text, p_course uuid default null)
 returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_id uuid; v_top jsonb; v_me jsonb;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  with base as (
    select student_id, week_points, challenges from leaderboard_weekly where (p_course is null or course_id = p_course)),
  agg as (select student_id, sum(week_points) as week_points, sum(challenges) as challenges from base group by student_id),
  ranked as (
    select a.student_id, a.week_points, a.challenges, split_part(s.full_name, ' ', 1) as name,
      coalesce(st.current_streak, 0) as streak, rank() over (order by a.week_points desc) as rnk
    from agg a join crm_students s on s.id = a.student_id and s.deleted_at is null
    left join student_streaks st on st.student_id = a.student_id)
  select (select coalesce(jsonb_agg(jsonb_build_object('rank', rnk, 'name', name, 'points', week_points, 'challenges', challenges, 'streak', streak, 'me', student_id = v_id) order by rnk), '[]'::jsonb) from ranked where rnk <= 20),
         (select jsonb_build_object('rank', rnk, 'points', week_points) from ranked where student_id = v_id)
  into v_top, v_me;
  return jsonb_build_object('top', v_top, 'me', v_me);
end; $function$;

-- ── 6. Game earns (challenge / vocab / streak) attributed to the chosen course ─
drop function if exists student_submit_challenge(text, text, uuid, text, text);
create or replace function public.student_submit_challenge(p_token text, p_type text, p_id uuid, p_mode text, p_answer text, p_course uuid default null)
 returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_id uuid; v_eng text; v_ok boolean; v_award int := 0;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return jsonb_build_object('ok', false); end if;
  if p_type = 'translation' then select english into v_eng from translation_challenges where id = p_id;
  else select english into v_eng from sentence_challenges where id = p_id; end if;
  if v_eng is null then return jsonb_build_object('ok', false); end if;
  v_ok := _norm(p_answer) = _norm(v_eng);
  insert into student_challenge_attempts (student_id, challenge_type, challenge_id, mode, is_correct, answer) values (v_id, p_type, p_id, p_mode, v_ok, p_answer);
  if v_ok then
    v_award := _award(v_id, 'challenge_' || p_type, 30, p_course, null, null, 'challenge', p_mode, 'challenge:' || p_type || ':' || p_id);
    insert into student_activity (student_id, event_type, entity_type, entity_id, entity_title) values (v_id, 'completed_challenge', p_type, p_id::text, p_mode);
  end if;
  return jsonb_build_object('ok', true, 'correct', v_ok, 'answer', v_eng, 'coins', v_award);
end; $function$;

drop function if exists student_vocab_reward(text, uuid[]);
create or replace function public.student_vocab_reward(p_token text, p_word_ids uuid[], p_course uuid default null)
 returns integer language plpgsql security definer set search_path to 'public'
as $function$
declare v_id uuid; w uuid; total int := 0;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return 0; end if;
  foreach w in array coalesce(p_word_ids, '{}'::uuid[]) loop
    total := total + _award(v_id, 'vocab', 5, p_course, null, null, 'game', null, 'vocab:' || w::text || ':' || current_date::text);
  end loop;
  if total > 0 then
    insert into student_activity (student_id, event_type, entity_type, entity_id, entity_title)
    values (v_id, 'vocab_game', 'game', 'vocab', 'ألعاب المفردات');
  end if;
  return total;
end; $function$;

drop function if exists student_streak_bonus(text);
create or replace function public.student_streak_bonus(p_token text, p_course uuid default null)
 returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_id uuid; s record; v_streak int; v_award int := 0; v_last date;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return null; end if;
  select * into s from student_streaks where student_id = v_id;
  if s is null then insert into student_streaks (student_id, current_streak, longest_streak, last_active_date) values (v_id, 1, 1, current_date); return jsonb_build_object('streak', 1, 'awarded', 0); end if;
  v_last := s.last_active_date;
  if v_last = current_date then v_streak := s.current_streak;
  elsif v_last = current_date - 1 then v_streak := s.current_streak + 1;
  else v_streak := 1; end if;
  update student_streaks set current_streak = v_streak, longest_streak = greatest(longest_streak, v_streak), last_active_date = current_date,
    m7_awarded = case when v_streak < 7 then false else m7_awarded end, m30_awarded = case when v_streak < 30 then false else m30_awarded end, updated_at = now()
  where student_id = v_id;
  if v_streak >= 7 and not s.m7_awarded then v_award := v_award + _award(v_id, 'streak_7', 150, p_course, null, null, 'streak', '7-day streak', 'streak7:' || to_char(current_date,'IYYY-IW')); update student_streaks set m7_awarded = true where student_id = v_id; end if;
  if v_streak >= 30 and not s.m30_awarded then v_award := v_award + _award(v_id, 'streak_30', 700, p_course, null, null, 'streak', '30-day streak', 'streak30:' || to_char(current_date,'IYYY-MM')); update student_streaks set m30_awarded = true where student_id = v_id; end if;
  return jsonb_build_object('streak', v_streak, 'awarded', v_award);
end; $function$;
