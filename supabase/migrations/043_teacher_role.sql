-- 043_teacher_role.sql
-- Adds 'teacher' to the profiles role enum.
--
-- ⚠️ RUN THIS FILE ON ITS OWN, BEFORE 044.
-- Postgres will not let a new enum value be *used* in the same transaction that
-- adds it, so the schema that references 'teacher' lives in 044_teachers.sql.
-- Everywhere we compare against it we use role::text = 'teacher' for the same
-- reason — a bare enum literal would be resolved at function-parse time.

alter type public.user_role add value if not exists 'teacher';
