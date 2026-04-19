-- Phase 5: per-course hosting type
-- native   → render inside the site using course_lessons
-- external → redirect to external URL (e.g. skool.com)

create table if not exists public.course_meta (
  slug         text primary key,
  course_type  text not null default 'native'
                 check (course_type in ('native','external')),
  external_url text,
  updated_at   timestamptz not null default now()
);

create or replace function public.set_updated_at_course_meta()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists on_course_meta_update on public.course_meta;
create trigger on_course_meta_update before update on public.course_meta
  for each row execute function public.set_updated_at_course_meta();

alter table public.course_meta enable row level security;

drop policy if exists course_meta_public_read on public.course_meta;
drop policy if exists course_meta_admin_write on public.course_meta;

create policy course_meta_public_read on public.course_meta
  for select using (true);

create policy course_meta_admin_write on public.course_meta
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
