-- 046_teacher_profile_rich.sql
-- The teacher profile becomes a real tutor page rather than a name and a bio.
--
-- Two kinds of field, and the split matters:
--   • DECLARED — what a teacher says about themselves: qualifications, the ages
--     and categories they do and don't take, their own level of English. These
--     are editable and can never be derived; "I don't teach children" is a
--     statement, not a statistic.
--   • COMPUTED — what the data already knows: students held, gender and age
--     spread, exam results, ratings, the week's schedule. These update on their
--     own as students are assigned, and no one can type them in.
--
-- crm_students gains gender and birth_year so the demographic charts have a
-- real source. Both are optional; the charts show what is known and say how
-- much is missing rather than pretending.
--
-- Requires 044_teachers.sql.

-- ─── 1. Declared profile fields ──────────────────────────────

alter table public.teacher_profiles
  add column if not exists cover_url        text,
  add column if not exists tagline          text,          -- "what he masters the most"
  add column if not exists english_level    text,          -- C2 / Native / IELTS 8.0…
  add column if not exists competences      text[] not null default '{}',
  add column if not exists liked_qualities  text[] not null default '{}',
  -- [{ title, issuer, year, url }]
  add column if not exists certificates     jsonb  not null default '[]'::jsonb,
  -- [{ role, org, from, to, description }]
  add column if not exists experiences      jsonb  not null default '[]'::jsonb,
  add column if not exists teaches          text[] not null default '{}',
  add column if not exists not_teaches      text[] not null default '{}',
  add column if not exists age_min          integer,
  add column if not exists age_max          integer,
  add column if not exists years_experience integer;

-- ─── 2. Student demographics (optional, staff-entered) ───────

alter table public.crm_students
  add column if not exists gender     text,      -- male | female | null
  add column if not exists birth_year integer;

alter table public.crm_students
  drop constraint if exists crm_students_gender_check;
alter table public.crm_students
  add constraint crm_students_gender_check
  check (gender is null or gender in ('male', 'female'));

-- ─── 3. The whole profile in one round trip ──────────────────
-- Readable by the teacher themselves and by CRM staff. Everything a teacher
-- could fabricate is declared; everything below "computed" comes from rows.

create or replace function public.teacher_profile_full(p_teacher uuid)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_caller uuid := auth.uid();
  v_out    jsonb;
