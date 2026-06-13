-- ════════════════════════════════════════════════════════════════════════
-- Revenue guarantee: every paid student must have a crm_payments row.
-- Fixes "marked paid but revenue = 0" at the DATABASE level (not just app code),
-- so it holds no matter which code path or deploy state created the student.
-- ════════════════════════════════════════════════════════════════════════

-- 1) BACKFILL — create the missing payment row for any paid student that lacks one.
insert into crm_payments (
  student_id, payment_type, course_or_service, amount_mad, payment_status,
  payment_date, payment_method, notes, added_by_id, approved_by_id, approved_at, created_at
)
select
  s.id,
  case when s.student_type = 'private_student' then 'private_monthly' else 'course_one_time' end,
  s.course,
  s.total_paid_mad,
  'paid',
  coalesce(s.enrollment_date, s.created_at::date),
  'cash',
  'Backfill 019 — تسجيل مدفوع بدون سجل دفع',
  s.added_by_id,
  s.added_by_id,
  s.created_at,
  s.created_at
from crm_students s
where s.deleted_at is null
  and s.payment_status = 'paid'
  and coalesce(s.total_paid_mad, 0) > 0
  and coalesce(s.enrollment_type, 'paid') = 'paid'
  and not exists (
    select 1 from crm_payments p
    where p.student_id = s.id and p.payment_status = 'paid' and p.amount_mad > 0
  );

-- 2) TRIGGER — when a NEW paid student is inserted with an amount and has no
--    payment row yet, create one automatically. (Monthly/approve flows already
--    write their own payment rows; the NOT EXISTS guard prevents double-counting.)
create or replace function public.crm_student_autopayment()
returns trigger language plpgsql security definer set search_path to 'public' as $$
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
      NEW.course,
      NEW.total_paid_mad,
      'paid',
      coalesce(NEW.enrollment_date, current_date),
      'cash',
      'تسجيل مباشر (auto)',
      NEW.added_by_id,
      NEW.added_by_id,
      now()
    );
  end if;
  return NEW;
end; $$;

drop trigger if exists trg_crm_student_autopayment on crm_students;
create trigger trg_crm_student_autopayment
  after insert on crm_students
  for each row execute function public.crm_student_autopayment();
