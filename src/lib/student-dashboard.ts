import { supabase } from './supabase'

/**
 * The student's dashboard data — student_dashboard(token), migration 054.
 *
 * Two tracks, kept apart because the platform keeps them apart:
 *   course track  lms_enrollments          self-paced course access
 *   class track   online_class_enrollments seats in live classes (group | private)
 * A student can be in one, both or neither. `classifyTracks` names the mix; the
 * screens show each track in its own block and connect them in one dashboard.
 */

/* ── RPC shape ─────────────────────────────────────────── */

export type SeatStatus = 'active' | 'waitlisted' | 'completed' | 'cancelled'
export type SessionStatus = 'scheduled' | 'live' | 'done' | 'cancelled'
export type MarkStatus = 'present' | 'late' | 'absent' | 'excused'

export interface DashCourse {
  course_id: string; title: string; level: string | null; status: 'active' | 'completed'
  enrolled_at: string; completed_at: string | null; lessons_total: number; lessons_done: number
}
export interface DashClass {
  enrollment_id: string; class_id: string; title: string; mode: 'group' | 'private'; level: string | null
  status: SeatStatus; class_status: string; schedule_note: string | null; meeting_url: string | null
  enrolled_at: string; ended_at: string | null; course_title: string | null
  teacher: { id: string; name: string | null; avatar_url: string | null } | null
  sessions_done: number; attended: number; next_session_at: string | null
}
export interface DashSession {
  id: string; title: string; starts_at: string; duration_min: number; mode: 'group' | 'private'; level: string | null
  status: SessionStatus; location: string | null; class_id: string | null; class_title: string | null
  teacher_name: string | null; meeting_url: string | null; my_attendance: MarkStatus | null
}
export interface DashTeacher {
  id: string; name: string | null; avatar_url: string | null; headline: string | null; specialties: string[]
  rating_avg: number | null; rating_count: number | null; assigned: boolean; classes: string[]; my_rating: number | null
}
export interface DashPayments {
  total_paid: number; paid_count: number; last_paid_at: string | null
  outstanding: number; overdue: number; next_due_at: string | null; monthly_fee: number | null
  status: 'paid' | 'due' | 'overdue' | 'none'
  history: { id: string; at: string; amount: number; label: string; status: 'paid' | 'pending' | 'overdue' | 'declined'; due_date: string | null; installment: string | null }[]
}
export interface StudentDashboard {
  found: boolean
  student?: { id: string; full_name: string; avatar_url: string | null; student_type: string; enrollment_date: string | null; course: string | null; billing_type: string | null }
  courses?: DashCourse[]
  classes?: DashClass[]
  sessions?: DashSession[]
  attendance?: { marks: number; present: number; late: number; absent: number; excused: number; rate: number | null
                 recent: { at: string; title: string; status: MarkStatus; note: string | null }[] }
  teachers?: DashTeacher[]
  payments?: DashPayments
  study?: {
    lessons_completed: number; videos_completed: number; quizzes_passed: number; quiz_avg: number | null
    exams_passed: number; tasks_done: number; tasks_total: number; practice_correct: number; practice_total: number
    watch_minutes: number; watch_minutes_7: number; active_days_7: number; last_active_at: string | null
    streak: { current: number; longest: number } | null
    weekly: { week: string; events: number }[] | null
  }
}

export async function fetchStudentDashboard(token: string): Promise<StudentDashboard> {
  const { data, error } = await supabase.rpc('student_dashboard', { p_token: token.trim().toUpperCase() })
  if (error) { console.warn('fetchStudentDashboard', error.message); return { found: false } }
  return (data ?? { found: false }) as StudentDashboard
}

/** Real watch time, from the video player. Under 5 seconds is ignored server-side. */
export async function logWatchTime(token: string, lessonId: string, seconds: number): Promise<void> {
  if (!token || token === 'DEMO' || seconds < 5) return
  try {
    await supabase.rpc('student_log_watch', { p_token: token.trim().toUpperCase(), p_lesson: lessonId, p_seconds: Math.round(seconds) })
  } catch { /* best effort */ }
}