begin
  if not (v_caller = p_teacher or public.is_crm_staff(v_caller)) then
    return '{}'::jsonb;
  end if;

  select jsonb_build_object(
    'profile', to_jsonb(tp) - 'hourly_rate_mad' - 'pay_model',

    'identity', jsonb_build_object(
      'email',     p.email,
      'full_name', p.full_name
    ),

    -- ── Headline numbers ───────────────────────────────────
    'stats', jsonb_build_object(
      'students_total',   (select count(*) from teacher_students ts
                            where ts.teacher_id = p_teacher),
      'students_active',  (select count(*) from teacher_students ts
                            join crm_students s on s.id = ts.student_id
                            where ts.teacher_id = p_teacher and ts.is_active
                              and s.is_active and s.deleted_at is null),
      'classes_done',     (select count(*) from class_sessions cs
                            where cs.teacher_id = p_teacher and cs.status = 'done'),
      'hours_total',      (select coalesce(round(sum(cs.duration_min)::numeric / 60, 1), 0)
                            from class_sessions cs
                            where cs.teacher_id = p_teacher and cs.status = 'done'),
      'reports_written',  (select count(*) from lesson_reports lr where lr.teacher_id = p_teacher),
      'materials',        (select count(*) from teacher_materials tm where tm.teacher_id = p_teacher),
      -- exams sat by this teacher's students, and how many were passed
      'exams_corrected',  (select count(*) from lms_unit_exam_results r
                            where r.student_id in (select ts.student_id from teacher_students ts
                                                    where ts.teacher_id = p_teacher and ts.is_active)),
      'exams_passed',     (select count(*) from lms_unit_exam_results r
                            where r.passed
                              and r.student_id in (select ts.student_id from teacher_students ts
                                                    where ts.teacher_id = p_teacher and ts.is_active)),
      'attendance_rate',  (select case when count(*) = 0 then null
                            else round(100.0 * count(*) filter (where a.status in ('present','late')) / count(*)) end
                           from class_attendance a
                           join class_sessions cs on cs.id = a.session_id
                           where cs.teacher_id = p_teacher),
      'rating_avg',       coalesce(tp.rating_avg, 0),
      'rating_count',     coalesce(tp.rating_count, 0),
      -- earned, not typed: 4.5+ across at least five reviews
      'is_top_rated',     (coalesce(tp.rating_avg, 0) >= 4.5 and coalesce(tp.rating_count, 0) >= 5)
    ),

    -- ── Who he actually teaches ────────────────────────────
    'gender_split', (
      select jsonb_build_object(
        'male',    count(*) filter (where s.gender = 'male'),
        'female',  count(*) filter (where s.gender = 'female'),
        'unknown', count(*) filter (where s.gender is null))
      from teacher_students ts join crm_students s on s.id = ts.student_id
      where ts.teacher_id = p_teacher and ts.is_active and s.deleted_at is null
    ),

    'age_bands', (
      select coalesce(jsonb_agg(jsonb_build_object('band', band, 'count', n) order by sort), '[]'::jsonb)
      from (
        select
          case
            when age < 13 then 'أقل من 13'
            when age between 13 and 17 then '13–17'
            when age between 18 and 24 then '18–24'
            when age between 25 and 34 then '25–34'
            when age between 35 and 49 then '35–49'
            else '+50'
          end as band,
          case
            when age < 13 then 1 when age between 13 and 17 then 2
            when age between 18 and 24 then 3 when age between 25 and 34 then 4
            when age between 35 and 49 then 5 else 6
          end as sort,
          count(*) as n
        from (
          select extract(year from current_date)::int - s.birth_year as age
          from teacher_students ts join crm_students s on s.id = ts.student_id
          where ts.teacher_id = p_teacher and ts.is_active
            and s.deleted_at is null and s.birth_year is not null
        ) aged
        group by band, sort
      ) bands
    ),

    'avg_age', (
      select round(avg(extract(year from current_date)::int - s.birth_year))
      from teacher_students ts join crm_students s on s.id = ts.student_id
      where ts.teacher_id = p_teacher and ts.is_active
        and s.deleted_at is null and s.birth_year is not null
    ),

    'level_split', (
      select coalesce(jsonb_agg(jsonb_build_object('level', lvl, 'count', n) order by lvl), '[]'::jsonb)
      from (
        select coalesce(s.current_level, s.course, 'غير محدد') as lvl, count(*) as n
        from teacher_students ts join crm_students s on s.id = ts.student_id
        where ts.teacher_id = p_teacher and ts.is_active and s.deleted_at is null
        group by lvl
      ) lv
    ),

    -- ── The week ahead ─────────────────────────────────────
    'upcoming', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', cs.id, 'title', cs.title, 'starts_at', cs.starts_at,
        'duration_min', cs.duration_min, 'mode', cs.mode, 'level', cs.level,
        'meeting_url', cs.meeting_url) order by cs.starts_at), '[]'::jsonb)
      from class_sessions cs
      where cs.teacher_id = p_teacher and cs.status in ('scheduled','live')
        and cs.starts_at between now() - interval '1 hour' and now() + interval '14 days'
    ),

    -- ── Standout students: coins + streak + exams passed ───
    'top_students', (
      select coalesce(jsonb_agg(t order by (t->>'score')::numeric desc), '[]'::jsonb)
      from (
        select jsonb_build_object(
          'id', s.id,
          'name', s.full_name,
          'avatar_url', s.avatar_url,
          'level', coalesce(s.current_level, s.course),
          'coins', coalesce(c.coins, 0),
          'streak', coalesce(st.current_streak, 0),
          'exams_passed', coalesce(e.passed, 0),
          'last_seen', pr.last_seen_at,
          -- one number so the list has an order: effort + consistency + result
          'score', coalesce(c.coins, 0) * 0.1 + coalesce(st.current_streak, 0) * 2 + coalesce(e.passed, 0) * 10
        ) as t
        from teacher_students ts
        join crm_students s on s.id = ts.student_id
        left join (select student_id, sum(coins_amount) coins from coin_transactions group by student_id) c
               on c.student_id = s.id
        left join student_streaks st on st.student_id = s.id
        left join (select student_id, count(*) filter (where passed) passed
                     from lms_unit_exam_results group by student_id) e on e.student_id = s.id
        left join student_presence pr on pr.student_id = s.id
        where ts.teacher_id = p_teacher and ts.is_active
          and s.is_active and s.deleted_at is null
        limit 12
      ) ranked
    ),

    -- ── Testimonials ───────────────────────────────────────
    'testimonials', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', r.id, 'rating', r.rating, 'comment', r.comment,
        'created_at', r.created_at, 'student_name', s.full_name,
        'student_avatar', s.avatar_url) order by r.created_at desc), '[]'::jsonb)
      from teacher_reviews r
      left join crm_students s on s.id = r.student_id
      where r.teacher_id = p_teacher and r.is_published
    ),

    'rating_breakdown', (
      select coalesce(jsonb_object_agg(rating::text, n), '{}'::jsonb)
      from (select rating, count(*) n from teacher_reviews
             where teacher_id = p_teacher and is_published group by rating) rb
    )
  ) into v_out
  from profiles p
  left join teacher_profiles tp on tp.id = p.id
  where p.id = p_teacher;

  return coalesce(v_out, '{}'::jsonb);
end $$;

grant execute on function public.teacher_profile_full(uuid) to authenticated;
