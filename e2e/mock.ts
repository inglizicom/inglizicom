import type { Page, Request, Route } from '@playwright/test'

/**
 * A stand-in Supabase for the e2e suite.
 *
 * The app is started with NEXT_PUBLIC_SUPABASE_URL=https://e2e-fake.supabase.co
 * (playwright.config.ts); this answers every browser request to that host:
 * auth, table reads, RPCs. Data is small and fixed so pages render the way
 * staff see them. Every request is recorded in `calls`, so a test can assert
 * what the app actually sent (an insert, an RPC with its arguments).
 */

export type Role = 'founder' | 'assistant' | 'teacher' | 'student'

export const HOST = 'e2e-fake.supabase.co'
const STORAGE_KEY = 'sb-e2e-fake-auth-token'

export const IDS = {
  founder: '00000000-0000-4000-8000-0000000000f1',
  assistant: '00000000-0000-4000-8000-0000000000a1',
  teacher: '00000000-0000-4000-8000-0000000000c1',
  student: '00000000-0000-4000-8000-0000000000d1',
}

export interface Call { method: string; path: string; query: string; body: unknown }

const now = Date.now()
const iso = (daysAgo: number) => new Date(now - daysAgo * 86_400_000).toISOString()
const day = (daysAgo: number) => iso(daysAgo).slice(0, 10)
const month = new Date().toISOString().slice(0, 8) + '01'

const NAMES = ['ياسين العلوي', 'سلمى بنعلي', 'أمين الإدريسي', 'خديجة الفاسي', 'عمر بنجلون', 'نورة الشرقاوي']
const STATUSES = ['new', 'contacted', 'interested', 'follow_up', 'confirmed', 'paid']

export const LEADS = NAMES.map((n, i) => ({
  id: `00000000-0000-4000-8000-00000000100${i}`, plan_id: 'monthly', level: 'A1', full_name: n,
  phone: `+21261000000${i}`, city: 'الرباط', amount_mad: 450, status: STATUSES[i], admin_note: null, notes: null,
  created_at: iso(i), reviewed_by: null, reviewed_at: null, source: 'instagram', goal: null, plan_interest: null,
  course_interested: null, test_score: null, recommended_plan: null, utm_source: null, utm_medium: null,
  utm_campaign: null, referrer: null, device: null, page_path: null, assigned_to_id: IDS.assistant,
  last_contact_at: null, next_followup_at: i === 3 ? iso(1) : null, is_vip: false, lead_source: 'instagram',
  course: 'a0-a1', lead_type: null, lost_reason: null, pending_payment: false, is_archived: false,
  archived_at: null, archived_by: null, deleted_at: null, deleted_by_id: null, country: 'MA',
}))

export const STUDENTS = NAMES.slice(0, 4).map((n, i) => ({
  id: `00000000-0000-4000-8000-00000000200${i}`, lead_id: LEADS[i].id, full_name: n, phone_number: `+21262000000${i}`,
  course: 'الدورة التأسيسية A0 - A1', student_type: 'course_student', enrollment_date: day(30),
  payment_status: i === 2 ? 'overdue' : 'paid', total_paid_mad: 900, monthly_fee_mad: 450,
  next_payment_date: day(-10), notes: null, is_active: true, added_by_id: IDS.assistant, created_at: iso(30),
  updated_at: iso(1), verification_token: `ING-E2E00${i}`, course_end_date: null, teacher_name: null,
  source: 'instagram', billing_type: 'monthly', current_level: 'A1', next_level: 'A2', deleted_at: null,
  enrollment_type: 'paid', avatar_url: null, country: 'MA',
}))

export const PAYMENTS = STUDENTS.map((s, i) => ({
  id: `00000000-0000-4000-8000-00000000300${i}`, lead_id: s.lead_id, student_id: s.id, payment_type: 'monthly',
  course_or_service: 'الدورة التأسيسية', amount_mad: 450, payment_status: i === 1 ? 'pending' : 'paid',
  payment_date: day(i * 3), next_payment_date: day(-20), receipt_url: null, notes: null, added_by_id: IDS.assistant,
  approved_by_id: null, approved_at: null, created_at: iso(i * 3), updated_at: iso(i * 3), due_date: null,
  reminder_sent_at: null, installment_no: null, installment_count: null, crm_students: { full_name: s.full_name },
}))

