import { supabase } from './supabase'

/**
 * The founder's control room — team, activity trail, payroll.
 * Every call is a founder-only RPC (057_founder_control.sql) except
 * my_payouts / staff_ping, which any teacher or staff member calls for themselves.
 */

export type StaffKind = 'founder' | 'assistant' | 'teacher'

export interface TeamMember {
  id: string
  name: string
  email: string | null
  phone: string | null
  avatar_url: string | null
  role: StaffKind
  blocked: boolean
  created_at: string
  last_sign_in_at: string | null
  last_seen_at: string | null
  last_path: string | null
  monthly_salary_mad: number
  hourly_rate_mad: number | null
  pay_model: string | null
  teacher_active: boolean | null
  rating_avg: number | null
  rating_count: number | null
  actions: number
  sessions_opened: number
  lead_actions: number
  leads_created: number
  payment_actions: number
  last_action_at: string | null
  students_added: number
  payments_recorded: number
  revenue_recorded: number
  leads_assigned: number
  followups_overdue: number
  sessions_done: number
  hours_done: number
  students_assigned: number
}

export interface ActivityRow {
  id: string
  created_at: string
  action: string
  entity_type: string
  entity_id: string | null
  actor_id: string | null
  actor_role: string | null
  actor_name: string | null
  before_value: Record<string, unknown> | null
  after_value: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  entity_label: string | null
}

export type PayoutStatus = 'pending' | 'paid' | 'cancelled'
export type PayoutMethod = 'cash' | 'bank_transfer' | 'wafacash' | 'cashplus' | 'paypal' | 'other'

export interface Payout {
  id: string
  payee_id: string
  period: string
  base_mad: number
  bonus_mad: number
  deduction_mad: number
  amount_mad: number
  hours: number | null
  sessions: number | null
  status: PayoutStatus
  method: PayoutMethod | null
  reference: string | null
  note: string | null
  paid_at: string | null
}

export interface PayrollRow {
  id: string
  role: 'assistant' | 'teacher'
  name: string
  email: string | null
  phone: string | null
  avatar_url: string | null
  blocked: boolean
  hours: number
  sessions: number
  hourly_rate_mad: number | null
  pay_model: string | null
  /** 060: revenue-share teachers — their % and the confirmed money from the students they brought. */
  revenue_share_pct?: number | null
  revenue_brought?: number | null
  monthly_salary_mad: number
  suggested_base: number
  payout: Payout | null
}

export interface Payroll {
  month: string
  rows: PayrollRow[]
  totals: { paid: number; pending: number; n_paid: number; n_pending: number }
}

export interface MyPayouts {
  salary: number | null
  payouts: Payout[]
}

const num = (v: unknown) => (v == null ? 0 : Number(v))

export async function fetchTeam(from?: string | null, to?: string | null): Promise<TeamMember[]> {
  const { data, error } = await supabase.rpc('founder_team', { p_from: from ?? null, p_to: to ?? null })
  if (error) throw new Error(error.message)
  return ((data?.people ?? []) as any[]).map(p => ({
    ...p,
    monthly_salary_mad: num(p.monthly_salary_mad), revenue_recorded: num(p.revenue_recorded),
    hours_done: num(p.hours_done), rating_avg: p.rating_avg == null ? null : Number(p.rating_avg),
    hourly_rate_mad: p.hourly_rate_mad == null ? null : Number(p.hourly_rate_mad),
  })) as TeamMember[]
}

/** True when the error means 057 is not on this database yet. */
export const isMissingFunction = (e: unknown) =>
  /Could not find the function|function .* does not exist|schema cache/i.test(String((e as Error)?.message ?? e))

/**
 * The team straight from profiles — used when founder_team() is not deployed
 * yet, so nobody vanishes from the page: names, roles and rates, no activity.
 */