/* ── Derived — one place, so both screens agree ─────────── */

export type TrackKind = 'course' | 'group' | 'private'

/** Which tracks this student is on, and what to call the mix. */
export function classifyTracks(d: StudentDashboard) {
  const courses = (d.courses ?? []).filter(c => c.status === 'active')
  const seats = (d.classes ?? []).filter(c => c.status === 'active')
  const course = courses.length > 0
  const group = seats.some(c => c.mode === 'group')
  const privateSeat = seats.some(c => c.mode === 'private')
  const kinds: TrackKind[] = [...(course ? ['course' as const] : []), ...(group ? ['group' as const] : []), ...(privateSeat ? ['private' as const] : [])]
  const label = course && (group || privateSeat) ? 'دورة + حصص مباشرة'
    : course ? 'طالب دورة'
    : group && privateSeat ? 'قسم جماعي + حصص فردية'
    : group ? 'طالب قسم جماعي'
    : privateSeat ? 'طالب حصص فردية'
    : d.student?.student_type === 'private_student' ? 'طالب حصص فردية'
    : 'طالب'
  return { course, group, private: privateSeat, kinds, label, activeCourses: courses, activeSeats: seats }
}

export const TRACK_STYLE: Record<TrackKind, { label: string; cls: string; dot: string }> = {
  course:  { label: 'دورة ذاتية',  cls: 'bg-amber-50 text-amber-900 ring-amber-200',    dot: 'bg-amber-500' },
  group:   { label: 'قسم جماعي',   cls: 'bg-stone-100 text-stone-800 ring-stone-300',    dot: 'bg-stone-600' },
  private: { label: 'حصص فردية',   cls: 'bg-orange-50 text-orange-900 ring-orange-200',  dot: 'bg-orange-600' },
}

export function sessionsSplit(d: StudentDashboard) {
  const now = Date.now()
  const all = d.sessions ?? []
  const upcoming = all.filter(s => (s.status === 'scheduled' || s.status === 'live') && new Date(s.starts_at).getTime() + s.duration_min * 60000 >= now)
  const past = all.filter(s => !upcoming.includes(s)).sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at))
  const missed = past.filter(s => s.my_attendance === 'absent')
  return { upcoming, past, missed }
}

/** Exercises the student completed, across the course track (quizzes, unit exams, staff tasks). */
export function exercisesDone(d: StudentDashboard) {
  const s = d.study
  return s ? s.quizzes_passed + s.exams_passed + s.tasks_done : 0
}

/** Learning status from the last seven days of activity. */
export function learningStatus(d: StudentDashboard): { label: string; tone: 'good' | 'mid' | 'low'; hint: string } {
  const days = d.study?.active_days_7 ?? 0
  if (days >= 4) return { label: 'منتظم ومتحمّس', tone: 'good', hint: `نشِط ${days} أيام هذا الأسبوع` }
  if (days >= 1) return { label: 'نشِط', tone: 'mid', hint: `نشِط ${days} ${days === 1 ? 'يوم' : 'أيام'} هذا الأسبوع — حاول يومًا إضافيًا` }
  return { label: 'متوقف هذا الأسبوع', tone: 'low', hint: 'لم تُسجَّل دراسة هذا الأسبوع — درس قصير اليوم يعيدك للمسار' }
}

export const hoursFrom = (minutes: number) => Math.round((minutes / 60) * 10) / 10

/* ── Demo — every section filled, for design review ────── */

const at = (days: number, h = 18, m = 0) => { const t = new Date(); t.setDate(t.getDate() + days); t.setHours(h, m, 0, 0); return t.toISOString() }
const day = (days: number) => at(days).slice(0, 10)

