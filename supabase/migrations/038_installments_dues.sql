-- ════════════════════════════════════════════════════════════════════════
-- 038: Split payments (installments) + payment dues board + reminders
--
-- One-time course payments can now be split into two parts: part 1 is paid
-- immediately, part 2 is a PENDING crm_payments row carrying a due_date.
-- Outstanding money therefore has ONE source of truth: pending payments.
-- crm_dues() feeds the dues board on both the assistant CRM (workspace →
-- payments) and the owner side (analytics + command center alerts):
-- who has to pay, who hasn't, overdue vs upcoming, plus monthly
-- subscriptions coming due. Reminder timestamps record the last nudge.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. Installment + reminder columns ───────────────────────────────────
alter table public.crm_payments add column if not exists due_date date;                    -- when a pending payment must be collected
alter table public.crm_payments add column if not exists reminder_sent_at timestamptz;     -- last reminder for THIS payment
alter table public.crm_payments add column if not exists installment_no int;               -- 1-based part number
alter table public.crm_payments add column if not exists installment_count int;            -- total parts (2 for a split)

alter table public.crm_students add column if not exists payment_reminder_at timestamptz;  -- last monthly-fee reminder

create index if not exists crm_payments_due_idx on public.crm_payments (due_date)
  where payment_status = 'pending' and due_date is not null;

-- ── 2. Dues board (staff: assistants + founder) ─────────────────────────
create or replace function public.crm_dues()
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v jsonb;
begin
  if not is_crm_staff(auth.uid()) then return null; end if;
  select jsonb_build_object(
    -- scheduled installments / any pending payment with a due date
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
    -- monthly subscriptions due within 14 days (or overdue)
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
end; $$;
grant execute on function public.crm_dues() to authenticated, service_role;
revoke execute on function public.crm_dues() from public, anon;
