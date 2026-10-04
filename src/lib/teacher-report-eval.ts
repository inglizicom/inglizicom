/**
 * The teacher's monthly report: types, the pay calculation, and the automatic
 * evaluation. Pure — no imports — so the rules are unit-tested on their own
 * (tests/unit/teacher-report.test.mjs) and give the same verdict for the same
 * month every time.
 *
 * The evaluation is deliberately strict and only uses what the CRM recorded.
 * Every point it makes quotes its number, so a teacher can check it and act:
 *
 *   attendance      25   share of marked seats that came (present + late)
 *   delivery        20   sessions delivered vs cancelled
 *   lesson reports  15   delivered sessions with a report
 *   students        15   kept (nobody left) + grew (someone new)
 *   satisfaction    15   reviews written this month (3+ needed to judge)
 *   punctuality      5   late among those who came
 *   money            5   money from the students they brought, vs last month
 *                  ───
 *                  100   A ≥ 85 · B ≥ 70 · C ≥ 55 · D below
 */

export interface ReportStudent {
  id: string; name: string; kind: 'group' | 'private'; brought: boolean; is_new: boolean; left: boolean
  review_status: 'pending' | 'approved' | 'rejected'
  present: number; late: number; absent: number; excused: number; paid: number; pending: number
}

export interface MonthReport {
  month: string
  generated_at: string
  teacher: {
    id: string; name: string; email: string | null; pay_model: 'hourly' | 'revenue_share' | string
    hourly_rate_mad: number | null; revenue_share_pct: number | null; rating_avg: number | null; rating_count: number | null
  }
  students: {
    total: number; brought: number; academy_assigned: number; group: number; private: number
    new: number; left: number; pending_review: number; list: ReportStudent[]
  }
  sessions: {
    scheduled: number; done: number; cancelled: number; upcoming: number; hours: number; missing_reports: number
    cancel_reasons: { date: string; title: string; reason: string | null }[]
  }
  attendance: { marked: number; present: number; late: number; absent: number; excused: number }
  money: {
    revenue_brought: number; pending_brought: number; paid_by_academy_students: number
    payout: null | { base_mad: number; bonus_mad: number; deduction_mad: number; amount_mad: number; status: string; method: string | null; paid_at: string | null; note: string | null }
  }
  reviews: { rating: number; comment: string | null; date: string }[]
  academy_note: null | { note: string; updated_at: string }
  previous: { sessions_done: number; attendance: { marked: number; came: number }; revenue_brought: number }
}

/* ── Pay ─────────────────────────────────────────────────── */

export interface PayBreakdown {
  model: 'revenue_share' | 'hourly'
  revenue: number            // confirmed, from the students they brought
  sharePct: number | null    // revenue share only
  teacherShare: number       // before bonus / deduction
  academyShare: number       // revenue − teacher share (revenue share only)
  bonus: number
  deduction: number
  net: number
  official: boolean          // true once the founder recorded the month in Payroll
  status: 'paid' | 'pending' | 'estimate'
}

const n = (v: unknown) => (v == null ? 0 : Number(v))

export function computePay(r: MonthReport): PayBreakdown {
  const model = r.teacher.pay_model === 'revenue_share' ? 'revenue_share' : 'hourly'
  const revenue = n(r.money.revenue_brought)
  const pct = r.teacher.revenue_share_pct == null ? null : n(r.teacher.revenue_share_pct)
  const computed = model === 'revenue_share'
    ? Math.round(revenue * (pct ?? 0) / 100)
    : Math.round(n(r.sessions.hours) * n(r.teacher.hourly_rate_mad))
  const p = r.money.payout
  const base = p ? n(p.base_mad) : computed
  const bonus = p ? n(p.bonus_mad) : 0
  const deduction = p ? n(p.deduction_mad) : 0
  return {
    model, revenue, sharePct: model === 'revenue_share' ? pct : null,
    teacherShare: base,
    academyShare: model === 'revenue_share' ? Math.max(0, revenue - base) : 0,
    bonus, deduction,
    net: p ? n(p.amount_mad) : base,
    official: !!p,
    status: p ? (p.status === 'paid' ? 'paid' : 'pending') : 'estimate',
  }
}

