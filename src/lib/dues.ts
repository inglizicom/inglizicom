import { supabase } from './supabase'

/**
 * Payment dues (migration 038): split one-time payments into installments,
 * track who has to pay and who hasn't (installments + monthly subscriptions),
 * and send WhatsApp / in-app reminders. Outstanding money has one source of
 * truth: PENDING crm_payments rows (part 2 of a split carries its due_date).
 */

export interface DueRow {
  payment_id?: string          // installment dues only
  student_id: string
  name: string
  phone: string | null
  avatar_url: string | null
  course: string | null
  amount: number
  due_date: string
  days: number                 // negative = overdue
  installment_no?: number | null
  installment_count?: number | null
  reminded_at: string | null
}
export interface DuesTotals {
  outstanding: number
  overdue: number
  due_7d: number
  monthly_mrr: number
  monthly_overdue_n: number
  collected_month: number
}
export interface DuesData {
  installments: DueRow[]
  monthly: DueRow[]
  totals: DuesTotals
}

export async function fetchDues(): Promise<DuesData | null> {
  const { data, error } = await supabase.rpc('crm_dues')
  if (error) { console.error('crm_dues', error.message); return null }
  return data as DuesData | null
}

/* ── Split payment: part 1 paid now, part 2 scheduled as pending ── */
export async function createSplitPayment(input: {
  studentId: string
  courseOrService?: string | null
  totalMad: number
  firstMad: number
  secondDueDate: string        // YYYY-MM-DD
  staffId: string
  notes?: string
}): Promise<boolean> {
  const second = input.totalMad - input.firstMad
  if (input.firstMad <= 0 || second <= 0) return false
  const today = new Date().toISOString().slice(0, 10)

  const { error: e1 } = await supabase.from('crm_payments').insert({
    student_id: input.studentId, payment_type: 'course_one_time',
    course_or_service: input.courseOrService ?? null,
    amount_mad: input.firstMad, payment_status: 'paid', payment_date: today,
    installment_no: 1, installment_count: 2,
    notes: input.notes || `دفعة أولى من ${input.totalMad} د.م`,
    added_by_id: input.staffId, approved_by_id: input.staffId, approved_at: new Date().toISOString(),
  })
  if (e1) { console.error('createSplitPayment #1', e1.message); return false }

  const { error: e2 } = await supabase.from('crm_payments').insert({
    student_id: input.studentId, payment_type: 'course_one_time',
    course_or_service: input.courseOrService ?? null,
    amount_mad: second, payment_status: 'pending', due_date: input.secondDueDate,
    installment_no: 2, installment_count: 2,
    notes: `الدفعة الثانية (${second} من ${input.totalMad} د.م)`,
    added_by_id: input.staffId,
  })
  if (e2) { console.error('createSplitPayment #2', e2.message); return false }

  const { data: s } = await supabase.from('crm_students').select('total_paid_mad').eq('id', input.studentId).maybeSingle()
  await supabase.from('crm_students').update({
    total_paid_mad: (Number((s as any)?.total_paid_mad) || 0) + input.firstMad,
    payment_status: 'pending',
    next_payment_date: input.secondDueDate,
  }).eq('id', input.studentId)

  await supabase.from('crm_student_events').insert({
    student_id: input.studentId, actor_id: input.staffId,
    event_type: 'payment_added',
    title: `تقسيط: دُفعت ${input.firstMad} د.م الآن — ${second} د.م مستحقة يوم ${input.secondDueDate}`,
    body: input.notes || null,
  })
  return true
}

/* ── Collect a scheduled installment (marks paid TODAY + settles the student) ── */
export async function collectInstallment(paymentId: string, studentId: string, amount: number, approverId: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)
  await supabase.from('crm_payments').update({
    payment_status: 'paid', payment_date: today,
    approved_by_id: approverId, approved_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq('id', paymentId)

  const [{ data: s }, { count: stillPending }] = await Promise.all([
    supabase.from('crm_students').select('total_paid_mad').eq('id', studentId).maybeSingle(),
    supabase.from('crm_payments').select('id', { count: 'exact', head: true })
      .eq('student_id', studentId).eq('payment_status', 'pending'),
  ])
  await supabase.from('crm_students').update({
    total_paid_mad: (Number((s as any)?.total_paid_mad) || 0) + amount,
    payment_status: (stillPending ?? 0) > 0 ? 'pending' : 'paid',
  }).eq('id', studentId)
}

/* ── Reminders: WhatsApp text + in-app bell + timestamp ── */
export function buildDueReminderMessage(d: DueRow): string {
  const when = d.days < 0 ? `كان مستحقًا يوم ${d.due_date}` : d.days === 0 ? 'مستحق اليوم' : `مستحق يوم ${d.due_date}`
  const part = d.installment_no && d.installment_count ? ` (القسط ${d.installment_no}/${d.installment_count})` : ''
  return `مرحبًا ${d.name} 👋\n` +
    `تذكير ودّي من Inglizi.com: مبلغ ${Math.round(d.amount)} د.م${part} ${when}.\n` +
    `يمكنك الدفع بنفس الطريقة السابقة، وإن كان لديك أي سؤال نحن في الخدمة 🙏`
}
export function dueWhatsAppLink(d: DueRow): string | null {
  if (!d.phone) return null
  return `https://wa.me/${d.phone.replace(/\D/g, '')}?text=${encodeURIComponent(buildDueReminderMessage(d))}`
}

/** Record that we nudged them: bell notification in the student portal +
 *  reminder timestamp on the right row (payment or student). */
export async function markReminded(d: DueRow): Promise<void> {
  const now = new Date().toISOString()
  await supabase.from('student_notifications').insert({
    student_id: d.student_id, type: 'reminder',
    title: '💳 تذكير بالدفعة القادمة',
    body: `${Math.round(d.amount)} د.م — ${d.days < 0 ? 'متأخرة، المرجو التسوية بأقرب وقت' : `مستحقة يوم ${d.due_date}`}`,
    tab: 'home',
  })
  if (d.payment_id) {
    await supabase.from('crm_payments').update({ reminder_sent_at: now }).eq('id', d.payment_id)
  } else {
    await supabase.from('crm_students').update({ payment_reminder_at: now }).eq('id', d.student_id)
  }
}