export const DEMO_STUDENT_DASHBOARD: StudentDashboard = {
  found: true,
  student: { id: 'demo', full_name: 'يوسف العلمي', avatar_url: null, student_type: 'course_student', enrollment_date: day(-128), course: 'المحادثة A2', billing_type: 'monthly' },
  courses: [
    // matches DEMO_SPACE (src/lib/demo.ts) so the demo header, lesson and tracks agree
    { course_id: 'c1', title: 'الدورة التأسيسية A0 - A1', level: 'A1', status: 'active', enrolled_at: at(-128), completed_at: null, lessons_total: 48, lessons_done: 16 },
    { course_id: 'dc0', title: 'تمهيدي — الحروف والأصوات', level: 'A0', status: 'completed', enrolled_at: at(-240), completed_at: at(-130), lessons_total: 24, lessons_done: 24 },
  ],
  classes: [
    { enrollment_id: 'e1', class_id: 'k1', title: 'المحادثة A2 — مساءً', mode: 'group', level: 'A2', status: 'active', class_status: 'active',
      schedule_note: 'الإثنين والأربعاء 18:00', meeting_url: 'https://meet.google.com/demo', enrolled_at: at(-90), ended_at: null, course_title: 'المحادثة A2 → B1',
      teacher: { id: 't1', name: 'سارة بن يوسف', avatar_url: null }, sessions_done: 22, attended: 19, next_session_at: at(0, 18) },
    { enrollment_id: 'e2', class_id: 'k2', title: 'إعداد مقابلات العمل — فردي', mode: 'private', level: 'B1', status: 'active', class_status: 'active',
      schedule_note: 'الخميس 20:00', meeting_url: 'https://meet.google.com/demo', enrolled_at: at(-30), ended_at: null, course_title: null,
      teacher: { id: 't2', name: 'ياسين المرابط', avatar_url: null }, sessions_done: 4, attended: 4, next_session_at: at(1, 20) },
    { enrollment_id: 'e3', class_id: 'k3', title: 'النطق B1 — مجموعة السبت', mode: 'group', level: 'B1', status: 'waitlisted', class_status: 'active',
      schedule_note: 'السبت 10:00', meeting_url: null, enrolled_at: at(-4), ended_at: null, course_title: null,
      teacher: { id: 't3', name: 'سلمى بنعلي', avatar_url: null }, sessions_done: 6, attended: 0, next_session_at: null },
  ],
  sessions: [
    ...[-26, -24, -19, -17, -12, -10, -5, -3].map((d, i) => ({
      id: `p${i}`, title: ['محادثة — السفر', 'محادثة — التسوق', 'مراجعة الوحدة 5', 'محادثة — العمل', 'محادثة — الصحة', 'محادثة — المطعم', 'محادثة — الهوايات', 'محادثة — الأسرة'][i],
      starts_at: at(d, 18), duration_min: 60, mode: 'group' as const, level: 'A2', status: 'done' as const, location: null,
      class_id: 'k1', class_title: 'المحادثة A2 — مساءً', teacher_name: 'سارة بن يوسف', meeting_url: null,
      my_attendance: (i === 2 ? 'absent' : i === 5 ? 'late' : 'present') as MarkStatus,
    })),
    { id: 'pp1', title: 'مقابلة تجريبية — تقديم النفس', starts_at: at(-6, 20), duration_min: 45, mode: 'private', level: 'B1', status: 'done', location: null,
      class_id: 'k2', class_title: 'إعداد مقابلات العمل — فردي', teacher_name: 'ياسين المرابط', meeting_url: null, my_attendance: 'present' },
    { id: 'u1', title: 'محادثة — وصف التجارب', starts_at: at(0, 18), duration_min: 60, mode: 'group', level: 'A2', status: 'scheduled', location: null,
      class_id: 'k1', class_title: 'المحادثة A2 — مساءً', teacher_name: 'سارة بن يوسف', meeting_url: 'https://meet.google.com/demo', my_attendance: null },
    { id: 'u2', title: 'مقابلة تجريبية — الأسئلة الصعبة', starts_at: at(1, 20), duration_min: 45, mode: 'private', level: 'B1', status: 'scheduled', location: null,
      class_id: 'k2', class_title: 'إعداد مقابلات العمل — فردي', teacher_name: 'ياسين المرابط', meeting_url: 'https://meet.google.com/demo', my_attendance: null },
    { id: 'u3', title: 'محادثة — الخطط المستقبلية', starts_at: at(2, 18), duration_min: 60, mode: 'group', level: 'A2', status: 'scheduled', location: null,
      class_id: 'k1', class_title: 'المحادثة A2 — مساءً', teacher_name: 'سارة بن يوسف', meeting_url: 'https://meet.google.com/demo', my_attendance: null },
    { id: 'u4', title: 'مراجعة الوحدة 6', starts_at: at(7, 18), duration_min: 60, mode: 'group', level: 'A2', status: 'scheduled', location: null,
      class_id: 'k1', class_title: 'المحادثة A2 — مساءً', teacher_name: 'سارة بن يوسف', meeting_url: 'https://meet.google.com/demo', my_attendance: null },
  ],
  attendance: {
    marks: 27, present: 23, late: 2, absent: 2, excused: 0, rate: 93,
    recent: [
      { at: at(-3), title: 'محادثة — الأسرة', status: 'present', note: null },
      { at: at(-6, 20), title: 'مقابلة تجريبية — تقديم النفس', status: 'present', note: null },
      { at: at(-10), title: 'محادثة — المطعم', status: 'late', note: 'وصل بعد 10 دقائق' },
      { at: at(-19), title: 'مراجعة الوحدة 5', status: 'absent', note: 'سفر عائلي — أُبلغنا مسبقاً' },
    ],
  },
  teachers: [
    { id: 't1', name: 'سارة بن يوسف', avatar_url: null, headline: 'المحادثة وتحضير IELTS', specialties: ['المحادثة', 'IELTS'], rating_avg: 4.8, rating_count: 47, assigned: true, classes: ['المحادثة A2 — مساءً'], my_rating: 5 },
    { id: 't2', name: 'ياسين المرابط', avatar_url: null, headline: 'إنجليزية الأعمال', specialties: ['الأعمال', 'المقابلات'], rating_avg: 4.7, rating_count: 18, assigned: false, classes: ['إعداد مقابلات العمل — فردي'], my_rating: null },
  ],
  payments: {
    total_paid: 2400, paid_count: 4, last_paid_at: day(-22), outstanding: 600, overdue: 0, next_due_at: day(8), monthly_fee: 600, status: 'due',
    history: [
      { id: 'h1', at: day(-22), amount: 600, label: 'اشتراك شهري — أكتوبر', status: 'paid', due_date: null, installment: null },
      { id: 'h2', at: day(-52), amount: 600, label: 'اشتراك شهري — شتنبر', status: 'paid', due_date: null, installment: null },
      { id: 'h3', at: day(-82), amount: 600, label: 'اشتراك شهري — غشت', status: 'paid', due_date: null, installment: null },
      { id: 'h4', at: day(-128), amount: 600, label: 'رسوم التسجيل', status: 'paid', due_date: null, installment: null },
    ],
  },
  study: {
    lessons_completed: 55, videos_completed: 34, quizzes_passed: 38, quiz_avg: 86, exams_passed: 5, tasks_done: 21, tasks_total: 26,
    practice_correct: 612, practice_total: 730, watch_minutes: 1712, watch_minutes_7: 185, active_days_7: 5, last_active_at: at(0, 9),
    streak: { current: 12, longest: 21 },
    weekly: [9, 14, 11, 17, 12, 19, 16, 21].map((events, i) => ({ week: day(-49 + i * 7), events })),
  },
}