export async function fetchTeamBasic(): Promise<TeamMember[]> {
  const [{ data: profs, error }, { data: tps }] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name, phone, avatar_url, role, blocked, created_at')
      .in('role', ['founder', 'assistant', 'teacher']),
    supabase.from('teacher_profiles').select('id, display_name, hourly_rate_mad, pay_model, is_active, rating_avg, rating_count'),
  ])
  if (error) throw new Error(error.message)
  const tpById = new Map((tps ?? []).map((t: any) => [t.id, t]))
  const order: Record<string, number> = { founder: 0, assistant: 1, teacher: 2 }
  return (profs ?? []).map((p: any) => {
    const tp: any = tpById.get(p.id)
    return {
      id: p.id, email: p.email, phone: p.phone, avatar_url: p.avatar_url, role: p.role, blocked: !!p.blocked,
      name: tp?.display_name || p.full_name || (p.email ?? '').split('@')[0] || '—',
      created_at: p.created_at, last_sign_in_at: null, last_seen_at: null, last_path: null,
      monthly_salary_mad: 0, hourly_rate_mad: tp?.hourly_rate_mad == null ? null : Number(tp.hourly_rate_mad),
      pay_model: tp?.pay_model ?? null, teacher_active: tp?.is_active ?? null,
      rating_avg: tp?.rating_avg == null ? null : Number(tp.rating_avg), rating_count: tp?.rating_count ?? null,
      actions: 0, sessions_opened: 0, lead_actions: 0, leads_created: 0, payment_actions: 0, last_action_at: null,
      students_added: 0, payments_recorded: 0, revenue_recorded: 0, leads_assigned: 0, followups_overdue: 0,
      sessions_done: 0, hours_done: 0, students_assigned: 0,
    } as TeamMember
  }).sort((a, b) => order[a.role] - order[b.role] || a.name.localeCompare(b.name, 'ar'))
}

export async function fetchActivity(opts: {
  actor?: string | null; from?: string | null; to?: string | null; entity?: string | null; limit?: number
} = {}): Promise<ActivityRow[]> {
  const { data, error } = await supabase.rpc('founder_activity', {
    p_actor: opts.actor ?? null, p_from: opts.from ?? null, p_to: opts.to ?? null,
    p_entity: opts.entity ?? null, p_limit: opts.limit ?? 300,
  })
  if (error) throw new Error(error.message)
  return (data ?? []) as ActivityRow[]
}

const toPayout = (p: any): Payout | null => p ? ({
  ...p, base_mad: num(p.base_mad), bonus_mad: num(p.bonus_mad), deduction_mad: num(p.deduction_mad),
  amount_mad: num(p.amount_mad), hours: p.hours == null ? null : Number(p.hours),
}) : null

export async function fetchPayroll(month: string): Promise<Payroll> {
  const { data, error } = await supabase.rpc('founder_payroll', { p_month: month })
  if (error) throw new Error(error.message)
  return {
    month: data.month,
    rows: (data.rows as any[]).map(r => ({
      ...r, hours: num(r.hours), suggested_base: num(r.suggested_base), monthly_salary_mad: num(r.monthly_salary_mad),
      hourly_rate_mad: r.hourly_rate_mad == null ? null : Number(r.hourly_rate_mad), payout: toPayout(r.payout),
      revenue_share_pct: r.revenue_share_pct == null ? null : Number(r.revenue_share_pct),
      revenue_brought: r.revenue_brought == null ? null : Number(r.revenue_brought),
    })),
    totals: {
      paid: num(data.totals?.paid), pending: num(data.totals?.pending),
      n_paid: num(data.totals?.n_paid), n_pending: num(data.totals?.n_pending),
    },
  }
}

export async function savePayout(input: {
  payee: string; month: string; base: number; bonus?: number; deduction?: number
  status: PayoutStatus; method?: PayoutMethod | null; reference?: string | null; note?: string | null
}): Promise<Payout> {
  const { data, error } = await supabase.rpc('founder_save_payout', {
    p_payee: input.payee, p_month: input.month, p_base: input.base,
    p_bonus: input.bonus ?? 0, p_deduction: input.deduction ?? 0, p_status: input.status,
    p_method: input.method ?? null, p_reference: input.reference ?? null, p_note: input.note ?? null,
  })
  if (error) throw new Error(error.message)
  return toPayout(data)!
}

export async function setPaySettings(profile: string, monthlySalary: number, note?: string | null): Promise<void> {
  const { error } = await supabase.rpc('founder_set_pay_settings', {
    p_profile: profile, p_monthly_salary: monthlySalary, p_note: note ?? null,
  })
  if (error) throw new Error(error.message)
}

export async function setStaffBlocked(profile: string, blocked: boolean): Promise<void> {
  const { error } = await supabase.rpc('founder_set_staff_blocked', { p_profile: profile, p_blocked: blocked })
  if (error) throw new Error(error.message)
}

export async function fetchMyPayouts(): Promise<MyPayouts | null> {
  const { data, error } = await supabase.rpc('my_payouts')
  if (error) { console.error('my_payouts', error.message); return null }
  return {
    salary: data?.salary == null ? null : Number(data.salary),
    payouts: ((data?.payouts ?? []) as any[]).map(p => toPayout(p)!),
  }
}

