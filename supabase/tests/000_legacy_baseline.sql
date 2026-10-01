-- 000_legacy_baseline.sql — TEST HARNESS ONLY. Never apply to a real project.
--
-- Structure-only snapshot of the production `public` schema as it stood at
-- migration 046 (taken from the live catalog on 2026-10-01). No rows, no PII.
--
-- Why this exists: supabase/migrations 001–046 cannot be replayed on an empty
-- database. Production was built partly in the SQL editor and partly through
-- timestamped migrations that never landed in this folder (022a_lms_schema,
-- lms_quiz, rls_on_new_lms_tables, …), and some files collide (001 and 004 both
-- define `lessons`). So the fresh-database test boots from this snapshot and
-- then applies every migration numbered after 046 — exactly the path
-- production will take.
--
-- Fidelity: supabase/tests/baseline-fidelity.json holds md5(prosrc) of every
-- production function; run-db-tests.mjs fails if this file drifts from it.

set check_function_bodies = off;
set search_path = public, extensions;

-- ─── Types & sequences ───────────────────────────────────────
create type public.user_role as enum ('founder', 'assistant', 'student', 'teacher');

create sequence if not exists public.content_id_seq start 1 increment 1;
create sequence if not exists public.progress_id_seq start 1 increment 1;
create sequence if not exists public.attempts_id_seq start 1 increment 1;
create sequence if not exists public.crm_receipt_number_seq start 1001 increment 1;

-- ─── Tables ──────────────────────────────────────────────────
create table public.announcement_targets (
  announcement_id uuid not null,
  student_id uuid not null,
  constraint announcement_targets_pkey PRIMARY KEY (announcement_id, student_id)
);
create table public.announcements (
  id uuid not null default gen_random_uuid(),
  title text not null,
  body text,
  type text not null default 'banner'::text,
  severity text not null default 'info'::text,
  audience text not null default 'all'::text,
  course_id uuid,
  is_active boolean not null default true,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone not null default now(),
  constraint announcements_pkey PRIMARY KEY (id)
);
create table public.articles (
  id uuid not null default gen_random_uuid(),
  slug text not null,
  title text not null,
  excerpt text not null default ''::text,
  content jsonb not null default '[]'::jsonb,
  category text not null default ''::text,
  category_color text not null default '#3b82f6'::text,
  tags jsonb not null default '[]'::jsonb,
  read_time text not null default '5 د'::text,
  date text not null default ''::text,
  img text not null default ''::text,
  featured boolean not null default false,
  author text not null default ''::text,
  status text not null default 'published'::text,
  sort_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint articles_pkey PRIMARY KEY (id),
  constraint articles_slug_key UNIQUE (slug)
);
create table public.assistant_codes (
  id uuid not null default gen_random_uuid(),
  code text not null,
  label text,
  uses_left integer,
  used_count integer not null default 0,
  expires_at timestamp with time zone,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamp with time zone not null default now(),
  constraint assistant_codes_pkey PRIMARY KEY (id),
  constraint assistant_codes_code_key UNIQUE (code)
);
create table public.attempts (
  id bigint not null default nextval('attempts_id_seq'::regclass),
  user_id text not null,
  lesson_id text not null,
  question_index integer not null,
  is_correct boolean not null,
  xp_earned integer not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint attempts_pkey PRIMARY KEY (id)
);
create table public.class_attendance (
  id uuid not null default gen_random_uuid(),
  session_id uuid not null,
  student_id uuid not null,
  status text not null default 'present'::text,
  minutes integer,
  note text,
  marked_by uuid,
  marked_at timestamp with time zone not null default now(),
  constraint class_attendance_pkey PRIMARY KEY (id),
  constraint class_attendance_session_id_student_id_key UNIQUE (session_id, student_id)
);
create table public.class_sessions (
  id uuid not null default gen_random_uuid(),
  teacher_id uuid not null,
  course_id uuid,
  title text not null,
  mode text not null default 'group'::text,
  level text,
  starts_at timestamp with time zone not null,
  duration_min integer not null default 60,
  meeting_url text,
  location text,
  status text not null default 'scheduled'::text,
  cancel_reason text,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint class_sessions_pkey PRIMARY KEY (id)
);
create table public.coin_transactions (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  action_type text not null,
  coins_amount integer not null,
  related_course_id uuid,
  related_lesson_id uuid,
  related_module_id uuid,
  source text not null default 'system'::text,
  notes text,
  dedup_key text,
  created_at timestamp with time zone not null default now(),
  constraint coin_transactions_pkey PRIMARY KEY (id)
);
create table public.content (
  id bigint generated by default as identity not null,
  created_at timestamp with time zone not null default now(),
  live_link text,
  youtube_link text,
  constraint content_pkey PRIMARY KEY (id)
);
create table public.content_items (
  id text not null,
  sentence text not null,
  arabic_sentence text,
  options jsonb not null,
  correct_index smallint not null,
  level text not null,
  lesson text not null,
  status text not null default 'draft'::text,
  video_url text,
  video_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint content_items_pkey PRIMARY KEY (id)
);
create table public.course_lessons (
  id uuid not null default gen_random_uuid(),
  course_slug text not null,
  section_title text not null,
  section_order integer not null default 0,
  lesson_title text not null,
  duration text not null default ''::text,
  youtube_id text not null default ''::text,
  is_free boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint course_lessons_pkey PRIMARY KEY (id)
);
create table public.course_meta (
  slug text not null,
  course_type text not null default 'native'::text,
  external_url text,
  updated_at timestamp with time zone not null default now(),
  constraint course_meta_pkey PRIMARY KEY (slug),
  constraint course_meta_course_type_check CHECK ((course_type = ANY (ARRAY['native'::text, 'external'::text])))
);
create table public.crm_activity_log (
  id uuid not null default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  actor_role text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_value jsonb,
  after_value jsonb,
  metadata jsonb,
  created_at timestamp with time zone not null default now(),
  constraint crm_activity_log_pkey PRIMARY KEY (id)
);
create table public.crm_broadcasts (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  created_by uuid,
  created_by_email text,
  audience text not null,
  filters jsonb not null default '{}'::jsonb,
  message text,
  template text,
  channel text not null,
  total integer not null default 0,
  sent integer not null default 0,
  failed integer not null default 0,
  failures jsonb not null default '[]'::jsonb,
  constraint crm_broadcasts_pkey PRIMARY KEY (id)
);
create table public.crm_lead_events (
  id uuid not null default gen_random_uuid(),
  lead_id uuid not null,
  actor_id uuid,
  actor_email text,
  event_type text not null,
  title text not null,
  body text,
  before_value jsonb,
  after_value jsonb,
  created_at timestamp with time zone not null default now(),
  constraint crm_lead_events_pkey PRIMARY KEY (id)
);
create table public.crm_payments (
  id uuid not null default gen_random_uuid(),
  lead_id uuid,
  student_id uuid,
  payment_type text not null,
  course_or_service text,
  amount_mad numeric(10,2) not null,
  payment_status text not null default 'pending'::text,
  payment_date date,
  next_payment_date date,
  receipt_url text,
  notes text,
  added_by_id uuid,
  approved_by_id uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  is_upgrade boolean not null default false,
  prev_plan text,
  description text,
  payment_method text default 'cash'::text,
  excluded_from_revenue boolean not null default false,
  due_date date,
  reminder_sent_at timestamp with time zone,
  installment_no integer,
  installment_count integer,
  constraint crm_payments_pkey PRIMARY KEY (id)
);
create table public.crm_receipts (
  id uuid not null default gen_random_uuid(),
  receipt_number text not null default ('ING-'::text || (nextval('crm_receipt_number_seq'::regclass))::text),
  payment_id uuid,
  lead_id uuid,
  student_id uuid,
  full_name text not null,
  phone_number text,
  course_name text,
  payment_type text not null default 'course_one_time'::text,
  amount_mad numeric(10,2) not null,
  payment_date date not null default CURRENT_DATE,
  payment_method text not null default 'cash'::text,
  notes text,
  issued_by_id uuid,
  issued_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  verification_token text,
  constraint crm_receipts_pkey PRIMARY KEY (id),
  constraint crm_receipts_receipt_number_key UNIQUE (receipt_number)
);
create table public.crm_student_events (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  actor_id uuid,
  actor_email text,
  event_type text not null,
  title text not null,
  body text,
  before_val jsonb,
  after_val jsonb,
  created_at timestamp with time zone not null default now(),
  constraint crm_student_events_pkey PRIMARY KEY (id)
);
create table public.crm_students (
  id uuid not null default gen_random_uuid(),
  lead_id uuid,
  full_name text not null,
  phone_number text,
  course text,
  student_type text not null default 'course_student'::text,
  enrollment_date date not null default CURRENT_DATE,
  payment_status text not null default 'paid'::text,
  total_paid_mad numeric(10,2) default 0,
  monthly_fee_mad numeric(10,2),
  next_payment_date date,
  notes text,
  is_active boolean not null default true,
  added_by_id uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone,
  deleted_by_id uuid,
  verification_token text default ('ING-'::text || upper(substr(md5(((random())::text || (clock_timestamp())::text)), 1, 8))),
  course_end_date date,
  teacher_name text default 'الأستاذ حمزة'::text,
  source text,
  billing_type text not null default 'one_time'::text,
  subscription_start date,
  current_level text,
  next_level text,
  admin_message text,
  next_task text,
  today_lesson_url text,
  today_lesson_title text,
  learning_stage text,
  device_limit integer not null default 1,
  enrollment_type text not null default 'paid'::text,
  coupon_code text,
  reward_source text,
  sponsor_reason text,
  trial_expires_at date,
  country text,
  avatar_url text,
  payment_reminder_at timestamp with time zone,
  gender text,
  birth_year integer,
  constraint crm_students_pkey PRIMARY KEY (id),
  constraint crm_students_lead_id_key UNIQUE (lead_id),
  constraint crm_students_gender_check CHECK (((gender IS NULL) OR (gender = ANY (ARRAY['male'::text, 'female'::text]))))
);
create table public.feature_access (
  slug text not null,
  label_ar text not null,
  category text not null default 'other'::text,
  requires_auth boolean not null default false,
  requires_paid boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamp with time zone not null default now(),
  constraint feature_access_pkey PRIMARY KEY (slug)
);
create table public.language_functions (
  id text not null,
  title text not null,
  ar text not null default ''::text,
  emoji text not null default ''::text,
  intro text not null default ''::text,
  groups jsonb not null default '[]'::jsonb,
  examples jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamp with time zone not null default now(),
  constraint language_functions_pkey PRIMARY KEY (id)
);
create table public.lesson_reports (
  id uuid not null default gen_random_uuid(),
  session_id uuid not null,
  teacher_id uuid not null,
  covered text not null,
  homework text,
  materials_used text,
  student_notes jsonb not null default '[]'::jsonb,
  founder_note text,
  submitted_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint lesson_reports_pkey PRIMARY KEY (id),
  constraint lesson_reports_session_id_key UNIQUE (session_id)
);
create table public.lessons (
  id text not null,
  title text not null,
  title_ar text not null,
  level text not null default 'A1'::text,
  emoji text not null default '📚'::text,
  color text not null default '#3b82f6'::text,
  vocab jsonb not null default '[]'::jsonb,
  sentences jsonb not null default '[]'::jsonb,
  "natural" jsonb not null default '[]'::jsonb,
  dialogue jsonb not null default '[]'::jsonb,
  exercises jsonb not null default '[]'::jsonb,
  status text not null default 'published'::text,
  sort_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint lessons_pkey PRIMARY KEY (id)
);
create table public.lms_certificates (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  level text not null default 'A0 - A1'::text,
  score integer not null,
  total integer not null,
  percent integer not null,
  passed boolean not null default false,
  cert_number text not null,
  created_at timestamp with time zone not null default now(),
  speaking_path text,
  constraint lms_certificates_pkey PRIMARY KEY (id)
);
create table public.lms_courses (
  id uuid not null default gen_random_uuid(),
  title text not null,
  level text,
  description text,
  is_published boolean not null default true,
  created_by uuid,
  created_at timestamp with time zone not null default now(),
  days_per_unit integer not null default 7,
  constraint lms_courses_pkey PRIMARY KEY (id)
);
create table public.lms_enrollments (
  id uuid not null default gen_random_uuid(),
  course_id uuid not null,
  student_id uuid not null,
  status text not null default 'active'::text,
  enrolled_at timestamp with time zone not null default now(),
  created_by uuid,
  constraint lms_enrollments_pkey PRIMARY KEY (id),
  constraint lms_enrollments_course_id_student_id_key UNIQUE (course_id, student_id)
);
create table public.lms_image_cache (
  q text not null,
  url text,
  created_at timestamp with time zone not null default now(),
  constraint lms_image_cache_pkey PRIMARY KEY (q)
);
create table public.lms_lesson_progress (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  lesson_id uuid not null,
  status text not null default 'opened'::text,
  opened_at timestamp with time zone not null default now(),
  completed_at timestamp with time zone,
  constraint lms_lesson_progress_pkey PRIMARY KEY (id),
  constraint lms_lesson_progress_student_id_lesson_id_key UNIQUE (student_id, lesson_id)
);
create table public.lms_lessons (
  id uuid not null default gen_random_uuid(),
  module_id uuid not null,
  title text not null,
  lesson_order integer not null default 0,
  lesson_type text not null default 'video'::text,
  video_url text,
  file_url text,
  exercise_url text,
  has_quiz boolean not null default false,
  content text,
  is_locked boolean not null default false,
  created_at timestamp with time zone not null default now(),
  quiz jsonb,
  constraint lms_lessons_pkey PRIMARY KEY (id)
);
create table public.lms_modules (
  id uuid not null default gen_random_uuid(),
  course_id uuid not null,
  title text not null,
  module_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  reading_text text,
  reading_audio_url text,
  reading_video_url text,
  reading_quiz jsonb,
  exam_quiz jsonb,
  conversation_prompt text,
  constraint lms_modules_pkey PRIMARY KEY (id)
);
create table public.lms_quiz_results (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  lesson_id uuid not null,
  score integer not null,
  total integer not null,
  passed boolean not null default false,
  answers jsonb,
  created_at timestamp with time zone not null default now(),
  constraint lms_quiz_results_pkey PRIMARY KEY (id)
);
create table public.lms_resources (
  id uuid not null default gen_random_uuid(),
  course_id uuid not null,
  title text not null,
  file_path text not null,
  file_type text,
  size_bytes bigint,
  created_by uuid,
  created_at timestamp with time zone not null default now(),
  constraint lms_resources_pkey PRIMARY KEY (id)
);
create table public.lms_submissions (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  module_id uuid not null,
  conversation_text text,
  status text not null default 'pending'::text,
  feedback text,
  score integer,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  constraint lms_submissions_pkey PRIMARY KEY (id)
);
create table public.lms_unit_exam_results (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  module_id uuid not null,
  score integer not null,
  total integer not null,
  passed boolean not null,
  answers jsonb,
  created_at timestamp with time zone not null default now(),
  constraint lms_unit_exam_results_pkey PRIMARY KEY (id)
);
create table public.path_template_steps (
  id uuid not null default gen_random_uuid(),
  template_id uuid not null,
  step_order integer not null default 0,
  title text not null,
  category text not null default 'exercise'::text,
  link_url text,
  description text,
  constraint path_template_steps_pkey PRIMARY KEY (id)
);
create table public.path_templates (
  id uuid not null default gen_random_uuid(),
  name text not null,
  level text,
  description text,
  created_by uuid,
  created_at timestamp with time zone not null default now(),
  constraint path_templates_pkey PRIMARY KEY (id)
);
create table public.payments (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  method text not null default 'receipt'::text,
  external_id text,
  plan_requested text not null,
  amount numeric(10,2) not null,
  currency text not null default 'MAD'::text,
  duration_months integer not null default 1,
  receipt_path text,
  status text not null default 'pending'::text,
  decline_reason text,
  user_note text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  constraint payments_pkey PRIMARY KEY (id),
  constraint payments_method_check CHECK ((method = ANY (ARRAY['receipt'::text, 'stripe'::text]))),
  constraint payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'declined'::text])))
);
create table public.profiles (
  id uuid not null,
  email text,
  full_name text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  plan text not null default 'free'::text,
  plan_expires_at timestamp with time zone,
  plan_note text,
  blocked boolean not null default false,
  role user_role not null default 'student'::user_role,
  phone text,
  constraint profiles_pkey PRIMARY KEY (id),
  constraint profiles_plan_check CHECK ((plan = ANY (ARRAY['free'::text, 'paid'::text])))
);
create table public.progress (
  id bigint not null default nextval('progress_id_seq'::regclass),
  user_id text not null,
  island_id text not null,
  completed boolean not null default false,
  score integer not null default 0,
  updated_at timestamp with time zone not null default now(),
  constraint progress_pkey PRIMARY KEY (id),
  constraint progress_user_id_island_id_key UNIQUE (user_id, island_id)
);
create table public.push_subscriptions (
  id uuid not null default gen_random_uuid(),
  student_id uuid,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamp with time zone not null default now(),
  last_seen_at timestamp with time zone not null default now(),
  constraint push_subscriptions_pkey PRIMARY KEY (id),
  constraint push_subscriptions_endpoint_key UNIQUE (endpoint)
);
create table public.reward_claims (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  reward_id uuid not null,
  status text not null default 'pending'::text,
  coins_at_claim integer not null default 0,
  note text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  constraint reward_claims_pkey PRIMARY KEY (id)
);
create table public.rewards (
  id uuid not null default gen_random_uuid(),
  level_name text not null,
  min_coins integer not null,
  reward_title text,
  reward_desc text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  constraint rewards_pkey PRIMARY KEY (id)
);
create table public.sentence_challenges (
  id uuid not null default gen_random_uuid(),
  level text not null default 'A0'::text,
  module_id uuid,
  arabic text not null,
  english text not null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  constraint sentence_challenges_pkey PRIMARY KEY (id)
);
create table public.student_activity (
  id uuid not null default gen_random_uuid(),
  user_id uuid,
  lead_id uuid,
  event_type text not null,
  entity_type text,
  entity_id text,
  entity_title text,
  score numeric(5,2),
  duration_sec integer,
  metadata jsonb,
  created_at timestamp with time zone not null default now(),
  student_id uuid,
  constraint student_activity_pkey PRIMARY KEY (id)
);
create table public.student_assignments (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  title text not null,
  description text,
  link_url text,
  is_done boolean not null default false,
  assigned_by uuid,
  created_at timestamp with time zone not null default now(),
  status text not null default 'pending'::text,
  category text not null default 'exercise'::text,
  due_date date,
  course text,
  completed_at timestamp with time zone,
  constraint student_assignments_pkey PRIMARY KEY (id)
);
create table public.student_certificates (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  course_id uuid,
  kind text not null,
  milestone integer,
  title text not null,
  serial text not null,
  meta jsonb,
  issued_by uuid,
  created_at timestamp with time zone not null default now(),
  constraint student_certificates_pkey PRIMARY KEY (id),
  constraint student_certificates_serial_key UNIQUE (serial)
);
create table public.student_challenge_attempts (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  challenge_type text not null,
  challenge_id uuid not null,
  mode text,
  is_correct boolean not null default false,
  answer text,
  created_at timestamp with time zone not null default now(),
  constraint student_challenge_attempts_pkey PRIMARY KEY (id)
);
create table public.student_devices (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  device_id text not null,
  label text,
  user_agent text,
  last_seen timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  constraint student_devices_pkey PRIMARY KEY (id),
  constraint student_devices_student_id_device_id_key UNIQUE (student_id, device_id)
);
create table public.student_exams (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  title text not null,
  level text,
  exam_date date,
  score numeric(5,2),
  max_score numeric(5,2) default 100,
  passed boolean,
  teacher_note text,
  retry_allowed boolean not null default false,
  created_by uuid,
  created_at timestamp with time zone not null default now(),
  constraint student_exams_pkey PRIMARY KEY (id)
);
create table public.student_files (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  file_name text not null,
  file_path text not null,
  size_bytes bigint,
  uploaded_by uuid,
  created_at timestamp with time zone not null default now(),
  file_type text,
  course text,
  constraint student_files_pkey PRIMARY KEY (id)
);
create table public.student_notifications (
  id uuid not null default gen_random_uuid(),
  student_id uuid not null,
  type text not null default 'info'::text,
  title text not null,
  body text,
  tab text,
  is_read boolean not null default false,
  sent_whatsapp boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint student_notifications_pkey PRIMARY KEY (id)
);
create table public.student_otps (
  student_id uuid not null,
  code_hash text not null,
  expires_at timestamp with time zone not null,
  attempts integer not null default 0,
  last_sent_at timestamp with time zone not null default now(),
  constraint student_otps_pkey PRIMARY KEY (student_id)
);
create table public.student_presence (
  student_id uuid not null,
  last_seen_at timestamp with time zone not null default now(),
  activity text,
  course_id uuid,
  updated_at timestamp with time zone not null default now(),
  constraint student_presence_pkey PRIMARY KEY (student_id)
);
create table public.student_streaks (
  student_id uuid not null,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  m7_awarded boolean not null default false,
  m30_awarded boolean not null default false,
  updated_at timestamp with time zone not null default now(),
  constraint student_streaks_pkey PRIMARY KEY (student_id)
);
create table public.subscription_leads (
  id uuid not null default gen_random_uuid(),
  plan_id text not null,
  level text,
  full_name text not null,
  phone text,
  city text,
  amount_mad integer,
  status text not null default 'new'::text,
  admin_note text,
  created_at timestamp with time zone not null default now(),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  source text,
  goal text,
  plan_interest text,
  test_score integer,
  recommended_plan text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  device text,
  page_path text,
  assigned_to_id uuid,
  course_interested text,
  notes text,
  last_contact_at timestamp with time zone,
  next_followup_at timestamp with time zone,
  is_vip boolean not null default false,
  lead_source text,
  course text,
  lead_type text,
  lost_reason text,
  pending_payment boolean not null default false,
  is_archived boolean not null default false,
  archived_at timestamp with time zone,
  archived_by uuid,
  deleted_at timestamp with time zone,
  deleted_by_id uuid,
  country text,
  constraint subscription_leads_pkey PRIMARY KEY (id),
  constraint subscription_leads_status_check CHECK ((status = ANY (ARRAY['new'::text, 'contacted'::text, 'interested'::text, 'follow_up'::text, 'confirmed'::text, 'paid'::text, 'delayed'::text, 'cancelled'::text, 'vip'::text, 'converted'::text, 'rejected'::text])))
);
create table public.support_messages (
  id uuid not null default gen_random_uuid(),
  thread_id uuid not null,
  sender_id uuid,
  sender_role text not null,
  body text not null,
  created_at timestamp with time zone not null default now(),
  constraint support_messages_pkey PRIMARY KEY (id),
  constraint support_messages_sender_role_check CHECK ((sender_role = ANY (ARRAY['user'::text, 'admin'::text])))
);
create table public.support_threads (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  subject text not null,
  status text not null default 'open'::text,
  last_message_at timestamp with time zone not null default now(),
  last_message_preview text,
  unread_for_admin boolean not null default true,
  unread_for_user boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint support_threads_pkey PRIMARY KEY (id),
  constraint support_threads_status_check CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text])))
);
create table public.teacher_materials (
  id uuid not null default gen_random_uuid(),
  teacher_id uuid not null,
  course_id uuid,
  title text not null,
  description text,
  file_path text not null,
  file_type text,
  size_bytes bigint,
  level text,
  unit_no integer,
  visibility text not null default 'students'::text,
  download_count integer not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint teacher_materials_pkey PRIMARY KEY (id)
);
create table public.teacher_profiles (
  id uuid not null,
  display_name text,
  headline text,
  bio text,
  avatar_url text,
  levels text[] not null default '{}'::text[],
  specialties text[] not null default '{}'::text[],
  languages text[] not null default '{}'::text[],
  whatsapp text,
  pay_model text not null default 'hourly'::text,
  hourly_rate_mad numeric(10,2),
  availability jsonb not null default '[]'::jsonb,
  hired_at date not null default CURRENT_DATE,
  is_active boolean not null default true,
  rating_avg numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  cover_url text,
  tagline text,
  english_level text,
  competences text[] not null default '{}'::text[],
  liked_qualities text[] not null default '{}'::text[],
  certificates jsonb not null default '[]'::jsonb,
  experiences jsonb not null default '[]'::jsonb,
  teaches text[] not null default '{}'::text[],
  not_teaches text[] not null default '{}'::text[],
  age_min integer,
  age_max integer,
  years_experience integer,
  constraint teacher_profiles_pkey PRIMARY KEY (id)
);
create table public.teacher_reviews (
  id uuid not null default gen_random_uuid(),
  teacher_id uuid not null,
  student_id uuid not null,
  rating integer not null,
  comment text,
  is_published boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint teacher_reviews_pkey PRIMARY KEY (id),
  constraint teacher_reviews_teacher_id_student_id_key UNIQUE (teacher_id, student_id),
  constraint teacher_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);
