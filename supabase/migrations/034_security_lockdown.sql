-- 034_security_lockdown.sql
-- Lock down publicly exposed functions, legacy game tables and storage policies
-- (Supabase security advisors + manual triage, 2026-07-18).

-- 1) Sensitive SECURITY DEFINER helpers become internal-only. They are called
--    from other SECURITY DEFINER functions, which execute as the function owner
--    and therefore keep working after the revoke.
revoke execute on function public.revenue_between(timestamptz, timestamptz) from public, anon, authenticated;
revoke execute on function public._award(uuid, text, integer, uuid, uuid, uuid, text, text, text) from public, anon, authenticated;
revoke execute on function public._lms_courses_for(uuid) from public, anon, authenticated;

-- 2) Legacy island-game tables: replace always-true FOR ALL policies with just
--    the operations the unauthenticated game client performs (game.ts inserts
--    attempts, upserts progress, never deletes).
drop policy if exists "anon_all_attempts" on public.attempts;
create policy "attempts_public_select" on public.attempts for select using (true);
create policy "attempts_public_insert" on public.attempts for insert with check (true);

drop policy if exists "anon_all_progress" on public.progress;
create policy "progress_public_select" on public.progress for select using (true);
create policy "progress_public_insert" on public.progress for insert with check (true);
create policy "progress_public_update" on public.progress for update using (true) with check (true);

-- content_items: the public site reads via the existing "Public read published"
-- policy (queries already filter status = 'published'); writes are staff-only.
drop policy if exists "Anon full access" on public.content_items;
create policy "content_items_staff" on public.content_items for all
  using (public.is_crm_staff(auth.uid()))
  with check (public.is_crm_staff(auth.uid()));

-- 3) Storage: drop the blanket policies — they applied to EVERY bucket,
--    including the private payment-receipts bucket (public read + public
--    upload anywhere). Public buckets (videos, student-files) still serve
--    downloads through their public object URLs without any SELECT policy;
--    dropping the broad SELECT also stops anonymous listing of bucket
--    contents. Staff-scoped policies cover CRM needs (uploads to
--    student-files already go through student_files_staff_write; student
--    final-speaking uploads use the service role).
drop policy if exists "Allow public read" on storage.objects;
drop policy if exists "Allow public upload" on storage.objects;
drop policy if exists "Allow upload 1livt5k_0" on storage.objects;
drop policy if exists "student_files_public_read" on storage.objects;

create policy "student_files_staff_read" on storage.objects for select
  using (bucket_id = 'student-files' and public.is_crm_staff(auth.uid()));
create policy "student_files_staff_delete" on storage.objects for delete
  using (bucket_id = 'student-files' and public.is_crm_staff(auth.uid()));
create policy "videos_staff_write" on storage.objects for insert
  with check (bucket_id = 'videos' and public.is_crm_staff(auth.uid()));
create policy "videos_staff_delete" on storage.objects for delete
  using (bucket_id = 'videos' and public.is_crm_staff(auth.uid()));
create policy "receipts_staff_read" on storage.objects for select
  using (bucket_id = 'payment-receipts' and public.is_crm_staff(auth.uid()));