const PROFILES = [
  { id: IDS.founder, email: 'founder@e2e.test', full_name: 'Founder', role: 'founder', is_admin: true, blocked: false, phone: null, avatar_url: null, created_at: iso(200) },
  { id: IDS.assistant, email: 'assistant@e2e.test', full_name: 'فاطمة الزهراء', role: 'assistant', is_admin: false, blocked: false, phone: '+212612345678', avatar_url: null, created_at: iso(120) },
  { id: IDS.teacher, email: 'teacher@e2e.test', full_name: 'سارة بن يوسف', role: 'teacher', is_admin: false, blocked: false, phone: null, avatar_url: null, created_at: iso(100) },
]

const TEACHER_PROFILE = {
  id: IDS.teacher, display_name: 'سارة بن يوسف', headline: 'IELTS', bio: null, avatar_url: null, levels: ['B1'],
  specialties: [], languages: [], whatsapp: null, pay_model: 'hourly', hourly_rate_mad: 100, availability: [],
  hired_at: '2025-01-10', is_active: true, rating_avg: 4.8, rating_count: 12, can_add_students: true,
}

const person = (id: string, name: string, role: string, extra: Record<string, unknown> = {}) => ({
  id, name, email: `${role}@e2e.test`, phone: '+212612345678', avatar_url: null, role, blocked: false,
  created_at: iso(100), last_sign_in_at: iso(1), last_seen_at: iso(0.001), last_path: '/sales/workspace',
  monthly_salary_mad: 0, hourly_rate_mad: null, pay_model: null, teacher_active: null, rating_avg: null, rating_count: 0,
  actions: 0, sessions_opened: 0, lead_actions: 0, leads_created: 0, payment_actions: 0, last_action_at: iso(1),
  students_added: 0, payments_recorded: 0, revenue_recorded: 0, leads_assigned: 0, followups_overdue: 0,
  sessions_done: 0, hours_done: 0, students_assigned: 0, ...extra,
})

export const RPC: Record<string, unknown> = {
  owner_overview: {
    rev_today: 900, rev_week: 6300, rev_month: 18450, rev_year: 142800, rev_total: 286400, paying_students: 64, arpu: 450,
    new_leads_today: 7, new_students_today: 2, total_leads: 812, total_students: 213, active_students: 148,
    inactive_students: 65, at_risk: 12, conversion_rate: 26, enroll: { paid: 180, trial: 21 },
    rewards: { coins_distributed: 48200, coins_spent: 21900, claims_total: 96, claims_pending: 4 },
    top_course: null, worst_course: null,
  },
  owner_revenue_trend: [{ month: month.slice(0, 7), mad: 18450 }],
  owner_team: [], owner_courses: [], owner_alerts: [],
  owner_students: { inactive_3: 1, inactive_7: 1, inactive_14: 0, inactive_30: 0, at_risk_list: [], top_coins: [], top_streak: [], most_active: [] },
  owner_live_pulse: { online_now: [], online_count: 0, active_today: 4, active_week: 20, lessons_today: 9, quizzes_today: 3, exams_passed_today: 0, challenges_today: 1, coins_today: 120, avg_score_7d: 80, certs_week: 0, recent_events: [] },
  owner_learning_intel: { progressing: [], struggling: [] },
  crm_dues: { installments: [], monthly: [], totals: { overdue: 450, due_7d: 0, monthly_overdue_n: 1 } },
  founder_team: {
    from: iso(30), to: iso(0),
    people: [
      person(IDS.founder, 'Founder', 'founder', { actions: 12 }),
      person(IDS.assistant, 'فاطمة الزهراء', 'assistant', { monthly_salary_mad: 3500, actions: 40, leads_created: 6, students_added: 4, payments_recorded: 3, revenue_recorded: 1350 }),
      person(IDS.teacher, 'سارة بن يوسف', 'teacher', { hourly_rate_mad: 100, pay_model: 'hourly', rating_avg: 4.8, rating_count: 12, sessions_done: 10, hours_done: 15 }),
    ],
  },
  founder_payroll: {
    month,
    rows: [
      { id: IDS.assistant, role: 'assistant', name: 'فاطمة الزهراء', email: 'assistant@e2e.test', phone: '+212612345678', avatar_url: null, blocked: false, hours: 0, sessions: 0, hourly_rate_mad: null, pay_model: null, monthly_salary_mad: 3500, suggested_base: 3500, payout: null },
      { id: IDS.teacher, role: 'teacher', name: 'سارة بن يوسف', email: 'teacher@e2e.test', phone: null, avatar_url: null, blocked: false, hours: 15, sessions: 10, hourly_rate_mad: 100, pay_model: 'hourly', monthly_salary_mad: 0, suggested_base: 1500, payout: null },
    ],
    totals: { paid: 0, pending: 0, n_paid: 0, n_pending: 0 },
  },
  founder_activity: [
    { id: 'e1', created_at: iso(0.01), action: 'lead_status_changed', entity_type: 'lead', entity_id: LEADS[1].id, actor_id: IDS.assistant, actor_role: 'assistant', actor_name: 'فاطمة الزهراء', before_value: { status: 'contacted' }, after_value: { status: 'interested' }, metadata: { source: 'db' }, entity_label: 'سلمى بنعلي' },
  ],
  founder_save_payout: { id: 'po1', payee_id: IDS.assistant, period: month, base_mad: 3500, bonus_mad: 0, deduction_mad: 0, amount_mad: 3500, hours: null, sessions: null, status: 'paid', method: 'bank_transfer', reference: null, note: null, paid_at: iso(0) },
  my_payouts: { salary: null, payouts: [] },
  staff_ping: null,
  teachers_scoreboard: [{
    id: IDS.teacher, display_name: 'سارة بن يوسف', email: 'teacher@e2e.test', headline: 'IELTS', avatar_url: null,
    is_active: true, hired_at: '2025-01-10', rating_avg: 4.8, rating_count: 12, period: { from: day(30), to: day(0), timezone: 'Africa/Casablanca' },
    assigned_students: 6, class_students: 4, unique_students: 8, course_students: 5, group_enrollments: 3, private_enrollments: 1,
    classes_active: 2, sessions_delivered: 10, hours_delivered: 15, sessions_cancelled: 1, reports_owed: 0, reports_owed_all_time: 0,
    attendance_marks: 30, attendance_rate: 90, new_class_enrollments: 2, course_enrollments: 5, class_seats: 4,
    group_classes: 1, private_classes: 1, roster_revenue: 2700, roster_paying_students: 4,
  }],
}