create table public.teacher_students (
  id uuid not null default gen_random_uuid(),
  teacher_id uuid not null,
  student_id uuid not null,
  is_active boolean not null default true,
  assigned_at timestamp with time zone not null default now(),
  assigned_by uuid,
  constraint teacher_students_pkey PRIMARY KEY (id),
  constraint teacher_students_teacher_id_student_id_key UNIQUE (teacher_id, student_id)
);
create table public.translation_challenges (
  id uuid not null default gen_random_uuid(),
  level text not null default 'A0'::text,
  module_id uuid,
  arabic text not null,
  english text not null,
  choices jsonb,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  constraint translation_challenges_pkey PRIMARY KEY (id)
);
create table public.users (
  id uuid not null default uuid_generate_v4(),
  email text,
  plan text default 'free'::text,
  xp integer default 0,
  streak integer default 0,
  created_at timestamp without time zone default now(),
  constraint users_pkey PRIMARY KEY (id)
);
create table public.vocab_words (
  id uuid not null default gen_random_uuid(),
  level text not null,
  en text not null,
  ar text not null,
  emoji text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  course_id uuid,
  module_id uuid,
  constraint vocab_words_pkey PRIMARY KEY (id)
);

-- ─── Functions ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public._award(p_student uuid, p_action text, p_amount integer, p_course uuid, p_lesson uuid, p_module uuid, p_source text, p_notes text, p_dedup text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if p_dedup is not null and exists (select 1 from coin_transactions where student_id = p_student and dedup_key = p_dedup) then return 0; end if;
  insert into coin_transactions (student_id, action_type, coins_amount, related_course_id, related_lesson_id, related_module_id, source, notes, dedup_key)
    values (p_student, p_action, p_amount, p_course, p_lesson, p_module, p_source, p_notes, p_dedup);
  return p_amount;
end; $function$
;
CREATE OR REPLACE FUNCTION public._award_certificate(p_student uuid, p_kind text, p_course uuid, p_milestone integer, p_title text, p_meta jsonb DEFAULT NULL::jsonb)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_serial text;
begin
  insert into student_certificates (student_id, kind, course_id, milestone, title, serial, meta)
  values (p_student, p_kind, p_course, p_milestone, p_title, public._cert_serial(), p_meta)
  on conflict (student_id, kind, coalesce(course_id, '00000000-0000-0000-0000-000000000000'::uuid), coalesce(milestone, 0))
  do nothing
  returning serial into v_serial;
  if v_serial is not null then
    insert into student_notifications (student_id, type, title, body, tab)
    values (p_student, 'certificate', '🎓 حصلت على شهادة جديدة!', p_title, 'home');
  end if;
  return v_serial;
end; $function$
;
CREATE OR REPLACE FUNCTION public._cert_serial()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v text;
begin
  loop
    v := 'IGZ-' || to_char(now(), 'YYMM') || '-' ||
         upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from student_certificates where serial = v);
  end loop;
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public._lms_courses_for(p_student uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(jsonb_agg(course ORDER BY course->>'title'), '[]'::jsonb) FROM (
    SELECT jsonb_build_object(
      'id', c.id, 'title', c.title, 'level', c.level, 'description', c.description,
      'modules', (
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
          'id', m.id, 'title', m.title, 'order', m.module_order,
          'lessons', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
              'id', l.id, 'title', l.title, 'type', l.lesson_type, 'order', l.lesson_order,
              'video_url', l.video_url, 'file_url', l.file_url, 'exercise_url', l.exercise_url,
              'has_quiz', l.has_quiz, 'is_locked', l.is_locked, 'content', l.content,
              'status', COALESCE(lp.status, 'not_started')
            ) ORDER BY l.lesson_order), '[]'::jsonb)
            FROM lms_lessons l
            LEFT JOIN lms_lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = p_student
            WHERE l.module_id = m.id
          )
        ) ORDER BY m.module_order), '[]'::jsonb)
        FROM lms_modules m WHERE m.course_id = c.id
      )
    ) AS course
    FROM lms_courses c
    JOIN lms_enrollments e ON e.course_id = c.id AND e.student_id = p_student
  ) z;
