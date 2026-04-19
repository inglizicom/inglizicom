-- Per-course curriculum stored flat: section is just a grouping label on each
-- lesson row. Keeps admin editing simple (one table, one list).

create table if not exists public.course_lessons (
  id             uuid        primary key default gen_random_uuid(),
  course_slug    text        not null,
  section_title  text        not null,
  section_order  int         not null default 0,
  lesson_title   text        not null,
  duration       text        not null default '',
  youtube_id     text        not null default '',
  is_free        boolean     not null default false,
  sort_order     int         not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists course_lessons_course_idx
  on public.course_lessons (course_slug, section_order, sort_order);

alter table public.course_lessons enable row level security;

drop policy if exists "course_lessons_public_read"  on public.course_lessons;
drop policy if exists "course_lessons_admin_write" on public.course_lessons;

create policy "course_lessons_public_read"
  on public.course_lessons for select
  using (true);

create policy "course_lessons_admin_write"
  on public.course_lessons for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop trigger if exists course_lessons_updated_at on public.course_lessons;
create trigger course_lessons_updated_at
  before update on public.course_lessons
  for each row execute function public.set_updated_at();