export const CLASS_ID = '00000000-0000-4000-8000-00000000c100'
export const SESSION_ID = '00000000-0000-4000-8000-00000000c200'
RPC.staff_online_class_detail = {
  class: {
    id: CLASS_ID, title: 'مجموعة المساء A1', mode: 'group', level: 'A1', status: 'active', teacher_id: IDS.teacher,
    teacher_name: 'سارة بن يوسف', course_id: null, course_title: null, starts_on: day(30), ends_on: day(-60), capacity: 8,
    waitlist_enabled: true, meeting_url: 'https://meet.example/a1', schedule_note: null, notes: null, archived_at: null, created_at: iso(40),
  },
  roster: STUDENTS.slice(0, 3).map((s, i) => ({
    enrollment_id: `00000000-0000-4000-8000-00000000c30${i}`, student_id: s.id, full_name: s.full_name, phone_number: s.phone_number,
    avatar_url: null, status: 'active', enrolled_at: iso(30), activated_at: iso(30), start_date: day(30), end_date: null,
    ended_at: null, end_reason: null, attendance: { marked: 4, present: 3, absent: 1 },
  })),
  sessions: [{
    id: SESSION_ID, title: 'مجموعة المساء A1', starts_at: iso(0.05), duration_min: 60, status: 'done', cancel_reason: null,
    teacher_id: IDS.teacher, teacher_name: 'سارة بن يوسف', marks: 0, present: 0, has_report: false,
  }],
}
RPC.staff_class_attendance_without_enrollment = []

// 059 — students teachers add, per-side money
export const INTAKE_STUDENT = '00000000-0000-4000-8000-00000000d500'
export const INTAKE_PAYMENT = '00000000-0000-4000-8000-00000000d600'
RPC.staff_teacher_intake = [{
  id: INTAKE_STUDENT, full_name: 'هبة العلوي', phone: '+212611223344', level: 'A1', kind: 'group', note: 'حصتان في الأسبوع',
  created_at: iso(0.2), review_status: 'pending', teacher_id: IDS.teacher, teacher_name: 'سارة بن يوسف',
  payments: [{ id: INTAKE_PAYMENT, amount_mad: 450, payment_method: 'bank_transfer', payment_date: day(0), notes: 'صرّح به الأستاذ · TX-1', receipt_path: null, payment_status: 'pending' }],
}]
RPC.staff_review_teacher_student = { id: INTAKE_STUDENT, review_status: 'approved', verification_token: 'ING-AB12CD34' }
RPC.staff_sides_breakdown = {
  from: day(2), to: day(0),
  sides: [
    { teacher_id: null, is_academy: true, name: 'بدون أستاذ', students: 40, active: 31, pending_review: 0, revenue_period: 12600, revenue_total: 98000, awaiting_confirmation: 0 },
    { teacher_id: IDS.teacher, is_academy: false, name: 'سارة بن يوسف', students: 9, active: 7, pending_review: 1, revenue_period: 3150, revenue_total: 8100, awaiting_confirmation: 450 },
  ],
}
RPC.teacher_add_student = { result: 'created', student_id: INTAKE_STUDENT, seat: null, review_status: 'pending' }
RPC.teacher_added_students = []
RPC.teacher_my_students = []
RPC.teacher_my_classes = []