/** Last-seen + session log. Best-effort: never blocks the page. */
export async function staffPing(path: string): Promise<void> {
  const { error } = await supabase.rpc('staff_ping', { p_path: path })
  if (error && !/function .* does not exist|Could not find/i.test(error.message)) console.error('staff_ping', error.message)
}

/* ── Labels ─────────────────────────────────────────────── */

export const PAYOUT_METHOD_AR: Record<PayoutMethod, string> = {
  cash: 'نقدًا', bank_transfer: 'تحويل بنكي', wafacash: 'وفاكاش', cashplus: 'كاش بلوس', paypal: 'PayPal', other: 'أخرى',
}

export const PAYOUT_STATUS_AR: Record<PayoutStatus, string> = {
  pending: 'قيد الانتظار', paid: 'مدفوع', cancelled: 'ملغى',
}

export const ROLE_AR: Record<StaffKind, string> = {
  founder: 'مؤسس', assistant: 'مساعد(ة)', teacher: 'أستاذ(ة)',
}

const ENTITY_AR: Record<string, string> = {
  lead: 'عميل', student: 'طالب', payment: 'دفعة', class: 'قسم', class_enrollment: 'تسجيل في قسم',
  course_enrollment: 'تسجيل في دورة', session: 'حصة', teacher_assignment: 'إسناد أستاذ', teacher: 'أستاذ',
  profile: 'حساب', task: 'مهمة', announcement: 'إعلان', broadcast: 'رسالة جماعية', payout: 'راتب',
  pay_setting: 'إعداد الراتب', session_started: 'جلسة',
}

const VERB_AR: Record<string, string> = {
  created: 'أضاف', updated: 'عدّل', deleted: 'حذف', restored: 'استرجع', archived: 'أرشف', unarchived: 'أخرج من الأرشيف',
  blocked: 'أوقف', unblocked: 'أعاد تفعيل', role_changed: 'غيّر دور', status_changed: 'غيّر حالة',
  deactivated: 'عطّل', activated: 'فعّل',
}

/** A short Arabic sentence for one log row: "عدّل طالب · سلمى بنعلي". */
export function describeAction(a: Pick<ActivityRow, 'action' | 'entity_type' | 'entity_label'>): string {
  if (a.action === 'session_started') return 'فتح جلسة عمل'
  // Older rows written from the browser (before 057) use their own names.
  const legacy: Record<string, string> = {
    lead_note_added: 'أضاف ملاحظة لعميل', lead_contacted: 'تواصل مع عميل', lead_followup_set: 'حدّد متابعة لعميل',
    lead_assigned: 'أسند عميلًا', student_created_direct: 'أضاف طالبًا', payment_added: 'سجّل دفعة',
    student_plan_changed: 'غيّر خطة طالب', payment_approved: 'وافق على دفعة', payment_declined: 'رفض دفعة',
    teacher_created: 'أنشأ حساب أستاذ', student_absent: 'سجّل غيابًا',
  }
  let text = legacy[a.action]
  if (!text) {
    const verb = Object.keys(VERB_AR).sort((x, y) => y.length - x.length).find(v => a.action.endsWith('_' + v))
    const entity = ENTITY_AR[a.entity_type] ?? a.entity_type
    text = verb ? `${VERB_AR[verb]} ${entity}` : `${a.action} · ${entity}`
  }
  return a.entity_label ? `${text} · ${a.entity_label}` : text
}

const FIELD_AR: Record<string, string> = {
  status: 'الحالة', payment_status: 'حالة الدفع', full_name: 'الاسم', phone: 'الهاتف', phone_number: 'الهاتف',
  amount_mad: 'المبلغ', total_paid_mad: 'المدفوع', monthly_fee_mad: 'الرسوم الشهرية', notes: 'ملاحظات',
  admin_note: 'ملاحظة', next_followup_at: 'المتابعة', assigned_to_id: 'المسؤول', is_vip: 'VIP', course: 'الدورة',
  is_archived: 'مؤرشف', deleted_at: 'محذوف', role: 'الدور', blocked: 'موقوف', is_active: 'نشط',
  base_mad: 'الأساسي', bonus_mad: 'المكافأة', deduction_mad: 'الخصم', method: 'طريقة الدفع', reference: 'المرجع',
  monthly_salary_mad: 'الراتب الشهري', hourly_rate_mad: 'سعر الساعة', next_payment_date: 'الدفعة القادمة',
  teacher_id: 'الأستاذ', payment_date: 'تاريخ الدفع', lead_source: 'المصدر', source: 'المصدر', city: 'المدينة',
}
export const fieldAr = (k: string) => FIELD_AR[k] ?? k