$function$
;
CREATE OR REPLACE FUNCTION public._norm(t text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select regexp_replace(regexp_replace(lower(btrim(coalesce(t, ''))), '[.!?,;:]+$', ''), '\s+', ' ', 'g')
$function$
;
CREATE OR REPLACE FUNCTION public.apply_path_template(p_student_id uuid, p_template_id uuid, p_actor uuid DEFAULT NULL::uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_n INT := 0;
BEGIN
  IF NOT public.is_crm_staff(auth.uid()) THEN RETURN 0; END IF;
  INSERT INTO public.student_assignments (student_id, title, description, link_url, category, assigned_by)
  SELECT p_student_id, st.title, st.description, st.link_url, st.category, p_actor
  FROM public.path_template_steps st WHERE st.template_id = p_template_id ORDER BY st.step_order;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RETURN v_n;
END; $function$
;
CREATE OR REPLACE FUNCTION public.apply_payment_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  current_expiry timestamptz;
  base_from      timestamptz;
  new_expiry     timestamptz;
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    select plan_expires_at into current_expiry from public.profiles where id = new.user_id;
    base_from  := case when current_expiry > now() then current_expiry else now() end;
    new_expiry := base_from + (new.duration_months || ' months')::interval;
    update public.profiles
       set plan = 'paid', plan_expires_at = new_expiry
     where id = new.user_id;
    new.reviewed_at := now();
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.auto_create_receipt()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_full_name TEXT;
  v_phone     TEXT;
  v_course    TEXT;
  v_token     TEXT;
  v_issued_by UUID;
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS DISTINCT FROM 'paid') THEN
    IF NEW.student_id IS NOT NULL THEN
      SELECT full_name, phone_number, course, verification_token
        INTO v_full_name, v_phone, v_course, v_token
        FROM public.crm_students WHERE id = NEW.student_id;
    ELSIF NEW.lead_id IS NOT NULL THEN
      SELECT full_name, phone, course
        INTO v_full_name, v_phone, v_course
        FROM public.subscription_leads WHERE id = NEW.lead_id;
    END IF;

    v_issued_by := COALESCE(NEW.approved_by_id, NEW.added_by_id);

    INSERT INTO public.crm_receipts (
      payment_id, lead_id, student_id, full_name, phone_number, course_name,
      payment_type, amount_mad, payment_date, payment_method, notes, issued_by_id,
      verification_token
    )
    SELECT
      NEW.id, NEW.lead_id, NEW.student_id, COALESCE(v_full_name, 'طالب'), v_phone,
      COALESCE(v_course, NEW.course_or_service), NEW.payment_type, NEW.amount_mad,
      COALESCE(NEW.payment_date::DATE, CURRENT_DATE), COALESCE(NEW.payment_method, 'cash'),
      NEW.notes, v_issued_by, v_token
    WHERE NOT EXISTS (SELECT 1 FROM public.crm_receipts WHERE payment_id = NEW.id);
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.bump_support_thread()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  update public.support_threads
     set last_message_at      = new.created_at,
         last_message_preview = left(new.body, 140),
         updated_at           = now(),
         unread_for_admin     = case when new.sender_role = 'user'  then true  else false end,
         unread_for_user      = case when new.sender_role = 'admin' then true  else false end,
         status               = case when status = 'closed' and new.sender_role = 'user' then 'open' else status end
   where id = new.thread_id;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.casa_now_trunc(p_unit text)
 RETURNS timestamp with time zone
 LANGUAGE sql
 STABLE
AS $function$
  select date_trunc(p_unit, now() at time zone 'Africa/Casablanca') at time zone 'Africa/Casablanca'
$function$
;
CREATE OR REPLACE FUNCTION public.cert_candidates()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not is_crm_staff(auth.uid()) then return null; end if;

  return (
  with active as (
    select s.id, s.full_name, s.verification_token as token, s.avatar_url
    from crm_students s
    where s.deleted_at is null and s.is_active and s.verification_token is not null
  ),
  cp as (
    select e.student_id, c.id as course_id, c.title,
           count(l.id) as total,
           count(lp.id) filter (where lp.status = 'completed') as done
    from lms_enrollments e
    join lms_courses c on c.id = e.course_id
    join lms_modules m on m.course_id = c.id
    join lms_lessons l on l.module_id = m.id
    left join lms_lesson_progress lp on lp.lesson_id = l.id and lp.student_id = e.student_id
    group by e.student_id, c.id, c.title
  ),
  ready as (
    select cp.student_id, '🎓 إتمام دورة ' || cp.title as label
    from cp
    where cp.total > 0 and cp.done = cp.total
      and not exists (select 1 from student_certificates sc
        where sc.student_id = cp.student_id and sc.kind = 'course_complete' and sc.course_id = cp.course_id)
  ),
  ready_g as (
    select r.student_id, jsonb_agg(r.label order by r.label) as items, count(*)::int as n
    from ready r group by r.student_id
  ),
  close_g as (
    select distinct on (cp.student_id) cp.student_id, cp.title,
           round(cp.done::numeric / nullif(cp.total, 0) * 100)::int as pct
    from cp
    where cp.total > 0 and cp.done < cp.total
      and round(cp.done::numeric / nullif(cp.total, 0) * 100) >= 75
    order by cp.student_id, round(cp.done::numeric / nullif(cp.total, 0) * 100) desc
  )
  select jsonb_build_object(
    'ready', coalesce((
      select jsonb_agg(jsonb_build_object(
        'student_id', a.id, 'name', a.full_name, 'token', a.token, 'avatar_url', a.avatar_url,
        'items', g.items, 'count', g.n) order by g.n desc, a.full_name)
      from ready_g g join active a on a.id = g.student_id), '[]'::jsonb),
    'close', coalesce((
      select jsonb_agg(jsonb_build_object(
        'student_id', a.id, 'name', a.full_name, 'avatar_url', a.avatar_url,
        'course', g.title, 'pct', g.pct) order by g.pct desc)
      from close_g g join active a on a.id = g.student_id
      where not exists (select 1 from ready_g rg where rg.student_id = g.student_id)), '[]'::jsonb),
    'recent', coalesce((
      select jsonb_agg(x.obj order by x.created_at desc) from (
        select jsonb_build_object(
          'student_id', sc.student_id, 'name', s.full_name, 'avatar_url', s.avatar_url,
          'serial', sc.serial, 'title', sc.title, 'date', to_char(sc.created_at, 'YYYY-MM-DD')) as obj,
          sc.created_at
        from student_certificates sc
        join crm_students s on s.id = sc.student_id and s.deleted_at is null
        where sc.created_at > now() - interval '30 days'
        order by sc.created_at desc limit 24) x), '[]'::jsonb),
    'counts', jsonb_build_object(
      'ready',  (select count(*) from ready_g),
      'close',  (select count(*) from close_g cg where not exists (select 1 from ready_g rg where rg.student_id = cg.student_id)),
      'recent', (select count(*) from student_certificates where created_at > now() - interval '30 days'))
  )
  );
end; $function$
;
CREATE OR REPLACE FUNCTION public.certificate_verify(p_serial text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce((
    select jsonb_build_object(
      'found', true, 'serial', sc.serial, 'kind', sc.kind, 'title', sc.title,
      'milestone', sc.milestone, 'student_name', s.full_name,
      'course_title', c.title, 'course_level', c.level,
      'date', to_char(sc.created_at, 'YYYY-MM-DD'))
    from student_certificates sc
    join crm_students s on s.id = sc.student_id
    left join lms_courses c on c.id = sc.course_id
    where sc.serial = upper(trim(p_serial)) and s.deleted_at is null
  ), jsonb_build_object('found', false));
$function$
;
CREATE OR REPLACE FUNCTION public.convert_lead_to_student(p_lead_id uuid, p_actor_id uuid DEFAULT auth.uid())
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_lead    record;
  v_student uuid;
begin
  select * into v_lead from public.subscription_leads where id = p_lead_id;
  if not found then raise exception 'Lead % not found', p_lead_id; end if;
  select id into v_student from public.crm_students where lead_id = p_lead_id;
  if v_student is not null then return v_student; end if;
  insert into public.crm_students
    (lead_id, full_name, phone_number, course, student_type, payment_status, added_by_id, country)
  values
    (p_lead_id, v_lead.full_name, v_lead.phone, coalesce(v_lead.course, v_lead.course_interested),
     case when v_lead.lead_type = 'private_class' then 'private_student' else 'course_student' end,
     'paid', p_actor_id, v_lead.country)
  returning id into v_student;
  insert into public.crm_lead_events (lead_id, actor_id, actor_email, event_type, title)
  values (p_lead_id, p_actor_id,
    (select email from public.profiles where id = p_actor_id),
    'converted_to_student', 'Lead converted to student');
  return v_student;
end; $function$
;
CREATE OR REPLACE FUNCTION public.course_catalog()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'title', c.title, 'level', c.level, 'description', c.description,
    'units', (select count(*) from lms_modules m where m.course_id = c.id)
  ) order by c.level nulls last, c.created_at), '[]'::jsonb)
  from lms_courses c
  where coalesce(c.is_published, false) = true;
$function$
;
CREATE OR REPLACE FUNCTION public.crm_dues()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v jsonb;
begin
  if not is_crm_staff(auth.uid()) then return null; end if;
  select jsonb_build_object(
    'installments', coalesce((
      select jsonb_agg(jsonb_build_object(
        'payment_id', p.id, 'student_id', s.id, 'name', s.full_name, 'phone', s.phone_number,
        'avatar_url', s.avatar_url, 'course', s.course, 'amount', p.amount_mad,
        'due_date', p.due_date, 'days', (p.due_date - current_date),
        'installment_no', p.installment_no, 'installment_count', p.installment_count,
        'reminded_at', p.reminder_sent_at) order by p.due_date asc)
      from crm_payments p
      join crm_students s on s.id = p.student_id
      where p.payment_status = 'pending' and p.due_date is not null
        and s.deleted_at is null and coalesce(p.excluded_from_revenue, false) = false), '[]'::jsonb),
    'monthly', coalesce((
      select jsonb_agg(jsonb_build_object(
        'student_id', s.id, 'name', s.full_name, 'phone', s.phone_number, 'avatar_url', s.avatar_url,
        'course', s.course, 'amount', s.monthly_fee_mad, 'due_date', s.next_payment_date,
        'days', (s.next_payment_date - current_date), 'reminded_at', s.payment_reminder_at) order by s.next_payment_date asc)
      from crm_students s
      where s.deleted_at is null and s.is_active
        and (s.billing_type = 'monthly' or s.student_type = 'private_student')
        and s.monthly_fee_mad is not null and s.next_payment_date is not null
        and s.next_payment_date <= current_date + 14), '[]'::jsonb),
    'totals', jsonb_build_object(
      'outstanding', (select coalesce(sum(p.amount_mad), 0) from crm_payments p join crm_students s on s.id = p.student_id
         where p.payment_status = 'pending' and s.deleted_at is null and coalesce(p.excluded_from_revenue, false) = false),
      'overdue', (select coalesce(sum(p.amount_mad), 0) from crm_payments p join crm_students s on s.id = p.student_id
         where p.payment_status = 'pending' and p.due_date < current_date and s.deleted_at is null and coalesce(p.excluded_from_revenue, false) = false),
      'due_7d', (select coalesce(sum(p.amount_mad), 0) from crm_payments p join crm_students s on s.id = p.student_id
         where p.payment_status = 'pending' and p.due_date between current_date and current_date + 7
           and s.deleted_at is null and coalesce(p.excluded_from_revenue, false) = false),
      'monthly_mrr', (select coalesce(sum(monthly_fee_mad), 0) from crm_students
         where deleted_at is null and is_active and (billing_type = 'monthly' or student_type = 'private_student') and monthly_fee_mad is not null),
      'monthly_overdue_n', (select count(*) from crm_students
         where deleted_at is null and is_active and (billing_type = 'monthly' or student_type = 'private_student')
           and next_payment_date is not null and next_payment_date < current_date),
      'collected_month', revenue_between(date_trunc('month', now()), now() + interval '1 sec'))
  ) into v;
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public.crm_student_autopayment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if coalesce(NEW.enrollment_type, 'paid') = 'paid'
     and coalesce(NEW.total_paid_mad, 0) > 0
     and not exists (select 1 from crm_payments p where p.student_id = NEW.id and p.payment_status = 'paid' and p.amount_mad > 0)
  then
    insert into crm_payments (
      student_id, payment_type, course_or_service, amount_mad, payment_status,
      payment_date, payment_method, notes, added_by_id, approved_by_id, approved_at
    ) values (
      NEW.id,
      case when NEW.student_type = 'private_student' then 'private_monthly' else 'course_one_time' end,
      NEW.course, NEW.total_paid_mad, 'paid',
      coalesce(NEW.enrollment_date, current_date),
      'cash', 'تسجيل مباشر (auto)',
      NEW.added_by_id, NEW.added_by_id, now()
    );
  end if;
  return NEW;
end; $function$
;
CREATE OR REPLACE FUNCTION public.guard_teacher_profile_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.is_crm_staff(auth.uid()) then
    return new;                                    -- founder/assistant may set pay
  end if;
  if coalesce(current_setting('app.rating_refresh', true), '') <> 'on' then
    new.rating_avg   := old.rating_avg;
    new.rating_count := old.rating_count;
  end if;
  new.pay_model       := old.pay_model;
  new.hourly_rate_mad := old.hourly_rate_mad;
  new.hired_at        := old.hired_at;
  new.is_active       := old.is_active;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$function$
