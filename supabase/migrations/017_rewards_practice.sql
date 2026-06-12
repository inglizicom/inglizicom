-- ════════════════════════════════════════════════════════════════════════
-- Rewards + Practice (Gamification) System — MVP
-- Additive only. Safe to apply on top of the existing schema.
-- Student access = SECURITY DEFINER token RPCs. Staff access = is_crm_staff RLS.
-- Coins are SERVER-AUTHORITATIVE: amounts are decided in the DB, awards are
-- verified against real progress, and idempotent (no farming the same action).
-- ════════════════════════════════════════════════════════════════════════

-- ── helper: normalise a sentence for comparison (case/space/punctuation) ──
create or replace function public._norm(t text)
returns text language sql immutable as $$
  select regexp_replace(regexp_replace(lower(btrim(coalesce(t, ''))), '[.!?,;:]+$', ''), '\s+', ' ', 'g')
$$;

-- ── 1. coin_transactions ────────────────────────────────────────────────
create table if not exists coin_transactions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references crm_students(id) on delete cascade,
  action_type text not null,
  coins_amount int not null,
  related_course_id uuid references lms_courses(id) on delete set null,
  related_lesson_id uuid references lms_lessons(id) on delete set null,
  related_module_id uuid references lms_modules(id) on delete set null,
  source text not null default 'system',          -- system | challenge | streak | admin
  notes text,
  dedup_key text,                                 -- prevents double-award of the same action
  created_at timestamptz not null default now()
);
create index if not exists idx_coin_tx_student on coin_transactions(student_id, created_at desc);
create unique index if not exists uq_coin_tx_dedup on coin_transactions(student_id, dedup_key) where dedup_key is not null;
alter table coin_transactions enable row level security;
create policy coin_transactions_staff on coin_transactions for all using (is_crm_staff(auth.uid()));

-- ── 2. rewards (also the coin levels) ───────────────────────────────────
create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  level_name text not null,
  min_coins int not null,
  reward_title text,                              -- null = level with no claimable reward (Bronze)
  reward_desc text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table rewards enable row level security;
create policy rewards_staff on rewards for all using (is_crm_staff(auth.uid()));

insert into rewards (level_name, min_coins, reward_title, reward_desc, sort_order)
select * from (values
  ('Bronze',    0,     null,                 null,                                    1),
  ('Silver',    1000,  'PDF مجاني',          'كتاب أو ملف PDF تعليمي مجاني',           2),
  ('Gold',      3000,  'خصم 10%',            'خصم 10% على الدورة القادمة',             3),
  ('Platinum',  7000,  'حصة Communication',  'حصة محادثة (Communication) مجانية',      4),
  ('Master',    15000, 'خصم 20% + شهادة Premium', 'خصم 20% على الدورة القادمة وشهادة Premium', 5)
) v(level_name, min_coins, reward_title, reward_desc, sort_order)
where not exists (select 1 from rewards);

