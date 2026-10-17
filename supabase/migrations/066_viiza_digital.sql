-- 066_viiza_digital.sql
-- VIIZA ENGLISH, interactive: the travel guide as a clickable app at
-- /viiza, sold on top of the printed book. A student gets in with the
-- token they already have (crm_students.verification_token); staff unlock
-- the app per student until a date:
--
--   crm_students.viiza_access_until   the last day the student may use the
--                                     app (Morocco day); null = not bought
--
-- The app's server routes check the token, this date and the student's
-- devices with the service role, so no new RPC is opened to anon. Staff
-- set the date through their usual update policy on crm_students, and the
-- audit trigger (057) records it.
--
-- Re-running this file is a no-op.

alter table public.crm_students add column if not exists viiza_access_until date;

comment on column public.crm_students.viiza_access_until is
  'VIIZA interactive (/viiza): the last day the student may use it (Africa/Casablanca). Null = no access.';