;
CREATE OR REPLACE FUNCTION public.is_crm_staff(uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select exists(
    select 1 from public.profiles
    where id = uid and role in ('founder', 'assistant')
  )
$function$
;
CREATE OR REPLACE FUNCTION public.is_founder(uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select exists(
    select 1 from public.profiles
    where id = uid and role = 'founder'
  )
$function$
;
CREATE OR REPLACE FUNCTION public.is_teacher(uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists(
    select 1 from public.profiles
    where id = uid and role::text = 'teacher'
  )
$function$
;
CREATE OR REPLACE FUNCTION public.log_absence_to_crm()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_student  record;
  v_session  record;
  v_teacher  text;
begin
  -- Only the transition into 'absent' is interesting.
  if new.status <> 'absent' then return null; end if;
  if tg_op = 'UPDATE' and old.status = 'absent' then return null; end if;

  select s.full_name, s.phone_number into v_student
    from public.crm_students s where s.id = new.student_id;

  select cs.title, cs.starts_at, cs.teacher_id into v_session
    from public.class_sessions cs where cs.id = new.session_id;

  select coalesce(tp.display_name, p.full_name, p.email) into v_teacher
    from public.profiles p
    left join public.teacher_profiles tp on tp.id = p.id
   where p.id = v_session.teacher_id;

  insert into public.crm_activity_log
    (actor_id, actor_email, actor_role, action, entity_type, entity_id, metadata)
  values (
    new.marked_by,
    (select email from public.profiles where id = new.marked_by),
    'teacher',
    'student_absent',
    'student',
    new.student_id,
    jsonb_build_object(
      'student_name', v_student.full_name,
      'class_title',  v_session.title,
      'class_at',     v_session.starts_at,
      'teacher',      v_teacher,
      'note',         new.note
    )
  );
  return null;
end $function$
;
CREATE OR REPLACE FUNCTION public.log_crm_activity(p_action text, p_entity_type text, p_entity_id uuid, p_before jsonb DEFAULT NULL::jsonb, p_after jsonb DEFAULT NULL::jsonb, p_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_role  text;
  v_id    uuid;
begin
  if v_actor is null then
    raise exception 'log_crm_activity requires an authenticated caller';
  end if;
  select email, role::text into v_email, v_role
    from public.profiles where id = v_actor;
  insert into public.crm_activity_log
    (actor_id, actor_email, actor_role, action, entity_type, entity_id,
     before_value, after_value, metadata)
  values
    (v_actor, v_email, v_role, p_action, p_entity_type, p_entity_id,
     p_before, p_after, p_metadata)
  returning id into v_id;
  return v_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.log_lead_event(p_lead_id uuid, p_event_type text, p_title text, p_body text DEFAULT NULL::text, p_before jsonb DEFAULT NULL::jsonb, p_after jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_id    uuid;
begin
  select email into v_email from public.profiles where id = v_actor;
  insert into public.crm_lead_events
    (lead_id, actor_id, actor_email, event_type, title, body, before_value, after_value)
  values (p_lead_id, v_actor, v_email, p_event_type, p_title, p_body, p_before, p_after)
  returning id into v_id;
  return v_id;
end; $function$
;
CREATE OR REPLACE FUNCTION public.module_has_exam(p_module uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(jsonb_array_length(exam_quiz->'questions'), 0) > 0 from lms_modules where id = p_module
$function$
;
CREATE OR REPLACE FUNCTION public.owner_alerts()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v jsonb; v_inactive7 int; v_backlog int; v_rev_this numeric; v_rev_prev numeric; v_pending_claims int;
begin
  if not is_founder(auth.uid()) then return '[]'::jsonb; end if;
  select count(*) into v_inactive7 from crm_students s where s.deleted_at is null and s.is_active
    and not exists (select 1 from student_activity a where a.student_id = s.id and a.created_at > now() - interval '7 days');
  select count(*) into v_backlog from subscription_leads l where l.next_followup_at is not null and l.next_followup_at < now()
    and l.status not in ('confirmed','converted','paid','rejected','cancelled');
  v_rev_this := revenue_between(casa_now_trunc('month'), now() + interval '1 sec');
  v_rev_prev := revenue_between(casa_now_trunc('month') - interval '1 month', casa_now_trunc('month'));
  select count(*) into v_pending_claims from reward_claims where status = 'pending';
  select jsonb_agg(a) into v from (
    select * from (values
      ('warn',   '⏰ ' || v_inactive7 || ' طالب غير نشط منذ 7 أيام أو أكثر', v_inactive7 > 0),
      ('warn',   '📞 ' || v_backlog || ' متابعة متأخرة لدى الفريق', v_backlog > 0),
      ('danger', '📉 إيراد هذا الشهر أقل من الشهر الماضي (' || round(v_rev_this) || ' مقابل ' || round(v_rev_prev) || ' درهم)', v_rev_prev > 0 and v_rev_this < v_rev_prev),
      ('info',   '🎁 ' || v_pending_claims || ' طلب مكافأة بانتظار الموافقة', v_pending_claims > 0)
    ) x(level, text, show) where show
  ) a;
  return coalesce(v, '[]'::jsonb);
end; $function$
;
CREATE OR REPLACE FUNCTION public.owner_courses()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v jsonb;
begin
  if not is_founder(auth.uid()) then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(row_to_json(t) order by t.students desc), '[]'::jsonb) into v from (
    select c.id, c.title,
      (select count(*) from lms_enrollments e where e.course_id = c.id) as students,
      (select count(*) from lms_lessons l join lms_modules m on m.id = l.module_id where m.course_id = c.id) as lessons,
      (select count(distinct a.student_id) from student_activity a where a.created_at > now() - interval '14 days'
        and a.student_id in (select student_id from lms_enrollments e where e.course_id = c.id)) as active_14d
    from lms_courses c
  ) t;
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public.owner_learning_intel()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v jsonb;
begin
  if not is_founder(auth.uid()) then return null; end if;
  with base as (
    select s.id, s.full_name, s.avatar_url from crm_students s where s.deleted_at is null and s.is_active
  ),
  prog as (
    select e.student_id,
           count(l.id) as total,
           count(lp.id) filter (where lp.status = 'completed') as done
    from lms_enrollments e
    join lms_modules m on m.course_id = e.course_id
    join lms_lessons l on l.module_id = m.id
    left join lms_lesson_progress lp on lp.lesson_id = l.id and lp.student_id = e.student_id
    group by e.student_id
  ),
  week as (
    select student_id,
           count(*) filter (where event_type = 'completed_lesson') as lessons_7d,
           count(*) filter (where event_type in ('completed_quiz', 'completed_reading_quiz')) as quizzes_7d,
           count(*) filter (where event_type = 'passed_unit_exam') as exams_7d
    from student_activity
    where created_at > now() - interval '7 days' and student_id is not null
    group by student_id
  ),
  scores as (
    select student_id,
           round(avg(pct)) as avg_pct, count(*) as attempts
    from (
      select student_id, score::numeric / nullif(total, 0) * 100 as pct, created_at from lms_quiz_results where total > 0
      union all
      select student_id, score::numeric / nullif(total, 0) * 100, created_at from lms_unit_exam_results where total > 0
    ) q
    where created_at > now() - interval '30 days'
    group by student_id
  ),
  fails as (
    select student_id, count(*) as n from lms_unit_exam_results
    where passed = false and created_at > now() - interval '14 days'
    group by student_id
  ),
  last_act as (
    select student_id, max(created_at) as last_at from student_activity where student_id is not null group by student_id
  ),
  full_view as (
    select b.id, b.full_name, b.avatar_url,
           coalesce(p.total, 0) as total, coalesce(p.done, 0) as done,
           case when coalesce(p.total, 0) > 0 then round(p.done::numeric / p.total * 100) else null end as progress,
           coalesce(w.lessons_7d, 0) as lessons_7d, coalesce(w.quizzes_7d, 0) as quizzes_7d, coalesce(w.exams_7d, 0) as exams_7d,
           s.avg_pct, coalesce(s.attempts, 0) as attempts, coalesce(f.n, 0) as fails,
           case when la.last_at is null then 999 else extract(day from now() - la.last_at)::int end as days_inactive
    from base b
    left join prog p on p.student_id = b.id
    left join week w on w.student_id = b.id
    left join scores s on s.student_id = b.id
    left join fails f on f.student_id = b.id
    left join last_act la on la.student_id = b.id
  )
  select jsonb_build_object(
    'progressing', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'name', full_name, 'avatar_url', avatar_url, 'lessons_7d', lessons_7d,
        'quizzes_7d', quizzes_7d, 'progress', progress, 'avg_score', avg_pct)
        order by lessons_7d + quizzes_7d + exams_7d desc)
      from (select * from full_view
            where lessons_7d + quizzes_7d + exams_7d > 0
            order by lessons_7d + quizzes_7d + exams_7d desc limit 10) t), '[]'::jsonb),
    'struggling', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'name', full_name, 'avatar_url', avatar_url, 'progress', progress,
        'avg_score', avg_pct, 'fails', fails, 'days_inactive', days_inactive,
        'reason', case
          when attempts >= 3 and avg_pct < 55 then 'معدل النقاط منخفض (' || avg_pct || '%)'
          when fails >= 2 then 'رسب في امتحان الوحدة ' || fails || ' مرات'
          else 'تقدّم متوقف (' || coalesce(progress, 0) || '%) وخمول ' || days_inactive || ' أيام' end)
        order by (case when attempts >= 3 and avg_pct < 55 then 0 when fails >= 2 then 1 else 2 end), days_inactive desc)
      from (select * from full_view
            where (attempts >= 3 and avg_pct < 55)
               or fails >= 2
               or (total > 0 and coalesce(progress, 0) < 25 and days_inactive between 5 and 60)
            limit 15) t), '[]'::jsonb)
  ) into v;
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public.owner_live_pulse()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v jsonb;
begin
  if not is_founder(auth.uid()) then return null; end if;
  select jsonb_build_object(
    'online_now', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'name', s.full_name, 'avatar_url', s.avatar_url,
        'activity', p.activity, 'course', c.title,
        'minutes', greatest(0, extract(epoch from now() - p.last_seen_at)::int / 60)) order by p.last_seen_at desc)
      from student_presence p
      join crm_students s on s.id = p.student_id and s.deleted_at is null
      left join lms_courses c on c.id = p.course_id
      where p.last_seen_at > now() - interval '5 minutes'), '[]'::jsonb),
    'online_count', (select count(*) from student_presence where last_seen_at > now() - interval '5 minutes'),
    'active_today', (select count(distinct student_id) from student_activity where created_at >= date_trunc('day', now()) and student_id is not null),
    'active_week',  (select count(distinct student_id) from student_activity where created_at > now() - interval '7 days' and student_id is not null),
    'lessons_today', (select count(*) from student_activity where event_type = 'completed_lesson' and created_at >= date_trunc('day', now())),
    'quizzes_today', (select count(*) from student_activity where event_type in ('completed_quiz', 'completed_reading_quiz') and created_at >= date_trunc('day', now())),
    'exams_passed_today', (select count(*) from student_activity where event_type = 'passed_unit_exam' and created_at >= date_trunc('day', now())),
    'challenges_today', (select count(*) from student_activity where event_type = 'completed_challenge' and created_at >= date_trunc('day', now())),
    'coins_today', (select coalesce(sum(coins_amount), 0) from coin_transactions where coins_amount > 0 and created_at >= date_trunc('day', now())),
    'avg_score_7d', (select coalesce(round(avg(score::numeric / nullif(total, 0)) * 100), 0) from (
        select score, total, created_at from lms_quiz_results
        union all select score, total, created_at from lms_unit_exam_results) q
      where created_at > now() - interval '7 days' and total > 0),
    'certs_week', (select count(*) from student_certificates where created_at > now() - interval '7 days'),
    'recent_events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', s.full_name, 'event', a.event_type, 'title', a.entity_title,
        'at', to_char(a.created_at, 'HH24:MI')) order by a.created_at desc)
      from (select * from student_activity where created_at >= date_trunc('day', now()) and student_id is not null
            order by created_at desc limit 12) a
      join crm_students s on s.id = a.student_id), '[]'::jsonb)
  ) into v;
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public.owner_overview()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v jsonb; v_rev_total numeric; v_paying int;
begin
  if not is_founder(auth.uid()) then return null; end if;
  select coalesce(sum(amount_mad),0) into v_rev_total from crm_payments where payment_status='paid' and amount_mad>0 and coalesce(excluded_from_revenue,false)=false;
  select count(distinct student_id) into v_paying from crm_payments where payment_status='paid' and amount_mad>0 and coalesce(excluded_from_revenue,false)=false and student_id is not null;
  select jsonb_build_object(
    'rev_today', revenue_between(casa_now_trunc('day'),   now() + interval '1 sec'),
    'rev_week',  revenue_between(casa_now_trunc('week'),  now() + interval '1 sec'),
    'rev_month', revenue_between(casa_now_trunc('month'), now() + interval '1 sec'),
    'rev_year',  revenue_between(casa_now_trunc('year'),  now() + interval '1 sec'),
    'rev_total', v_rev_total,
    'paying_students', v_paying,
    'arpu', case when v_paying > 0 then round(v_rev_total / v_paying) else 0 end,
    'new_leads_today', (select count(*) from subscription_leads where created_at >= casa_now_trunc('day')),
    'new_students_today', (select count(*) from crm_students where deleted_at is null and created_at >= casa_now_trunc('day')),
    'total_leads', (select count(*) from subscription_leads),
    'total_students', (select count(*) from crm_students where deleted_at is null),
    'active_students', (select count(*) from crm_students where deleted_at is null and is_active),
    'inactive_students', (select count(*) from crm_students where deleted_at is null and not is_active),
    'at_risk', (select count(*) from crm_students s where s.deleted_at is null and s.is_active
                 and not exists (select 1 from student_activity a where a.student_id = s.id and a.created_at > now() - interval '7 days')),
    'conversion_rate', case when (select count(*) from subscription_leads) > 0
        then round(v_paying::numeric / (select count(*) from subscription_leads) * 100, 1) else 0 end,
    'enroll', (select coalesce(jsonb_object_agg(et, c), '{}'::jsonb) from (select coalesce(enrollment_type,'paid') et, count(*) c from crm_students where deleted_at is null group by 1) t),
    'rewards', jsonb_build_object(
      'coins_distributed', (select coalesce(sum(coins_amount),0) from coin_transactions where coins_amount > 0),
      'coins_spent', (select coalesce(abs(sum(coins_amount)),0) from coin_transactions where coins_amount < 0),
      'claims_total', (select count(*) from reward_claims),
      'claims_pending', (select count(*) from reward_claims where status = 'pending')),
    'top_course', (select jsonb_build_object('title', c.title, 'students', e.cnt)
       from (select course_id, count(*) cnt from lms_enrollments group by course_id order by cnt desc limit 1) e
       join lms_courses c on c.id = e.course_id),
    'worst_course', (select jsonb_build_object('title', c.title, 'students', e.cnt)
       from (select course_id, count(*) cnt from lms_enrollments group by course_id order by cnt asc limit 1) e
       join lms_courses c on c.id = e.course_id)
  ) into v;
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public.owner_revenue_trend()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v jsonb;
begin
  if not is_founder(auth.uid()) then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object('month', to_char(m at time zone 'Africa/Casablanca', 'YYYY-MM'),
      'mad', revenue_between(m, m + interval '1 month')) order by m), '[]'::jsonb) into v
  from generate_series(casa_now_trunc('month') - interval '5 months', casa_now_trunc('month'), interval '1 month') m;
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public.owner_students()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
end; $function$
;
CREATE OR REPLACE FUNCTION public.owner_team()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v jsonb;
begin
  if not is_founder(auth.uid()) then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(row_to_json(t) order by t.revenue desc), '[]'::jsonb) into v from (
    select
      p.id, coalesce(nullif(p.full_name,''), p.email, 'مساعد') as name,
      (select count(*) from subscription_leads l where l.assigned_to_id = p.id) as leads_handled,
      (select count(*) from subscription_leads l where l.assigned_to_id = p.id and l.status in ('confirmed','converted','paid')) as confirmed,
      (select count(*) from crm_students s where s.added_by_id = p.id and s.deleted_at is null) as students_added,
      (select count(distinct cp.student_id) from crm_payments cp join crm_students s on s.id = cp.student_id
         where s.added_by_id = p.id and cp.payment_status='paid' and cp.amount_mad>0 and coalesce(cp.excluded_from_revenue,false)=false) as paid_students,
      (select coalesce(sum(cp.amount_mad),0) from crm_payments cp join crm_students s on s.id = cp.student_id
         where s.added_by_id = p.id and cp.payment_status='paid' and cp.amount_mad>0 and coalesce(cp.excluded_from_revenue,false)=false) as revenue,
      (select count(*) from subscription_leads l where l.assigned_to_id = p.id and l.next_followup_at is not null and l.next_followup_at < now()
         and l.status not in ('confirmed','converted','paid','rejected','cancelled')) as followups_overdue
    from profiles p where p.role = 'assistant'
  ) t;
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public.refresh_teacher_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_teacher uuid;
begin
  v_teacher := coalesce(new.teacher_id, old.teacher_id);
  -- Tell guard_teacher_profile_fields() this write is the legitimate one.
  perform set_config('app.rating_refresh', 'on', true);
  update public.teacher_profiles p
     set rating_avg = coalesce((
           select round(avg(r.rating)::numeric, 2) from public.teacher_reviews r
           where r.teacher_id = v_teacher and r.is_published = true), 0),
         rating_count = (
           select count(*) from public.teacher_reviews r
           where r.teacher_id = v_teacher and r.is_published = true)
   where p.id = v_teacher;
  perform set_config('app.rating_refresh', 'off', true);
  return null;
end $function$
;
CREATE OR REPLACE FUNCTION public.revenue_between(p_from timestamp with time zone, p_to timestamp with time zone)
 RETURNS numeric
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(sum(amount_mad), 0)
  from crm_payments
  where payment_status = 'paid' and amount_mad > 0 and coalesce(excluded_from_revenue, false) = false
    and coalesce(payment_date::timestamptz, created_at) >= p_from
    and coalesce(payment_date::timestamptz, created_at) <  p_to