-- ── 3. reward_claims ────────────────────────────────────────────────────
create table if not exists reward_claims (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references crm_students(id) on delete cascade,
  reward_id uuid not null references rewards(id) on delete cascade,
  status text not null default 'pending',         -- pending | approved | rejected | used
  coins_at_claim int not null default 0,
  note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_reward_claims_student on reward_claims(student_id, created_at desc);
create index if not exists idx_reward_claims_status on reward_claims(status);
alter table reward_claims enable row level security;
create policy reward_claims_staff on reward_claims for all using (is_crm_staff(auth.uid()));

-- ── 4 & 5. challenges (sentence builder + translation) ──────────────────
create table if not exists sentence_challenges (
  id uuid primary key default gen_random_uuid(),
  level text not null default 'A0',               -- A0 | A1 | A2
  module_id uuid references lms_modules(id) on delete set null,
  arabic text not null,
  english text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists translation_challenges (
  id uuid primary key default gen_random_uuid(),
  level text not null default 'A0',
  module_id uuid references lms_modules(id) on delete set null,
  arabic text not null,
  english text not null,
  choices jsonb,                                  -- optional MCQ distractors
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table sentence_challenges enable row level security;
alter table translation_challenges enable row level security;
create policy sentence_challenges_staff on sentence_challenges for all using (is_crm_staff(auth.uid()));
create policy translation_challenges_staff on translation_challenges for all using (is_crm_staff(auth.uid()));

-- ── 6. attempts ─────────────────────────────────────────────────────────
create table if not exists student_challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references crm_students(id) on delete cascade,
  challenge_type text not null,                   -- sentence | translation
  challenge_id uuid not null,
  mode text,                                      -- arrange | translate
  is_correct boolean not null default false,
  answer text,
  created_at timestamptz not null default now()
);
create index if not exists idx_attempts_student on student_challenge_attempts(student_id, created_at desc);
alter table student_challenge_attempts enable row level security;
create policy student_challenge_attempts_staff on student_challenge_attempts for all using (is_crm_staff(auth.uid()));

-- ── 7. streaks ──────────────────────────────────────────────────────────
create table if not exists student_streaks (
  student_id uuid primary key references crm_students(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_date date,
  m7_awarded boolean not null default false,
  m30_awarded boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table student_streaks enable row level security;
create policy student_streaks_staff on student_streaks for all using (is_crm_staff(auth.uid()));

-- ── 8. weekly leaderboard (live view — naturally resets each week) ───────
-- security_invoker = the view obeys the querier's RLS: anon (no auth) sees nothing
-- by direct query; staff (authenticated) can read it; the student RPC below is
-- SECURITY DEFINER so it still works for the token-gated student path.
create or replace view leaderboard_weekly with (security_invoker = true) as
  select ct.student_id,
         sum(ct.coins_amount) as week_points,
         count(*) filter (where ct.action_type like 'challenge%') as challenges
  from coin_transactions ct
  where ct.created_at >= date_trunc('week', now())
  group by ct.student_id;
revoke all on leaderboard_weekly from anon;
grant select on leaderboard_weekly to authenticated, service_role;

-- ════════════════════════════════════════════════════════════════════════
-- COIN ENGINE
-- ════════════════════════════════════════════════════════════════════════

-- internal award helper (idempotent via dedup_key)
create or replace function public._award(p_student uuid, p_action text, p_amount int,
  p_course uuid, p_lesson uuid, p_module uuid, p_source text, p_notes text, p_dedup text)
returns int language plpgsql security definer set search_path to 'public' as $$
begin
  if p_dedup is not null and exists (select 1 from coin_transactions where student_id = p_student and dedup_key = p_dedup) then
    return 0;
  end if;
  insert into coin_transactions (student_id, action_type, coins_amount, related_course_id, related_lesson_id, related_module_id, source, notes, dedup_key)
    values (p_student, p_action, p_amount, p_course, p_lesson, p_module, p_source, p_notes, p_dedup);
  return p_amount;
end; $$;

-- Award coins for a REAL action, verified against existing progress tables.
create or replace function public.student_earn(p_token text, p_action text, p_lesson uuid default null, p_module uuid default null)
returns int language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v_amt int := 0; v_course uuid; v_mod uuid; v_done int; v_total int;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return 0; end if;

  if p_action = 'open_lesson' then
    if not exists (select 1 from lms_lesson_progress where student_id = v_id and lesson_id = p_lesson) then return 0; end if;
    v_amt := _award(v_id, 'open_lesson', 10, null, p_lesson, null, 'system', null, 'open_lesson:' || p_lesson);

  elsif p_action = 'complete_lesson' then
    if not exists (select 1 from lms_lesson_progress where student_id = v_id and lesson_id = p_lesson and status = 'completed') then return 0; end if;
    select module_id into v_mod from lms_lessons where id = p_lesson;
    v_amt := _award(v_id, 'complete_lesson', 25, null, p_lesson, v_mod, 'system', null, 'complete_lesson:' || p_lesson);
    -- full unit bonus when every lesson in the module is completed
    select count(*) , count(*) filter (where lp.status = 'completed')
      into v_total, v_done
    from lms_lessons l left join lms_lesson_progress lp on lp.lesson_id = l.id and lp.student_id = v_id
    where l.module_id = v_mod;
    if v_total > 0 and v_done >= v_total then
      perform _award(v_id, 'complete_unit', 100, null, null, v_mod, 'system', null, 'complete_unit:' || v_mod);
    end if;

  elsif p_action = 'complete_quiz' then
    if not exists (select 1 from lms_quiz_results where student_id = v_id and lesson_id = p_lesson and passed) then return 0; end if;
    v_amt := _award(v_id, 'complete_quiz', 50, null, p_lesson, null, 'system', null, 'complete_quiz:' || p_lesson);

  elsif p_action = 'complete_reading' then
    if not exists (select 1 from student_activity where student_id = v_id and event_type = 'completed_reading_quiz' and entity_id = p_module::text) then return 0; end if;
    v_amt := _award(v_id, 'complete_reading', 15, null, null, p_module, 'system', null, 'complete_reading:' || p_module);
  end if;

  return v_amt;
end; $$;

-- ════════════════════════════════════════════════════════════════════════
-- STUDENT-FACING RPCs
-- ════════════════════════════════════════════════════════════════════════

-- balance + level + next-level progress + recent transactions
create or replace function public.student_coins(p_token text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v_bal int; v_cur record; v_next record; v_recent jsonb;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return null; end if;
  select coalesce(sum(coins_amount), 0) into v_bal from coin_transactions where student_id = v_id;
  select * into v_cur  from rewards where is_active and min_coins <= v_bal order by min_coins desc limit 1;
  select * into v_next from rewards where is_active and min_coins >  v_bal order by min_coins asc  limit 1;
  select coalesce(jsonb_agg(jsonb_build_object('action', action_type, 'amount', coins_amount, 'source', source, 'notes', notes, 'at', created_at) order by created_at desc), '[]'::jsonb)
    into v_recent from (select * from coin_transactions where student_id = v_id order by created_at desc limit 20) r;
  return jsonb_build_object(
    'balance', v_bal,
    'level', coalesce(v_cur.level_name, 'Bronze'),
    'level_min', coalesce(v_cur.min_coins, 0),
    'next_level', v_next.level_name,
    'next_min', v_next.min_coins,
    'to_next', case when v_next.min_coins is null then 0 else v_next.min_coins - v_bal end,
    'progress', case when v_next.min_coins is null then 100
      else round((v_bal - coalesce(v_cur.min_coins,0))::numeric / nullif(v_next.min_coins - coalesce(v_cur.min_coins,0),0) * 100) end,
    'recent', v_recent);
end; $$;

-- rewards list with progress / claim status
create or replace function public.student_rewards_status(p_token text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v_bal int; v jsonb;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return '[]'::jsonb; end if;
  select coalesce(sum(coins_amount), 0) into v_bal from coin_transactions where student_id = v_id;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', r.id, 'level', r.level_name, 'min_coins', r.min_coins, 'title', r.reward_title, 'desc', r.reward_desc,
    'unlocked', v_bal >= r.min_coins,
    'progress', least(100, round(v_bal::numeric / nullif(r.min_coins,0) * 100)),
    'claim_status', (select rc.status from reward_claims rc where rc.student_id = v_id and rc.reward_id = r.id order by rc.created_at desc limit 1)
  ) order by r.sort_order), '[]'::jsonb) into v
  from rewards r where r.is_active and r.reward_title is not null;
  return v;
end; $$;

-- claim a reward → pending (admin approval required)
create or replace function public.student_claim_reward(p_token text, p_reward_id uuid)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v_bal int; v_min int; v_title text;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return jsonb_build_object('ok', false, 'reason', 'invalid'); end if;
  select min_coins, reward_title into v_min, v_title from rewards where id = p_reward_id and is_active;
  if v_title is null then return jsonb_build_object('ok', false, 'reason', 'no_reward'); end if;
  select coalesce(sum(coins_amount), 0) into v_bal from coin_transactions where student_id = v_id;
  if v_bal < v_min then return jsonb_build_object('ok', false, 'reason', 'locked'); end if;
  if exists (select 1 from reward_claims where student_id = v_id and reward_id = p_reward_id and status in ('pending','approved','used')) then
    return jsonb_build_object('ok', false, 'reason', 'already');
  end if;
  insert into reward_claims (student_id, reward_id, status, coins_at_claim) values (v_id, p_reward_id, 'pending', v_bal);
  insert into student_activity (student_id, event_type, entity_type, entity_id, entity_title)
    values (v_id, 'reward_claim', 'reward', p_reward_id::text, v_title);
  return jsonb_build_object('ok', true);
end; $$;

-- a batch of practice challenges (answers stay server-side)
create or replace function public.student_challenges(p_token text, p_type text, p_mode text, p_scope text, p_module uuid default null, p_limit int default 8)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v_level text; v jsonb;
begin
  select id, coalesce(nullif(current_level,''),'A0') into v_id, v_level from crm_students
    where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return '[]'::jsonb; end if;

  if p_type = 'translation' then
    select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'mode', 'translate', 'arabic', x.arabic, 'choices', x.choices)), '[]'::jsonb) into v
    from (
      select * from translation_challenges c where c.is_active
        and (p_scope <> 'lesson' or c.module_id = p_module)
      order by random() limit greatest(1, least(p_limit, 20))
    ) x;
  else
    -- sentence builder: arrange → shuffled english words; translate → arabic prompt
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', x.id, 'mode', p_mode, 'arabic', x.arabic,
      'words', case when p_mode = 'arrange' then (
        select jsonb_agg(w order by random()) from regexp_split_to_table(x.english, '\s+') w
      ) else null end
    )), '[]'::jsonb) into v
    from (
      select * from sentence_challenges c where c.is_active
        and (p_scope <> 'lesson' or c.module_id = p_module)
      order by random() limit greatest(1, least(p_limit, 20))
    ) x;
  end if;
  return v;