/* ── Evaluation ──────────────────────────────────────────── */

export type Grade = 'A' | 'B' | 'C' | 'D'
export interface Criterion { key: string; label: string; score: number; max: number; detail: string }
export interface Evaluation {
  score: number; grade: Grade; gradeLabel: string
  criteria: Criterion[]
  strengths: string[]; weaknesses: string[]; actions: string[]
  noActivity: boolean
}

export const GRADE_LABEL: Record<Grade, string> = { A: 'ممتاز', B: 'جيد', C: 'مقبول', D: 'يحتاج تحسينًا' }
const pctStr = (x: number) => `${Math.round(x * 100)}%`
const mad = (x: number) => `${Math.round(x).toLocaleString('en-US')} د.م`

export function evaluate(r: MonthReport): Evaluation {
  const strengths: string[] = [], weaknesses: string[] = [], actions: string[] = []
  const criteria: Criterion[] = []
  const a = r.attendance, s = r.sessions

  // Attendance — 25
  const came = n(a.present) + n(a.late)
  const rate = a.marked > 0 ? came / a.marked : null
  let att = 0
  if (rate == null) {
    weaknesses.push('لم يُسجَّل أي حضور هذا الشهر — لا يمكن قياس التزام الطلاب.')
    actions.push('سجّل الحضور في نهاية كل حصة من صفحة «الحصص».')
  } else {
    att = rate >= 0.9 ? 25 : rate >= 0.8 ? 18 : rate >= 0.7 ? 10 : 4
    if (rate >= 0.9) strengths.push(`حضور مرتفع: ${pctStr(rate)} من المقاعد المسجّلة (${came} من ${a.marked}).`)
    else if (rate < 0.8) weaknesses.push(`الحضور ${pctStr(rate)} — أقل من الهدف 80% (${n(a.absent)} غياب من ${a.marked}).`)
  }
  criteria.push({ key: 'attendance', label: 'الحضور', score: att, max: 25, detail: rate == null ? 'لا بيانات' : `${pctStr(rate)} (${came}/${a.marked})` })

  // Delivery — 20
  const held = n(s.done) + n(s.cancelled)
  let del = 0
  if (held === 0) {
    weaknesses.push('لم تُنجز أي حصة هذا الشهر.')
  } else {
    const c = n(s.cancelled) / held
    del = c === 0 ? 20 : c <= 0.1 ? 15 : c <= 0.2 ? 8 : 2
    if (c === 0) strengths.push(`كل الحصص المبرمجة أُنجزت (${s.done} حصة، ${s.hours} ساعة).`)
    else if (c > 0.1) {
      weaknesses.push(`نسبة الإلغاء ${pctStr(c)}: ${s.cancelled} حصة ملغاة من ${held}.`)
      actions.push('قلّل الإلغاءات: بلّغ الإدارة مسبقًا وبرمج حصة تعويضية لكل حصة ملغاة.')
    }
  }
  criteria.push({ key: 'delivery', label: 'إنجاز الحصص', score: del, max: 20, detail: held === 0 ? 'لا حصص' : `${s.done} منجزة · ${s.cancelled} ملغاة` })

  // Lesson reports — 15
  let rep = 0
  if (n(s.done) > 0) {
    const missing = n(s.missing_reports)
    const share = missing / n(s.done)
    rep = missing === 0 ? 15 : share <= 0.1 ? 10 : share <= 0.3 ? 5 : 0
    if (missing === 0) strengths.push('تقرير مكتوب لكل حصة منجزة.')
    else {
      weaknesses.push(`${missing} حصة منجزة بدون تقرير (${pctStr(share)} من الحصص).`)
      actions.push('اكتب تقرير الحصة في نفس اليوم: ما دُرِّس، الواجب، وملاحظة لكل طالب.')
    }
  }
  criteria.push({ key: 'reports', label: 'تقارير الحصص', score: rep, max: 15, detail: n(s.done) ? `${n(s.done) - n(s.missing_reports)}/${s.done}` : '—' })

  // Students: kept + grew — 15
  const left = n(r.students.left)
  let stu = Math.max(0, 10 - 5 * left) + (n(r.students.new) > 0 ? 5 : 0)
  stu = Math.min(15, stu)
  if (left === 0 && r.students.total > 0) strengths.push(`لم يغادر أي طالب (${r.students.total} طالب).`)
  if (left > 0) {
    weaknesses.push(`${left} طالب غادر أحد أقسامك هذا الشهر.`)
    actions.push('اتصل بكل طالب غادر لمعرفة السبب، وأخبر الإدارة بما قاله.')
  }
  if (n(r.students.new) > 0) strengths.push(`${r.students.new} طالب جديد هذا الشهر.`)
  criteria.push({ key: 'students', label: 'الطلاب', score: stu, max: 15, detail: `${r.students.new} جديد · ${left} غادر` })

  // Satisfaction — 15 (3+ reviews this month to judge)
  const reviews = r.reviews ?? []
  let sat = 8
  let satDetail = `${reviews.length} تقييم — غير كافٍ للحكم`
  if (reviews.length >= 3) {
    const avg = reviews.reduce((t, x) => t + n(x.rating), 0) / reviews.length
    sat = avg >= 4.5 ? 15 : avg >= 4 ? 11 : avg >= 3.5 ? 6 : 2
    satDetail = `${avg.toFixed(1)} ★ من ${reviews.length} تقييم`
    if (avg >= 4.5) strengths.push(`رضا الطلاب مرتفع: ${avg.toFixed(1)} ★ (${reviews.length} تقييم).`)
    else if (avg < 4) {
      weaknesses.push(`متوسط تقييم الطلاب ${avg.toFixed(1)} ★ هذا الشهر — أقل من 4.`)
      actions.push('اقرأ تعليقات الطلاب وناقشها مع الإدارة.')
    }
  } else {
    actions.push('شجّع طلابك على تقييمك من فضاء الطالب — 3 تقييمات على الأقل في الشهر.')
  }
  criteria.push({ key: 'satisfaction', label: 'رضا الطلاب', score: sat, max: 15, detail: satDetail })

  // Punctuality — 5
  let pun = 0
  if (came > 0) {
    const lateShare = n(a.late) / came
    pun = lateShare <= 0.1 ? 5 : lateShare <= 0.25 ? 3 : 0
    if (lateShare > 0.25) weaknesses.push(`${n(a.late)} حالة تأخر (${pctStr(lateShare)} ممن حضروا).`)
  }
  criteria.push({ key: 'punctuality', label: 'الانضباط', score: pun, max: 5, detail: came ? `${n(a.late)} تأخر من ${came}` : '—' })

  // Money — 5
  const rev = n(r.money.revenue_brought), prev = n(r.previous?.revenue_brought)
  const mon = rev > 0 && rev >= prev ? 5 : rev > 0 ? 3 : 0
  if (rev > 0 && prev > 0 && rev >= prev) strengths.push(`مداخيل طلابك ارتفعت: ${mad(rev)} مقابل ${mad(prev)} الشهر الماضي.`)
  if (rev > 0 && prev > 0 && rev < prev) weaknesses.push(`مداخيل طلابك انخفضت: ${mad(rev)} مقابل ${mad(prev)} الشهر الماضي.`)
  if (n(r.money.pending_brought) > 0) actions.push(`${mad(n(r.money.pending_brought))} بانتظار تأكيد الإدارة — أرسل صور الوصولات إن لم تفعل.`)
  criteria.push({ key: 'money', label: 'المداخيل', score: mon, max: 5, detail: mad(rev) })

  // Students who need a call
  const absentees = (r.students.list ?? []).filter(x => n(x.absent) >= 2)
  if (absentees.length) {
    actions.push(`تواصل مع: ${absentees.slice(0, 6).map(x => `${x.name} (${x.absent} غياب)`).join('، ')}${absentees.length > 6 ? '…' : ''}.`)
  }

  const score = criteria.reduce((t, c) => t + c.score, 0)
  const grade: Grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D'
  return {
    score, grade, gradeLabel: GRADE_LABEL[grade], criteria, strengths, weaknesses, actions,
    noActivity: held === 0 && a.marked === 0,
  }
}