$function$
;
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin new.updated_at = now(); return new; end;
$function$
;
CREATE OR REPLACE FUNCTION public.set_updated_at_course_meta()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin new.updated_at = now(); return new; end;
$function$
;
CREATE OR REPLACE FUNCTION public.set_updated_at_support_threads()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin new.updated_at = now(); return new; end;
$function$
;
CREATE OR REPLACE FUNCTION public.set_updated_at_teachers()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.student_absence_summary(p_days integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select case when not public.is_crm_staff(auth.uid()) then '[]'::jsonb
    else coalesce(jsonb_agg(row_to_json(t) order by (t.absences)::int desc), '[]'::jsonb) end
  from (
    select
      s.id                                                            as student_id,
      s.full_name,
      s.phone_number,
      s.course,
      count(*) filter (where a.status = 'absent')                     as absences,
      count(*)                                                        as sessions,
      round(100.0 * count(*) filter (where a.status in ('present','late'))
            / nullif(count(*), 0))                                    as attendance_rate,
      max(cs.starts_at) filter (where a.status = 'absent')             as last_absence,
      coalesce(tp.display_name, p.full_name, p.email)                  as teacher
    from public.class_attendance a
    join public.class_sessions  cs on cs.id = a.session_id
    join public.crm_students     s on s.id  = a.student_id
    left join public.profiles          p  on p.id  = cs.teacher_id
    left join public.teacher_profiles tp on tp.id = cs.teacher_id
    where cs.starts_at >= now() - make_interval(days => p_days)
      and s.deleted_at is null
    group by s.id, s.full_name, s.phone_number, s.course, tp.display_name, p.full_name, p.email
    having count(*) filter (where a.status = 'absent') > 0
  ) t
$function$
;
CREATE OR REPLACE FUNCTION public.student_announcements(p_token text)
 RETURNS TABLE(id uuid, title text, body text, type text, severity text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
#variable_conflict use_column
declare v_id uuid;
begin
  select c.id into v_id from crm_students c where c.verification_token = upper(trim(p_token)) and c.deleted_at is null and c.is_active = true;
  if v_id is null then return; end if;
  return query
    select a.id, a.title, a.body, a.type, a.severity, a.created_at
    from announcements a
    where a.is_active
      and (a.starts_at is null or a.starts_at <= now())
      and (a.ends_at is null or a.ends_at >= now())
      and (
        a.audience = 'all'
        or (a.audience = 'course' and a.course_id in (select e.course_id from lms_enrollments e where e.student_id = v_id))
        or (a.audience = 'students' and exists (select 1 from announcement_targets t where t.announcement_id = a.id and t.student_id = v_id))
      )
    order by a.created_at desc limit 20;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_avatar(p_token text)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select avatar_url from crm_students
  where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
$function$
;
CREATE OR REPLACE FUNCTION public.student_can_access_lesson(p_student uuid, p_lesson uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_module uuid; v_order int; v_course uuid; v_lorder int; v_minorder int;
  v_prev uuid; v_prev_total int; v_prev_done int; v_prev_reviewed boolean; v_started boolean; v_exam_ok boolean;
begin
  if exists (select 1 from lms_lesson_progress
             where student_id = p_student and lesson_id = p_lesson and status = 'completed') then
    return true;
  end if;
  select l.module_id, l.lesson_order, m.module_order, m.course_id
    into v_module, v_lorder, v_order, v_course
  from lms_lessons l join lms_modules m on m.id = l.module_id
  where l.id = p_lesson;
  if v_module is null then return true; end if;

  -- within the unit: every earlier lesson must be completed first
  if exists (
    select 1 from lms_lessons l2
    where l2.module_id = v_module and l2.lesson_order < v_lorder
      and not exists (select 1 from lms_lesson_progress lp
                      where lp.student_id = p_student and lp.lesson_id = l2.id and lp.status = 'completed')
  ) then return false; end if;

  -- only the first lesson of the unit needs the previous-unit gate
  select min(lesson_order) into v_minorder from lms_lessons where module_id = v_module;
  if v_lorder > v_minorder then return true; end if;
  if v_order <= (select min(module_order) from lms_modules where course_id = v_course) then return true; end if;

  select exists (
    select 1 from lms_lesson_progress lp join lms_lessons l on l.id = lp.lesson_id
    where lp.student_id = p_student and l.module_id = v_module and lp.status = 'completed'
  ) into v_started;
  if v_started then return true; end if;

  select id into v_prev from lms_modules
   where course_id = v_course and module_order < v_order
   order by module_order desc limit 1;
  if v_prev is null then return true; end if;
  select count(*) into v_prev_total from lms_lessons where module_id = v_prev;
  select count(*) into v_prev_done
    from lms_lesson_progress lp join lms_lessons l on l.id = lp.lesson_id
   where lp.student_id = p_student and l.module_id = v_prev and lp.status = 'completed';
  if v_prev_total = 0 or v_prev_done < v_prev_total then return false; end if;
  if module_has_exam(v_prev) then
    select exists(select 1 from lms_unit_exam_results where student_id = p_student and module_id = v_prev and passed) into v_exam_ok;
    if not v_exam_ok then return false; end if;
  end if;
  select exists (
    select 1 from lms_submissions
    where student_id = p_student and module_id = v_prev and status = 'reviewed'
  ) into v_prev_reviewed;
  return v_prev_reviewed;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_certificate(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v_name text; v_row record;
begin
  select id, full_name into v_id, v_name from crm_students
    where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return null; end if;
  select cert_number, percent, level, created_at into v_row
    from lms_certificates where student_id = v_id and passed order by created_at desc limit 1;
  if v_row is null then return null; end if;
  return jsonb_build_object('cert_number', v_row.cert_number, 'percent', v_row.percent, 'level', v_row.level,
    'full_name', v_name, 'date', to_char(v_row.created_at, 'YYYY-MM-DD'));
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_challenges(p_token text, p_type text, p_mode text, p_scope text, p_module uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 8)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v jsonb; v_level text; v_levels text[]; v_use boolean;
begin
  select id, coalesce(nullif(current_level,''),'A0') into v_id, v_level
  from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return '[]'::jsonb; end if;
  -- level-appropriate pool (cumulative, so beginners stay in easy territory)
  v_levels := case v_level
    when 'A0' then array['A0']
    when 'A1' then array['A0','A1']
    when 'A2' then array['A0','A1','A2']
    else array['A0','A1','A2','B1'] end;

  if p_type = 'translation' then
    v_use := (p_scope = 'lesson' and p_module is not null
              and exists(select 1 from translation_challenges where module_id = p_module and is_active));
    select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'mode', 'translate', 'arabic', x.arabic, 'choices', x.choices)), '[]'::jsonb) into v
    from (select * from translation_challenges c
          where c.is_active and c.level = any(v_levels) and (not v_use or c.module_id = p_module)
          order by random() limit greatest(1, least(p_limit, 20))) x;
  else
    v_use := (p_scope = 'lesson' and p_module is not null
              and exists(select 1 from sentence_challenges where module_id = p_module and is_active));
    select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'mode', p_mode, 'arabic', x.arabic,
      'words', case when p_mode = 'arrange' then (select jsonb_agg(w order by random()) from regexp_split_to_table(x.english, '\s+') w) else null end)), '[]'::jsonb) into v
    from (select * from sentence_challenges c
          where c.is_active and c.level = any(v_levels) and (not v_use or c.module_id = p_module)
          order by random() limit greatest(1, least(p_limit, 20))) x;
  end if;
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_check_certificates(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_id uuid; v_name text; v_new text[] := '{}';
  r record; v_serial text;
begin
  select id, full_name into v_id, v_name from crm_students
    where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return jsonb_build_object('found', false); end if;

  for r in
    select c.id as course_id, c.title,
           count(l.id) as total,
           count(lp.id) filter (where lp.status = 'completed') as done
    from lms_enrollments e
    join lms_courses c on c.id = e.course_id
    join lms_modules m2 on m2.course_id = c.id
    join lms_lessons l on l.module_id = m2.id
    left join lms_lesson_progress lp on lp.lesson_id = l.id and lp.student_id = v_id
    where e.student_id = v_id
    group by c.id, c.title
    having count(l.id) > 0 and count(l.id) = count(lp.id) filter (where lp.status = 'completed')
  loop
    v_serial := public._award_certificate(v_id, 'course_complete', r.course_id, null,
      'شهادة إتمام دورة ' || r.title, jsonb_build_object('lessons', r.total));
    if v_serial is not null then v_new := v_new || v_serial; end if;
  end loop;

  return jsonb_build_object(
    'found', true,
    'new', to_jsonb(v_new),
    'certs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'serial', sc.serial, 'kind', sc.kind, 'title', sc.title, 'milestone', sc.milestone,
        'course_title', c.title, 'date', to_char(sc.created_at, 'YYYY-MM-DD')) order by sc.created_at desc)
      from student_certificates sc left join lms_courses c on c.id = sc.course_id
      where sc.student_id = v_id), '[]'::jsonb)
  );
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_claim_reward(p_token text, p_reward_id uuid, p_course uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_coins(p_token text, p_course uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_complete_exercise(p_token text, p_assignment_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_id UUID; v_title TEXT;
BEGIN
  SELECT id INTO v_id FROM crm_students WHERE verification_token = UPPER(TRIM(p_token)) AND deleted_at IS NULL;
  IF v_id IS NULL THEN RETURN FALSE; END IF;
  UPDATE student_assignments SET status='done', is_done=TRUE, completed_at=NOW()
   WHERE id = p_assignment_id AND student_id = v_id
   RETURNING title INTO v_title;
  IF v_title IS NULL THEN RETURN FALSE; END IF;
  INSERT INTO student_activity (student_id, event_type, entity_type, entity_id, entity_title)
  VALUES (v_id, 'completed_exercise', 'exercise', p_assignment_id::TEXT, v_title);
  RETURN TRUE;
END; $function$
;
CREATE OR REPLACE FUNCTION public.student_complete_lesson(p_token text, p_lesson_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_id UUID; v_title TEXT; v_has_quiz boolean;
BEGIN
  SELECT id INTO v_id FROM crm_students WHERE verification_token = UPPER(TRIM(p_token)) AND deleted_at IS NULL;
  IF v_id IS NULL THEN RETURN FALSE; END IF;
  SELECT title, coalesce(jsonb_array_length(quiz->'questions'),0) > 0 INTO v_title, v_has_quiz FROM lms_lessons WHERE id = p_lesson_id;
  IF v_title IS NULL THEN RETURN FALSE; END IF;
  IF NOT student_can_access_lesson(v_id, p_lesson_id) THEN RETURN FALSE; END IF;
  -- forced test: a real-quiz lesson needs a passed result before it counts complete
  IF v_has_quiz AND NOT EXISTS (
       SELECT 1 FROM lms_quiz_results WHERE student_id = v_id AND lesson_id = p_lesson_id AND passed
  ) THEN RETURN FALSE; END IF;
  INSERT INTO lms_lesson_progress (student_id, lesson_id, status, completed_at)
  VALUES (v_id, p_lesson_id, 'completed', NOW())
  ON CONFLICT (student_id, lesson_id) DO UPDATE SET status = 'completed', completed_at = NOW();
  INSERT INTO student_activity (student_id, event_type, entity_type, entity_id, entity_title)
  VALUES (v_id, 'completed_lesson', 'lesson', p_lesson_id::TEXT, v_title);
  RETURN TRUE;
END; $function$
;
CREATE OR REPLACE FUNCTION public.student_course_progress(p_student uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_crm_staff(auth.uid()) THEN RETURN '[]'::jsonb; END IF;
  RETURN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'course_id', c.id, 'title', c.title, 'level', c.level,
      'total', t.total, 'done', COALESCE(d.done, 0),
      'progress', CASE WHEN t.total > 0 THEN round((COALESCE(d.done,0)::numeric / t.total) * 100) ELSE 0 END
    )), '[]'::jsonb)
    FROM lms_enrollments e
    JOIN lms_courses c ON c.id = e.course_id
    LEFT JOIN LATERAL (
      SELECT count(*) total FROM lms_lessons l JOIN lms_modules m ON m.id = l.module_id WHERE m.course_id = c.id
    ) t ON TRUE
    LEFT JOIN LATERAL (
      SELECT count(*) done FROM lms_lesson_progress lp JOIN lms_lessons l ON l.id = lp.lesson_id
      JOIN lms_modules m ON m.id = l.module_id
      WHERE m.course_id = c.id AND lp.student_id = p_student AND lp.status = 'completed'
    ) d ON TRUE
    WHERE e.student_id = p_student
  );
END; $function$
;
CREATE OR REPLACE FUNCTION public.student_device_valid(p_token text, p_device_id text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return false; end if;   -- still log out deactivated / removed students
  -- device limit cancelled: keep the session open on any device; just refresh last_seen if known
  update student_devices set last_seen = now() where student_id = v_id and device_id = p_device_id;
  return true;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_earn(p_token text, p_action text, p_lesson uuid DEFAULT NULL::uuid, p_module uuid DEFAULT NULL::uuid, p_course uuid DEFAULT NULL::uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v_amt int := 0; v_mod uuid; v_done int; v_total int; v_course uuid;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return 0; end if;
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
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_engagement()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_crm_staff(auth.uid()) THEN RETURN '[]'::jsonb; END IF;
  RETURN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'student_id', s.id, 'last_activity_at', la.last_at, 'activity_count', COALESCE(la.cnt, 0)
    )), '[]'::jsonb)
    FROM public.crm_students s
    LEFT JOIN (
      SELECT student_id, MAX(created_at) last_at, COUNT(*) cnt
      FROM public.student_activity WHERE student_id IS NOT NULL GROUP BY student_id
    ) la ON la.student_id = s.id
    WHERE s.deleted_at IS NULL
  );
END; $function$
;
CREATE OR REPLACE FUNCTION public.student_heartbeat(p_token text, p_activity text DEFAULT NULL::text, p_course uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid;
begin
  select id into v_id from crm_students
    where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return false; end if;
  insert into student_presence (student_id, last_seen_at, activity, course_id, updated_at)
  values (v_id, now(), left(p_activity, 120), p_course, now())
  on conflict (student_id) do update
    set last_seen_at = now(), activity = left(coalesce(p_activity, student_presence.activity), 120),
        course_id = coalesce(excluded.course_id, student_presence.course_id), updated_at = now();
  return true;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_leaderboard_weekly(p_token text, p_course uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_lesson_quiz(p_token text, p_lesson_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v_quiz jsonb; v_best int; v_total int;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return null; end if;
  select l.quiz into v_quiz
  from lms_lessons l
  join lms_modules m on m.id = l.module_id
  join lms_enrollments e on e.course_id = m.course_id and e.student_id = v_id
  where l.id = p_lesson_id
  limit 1;
  if v_quiz is null then return null; end if;
  select score, total into v_best, v_total from lms_quiz_results
    where student_id = v_id and lesson_id = p_lesson_id order by score desc, created_at desc limit 1;
  return jsonb_build_object('quiz', v_quiz, 'best_score', v_best, 'best_total', v_total);
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_log_activity(p_token text, p_event text, p_entity_type text DEFAULT NULL::text, p_entity_id text DEFAULT NULL::text, p_title text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_id UUID;
BEGIN
  SELECT id INTO v_id FROM crm_students WHERE verification_token = UPPER(TRIM(p_token)) AND deleted_at IS NULL;
  IF v_id IS NULL THEN RETURN FALSE; END IF;
  INSERT INTO student_activity (student_id, event_type, entity_type, entity_id, entity_title)
  VALUES (v_id, p_event, p_entity_type, p_entity_id, p_title);
  RETURN TRUE;
END; $function$
;
CREATE OR REPLACE FUNCTION public.student_login(p_token text, p_device_id text, p_label text, p_ua text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_my_teachers(p_token text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',           p.id,
    'display_name', coalesce(tp.display_name, p.full_name),
    'headline',     tp.headline,
    'bio',          tp.bio,
    'avatar_url',   tp.avatar_url,
    'specialties',  tp.specialties,
    'rating_avg',   tp.rating_avg,
    'rating_count', tp.rating_count,
    'my_rating',    (select r.rating from public.teacher_reviews r
                      where r.teacher_id = p.id and r.student_id = ts.student_id)
  )), '[]'::jsonb)
  from public.crm_students s
  join public.teacher_students ts on ts.student_id = s.id and ts.is_active = true
  join public.profiles p          on p.id = ts.teacher_id
  left join public.teacher_profiles tp on tp.id = p.id
  where s.verification_token = upper(trim(p_token))
    and s.deleted_at is null and s.is_active = true
$function$
;
CREATE OR REPLACE FUNCTION public.student_notifications_list(p_token text)
 RETURNS TABLE(id uuid, type text, title text, body text, tab text, is_read boolean, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid;
begin
  select c.id into v_id from crm_students c where c.verification_token = upper(trim(p_token)) and c.deleted_at is null;
  if v_id is null then return; end if;
  return query select n.id, n.type, n.title, n.body, n.tab, n.is_read, n.created_at
    from student_notifications n where n.student_id = v_id
    order by n.created_at desc limit 50;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_notifications_read(p_token text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v_n int;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return 0; end if;
  update student_notifications set is_read = true where student_id = v_id and is_read = false;
  get diagnostics v_n = row_count; return v_n;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_open_lesson(p_token text, p_lesson_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
END; $function$
;
CREATE OR REPLACE FUNCTION public.student_progress_meta(p_token text)
 RETURNS TABLE(course_id uuid, course_title text, start_at timestamp with time zone, end_at timestamp with time zone, days_per_unit integer, total_units integer, completed_units integer, current_unit_order integer, current_unit_title text, total_lessons integer, done_lessons integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
#variable_conflict use_column
declare v_id uuid; v_start timestamptz; v_end timestamptz;
begin
  select id, coalesce(subscription_start, enrollment_date, created_at), course_end_date
    into v_id, v_start, v_end
  from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return; end if;
  return query
  with enr as (
    select e.course_id as cid, coalesce(v_start, e.enrolled_at) as s_at, c.title as ctitle, coalesce(c.days_per_unit,7) as dpu
    from lms_enrollments e join lms_courses c on c.id = e.course_id
    where e.student_id = v_id
  ),
  mods as (
    select m.course_id as cid, m.module_order as ord, m.title as mtitle,
      (select count(*) from lms_lessons l where l.module_id = m.id) as lcount,
      (select count(*) from lms_lessons l
         join lms_lesson_progress p on p.lesson_id = l.id and p.student_id = v_id and p.status = 'completed'
       where l.module_id = m.id) as ldone
    from lms_modules m where m.course_id in (select enr.cid from enr)
  ),
  mods2 as (select mods.*, (lcount > 0 and ldone >= lcount) as unit_done from mods)
  select
    enr.cid, enr.ctitle, enr.s_at, v_end, enr.dpu,
    (select count(*) from mods2 where mods2.cid = enr.cid)::int,
    (select count(*) from mods2 where mods2.cid = enr.cid and unit_done)::int,
    coalesce((select min(ord) from mods2 where mods2.cid = enr.cid and not unit_done),
             (select max(ord) from mods2 where mods2.cid = enr.cid), 1)::int,
    coalesce((select mtitle from mods2 where mods2.cid = enr.cid and not unit_done order by ord limit 1), '')::text,
    (select coalesce(sum(lcount),0) from mods2 where mods2.cid = enr.cid)::int,
    (select coalesce(sum(ldone),0) from mods2 where mods2.cid = enr.cid)::int
  from enr order by enr.s_at limit 1;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_reading_units(p_token text)
 RETURNS SETOF uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return; end if;
  return query
    select m.id from lms_modules m
    join lms_enrollments e on e.course_id = m.course_id and e.student_id = v_id
    where m.reading_text is not null or m.reading_audio_url is not null or m.reading_video_url is not null;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_resources(p_token text)
 RETURNS TABLE(id uuid, title text, file_path text, file_type text, size_bytes bigint, course_title text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid;
begin
  select s.id into v_id from crm_students s where s.verification_token = upper(trim(p_token)) and s.deleted_at is null;
  if v_id is null then return; end if;
  return query
    select r.id, r.title, r.file_path, r.file_type, r.size_bytes, c.title
    from lms_resources r
    join lms_courses c on c.id = r.course_id
    join lms_enrollments e on e.course_id = r.course_id and e.student_id = v_id
    order by r.created_at desc;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_rewards_status(p_token text, p_course uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_space(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v public.crm_students;
  v_courses JSONB; v_ex JSONB; v_files JSONB; v_exams JSONB; v_recent JSONB;
  v_les_total INT; v_les_done INT; v_ex_total INT; v_ex_done INT;
  v_exam_total INT; v_exam_done INT; v_files_total INT; v_files_opened INT;
  v_overall INT; v_streak INT := 0; v_day DATE; v_last TIMESTAMPTZ;
BEGIN
  SELECT * INTO v FROM crm_students WHERE verification_token = UPPER(TRIM(p_token)) AND deleted_at IS NULL LIMIT 1;
  IF v.id IS NULL THEN RETURN jsonb_build_object('found', false); END IF;

  v_courses := public._lms_courses_for(v.id);

  SELECT count(*) INTO v_les_total
  FROM lms_lessons l JOIN lms_modules m ON m.id = l.module_id
  JOIN lms_enrollments e ON e.course_id = m.course_id AND e.student_id = v.id;
  SELECT count(*) INTO v_les_done
  FROM lms_lesson_progress lp JOIN lms_lessons l ON l.id = lp.lesson_id
  JOIN lms_modules m ON m.id = l.module_id
  JOIN lms_enrollments e ON e.course_id = m.course_id AND e.student_id = v.id
  WHERE lp.student_id = v.id AND lp.status = 'completed';

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', a.id, 'title', a.title, 'description', a.description, 'link_url', a.link_url,
    'status', a.status, 'category', a.category, 'due_date', a.due_date, 'completed_at', a.completed_at
  ) ORDER BY (a.status='done'), a.created_at DESC), '[]'::jsonb),
  count(*), count(*) FILTER (WHERE status='done')
  INTO v_ex, v_ex_total, v_ex_done FROM student_assignments a WHERE a.student_id = v.id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', f.id, 'file_name', f.file_name, 'file_path', f.file_path, 'file_type', f.file_type, 'created_at', f.created_at
  ) ORDER BY f.created_at DESC), '[]'::jsonb), count(*)
  INTO v_files, v_files_total FROM student_files f WHERE f.student_id = v.id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', e.id, 'title', e.title, 'level', e.level, 'exam_date', e.exam_date,
    'score', e.score, 'max_score', e.max_score, 'passed', e.passed, 'teacher_note', e.teacher_note, 'retry_allowed', e.retry_allowed
  ) ORDER BY e.exam_date DESC NULLS LAST), '[]'::jsonb),
  count(*), count(*) FILTER (WHERE score IS NOT NULL)
  INTO v_exams, v_exam_total, v_exam_done FROM student_exams e WHERE e.student_id = v.id;

  SELECT count(DISTINCT entity_id) FILTER (WHERE event_type='downloaded_file'), MAX(created_at)
  INTO v_files_opened, v_last FROM student_activity WHERE student_id = v.id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('event_type', event_type, 'entity_title', entity_title, 'created_at', created_at) ORDER BY created_at DESC), '[]'::jsonb)
  INTO v_recent FROM (SELECT event_type, entity_title, created_at FROM student_activity WHERE student_id = v.id ORDER BY created_at DESC LIMIT 15) r;

  v_overall := CASE WHEN (v_les_total + v_exam_total) > 0
    THEN round(((v_les_done + v_exam_done)::numeric / (v_les_total + v_exam_total)) * 100) ELSE 0 END;

  v_day := CURRENT_DATE;
  IF NOT EXISTS (SELECT 1 FROM student_activity WHERE student_id=v.id AND created_at::date = v_day)
     AND EXISTS (SELECT 1 FROM student_activity WHERE student_id=v.id AND created_at::date = v_day - 1)
  THEN v_day := CURRENT_DATE - 1; END IF;
  WHILE EXISTS (SELECT 1 FROM student_activity WHERE student_id=v.id AND created_at::date = v_day) LOOP
    v_streak := v_streak + 1; v_day := v_day - 1;
  END LOOP;

  RETURN jsonb_build_object(
    'found', true,
    'student', jsonb_build_object(
      'id', v.id, 'full_name', v.full_name, 'course', v.course, 'student_type', v.student_type,
      'teacher_name', v.teacher_name, 'is_active', v.is_active, 'verification_token', v.verification_token,
      'current_level', v.current_level, 'next_level', v.next_level, 'learning_stage', v.learning_stage,
      'admin_message', v.admin_message, 'next_task', v.next_task,
      'today_lesson_url', v.today_lesson_url, 'today_lesson_title', v.today_lesson_title
    ),
    'courses', v_courses,
    'assignments', v_ex, 'files', v_files, 'exams', v_exams, 'recent_activity', v_recent,
    'stats', jsonb_build_object(
      'lessons_total', v_les_total, 'lessons_done', v_les_done,
      'ex_total', v_ex_total, 'ex_done', v_ex_done,
      'exam_total', v_exam_total, 'exam_done', v_exam_done,
      'files_total', v_files_total, 'files_opened', COALESCE(v_files_opened, 0),
      'overall', v_overall, 'streak', v_streak, 'last_activity', v_last
    )
  );