// 060 — the monthly report
RPC.teacher_month_report = {
  month, generated_at: iso(0),
  teacher: { id: IDS.teacher, name: 'سارة بن يوسف', email: 'teacher@e2e.test', pay_model: 'revenue_share', hourly_rate_mad: null, revenue_share_pct: 60, rating_avg: 4.8, rating_count: 12 },
  students: { total: 2, group: 2, private: 0, new: 1, left: 0, pending_review: 0, list: [
    { id: STUDENTS[0].id, name: STUDENTS[0].full_name, kind: 'group', is_new: true, left: false, review_status: 'approved', present: 6, late: 1, absent: 2, excused: 0, paid: 1000, pending: 0 },
    { id: STUDENTS[1].id, name: STUDENTS[1].full_name, kind: 'group', is_new: false, left: false, review_status: 'approved', present: 8, late: 0, absent: 0, excused: 0, paid: 0, pending: 0, unlinked: 450 },
  ] },
  sessions: { scheduled: 9, done: 8, cancelled: 1, upcoming: 0, hours: 8, missing_reports: 1, cancel_reasons: [{ date: iso(5), title: 'مجموعة المساء', reason: 'مرض' }] },
  attendance: { marked: 17, present: 14, late: 1, absent: 2, excused: 0 },
  money: { revenue: 1000, pending: 0, unlinked: 450, payout: null },
  reviews: [{ rating: 5, comment: 'ممتازة', date: iso(3) }],
  academy_note: null,
  previous: { sessions_done: 7, attendance: { marked: 15, came: 13 }, revenue: 800 },
}
RPC.staff_set_teacher_month_note = { note: 'ok' }

// 061 — which teacher's lessons a payment pays for
RPC.staff_payment_teacher_options = [
  { teacher_id: IDS.teacher, name: 'سارة بن يوسف', via: 'مسنَد مباشرة' },
]
RPC.staff_set_payment_teacher = { id: PAYMENTS[0].id, teacher_id: IDS.teacher }

// 062 — notifications
export const NOTIFS = [
  { id: '00000000-0000-4000-8000-00000000a001', kind: 'payment', title: '💰 دفعة جديدة لحصصك', body: 'سلمى بنعلي · 450 د.م', url: '/teacher/earnings', read_at: null, created_at: iso(0.01), message_id: null },
  { id: '00000000-0000-4000-8000-00000000a002', kind: 'message', title: '✉️ رسالة من سلمى بنعلي', body: 'سأتأخر قليلًا.', url: '/sales/notifications', read_at: null, created_at: iso(0.2), message_id: null },
  { id: '00000000-0000-4000-8000-00000000a003', kind: 'student_assigned', title: '👤 طالب جديد مسنَد إليك', body: 'ياسين العلوي', url: '/teacher/students', read_at: iso(1), created_at: iso(1), message_id: null },
]
export const MESSAGES = [
  { id: '00000000-0000-4000-8000-00000000b001', created_at: iso(0.1), sender_role: 'teacher', sender_name: 'سارة بن يوسف', title: 'واجب الغد', body: 'الصفحة 12',
    recipients: [{ kind: 'student', id: STUDENTS[0].id, name: STUDENTS[0].full_name }], recipient_count: 1 },
  { id: '00000000-0000-4000-8000-00000000b002', created_at: iso(0.3), sender_role: 'student', sender_name: STUDENTS[1].full_name, title: `✉️ رسالة من ${STUDENTS[1].full_name}`, body: 'متى الحصة القادمة؟',
    recipients: [{ kind: 'teacher', id: IDS.teacher, name: 'سارة بن يوسف' }], recipient_count: 1 },
]
RPC.notifications_mark_read = 2
RPC.staff_send_notification = { message_id: MESSAGES[0].id, teachers: 1, students: 0 }
RPC.teacher_send_notification = { message_id: MESSAGES[0].id, students: 1 }
RPC.student_my_teachers = [{ id: IDS.teacher, name: 'سارة بن يوسف' }]
RPC.student_send_notification = { message_id: MESSAGES[1].id }

