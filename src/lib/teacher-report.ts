import { supabase } from './supabase'
import type { MonthReport } from './teacher-report-eval'

export * from './teacher-report-eval'

/** One teacher's month (060). The teacher reads their own; staff read anyone's. */
export async function fetchMonthReport(teacherId: string, month: string): Promise<MonthReport> {
  const { data, error } = await supabase.rpc('teacher_month_report', { p_teacher: teacherId, p_month: month })
  if (error) throw new Error(/Not allowed/.test(error.message) ? 'لا يمكنك فتح هذا التقرير.' : error.message)
  return data as MonthReport
}

/** The academy's written note for that month (staff). Empty text removes it. */
export async function saveMonthNote(teacherId: string, month: string, note: string): Promise<void> {
  const { error } = await supabase.rpc('staff_set_teacher_month_note', { p_teacher: teacherId, p_month: month, p_note: note })
  if (error) throw new Error(error.message)
}

/** A believable month for the teacher demo (?demo=1) and the e2e suite. */
export const DEMO_MONTH_REPORT: MonthReport = {
  month: new Date().toISOString().slice(0, 8) + '01',
  generated_at: new Date().toISOString(),
  teacher: { id: 'demo', name: 'سارة بن يوسف', email: null, pay_model: 'revenue_share', hourly_rate_mad: null, revenue_share_pct: 60, rating_avg: 4.8, rating_count: 47 },
  students: {
    total: 6, group: 5, private: 1, new: 2, left: 1, pending_review: 0,
    list: [
      { id: 's1', name: 'ياسين العلوي', kind: 'group', is_new: false, left: false, review_status: 'approved', present: 7, late: 1, absent: 0, excused: 0, paid: 450, pending: 0 },
      { id: 's2', name: 'سلمى بنعلي', kind: 'group', is_new: true, left: false, review_status: 'approved', present: 6, late: 0, absent: 2, excused: 0, paid: 900, pending: 0 },
      { id: 's3', name: 'أمين الإدريسي', kind: 'private', is_new: false, left: false, review_status: 'approved', present: 4, late: 0, absent: 0, excused: 0, paid: 1200, pending: 0 },
      { id: 's4', name: 'هبة العلوي', kind: 'group', is_new: true, left: false, review_status: 'approved', present: 3, late: 1, absent: 1, excused: 0, paid: 0, pending: 450 },
      { id: 's5', name: 'خديجة الفاسي', kind: 'group', is_new: false, left: false, review_status: 'approved', present: 6, late: 2, absent: 0, excused: 0, paid: 0, pending: 0, unlinked: 450 },
      { id: 's6', name: 'عمر بنجلون', kind: 'group', is_new: false, left: true, review_status: 'approved', present: 2, late: 0, absent: 3, excused: 1, paid: 0, pending: 0 },
    ],
  },
  sessions: { scheduled: 14, done: 12, cancelled: 1, upcoming: 1, hours: 14, missing_reports: 2,
    cancel_reasons: [{ date: new Date().toISOString(), title: 'مجموعة المساء A1', reason: 'سفر الأستاذة' }] },
  attendance: { marked: 40, present: 28, late: 4, absent: 6, excused: 2 },
  money: { revenue: 2550, pending: 450, unlinked: 450, payout: null },
  reviews: [
    { rating: 5, comment: 'شرح واضح جدًا وصبورة', date: new Date().toISOString() },
    { rating: 5, comment: null, date: new Date().toISOString() },
    { rating: 4, comment: 'أتمنى واجبات أكثر', date: new Date().toISOString() },
  ],
  academy_note: { note: 'شهر جيد. المطلوب: تقرير لكل حصة في نفس اليوم، ومتابعة عمر قبل أن يغادر.', updated_at: new Date().toISOString() },
  previous: { sessions_done: 11, attendance: { marked: 36, came: 30 }, revenue: 2100 },
}

export const MONTHS_AR =['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر']
export const monthLabel = (m: string) => `${MONTHS_AR[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`
export const shiftMonth = (m: string, by: number) => {
  const d = new Date(Date.UTC(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1 + by, 1))
  return d.toISOString().slice(0, 10)
}