END; $function$
;
CREATE OR REPLACE FUNCTION public.student_streak_bonus(p_token text, p_course uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_submissions(p_token text)
 RETURNS TABLE(id uuid, module_id uuid, module_title text, conversation_text text, status text, feedback text, score integer, reviewed_at timestamp with time zone, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid;
begin
  select c.id into v_id from crm_students c where c.verification_token = upper(trim(p_token)) and c.deleted_at is null;
  if v_id is null then return; end if;
  return query
    select sub.id, sub.module_id, m.title, sub.conversation_text, sub.status, sub.feedback, sub.score, sub.reviewed_at, sub.created_at
    from lms_submissions sub join lms_modules m on m.id = sub.module_id
    where sub.student_id = v_id
    order by sub.created_at desc;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_submit_challenge(p_token text, p_type text, p_id uuid, p_mode text, p_answer text, p_course uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_submit_final_exam(p_token text, p_score integer, p_total integer, p_speaking_path text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v_name text; v_pct int; v_pass boolean; v_cert text;
begin
  select id, full_name into v_id, v_name from crm_students
    where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return jsonb_build_object('ok', false); end if;
  if p_total <= 0 then return jsonb_build_object('ok', false); end if;
  v_pct := round(p_score::numeric / p_total * 100);
  v_pass := v_pct >= 60;
  v_cert := 'INGCERT-' || upper(substr(md5(random()::text || v_id::text), 1, 8));
  insert into lms_certificates (student_id, score, total, percent, passed, cert_number, speaking_path)
    values (v_id, p_score, p_total, v_pct, v_pass, v_cert, p_speaking_path);
  insert into student_activity (student_id, event_type, entity_type, entity_id, entity_title)
    values (v_id, 'final_exam', 'exam', v_cert, 'الامتحان النهائي ' || v_pct || '%');
  return jsonb_build_object('ok', true, 'passed', v_pass, 'percent', v_pct, 'score', p_score, 'total', p_total,
    'cert_number', v_cert, 'full_name', v_name, 'date', to_char(now(), 'YYYY-MM-DD'));
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_submit_quiz(p_token text, p_lesson_id uuid, p_score integer, p_total integer, p_answers jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v_title text; v_pass boolean;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return false; end if;
  select title into v_title from lms_lessons where id = p_lesson_id;
  if v_title is null then return false; end if;
  v_pass := p_total > 0 and p_score = p_total;   -- 100% required
  insert into lms_quiz_results (student_id, lesson_id, score, total, passed, answers)
    values (v_id, p_lesson_id, p_score, p_total, v_pass, p_answers);
  insert into student_activity (student_id, event_type, entity_type, entity_id, entity_title)
    values (v_id, 'completed_quiz', 'lesson', p_lesson_id::text, v_title);
  return v_pass;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_submit_text(p_token text, p_module_id uuid, p_text text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v_sub uuid; v_title text;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return null; end if;
  select title into v_title from lms_modules where id = p_module_id;
  if v_title is null then return null; end if;
  insert into lms_submissions (student_id, module_id, conversation_text, status)
    values (v_id, p_module_id, p_text, 'pending') returning id into v_sub;
  insert into student_activity (student_id, event_type, entity_type, entity_id, entity_title)
    values (v_id, 'submitted_conversation', 'module', p_module_id::text, v_title);
  return v_sub;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_submit_unit_exam(p_token text, p_module_id uuid, p_score integer, p_total integer, p_answers jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v_pass boolean; v_title text;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return false; end if;
  v_pass := p_total > 0 and (p_score::numeric * 100 / p_total) >= 60;
  insert into lms_unit_exam_results (student_id, module_id, score, total, passed, answers)
  values (v_id, p_module_id, p_score, p_total, v_pass, p_answers);
  select title into v_title from lms_modules where id = p_module_id;
  insert into student_activity (student_id, event_type, entity_type, entity_id, entity_title)
  values (v_id, case when v_pass then 'passed_unit_exam' else 'failed_unit_exam' end, 'module', p_module_id::text, v_title);
  return v_pass;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_unit_exam(p_token text, p_module_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v_quiz jsonb; v_passed boolean;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return null; end if;
  select exam_quiz into v_quiz from lms_modules where id = p_module_id;
  select exists(select 1 from lms_unit_exam_results where student_id=v_id and module_id=p_module_id and passed) into v_passed;
  return jsonb_build_object('quiz', v_quiz, 'passed', v_passed);
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_unit_exams(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v jsonb;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'module_id', m.id,
           'passed', exists(select 1 from lms_unit_exam_results r where r.student_id = v_id and r.module_id = m.id and r.passed))), '[]'::jsonb)
    into v
  from lms_modules m
  where coalesce(jsonb_array_length(m.exam_quiz->'questions'), 0) > 0
    and m.course_id in (select course_id from lms_enrollments where student_id = v_id);
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_unit_reading(p_token text, p_module_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v jsonb;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return null; end if;
  select jsonb_build_object(
    'text', m.reading_text, 'audio', m.reading_audio_url,
    'video', m.reading_video_url, 'quiz', m.reading_quiz, 'title', m.title)
  into v
  from lms_modules m
  join lms_enrollments e on e.course_id = m.course_id and e.student_id = v_id
  where m.id = p_module_id
  limit 1;
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_unit_steps(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v jsonb;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return '{}'::jsonb; end if;
  select coalesce(jsonb_object_agg(mid, steps), '{}'::jsonb) into v from (
    select a.entity_id as mid,
      jsonb_build_object(
        'reading', bool_or(a.event_type = 'opened_reading'),
        'exam',    bool_or(a.event_type = 'opened_exam')
      ) as steps
    from student_activity a
    where a.student_id = v_id and a.entity_type = 'module'
      and a.event_type in ('opened_reading', 'opened_exam')
    group by a.entity_id
  ) t;
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_unit_task(p_token text, p_module_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v text;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return null; end if;
  select conversation_prompt into v from lms_modules where id = p_module_id;
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_vocab(p_token text, p_limit integer DEFAULT 12)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v_level text; v_levels text[]; v jsonb; v_has_course boolean;
begin
  select id, coalesce(nullif(current_level,''),'A0') into v_id, v_level
  from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return '[]'::jsonb; end if;

  select exists(
    select 1 from vocab_words w
    join lms_enrollments e on e.course_id = w.course_id
    where e.student_id = v_id and e.status = 'active' and w.is_active and w.course_id is not null
  ) into v_has_course;

  if v_has_course then
    select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'en', x.en, 'ar', x.ar, 'emoji', x.emoji)), '[]'::jsonb) into v
    from (
      select w.* from vocab_words w
      join lms_enrollments e on e.course_id = w.course_id
      where e.student_id = v_id and e.status = 'active' and w.is_active and w.course_id is not null
      order by random() limit greatest(4, least(p_limit, 20))
    ) x;
    return v;
  end if;

  v_levels := case v_level when 'A0' then array['A0'] when 'A1' then array['A0','A1']
    when 'A2' then array['A0','A1','A2'] else array['A0','A1','A2','B1'] end;
  select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'en', x.en, 'ar', x.ar, 'emoji', x.emoji)), '[]'::jsonb) into v
  from (select * from vocab_words c where c.is_active and c.course_id is null and c.level = any(v_levels)
        order by random() limit greatest(4, least(p_limit, 20))) x;
  return v;
end; $function$
;
CREATE OR REPLACE FUNCTION public.student_vocab_reward(p_token text, p_word_ids uuid[], p_course uuid DEFAULT NULL::uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
end; $function$
;
CREATE OR REPLACE FUNCTION public.submit_teacher_review(p_token text, p_teacher_id uuid, p_rating integer, p_comment text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_student uuid;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    return jsonb_build_object('ok', false, 'error', 'Rating must be between 1 and 5.');
  end if;

  select id into v_student from public.crm_students
   where verification_token = upper(trim(p_token))
     and deleted_at is null and is_active = true;
  if v_student is null then
    return jsonb_build_object('ok', false, 'error', 'We could not find your student account.');
  end if;

  if not exists (select 1 from public.teacher_students
                  where teacher_id = p_teacher_id and student_id = v_student and is_active = true) then
    return jsonb_build_object('ok', false, 'error', 'You can only review a teacher who teaches you.');
  end if;

  insert into public.teacher_reviews (teacher_id, student_id, rating, comment)
  values (p_teacher_id, v_student, p_rating, nullif(trim(coalesce(p_comment, '')), ''))
  on conflict (teacher_id, student_id) do update
    set rating = excluded.rating, comment = excluded.comment, updated_at = now();

  return jsonb_build_object('ok', true);
end $function$
;
CREATE OR REPLACE FUNCTION public.teacher_my_students()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',             s.id,
    'full_name',      s.full_name,
    'course',         s.course,
    'student_type',   s.student_type,
    'enrollment_date',s.enrollment_date,
    'is_active',      s.is_active,
    'avatar_url',     s.avatar_url,
    -- +2126••••••11 — enough to recognise, useless to harvest
    'phone_masked',   case when s.phone_number is null or length(s.phone_number) < 6 then null
                      else left(s.phone_number, 5) || '••••' || right(s.phone_number, 2) end,
    'assigned_at',    ts.assigned_at
  ) order by s.full_name), '[]'::jsonb)
  from public.teacher_students ts
  join public.crm_students s on s.id = ts.student_id
  where ts.teacher_id = auth.uid()
    and ts.is_active = true
    and s.deleted_at is null
    and public.is_teacher(auth.uid())
$function$
;
CREATE OR REPLACE FUNCTION public.teacher_overview()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select case when not public.is_teacher(auth.uid()) then '{}'::jsonb else jsonb_build_object(
    'students_total', (select count(*) from public.teacher_students
                        where teacher_id = auth.uid() and is_active = true),
    'classes_month',  (select count(*) from public.class_sessions
                        where teacher_id = auth.uid() and status = 'done'
                          and starts_at >= date_trunc('month', now())),
    'hours_month',    (select coalesce(round(sum(duration_min)::numeric / 60, 1), 0) from public.class_sessions
                        where teacher_id = auth.uid() and status = 'done'
                          and starts_at >= date_trunc('month', now())),
    'upcoming',       (select count(*) from public.class_sessions
                        where teacher_id = auth.uid() and status = 'scheduled' and starts_at >= now()),
    -- finished classes still missing their report — the number that should sting
    'reports_owed',   (select count(*) from public.class_sessions s
                        where s.teacher_id = auth.uid() and s.status = 'done'
                          and not exists (select 1 from public.lesson_reports r where r.session_id = s.id)),
    'attendance_rate',(select case when count(*) = 0 then null
                        else round(100.0 * count(*) filter (where a.status in ('present','late')) / count(*)) end
                       from public.class_attendance a
                       join public.class_sessions s on s.id = a.session_id
                       where s.teacher_id = auth.uid()),
    'rating_avg',     (select rating_avg   from public.teacher_profiles where id = auth.uid()),
    'rating_count',   (select rating_count from public.teacher_profiles where id = auth.uid())
  ) end
$function$
;
CREATE OR REPLACE FUNCTION public.teacher_profile_full(p_teacher uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
end $function$
;
CREATE OR REPLACE FUNCTION public.teachers_scoreboard()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select case when not public.is_crm_staff(auth.uid()) then '[]'::jsonb else coalesce(jsonb_agg(t order by t->>'display_name'), '[]'::jsonb) end
  from (
    select jsonb_build_object(
      'id',            p.id,
      'display_name',  coalesce(tp.display_name, p.full_name, p.email),
      'email',         p.email,
      'headline',      tp.headline,
      'avatar_url',    tp.avatar_url,
      'is_active',     coalesce(tp.is_active, true),
      'hired_at',      tp.hired_at,
      'rating_avg',    coalesce(tp.rating_avg, 0),
      'rating_count',  coalesce(tp.rating_count, 0),
      'students',      (select count(*) from public.teacher_students ts
                         where ts.teacher_id = p.id and ts.is_active = true),
      'classes_month', (select count(*) from public.class_sessions s
                         where s.teacher_id = p.id and s.status = 'done'
                           and s.starts_at >= date_trunc('month', now())),
      'hours_month',   (select coalesce(round(sum(s.duration_min)::numeric / 60, 1), 0) from public.class_sessions s
                         where s.teacher_id = p.id and s.status = 'done'
                           and s.starts_at >= date_trunc('month', now())),
      'reports_owed',  (select count(*) from public.class_sessions s
                         where s.teacher_id = p.id and s.status = 'done'
                           and not exists (select 1 from public.lesson_reports r where r.session_id = s.id)),
      'attendance_rate', (select case when count(*) = 0 then null
                           else round(100.0 * count(*) filter (where a.status in ('present','late')) / count(*)) end
                          from public.class_attendance a
                          join public.class_sessions s on s.id = a.session_id
                          where s.teacher_id = p.id)
    ) as t
    from public.profiles p
    left join public.teacher_profiles tp on tp.id = p.id
    where p.role::text = 'teacher'
  ) scored
$function$
;

-- ─── Views ───────────────────────────────────────────────────
create view public.crm_revenue_safe with (security_invoker=true) as
 SELECT p.id,
    p.lead_id,
    p.student_id,
    p.payment_type,
    p.course_or_service,
    p.amount_mad,
    p.payment_status,
    p.payment_date,
    p.next_payment_date,
    p.receipt_url,
    p.notes,
    p.added_by_id,
    p.approved_by_id,
    p.approved_at,
    p.created_at,
    p.updated_at,
    p.is_upgrade,
    p.prev_plan,
    p.description,
    p.payment_method,
    r.receipt_number,
    r.id AS receipt_id
   FROM crm_payments p
     LEFT JOIN crm_receipts r ON r.payment_id = p.id
  WHERE p.payment_status = 'paid'::text AND p.amount_mad > 0::numeric AND COALESCE(p.excluded_from_revenue, false) = false;
create view public.leaderboard_weekly as
 SELECT student_id,
    sum(coins_amount) AS week_points,
    count(*) FILTER (WHERE action_type ~~ 'challenge%'::text) AS challenges,
    related_course_id AS course_id
   FROM coin_transactions
  WHERE created_at >= (date_trunc('week'::text, (now() AT TIME ZONE 'Africa/Casablanca'::text)) AT TIME ZONE 'Africa/Casablanca'::text)
  GROUP BY student_id, related_course_id;
revoke all on public.crm_revenue_safe, public.leaderboard_weekly from anon;

-- ─── Foreign keys ────────────────────────────────────────────
alter table public.announcement_targets add constraint announcement_targets_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE;
alter table public.announcement_targets add constraint announcement_targets_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.announcements add constraint announcements_course_id_fkey FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE;
alter table public.assistant_codes add constraint assistant_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.class_attendance add constraint class_attendance_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.class_attendance add constraint class_attendance_session_id_fkey FOREIGN KEY (session_id) REFERENCES class_sessions(id) ON DELETE CASCADE;
alter table public.class_attendance add constraint class_attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.class_sessions add constraint class_sessions_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.coin_transactions add constraint coin_transactions_related_course_id_fkey FOREIGN KEY (related_course_id) REFERENCES lms_courses(id) ON DELETE SET NULL;
alter table public.coin_transactions add constraint coin_transactions_related_lesson_id_fkey FOREIGN KEY (related_lesson_id) REFERENCES lms_lessons(id) ON DELETE SET NULL;
alter table public.coin_transactions add constraint coin_transactions_related_module_id_fkey FOREIGN KEY (related_module_id) REFERENCES lms_modules(id) ON DELETE SET NULL;
alter table public.coin_transactions add constraint coin_transactions_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.crm_activity_log add constraint crm_activity_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.crm_broadcasts add constraint crm_broadcasts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.crm_lead_events add constraint crm_lead_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.crm_lead_events add constraint crm_lead_events_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES subscription_leads(id) ON DELETE CASCADE;
alter table public.crm_payments add constraint crm_payments_added_by_id_fkey FOREIGN KEY (added_by_id) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.crm_payments add constraint crm_payments_approved_by_id_fkey FOREIGN KEY (approved_by_id) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.crm_payments add constraint crm_payments_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES subscription_leads(id) ON DELETE SET NULL;
alter table public.crm_payments add constraint crm_payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE SET NULL;
alter table public.crm_receipts add constraint crm_receipts_issued_by_id_fkey FOREIGN KEY (issued_by_id) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.crm_receipts add constraint crm_receipts_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES subscription_leads(id) ON DELETE SET NULL;
alter table public.crm_receipts add constraint crm_receipts_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES crm_payments(id) ON DELETE SET NULL;
alter table public.crm_receipts add constraint crm_receipts_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE SET NULL;
alter table public.crm_student_events add constraint crm_student_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.crm_student_events add constraint crm_student_events_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.crm_students add constraint crm_students_added_by_id_fkey FOREIGN KEY (added_by_id) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.crm_students add constraint crm_students_deleted_by_id_fkey FOREIGN KEY (deleted_by_id) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.crm_students add constraint crm_students_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES subscription_leads(id) ON DELETE SET NULL;
alter table public.lesson_reports add constraint lesson_reports_session_id_fkey FOREIGN KEY (session_id) REFERENCES class_sessions(id) ON DELETE CASCADE;
alter table public.lesson_reports add constraint lesson_reports_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.lms_certificates add constraint lms_certificates_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.lms_courses add constraint lms_courses_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.lms_enrollments add constraint lms_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE;
alter table public.lms_enrollments add constraint lms_enrollments_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.lms_enrollments add constraint lms_enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.lms_lesson_progress add constraint lms_lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lms_lessons(id) ON DELETE CASCADE;
alter table public.lms_lesson_progress add constraint lms_lesson_progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.lms_lessons add constraint lms_lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES lms_modules(id) ON DELETE CASCADE;
alter table public.lms_modules add constraint lms_modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE;
alter table public.lms_quiz_results add constraint lms_quiz_results_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lms_lessons(id) ON DELETE CASCADE;
alter table public.lms_quiz_results add constraint lms_quiz_results_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.lms_resources add constraint lms_resources_course_id_fkey FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE;
alter table public.lms_submissions add constraint lms_submissions_module_id_fkey FOREIGN KEY (module_id) REFERENCES lms_modules(id) ON DELETE CASCADE;
alter table public.lms_submissions add constraint lms_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.lms_unit_exam_results add constraint lms_unit_exam_results_module_id_fkey FOREIGN KEY (module_id) REFERENCES lms_modules(id) ON DELETE CASCADE;
alter table public.lms_unit_exam_results add constraint lms_unit_exam_results_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.path_template_steps add constraint path_template_steps_template_id_fkey FOREIGN KEY (template_id) REFERENCES path_templates(id) ON DELETE CASCADE;
alter table public.path_templates add constraint path_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.payments add constraint payments_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.payments add constraint payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.push_subscriptions add constraint push_subscriptions_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.reward_claims add constraint reward_claims_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE;
alter table public.reward_claims add constraint reward_claims_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.sentence_challenges add constraint sentence_challenges_module_id_fkey FOREIGN KEY (module_id) REFERENCES lms_modules(id) ON DELETE SET NULL;
alter table public.student_activity add constraint student_activity_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES subscription_leads(id) ON DELETE SET NULL;
alter table public.student_activity add constraint student_activity_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.student_activity add constraint student_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.student_assignments add constraint student_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.student_assignments add constraint student_assignments_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.student_certificates add constraint student_certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE SET NULL;
alter table public.student_certificates add constraint student_certificates_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.student_certificates add constraint student_certificates_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.student_challenge_attempts add constraint student_challenge_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.student_devices add constraint student_devices_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.student_exams add constraint student_exams_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.student_exams add constraint student_exams_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.student_files add constraint student_files_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.student_files add constraint student_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.student_notifications add constraint student_notifications_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.student_otps add constraint student_otps_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.student_presence add constraint student_presence_course_id_fkey FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE SET NULL;
alter table public.student_presence add constraint student_presence_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.student_streaks add constraint student_streaks_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.subscription_leads add constraint subscription_leads_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.subscription_leads add constraint subscription_leads_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.subscription_leads add constraint subscription_leads_deleted_by_id_fkey FOREIGN KEY (deleted_by_id) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.subscription_leads add constraint subscription_leads_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.support_messages add constraint support_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.support_messages add constraint support_messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES support_threads(id) ON DELETE CASCADE;
alter table public.support_threads add constraint support_threads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.teacher_materials add constraint teacher_materials_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.teacher_profiles add constraint teacher_profiles_id_fkey FOREIGN KEY (id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.teacher_reviews add constraint teacher_reviews_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.teacher_reviews add constraint teacher_reviews_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.teacher_students add constraint teacher_students_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.teacher_students add constraint teacher_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES crm_students(id) ON DELETE CASCADE;
alter table public.teacher_students add constraint teacher_students_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.translation_challenges add constraint translation_challenges_module_id_fkey FOREIGN KEY (module_id) REFERENCES lms_modules(id) ON DELETE SET NULL;
alter table public.vocab_words add constraint vocab_words_course_id_fkey FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE;
alter table public.vocab_words add constraint vocab_words_module_id_fkey FOREIGN KEY (module_id) REFERENCES lms_modules(id) ON DELETE SET NULL;

-- ─── Indexes (beyond PK/UNIQUE constraints) ──────────────────
CREATE INDEX articles_status_sort_idx ON public.articles USING btree (status, sort_order DESC);
CREATE INDEX class_attendance_student_idx ON public.class_attendance USING btree (student_id, marked_at DESC);
CREATE INDEX class_sessions_teacher_idx ON public.class_sessions USING btree (teacher_id, starts_at DESC);
CREATE INDEX class_sessions_upcoming_idx ON public.class_sessions USING btree (starts_at) WHERE (status = 'scheduled'::text);
CREATE INDEX idx_coin_tx_student ON public.coin_transactions USING btree (student_id, created_at DESC);
CREATE UNIQUE INDEX uq_coin_tx_dedup ON public.coin_transactions USING btree (student_id, dedup_key) WHERE (dedup_key IS NOT NULL);
CREATE INDEX course_lessons_course_idx ON public.course_lessons USING btree (course_slug, section_order, sort_order);
CREATE INDEX crm_activity_log_actor_idx ON public.crm_activity_log USING btree (actor_id, created_at DESC);
CREATE INDEX crm_activity_log_created_idx ON public.crm_activity_log USING btree (created_at DESC);
CREATE INDEX crm_activity_log_entity_idx ON public.crm_activity_log USING btree (entity_type, entity_id);
CREATE INDEX crm_broadcasts_created_at_idx ON public.crm_broadcasts USING btree (created_at DESC);
CREATE INDEX crm_lead_events_lead_id_idx ON public.crm_lead_events USING btree (lead_id, created_at DESC);
CREATE INDEX crm_payments_date_idx ON public.crm_payments USING btree (payment_date DESC);
CREATE INDEX crm_payments_due_idx ON public.crm_payments USING btree (due_date) WHERE ((payment_status = 'pending'::text) AND (due_date IS NOT NULL));
CREATE INDEX crm_payments_excluded_idx ON public.crm_payments USING btree (excluded_from_revenue) WHERE (excluded_from_revenue = true);
CREATE INDEX crm_payments_lead_idx ON public.crm_payments USING btree (lead_id, created_at DESC);
CREATE INDEX crm_payments_next_idx ON public.crm_payments USING btree (next_payment_date) WHERE (next_payment_date IS NOT NULL);
CREATE INDEX crm_payments_status_idx ON public.crm_payments USING btree (payment_status, created_at DESC);
CREATE INDEX crm_receipts_issued_at_idx ON public.crm_receipts USING btree (issued_at DESC);
CREATE INDEX crm_receipts_lead_id_idx ON public.crm_receipts USING btree (lead_id);
CREATE INDEX crm_receipts_payment_id_idx ON public.crm_receipts USING btree (payment_id);
CREATE INDEX crm_receipts_student_id_idx ON public.crm_receipts USING btree (student_id);
CREATE INDEX crm_student_events_student_idx ON public.crm_student_events USING btree (student_id, created_at DESC);
CREATE INDEX crm_students_course_idx ON public.crm_students USING btree (course, is_active);
CREATE INDEX crm_students_payment_idx ON public.crm_students USING btree (next_payment_date) WHERE (next_payment_date IS NOT NULL);
CREATE INDEX crm_students_type_idx ON public.crm_students USING btree (student_type, is_active);
CREATE UNIQUE INDEX crm_students_verification_token_idx ON public.crm_students USING btree (verification_token);
CREATE INDEX lesson_reports_teacher_idx ON public.lesson_reports USING btree (teacher_id, submitted_at DESC);
CREATE INDEX lessons_status_sort_idx ON public.lessons USING btree (status, sort_order);
CREATE INDEX idx_lms_certificates_student ON public.lms_certificates USING btree (student_id, created_at DESC);
CREATE INDEX lms_enrollments_course_idx ON public.lms_enrollments USING btree (course_id);
CREATE INDEX lms_enrollments_student_idx ON public.lms_enrollments USING btree (student_id);
CREATE INDEX lms_lesson_progress_student_idx ON public.lms_lesson_progress USING btree (student_id);
CREATE INDEX lms_lessons_idx ON public.lms_lessons USING btree (module_id, lesson_order);
CREATE INDEX lms_modules_idx ON public.lms_modules USING btree (course_id, module_order);
CREATE INDEX idx_quiz_results_student ON public.lms_quiz_results USING btree (student_id, lesson_id);
CREATE INDEX idx_lms_resources_course ON public.lms_resources USING btree (course_id);
CREATE INDEX idx_lms_submissions_status ON public.lms_submissions USING btree (status);
CREATE INDEX idx_lms_submissions_student ON public.lms_submissions USING btree (student_id);
CREATE INDEX idx_unit_exam_results_student ON public.lms_unit_exam_results USING btree (student_id, module_id);
CREATE INDEX path_template_steps_idx ON public.path_template_steps USING btree (template_id, step_order);
CREATE INDEX payments_status_idx ON public.payments USING btree (status, created_at DESC);
CREATE INDEX payments_user_idx ON public.payments USING btree (user_id, created_at DESC);
CREATE INDEX profiles_plan_idx ON public.profiles USING btree (plan, plan_expires_at);
CREATE INDEX push_subscriptions_student_idx ON public.push_subscriptions USING btree (student_id);
CREATE INDEX idx_reward_claims_status ON public.reward_claims USING btree (status);
CREATE INDEX idx_reward_claims_student ON public.reward_claims USING btree (student_id, created_at DESC);
CREATE INDEX student_activity_created_idx ON public.student_activity USING btree (created_at DESC);
CREATE INDEX student_activity_event_idx ON public.student_activity USING btree (event_type);
CREATE INDEX student_activity_lead_idx ON public.student_activity USING btree (lead_id, created_at DESC);
CREATE INDEX student_activity_student_idx ON public.student_activity USING btree (student_id, created_at DESC);
CREATE INDEX student_activity_user_idx ON public.student_activity USING btree (user_id, created_at DESC);
CREATE INDEX student_assignments_student_idx ON public.student_assignments USING btree (student_id, created_at DESC);
CREATE UNIQUE INDEX student_certificates_dedupe ON public.student_certificates USING btree (student_id, kind, COALESCE(course_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(milestone, 0));
CREATE INDEX student_certificates_student_idx ON public.student_certificates USING btree (student_id, created_at DESC);
CREATE INDEX idx_attempts_student ON public.student_challenge_attempts USING btree (student_id, created_at DESC);
CREATE INDEX idx_student_devices ON public.student_devices USING btree (student_id);
CREATE INDEX student_exams_student_idx ON public.student_exams USING btree (student_id, created_at DESC);
CREATE INDEX student_files_student_idx ON public.student_files USING btree (student_id, created_at DESC);
CREATE INDEX idx_student_notifs ON public.student_notifications USING btree (student_id, is_read, created_at DESC);
CREATE INDEX student_presence_seen_idx ON public.student_presence USING btree (last_seen_at DESC);
CREATE INDEX subscription_leads_archived_idx ON public.subscription_leads USING btree (is_archived, created_at DESC);
CREATE INDEX subscription_leads_assigned_idx ON public.subscription_leads USING btree (assigned_to_id, status);
CREATE INDEX subscription_leads_course_idx ON public.subscription_leads USING btree (course, created_at DESC);
CREATE INDEX subscription_leads_created_idx ON public.subscription_leads USING btree (created_at DESC);
CREATE INDEX subscription_leads_deleted_idx ON public.subscription_leads USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);
CREATE INDEX subscription_leads_followup_idx ON public.subscription_leads USING btree (next_followup_at) WHERE (next_followup_at IS NOT NULL);
CREATE INDEX subscription_leads_lead_source_idx ON public.subscription_leads USING btree (lead_source, created_at DESC);
CREATE INDEX subscription_leads_source_idx ON public.subscription_leads USING btree (source, created_at DESC);
CREATE INDEX subscription_leads_status_idx ON public.subscription_leads USING btree (status, created_at DESC);
CREATE INDEX support_messages_thread_idx ON public.support_messages USING btree (thread_id, created_at);
CREATE INDEX support_threads_inbox_idx ON public.support_threads USING btree (status, last_message_at DESC);
CREATE INDEX support_threads_user_idx ON public.support_threads USING btree (user_id, last_message_at DESC);
CREATE INDEX teacher_materials_course_idx ON public.teacher_materials USING btree (course_id) WHERE (course_id IS NOT NULL);
CREATE INDEX teacher_materials_teacher_idx ON public.teacher_materials USING btree (teacher_id, created_at DESC);
CREATE INDEX teacher_profiles_active_idx ON public.teacher_profiles USING btree (is_active);
CREATE INDEX teacher_reviews_teacher_idx ON public.teacher_reviews USING btree (teacher_id, created_at DESC);
CREATE INDEX teacher_students_student_idx ON public.teacher_students USING btree (student_id, is_active);
CREATE INDEX teacher_students_teacher_idx ON public.teacher_students USING btree (teacher_id, is_active);
CREATE INDEX idx_vocab_level ON public.vocab_words USING btree (level) WHERE is_active;
CREATE INDEX idx_vocab_words_course ON public.vocab_words USING btree (course_id) WHERE (course_id IS NOT NULL);

-- ─── Row level security: on for every public table in production ───
do $$
declare r record;
begin
  for r in select c.relname from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind = 'r' loop
    execute format('alter table public.%I enable row level security', r.relname);
  end loop;
end $$;

-- ─── Policies ────────────────────────────────────────────────
create policy announcement_targets_staff on public.announcement_targets as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy announcements_staff on public.announcements as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy articles_admin_write on public.articles as PERMISSIVE for ALL to public using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy articles_public_read on public.articles as PERMISSIVE for SELECT to public using (((status = 'published'::text) OR is_admin(auth.uid())));
create policy assistant_codes_founder on public.assistant_codes as PERMISSIVE for ALL to public using (is_founder(auth.uid()));
create policy class_attendance_own on public.class_attendance as PERMISSIVE for ALL to public using ((EXISTS ( SELECT 1
   FROM class_sessions s
  WHERE ((s.id = class_attendance.session_id) AND (s.teacher_id = auth.uid()))))) with check ((EXISTS ( SELECT 1
   FROM class_sessions s
  WHERE ((s.id = class_attendance.session_id) AND (s.teacher_id = auth.uid())))));
create policy class_attendance_staff on public.class_attendance as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));
create policy class_sessions_own on public.class_sessions as PERMISSIVE for ALL to public using ((teacher_id = auth.uid())) with check ((teacher_id = auth.uid()));
create policy class_sessions_staff on public.class_sessions as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));
create policy coin_transactions_staff on public.coin_transactions as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy "Allow public read on content" on public.content as PERMISSIVE for SELECT to anon using (true);
create policy content_items_staff on public.content_items as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));
create policy course_lessons_admin_write on public.course_lessons as PERMISSIVE for ALL to public using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy course_lessons_public_read on public.course_lessons as PERMISSIVE for SELECT to public using (true);
create policy course_meta_admin_write on public.course_meta as PERMISSIVE for ALL to public using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy course_meta_public_read on public.course_meta as PERMISSIVE for SELECT to public using (true);
create policy crm_activity_log_insert on public.crm_activity_log as PERMISSIVE for INSERT to public with check (is_crm_staff(auth.uid()));
create policy crm_activity_log_read on public.crm_activity_log as PERMISSIVE for SELECT to public using (is_crm_staff(auth.uid()));
create policy "staff insert broadcasts" on public.crm_broadcasts as PERMISSIVE for INSERT to public with check (is_crm_staff(auth.uid()));
create policy "staff read broadcasts" on public.crm_broadcasts as PERMISSIVE for SELECT to public using (is_crm_staff(auth.uid()));
create policy crm_lead_events_insert on public.crm_lead_events as PERMISSIVE for INSERT to public with check (is_crm_staff(auth.uid()));
create policy crm_lead_events_read on public.crm_lead_events as PERMISSIVE for SELECT to public using (is_crm_staff(auth.uid()));
create policy crm_payments_del on public.crm_payments as PERMISSIVE for DELETE to public using (is_founder(auth.uid()));
create policy crm_payments_read on public.crm_payments as PERMISSIVE for SELECT to public using (is_crm_staff(auth.uid()));
create policy crm_payments_write on public.crm_payments as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy crm_receipts_staff_all on public.crm_receipts as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy crm_student_events_staff on public.crm_student_events as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy crm_students_del on public.crm_students as PERMISSIVE for DELETE to public using (is_founder(auth.uid()));
create policy crm_students_read on public.crm_students as PERMISSIVE for SELECT to public using (is_crm_staff(auth.uid()));
create policy crm_students_write on public.crm_students as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy feature_access_admin_write on public.feature_access as PERMISSIVE for ALL to public using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy feature_access_public_read on public.feature_access as PERMISSIVE for SELECT to public using (true);
create policy language_functions_staff on public.language_functions as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));
create policy lesson_reports_own on public.lesson_reports as PERMISSIVE for ALL to public using ((teacher_id = auth.uid())) with check ((teacher_id = auth.uid()));
create policy lesson_reports_staff on public.lesson_reports as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));
create policy lessons_admin_write on public.lessons as PERMISSIVE for ALL to public using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy lessons_public_read on public.lessons as PERMISSIVE for SELECT to public using (((status = 'published'::text) OR is_admin(auth.uid())));
create policy lms_certificates_staff on public.lms_certificates as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy lms_courses_staff on public.lms_courses as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy lms_enrollments_staff on public.lms_enrollments as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy lms_lesson_progress_staff on public.lms_lesson_progress as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy lms_lessons_staff on public.lms_lessons as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy lms_modules_staff on public.lms_modules as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy lms_quiz_results_staff on public.lms_quiz_results as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy lms_resources_staff on public.lms_resources as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy lms_submissions_staff on public.lms_submissions as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy lms_unit_exam_results_staff on public.lms_unit_exam_results as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));
create policy path_template_steps_staff on public.path_template_steps as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy path_templates_staff on public.path_templates as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy payments_admin_all on public.payments as PERMISSIVE for ALL to public using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy payments_owner_insert on public.payments as PERMISSIVE for INSERT to public with check (((auth.uid() = user_id) AND (method = 'receipt'::text) AND (status = 'pending'::text)));
create policy payments_owner_read on public.payments as PERMISSIVE for SELECT to public using ((auth.uid() = user_id));
create policy profiles_admin_read on public.profiles as PERMISSIVE for SELECT to public using (is_admin(auth.uid()));
create policy profiles_admin_update on public.profiles as PERMISSIVE for UPDATE to public using (is_admin(auth.uid()));
create policy profiles_self_read on public.profiles as PERMISSIVE for SELECT to public using ((auth.uid() = id));
create policy profiles_self_update on public.profiles as PERMISSIVE for UPDATE to public using ((auth.uid() = id));
create policy "staff read push subs" on public.push_subscriptions as PERMISSIVE for SELECT to public using (is_crm_staff(auth.uid()));
create policy reward_claims_staff on public.reward_claims as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy rewards_staff on public.rewards as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy sentence_challenges_staff on public.sentence_challenges as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy student_activity_self_insert on public.student_activity as PERMISSIVE for INSERT to public with check ((auth.uid() = user_id));
create policy student_activity_staff_read on public.student_activity as PERMISSIVE for SELECT to public using (is_crm_staff(auth.uid()));
create policy student_assignments_staff on public.student_assignments as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy student_certificates_founder_del on public.student_certificates as PERMISSIVE for DELETE to public using (is_founder(auth.uid()));
create policy student_certificates_staff_read on public.student_certificates as PERMISSIVE for SELECT to public using (is_crm_staff(auth.uid()));
create policy student_certificates_staff_write on public.student_certificates as PERMISSIVE for INSERT to public with check (is_crm_staff(auth.uid()));
create policy student_challenge_attempts_staff on public.student_challenge_attempts as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy student_devices_staff on public.student_devices as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy student_exams_staff on public.student_exams as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy student_files_staff on public.student_files as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy student_notifications_staff on public.student_notifications as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy student_otps_staff on public.student_otps as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy student_presence_staff_read on public.student_presence as PERMISSIVE for SELECT to public using (is_crm_staff(auth.uid()));
create policy student_streaks_staff on public.student_streaks as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy subscription_leads_admin_all on public.subscription_leads as PERMISSIVE for ALL to public using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy subscription_leads_anon_insert on public.subscription_leads as PERMISSIVE for INSERT to public with check ((status = 'new'::text));
create policy subscription_leads_founder_delete on public.subscription_leads as PERMISSIVE for DELETE to public using (is_founder(auth.uid()));
create policy subscription_leads_staff_select on public.subscription_leads as PERMISSIVE for SELECT to public using (is_crm_staff(auth.uid()));
create policy subscription_leads_staff_update on public.subscription_leads as PERMISSIVE for UPDATE to public using (is_crm_staff(auth.uid()));
create policy support_messages_admin_all on public.support_messages as PERMISSIVE for ALL to public using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy support_messages_owner_insert on public.support_messages as PERMISSIVE for INSERT to public with check (((sender_role = 'user'::text) AND (sender_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM support_threads t
  WHERE ((t.id = support_messages.thread_id) AND (t.user_id = auth.uid()) AND (t.status = 'open'::text))))));