// 063: where students come from
RPC.staff_channel_report = {
  from: '2026-07-01', to: '2026-10-01',
  channels: [
    { channel: 'instagram', leads: 42, from_site: 30, students: 9, paying: 7, revenue: 12600 },
    { channel: 'tiktok',    leads: 55, from_site: 51, students: 6, paying: 4, revenue: 6800 },
    { channel: 'direct',    leads: 12, from_site: 12, students: 1, paying: 1, revenue: 1400 },
  ],
}

export interface MockOptions {
  role?: Role | null
  /** Profile fields to override for the signed-in user (e.g. { blocked: true }). */
  profile?: Record<string, unknown>
  /** teacher_profiles fields to override (e.g. { can_add_students: false }). */
  teacherProfile?: Record<string, unknown>
  rpc?: Record<string, unknown>
}

/** Sign in (or not) and answer every Supabase request. Returns the recorded calls. */
export async function mockSupabase(page: Page, opts: MockOptions = {}): Promise<Call[]> {
  const role = opts.role ?? null
  const calls: Call[] = []
  const me = role ? { ...(PROFILES.find(p => p.role === role) ?? { id: IDS.student, email: 'student@e2e.test', full_name: 'Student', role: 'student', is_admin: false, blocked: false }), ...opts.profile } : null
  const rpc = { ...RPC, ...opts.rpc }

  if (me) {
    const exp = Math.floor(Date.now() / 1000) + 86_400
    const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
    const user = { id: me.id, aud: 'authenticated', role: 'authenticated', email: me.email, app_metadata: { provider: 'email' }, user_metadata: {}, created_at: iso(100) }
    const session = {
      access_token: `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: me.id, role: 'authenticated', aud: 'authenticated', exp })}.sig`,
      token_type: 'bearer', expires_in: 86_400, expires_at: exp, refresh_token: 'e2e', user,
    }
    await page.addInitScript(([key, value]) => { try { localStorage.setItem(key, value) } catch {} }, [STORAGE_KEY, JSON.stringify(session)])
    ;(me as any).__user = user
    ;(me as any).__session = session
  }

  await page.route(`https://${HOST}/**`, async (route: Route, req: Request) => {
    const url = new URL(req.url())
    let body: unknown = null
    try { body = req.postDataJSON() } catch { body = req.postData() }
    calls.push({ method: req.method(), path: url.pathname, query: decodeURIComponent(url.search), body })

    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*' }
    const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
      route.fulfill({ status, contentType: 'application/json', headers: { ...cors, ...headers }, body: JSON.stringify(data) })
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })

    const p = url.pathname
    if (p.startsWith('/auth/v1/')) {
      if (!me) return json({ error: 'not signed in' }, 401)
      return json(p.endsWith('/user') ? (me as any).__user : (me as any).__session)
    }
    if (p.startsWith('/storage/v1/')) return json([])
    if (p.startsWith('/rest/v1/rpc/')) {
      const name = p.slice('/rest/v1/rpc/'.length)
      return json(name in rpc ? rpc[name] : null)
    }
    if (p.startsWith('/rest/v1/')) {
      const table = p.slice('/rest/v1/'.length)
      const single = (req.headers()['accept'] ?? '').includes('vnd.pgrst.object')
      const write = req.method() === 'POST' || req.method() === 'PATCH'
      let rows: any[] = []
      if (table === 'profiles') rows = url.search.includes('role=in') ? PROFILES : me ? [me] : []
      else if (table === 'teacher_profiles') rows = [{ ...TEACHER_PROFILE, ...opts.teacherProfile }]
      else if (table === 'subscription_leads') rows = LEADS
      else if (table === 'crm_students') rows = STUDENTS
      else if (table === 'crm_payments') rows = PAYMENTS
      else if (table === 'notifications') rows = url.searchParams.get('read_at') === 'is.null' ? NOTIFS.filter(n => !n.read_at) : NOTIFS
      else if (table === 'notification_messages') rows = MESSAGES
      if (write) {
        const created = { id: '00000000-0000-4000-8000-00000000ffff', created_at: new Date().toISOString(), ...(Array.isArray(body) ? body[0] : (body as object)) }
        return json(single ? created : [created], 201)
      }
      const eqId = url.searchParams.get('id')?.replace(/^eq\./, '')
      if (eqId) rows = rows.filter(r => r.id === eqId)
      return json(single ? (rows[0] ?? null) : rows, 200, { 'content-range': `0-${Math.max(rows.length - 1, 0)}/${rows.length}` })
    }
    return json({})
  })

  return calls
}

/** Page errors (uncaught exceptions) — the thing a smoke test must never see. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  return errors
}