end; $$;

-- submit one challenge → validate, record attempt, award once
create or replace function public.student_submit_challenge(p_token text, p_type text, p_id uuid, p_mode text, p_answer text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v_eng text; v_ok boolean; v_award int := 0;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return jsonb_build_object('ok', false); end if;
  if p_type = 'translation' then select english into v_eng from translation_challenges where id = p_id;
  else select english into v_eng from sentence_challenges where id = p_id; end if;
  if v_eng is null then return jsonb_build_object('ok', false); end if;

  v_ok := _norm(p_answer) = _norm(v_eng);
  insert into student_challenge_attempts (student_id, challenge_type, challenge_id, mode, is_correct, answer)
    values (v_id, p_type, p_id, p_mode, v_ok, p_answer);
  if v_ok then
    v_award := _award(v_id, 'challenge_' || p_type, 30, null, null, null, 'challenge', p_mode, 'challenge:' || p_type || ':' || p_id);
    insert into student_activity (student_id, event_type, entity_type, entity_id, entity_title)
      values (v_id, 'completed_challenge', p_type, p_id::text, p_mode);
  end if;
  return jsonb_build_object('ok', true, 'correct', v_ok, 'answer', v_eng, 'coins', v_award);
end; $$;

-- daily streak check + milestone bonuses (call on portal load)
create or replace function public.student_streak_bonus(p_token text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; s record; v_streak int; v_award int := 0; v_last date;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return null; end if;
  select * into s from student_streaks where student_id = v_id;
  if s is null then
    insert into student_streaks (student_id, current_streak, longest_streak, last_active_date) values (v_id, 1, 1, current_date);
    return jsonb_build_object('streak', 1, 'awarded', 0);
  end if;
  v_last := s.last_active_date;
  if v_last = current_date then
    v_streak := s.current_streak;
  elsif v_last = current_date - 1 then
    v_streak := s.current_streak + 1;
  else
    v_streak := 1;
  end if;
  update student_streaks set current_streak = v_streak, longest_streak = greatest(longest_streak, v_streak),
    last_active_date = current_date,
    m7_awarded  = case when v_streak < 7  then false else m7_awarded  end,
    m30_awarded = case when v_streak < 30 then false else m30_awarded end,
    updated_at = now()
  where student_id = v_id;
  -- milestone awards (once per streak run)
  if v_streak >= 7 and not s.m7_awarded then
    v_award := v_award + _award(v_id, 'streak_7', 150, null, null, null, 'streak', '7-day streak', 'streak7:' || to_char(current_date,'IYYY-IW'));
    update student_streaks set m7_awarded = true where student_id = v_id;
  end if;
  if v_streak >= 30 and not s.m30_awarded then
    v_award := v_award + _award(v_id, 'streak_30', 700, null, null, null, 'streak', '30-day streak', 'streak30:' || to_char(current_date,'IYYY-MM'));
    update student_streaks set m30_awarded = true where student_id = v_id;
  end if;
  return jsonb_build_object('streak', v_streak, 'awarded', v_award);
end; $$;

-- weekly leaderboard + caller's own rank (first names only)
create or replace function public.student_leaderboard_weekly(p_token text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v_top jsonb; v_me jsonb;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  with ranked as (
    select lw.student_id, lw.week_points, lw.challenges,
      split_part(s.full_name, ' ', 1) as name,
      coalesce(st.current_streak, 0) as streak,
      rank() over (order by lw.week_points desc) as rnk
    from leaderboard_weekly lw
    join crm_students s on s.id = lw.student_id and s.deleted_at is null
    left join student_streaks st on st.student_id = lw.student_id
  )
  select
    (select coalesce(jsonb_agg(jsonb_build_object('rank', rnk, 'name', name, 'points', week_points, 'challenges', challenges, 'streak', streak, 'me', student_id = v_id) order by rnk), '[]'::jsonb) from ranked where rnk <= 20),
    (select jsonb_build_object('rank', rnk, 'points', week_points) from ranked where student_id = v_id)
  into v_top, v_me;
  return jsonb_build_object('top', v_top, 'me', v_me);
end; $$;

grant execute on function public.student_earn(text, text, uuid, uuid) to anon, authenticated;
grant execute on function public.student_coins(text) to anon, authenticated;
grant execute on function public.student_rewards_status(text) to anon, authenticated;
grant execute on function public.student_claim_reward(text, uuid) to anon, authenticated;
grant execute on function public.student_challenges(text, text, text, text, uuid, int) to anon, authenticated;
grant execute on function public.student_submit_challenge(text, text, uuid, text, text) to anon, authenticated;
grant execute on function public.student_streak_bonus(text) to anon, authenticated;
grant execute on function public.student_leaderboard_weekly(text) to anon, authenticated;

-- ── seed starter challenges (A0/A1/A2) ──────────────────────────────────
insert into sentence_challenges (level, arabic, english) select * from (values
  ('A0','أنا من المغرب.','I am from Morocco'),
  ('A0','ما اسمك؟','What is your name'),
  ('A0','عمري عشرون سنة.','I am twenty years old'),
  ('A0','هي معلمة.','She is a teacher'),
  ('A0','سعدت بلقائك.','Nice to meet you'),
  ('A0','أنا طالب.','I am a student'),
  ('A1','أستيقظ في السابعة.','I wake up at seven'),
  ('A1','أخي طبيب.','My brother is a doctor'),
  ('A1','الكتاب فوق الطاولة.','The book is on the table'),
  ('A1','أحب القهوة.','I like coffee'),
  ('A1','أين تسكن؟','Where do you live'),
  ('A1','أذهب إلى العمل كل يوم.','I go to work every day'),
  ('A2','ذهبت إلى السوق أمس.','I went to the market yesterday'),
  ('A2','سأسافر الأسبوع القادم.','I will travel next week'),
  ('A2','أشعر بسعادة كبيرة اليوم.','I feel very happy today')
) v(level, arabic, english) where not exists (select 1 from sentence_challenges);

insert into translation_challenges (level, arabic, english) select * from (values
  ('A0','أنا أعيش في المغرب.','I live in Morocco'),
  ('A0','أختي طبيبة.','My sister is a doctor'),
  ('A0','اسمي أحمد.','My name is Ahmed'),
  ('A0','أنا من إسبانيا.','I am from Spain'),
  ('A1','الكتاب فوق الطاولة.','The book is on the table'),
  ('A1','أين تسكن؟','Where do you live'),
  ('A1','أحب القهوة والشاي.','I like coffee and tea'),
  ('A1','أستيقظ مبكرا.','I wake up early'),
  ('A2','ذهبت إلى المدرسة أمس.','I went to school yesterday'),
  ('A2','سأزور عائلتي غدا.','I will visit my family tomorrow')
) v(level, arabic, english) where not exists (select 1 from translation_challenges);