create policy support_messages_owner_read on public.support_messages as PERMISSIVE for SELECT to public using ((EXISTS ( SELECT 1
   FROM support_threads t
  WHERE ((t.id = support_messages.thread_id) AND (t.user_id = auth.uid())))));
create policy support_threads_admin_all on public.support_threads as PERMISSIVE for ALL to public using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy support_threads_owner_insert on public.support_threads as PERMISSIVE for INSERT to public with check ((auth.uid() = user_id));
create policy support_threads_owner_read on public.support_threads as PERMISSIVE for SELECT to public using ((auth.uid() = user_id));
create policy support_threads_owner_update on public.support_threads as PERMISSIVE for UPDATE to public using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));
create policy teacher_materials_own on public.teacher_materials as PERMISSIVE for ALL to public using ((teacher_id = auth.uid())) with check ((teacher_id = auth.uid()));
create policy teacher_materials_staff on public.teacher_materials as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));
create policy teacher_profiles_insert on public.teacher_profiles as PERMISSIVE for INSERT to public with check (((id = auth.uid()) AND is_teacher(auth.uid())));
create policy teacher_profiles_self on public.teacher_profiles as PERMISSIVE for SELECT to public using ((id = auth.uid()));
create policy teacher_profiles_staff on public.teacher_profiles as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));
create policy teacher_profiles_update on public.teacher_profiles as PERMISSIVE for UPDATE to public using ((id = auth.uid())) with check ((id = auth.uid()));
create policy teacher_reviews_own on public.teacher_reviews as PERMISSIVE for SELECT to public using (((teacher_id = auth.uid()) AND (is_published = true)));
create policy teacher_reviews_staff on public.teacher_reviews as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));
create policy teacher_students_own on public.teacher_students as PERMISSIVE for SELECT to public using ((teacher_id = auth.uid()));
create policy teacher_students_staff on public.teacher_students as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));
create policy translation_challenges_staff on public.translation_challenges as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid()));
create policy vocab_words_staff on public.vocab_words as PERMISSIVE for ALL to public using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));

-- ─── Triggers ────────────────────────────────────────────────
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_absence_to_crm AFTER INSERT OR UPDATE ON public.class_attendance FOR EACH ROW EXECUTE FUNCTION log_absence_to_crm();
CREATE TRIGGER trg_class_sessions_updated BEFORE UPDATE ON public.class_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at_teachers();
CREATE TRIGGER course_lessons_updated_at BEFORE UPDATE ON public.course_lessons FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER on_course_meta_update BEFORE UPDATE ON public.course_meta FOR EACH ROW EXECUTE FUNCTION set_updated_at_course_meta();
CREATE TRIGGER trg_auto_create_receipt AFTER UPDATE OF payment_status ON public.crm_payments FOR EACH ROW EXECUTE FUNCTION auto_create_receipt();
CREATE TRIGGER trg_crm_student_autopayment AFTER INSERT ON public.crm_students FOR EACH ROW EXECUTE FUNCTION crm_student_autopayment();
CREATE TRIGGER trg_lesson_reports_updated BEFORE UPDATE ON public.lesson_reports FOR EACH ROW EXECUTE FUNCTION set_updated_at_teachers();
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER on_payment_approve BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION apply_payment_approval();
CREATE TRIGGER progress_updated_at BEFORE UPDATE ON public.progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER on_support_message_insert AFTER INSERT ON public.support_messages FOR EACH ROW EXECUTE FUNCTION bump_support_thread();
CREATE TRIGGER on_support_thread_update BEFORE UPDATE ON public.support_threads FOR EACH ROW EXECUTE FUNCTION set_updated_at_support_threads();
CREATE TRIGGER trg_teacher_profiles_guard BEFORE UPDATE ON public.teacher_profiles FOR EACH ROW EXECUTE FUNCTION guard_teacher_profile_fields();
CREATE TRIGGER trg_teacher_profiles_updated BEFORE UPDATE ON public.teacher_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at_teachers();
CREATE TRIGGER trg_teacher_rating AFTER INSERT OR DELETE OR UPDATE ON public.teacher_reviews FOR EACH ROW EXECUTE FUNCTION refresh_teacher_rating();
CREATE TRIGGER trg_teacher_reviews_updated BEFORE UPDATE ON public.teacher_reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at_teachers();
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Function grants that differ from the default (034_security_lockdown & co) ──
revoke execute on function public.cert_candidates(), public.crm_dues(), public.owner_learning_intel(), public.owner_live_pulse()
  from public, anon;
revoke execute on function
  public._award(uuid, text, integer, uuid, uuid, uuid, text, text, text),
  public._award_certificate(uuid, text, uuid, integer, text, jsonb),
  public._cert_serial(),
  public._lms_courses_for(uuid),
  public.revenue_between(timestamptz, timestamptz)
  from public, anon, authenticated;

reset check_function_bodies;
