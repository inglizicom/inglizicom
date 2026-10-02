import { supabase } from './supabase'
import {
  fetchMyClasses, fetchMyStudents, fetchReports, fetchSessions,
  type AttendanceStatus, type ClassSession, type MyClass, type MyStudent, type SessionStatus,
} from './teachers'

/**
 * One student, as a learning profile — the shape every section of the student
 * profile page reads.
 *
 * Every block that a given viewer may not see is nullable. A teacher reads the
 * roster RPC, their own sessions, their own attendance marks and their own
 * lesson reports — never crm_* tables — so `loadStudentProfileForTeacher`
 * leaves payment, LMS progress, exercises and certificates null and the page
 * says so. A later staff/student loader, or a security-definer RPC, fills the
 * same fields and the page lights up without a rewrite.
 */

export type StudentStatus = 'active' | 'paused' | 'vip' | 'trial' | 'awaiting_payment'
export type ClassMode = 'group' | 'private' | 'trial'
export type SkillKey = 'speaking' | 'listening' | 'reading' | 'writing' | 'vocabulary' | 'grammar'

export interface SPClass {
  id: string; title: string; teacher: string; mode: ClassMode
  schedule: string | null; status: 'active' | 'waitlisted' | 'completed' | 'cancelled'
  sessionsDone: number | null; meetingUrl: string | null; nextAt: string | null; level: string | null
}

export interface SPSession {
  id: string; title: string; startsAt: string; durationMin: number; teacher: string
  mode: ClassMode; meetingUrl: string | null; location: string | null; status: SessionStatus
  /** This student's mark on the session, when there is one. */
  attendance: AttendanceStatus | null
  reminder: boolean
}

export interface SPAttendance { at: string; title: string; status: AttendanceStatus; note: string | null }

export interface StudentProfile {
  id: string
  name: string
  avatarUrl: string | null
  phoneMasked: string | null
  enrolledAt: string | null
  statuses: StudentStatus[]
  level: string | null
  goalLevel: string | null
  courses: { title: string; status: 'active' | 'completed' }[]

  learning: {
    course: string; unit: string | null; lesson: string | null; teacher: string | null
    progressPct: number; nextMilestone: string | null; weekMinutes: number; trend: number[]
  } | null

  classes: SPClass[]
  /** Sessions this student is part of — past and future. */
  sessions: SPSession[]
  attendance: SPAttendance[]

  /** Study figures. A null figure is one this source does not record — sections hide it. */
  study: {
    lessonsCompleted: number; exercises: number | null; quizzesPassed: number | null; vocabulary: number | null
    videosWatched: number | null; hoursWatched: number | null; practiceMinutes: number | null; avgScore: number | null
    examsPassed?: number | null; practiceCorrect?: number | null; activeDays7?: number | null
    lastExerciseAt: string | null; targetPct: number | null
    skills: { key: SkillKey; label: string; pct: number }[]
    weekly: { label: string; value: number }[]
  } | null

  levelInfo: {
    current: string; goal: string | null; improvement: number | null; nextStep: string | null
    trend: { label: string; level: string }[]
  } | null

  payment: {
    totalPaid: number; balance: number; nextDueAt: string | null; lastPaidAt: string | null
    status: 'paid' | 'due' | 'overdue' | 'pending'
    history: { id: string; at: string; amount: number; label: string; status: 'paid' | 'pending' | 'overdue'; receiptUrl: string | null }[]
  } | null

  teachers: { id: string; name: string; avatarUrl: string | null; specialty: string | null; rating: number | null; role: string; isMe: boolean }[]

  certificates: { id: string; title: string; issuedAt: string; url: string | null }[] | null
  nextCertificate: { title: string; pct: number } | null
  achievements: { title: string; at: string; kind: 'streak' | 'milestone' | 'badge' }[]

  activity: { kind: 'lesson' | 'homework' | 'test' | 'note' | 'streak' | 'certificate' | 'payment' | 'attendance'; title: string; sub: string; at: string }[]

  summary: {
    goal: string | null; learningStyle: string | null; favoriteSkill: string | null
    motivation: 'high' | 'steady' | 'low' | null
    participationAvg: number | null; needsHelp: boolean
    notes: { at: string; text: string; by: string }[]
  }

  /** What this viewer may see — sections use it to explain an empty block. */
  access: { payments: boolean; learning: boolean; certificates: boolean }
}

/* ── Derived figures — one place, so every section agrees ─────────────── */

export function attendanceStats(p: StudentProfile) {
  const marks = p.attendance
  const present = marks.filter(m => m.status === 'present').length
  const late    = marks.filter(m => m.status === 'late').length
  const absent  = marks.filter(m => m.status === 'absent').length
  const excused = marks.filter(m => m.status === 'excused').length
  const counted = present + late + absent
  const rate = counted ? Math.round(((present + late) / counted) * 100) : null
  // Streak: consecutive attended sessions, newest first.
  let streak = 0
  for (const m of [...marks].sort((a, b) => +new Date(b.at) - +new Date(a.at))) {
    if (m.status === 'present' || m.status === 'late') streak++
    else if (m.status === 'absent') break
  }
  // Last 8 weeks: share attended per week (null when nothing was marked).
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  const weekly = Array.from({ length: 8 }, (_, i) => {
    const from = new Date(start.getTime() - (7 - i) * 7 * 864e5)
    const to = new Date(from.getTime() + 7 * 864e5)
    const wk = marks.filter(m => { const t = new Date(m.at); return t >= from && t < to && m.status !== 'excused' })
    const ok = wk.filter(m => m.status !== 'absent').length
    return { label: `${from.getDate()}/${from.getMonth() + 1}`, value: wk.length ? Math.round((ok / wk.length) * 100) : 0 }
  })
  return { present, late, absent, excused, attended: present + late, rate, streak, weekly }
}

export function upcomingSessions(p: StudentProfile) {
  const now = Date.now()
  return p.sessions
    .filter(s => s.status !== 'cancelled' && s.status !== 'done' && new Date(s.startsAt).getTime() + s.durationMin * 60000 >= now)
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
}

/* ── Live: what a teacher may read ─────────────────────────────────────── */

const modeOf = (m: 'group' | 'private'): ClassMode => m

/** teacher_student_learning() — 052. Learning only, never payments. */
export interface TeacherStudentLearning {
  course: {
    id: string; title: string; level: string | null; lessons_total: number; lessons_done: number
    progress_pct: number; unit: string | null; lesson: string | null; next_milestone: string | null
  } | null
  lessons_completed: number; last_lesson_at: string | null
  quizzes_passed: number; quiz_avg: number | null; exams_passed: number; exam_avg: number | null
  tasks_done: number; practice_correct: number
  active_days_7: number; minutes_7: number; last_active_at: string | null
  weekly: { week: string; lessons: number }[] | null
  streak: { current: number; longest: number } | null
  certificates: { id: string; title: string; issued_at: string; serial: string | null }[]
}

/** Null when the caller may not see the student — or when 052 is not applied yet. */
export async function fetchStudentLearning(studentId: string): Promise<TeacherStudentLearning | null> {
  const { data, error } = await supabase.rpc('teacher_student_learning', { p_student: studentId })
  if (error) { console.warn('fetchStudentLearning', error.message); return null }
  return (data ?? null) as TeacherStudentLearning | null
}

export async function loadStudentProfileForTeacher(
  teacher: { id: string; name: string; avatarUrl: string | null; headline: string | null; rating: number | null },
  studentId: string,
): Promise<StudentProfile | null> {
  const [students, classes, sessions, reports, marks, learn] = await Promise.all([
    fetchMyStudents(), fetchMyClasses(), fetchSessions(teacher.id), fetchReports(teacher.id, 200),
    supabase.from('class_attendance')
      .select('status, note, session:class_sessions!inner(id, title, starts_at, teacher_id)')
      .eq('student_id', studentId),
    fetchStudentLearning(studentId),
  ])
  const s: MyStudent | undefined = students.find(x => x.id === studentId)
  if (!s) return null   // not on my roster — the database would refuse the rest anyway

  const memberships = s.class_memberships ?? (s.classes ?? []).map(c => ({ ...c, status: 'active' as const }))
  const classIds = new Set(memberships.map(m => m.class_id))
  const classById = new Map<string, MyClass>(classes.map(c => [c.id, c]))

  const markRows = ((marks.data ?? []) as any[]).map(r => ({
    sessionId: (Array.isArray(r.session) ? r.session[0] : r.session)?.id as string,
    title: (Array.isArray(r.session) ? r.session[0] : r.session)?.title as string,
    at: (Array.isArray(r.session) ? r.session[0] : r.session)?.starts_at as string,
    status: r.status as AttendanceStatus, note: (r.note ?? null) as string | null,
  })).filter(r => r.sessionId)
  const markBySession = new Map(markRows.map(m => [m.sessionId, m.status]))

  const mine: ClassSession[] = sessions.filter(x => (x.class_id && classIds.has(x.class_id)) || markBySession.has(x.id))

  const notes = reports.flatMap(r => (r.student_notes ?? [])
    .filter(n => n.student_id === studentId)
    .map(n => ({ ...n, at: r.submitted_at })))
  const participation = notes.filter(n => n.participation).map(n => n.participation)

  const activeCourse = (s.courses ?? []).find(c => c.status === 'active')
  const course = learn?.course ?? null
  const weekLabel = (iso: string) => { const d = new Date(iso); return `${d.getDate()}/${d.getMonth() + 1}` }

  return {
    id: s.id,
    name: s.full_name,
    avatarUrl: s.avatar_url,
    phoneMasked: s.phone_masked,
    enrolledAt: s.enrollment_date ?? s.assigned_at,
    statuses: [s.is_active ? 'active' : 'paused'],
    level: course?.level ?? activeCourse?.level ?? memberships.map(m => classById.get(m.class_id)?.level).find(Boolean) ?? null,
    goalLevel: null,
    courses: (s.courses ?? []).map(c => ({ title: c.title, status: c.status })),
    learning: course ? {
      course: course.title, unit: course.unit, lesson: course.lesson, teacher: null,
      progressPct: course.progress_pct, nextMilestone: course.next_milestone,
      weekMinutes: learn!.minutes_7, trend: (learn!.weekly ?? []).map(w => w.lessons),
    } : null,
    classes: memberships.map(m => {
      const c = classById.get(m.class_id)
      return {
        id: m.class_id, title: m.title, teacher: teacher.name, mode: modeOf(m.mode),
        schedule: c?.schedule_note ?? null, status: m.status, sessionsDone: c?.sessions_done ?? null,
        meetingUrl: c?.meeting_url ?? null, nextAt: c?.next_session_at ?? null, level: c?.level ?? null,
      }
    }),
    sessions: mine.map(x => ({
      id: x.id, title: x.title, startsAt: x.starts_at, durationMin: x.duration_min, teacher: teacher.name,
      mode: modeOf(x.mode), meetingUrl: x.meeting_url, location: x.location, status: x.status,
      attendance: markBySession.get(x.id) ?? null, reminder: false,
    })),
    attendance: markRows.map(m => ({ at: m.at, title: m.title, status: m.status, note: m.note })),
    study: learn ? {
      lessonsCompleted: learn.lessons_completed, exercises: learn.tasks_done, quizzesPassed: learn.quizzes_passed,
      vocabulary: null, videosWatched: null, hoursWatched: null,
      practiceMinutes: learn.minutes_7 || null, avgScore: learn.quiz_avg,
      examsPassed: learn.exams_passed, practiceCorrect: learn.practice_correct, activeDays7: learn.active_days_7,
      lastExerciseAt: learn.last_lesson_at, targetPct: course ? course.progress_pct : null,
      skills: [],
      weekly: (learn.weekly ?? []).map(w => ({ label: weekLabel(w.week), value: w.lessons })),
    } : null,
    levelInfo: null,
    payment: null,
    teachers: [{ id: teacher.id, name: teacher.name, avatarUrl: teacher.avatarUrl, specialty: teacher.headline,
                 rating: teacher.rating, role: s.relationship === 'class' ? 'أستاذ القسم' : 'الأستاذ المسؤول', isMe: true }],
    certificates: learn ? learn.certificates.map(c => ({
      id: c.id, title: c.title, issuedAt: c.issued_at, url: c.serial ? `/certificate/${c.serial}` : null,
    })) : null,
    nextCertificate: course ? { title: `شهادة إتمام ${course.title}`, pct: course.progress_pct } : null,
    achievements: learn?.streak && learn.streak.current >= 3
      ? [{ title: `${learn.streak.current} أيام متتالية من الدراسة`, at: learn.last_active_at ?? new Date().toISOString(), kind: 'streak' as const }]
      : [],
    activity: [
      ...(learn?.last_lesson_at ? [{ kind: 'lesson' as const, title: 'أكمل درساً', sub: course?.title ?? 'المنصة', at: learn.last_lesson_at }] : []),
      ...(learn?.certificates ?? []).map(c => ({ kind: 'certificate' as const, title: 'حصل على شهادة', sub: c.title, at: c.issued_at })),
      ...markRows.map(m => ({ kind: 'attendance' as const, title: m.status === 'absent' ? 'غياب عن حصة' : m.status === 'late' ? 'حضر متأخراً' : 'حضر حصة', sub: m.title, at: m.at })),
      ...notes.filter(n => n.note).map(n => ({ kind: 'note' as const, title: 'ملاحظة أستاذ', sub: n.note as string, at: n.at })),
    ].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 10),
    summary: {
      goal: null, learningStyle: null, favoriteSkill: null,
      motivation: participation.length ? (avg(participation) >= 4 ? 'high' : avg(participation) >= 3 ? 'steady' : 'low') : null,
      participationAvg: participation.length ? Math.round(avg(participation) * 10) / 10 : null,
      needsHelp: notes.slice(0, 3).some(n => n.needs_help),
      notes: notes.filter(n => n.note).slice(0, 5).map(n => ({ at: n.at, text: n.note as string, by: teacher.name })),
    },
    access: { payments: false, learning: !!learn, certificates: !!learn },
  }
}

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

/* ── Demo: every section filled, for design review ─────────────────────── */

const daysFrom = (d: number, h = 18, m = 0) => { const t = new Date(); t.setDate(t.getDate() + d); t.setHours(h, m, 0, 0); return t.toISOString() }

export function demoStudentProfile(id: string, name = 'يوسف العلمي'): StudentProfile {
  const statuses: AttendanceStatus[] = ['present', 'present', 'late', 'present', 'absent', 'present', 'present', 'present',
    'present', 'late', 'present', 'present', 'absent', 'present', 'present', 'present', 'present', 'present']
  const attendance: SPAttendance[] = statuses.map((st, i) => ({
    at: daysFrom(-(i * 3 + 1)), title: i % 2 ? 'المحادثة A2 — مساءً' : 'إعداد مقابلات العمل — فردي', status: st,
    note: st === 'absent' ? (i === 4 ? 'سفر عائلي — أُبلغنا مسبقاً' : 'مرض') : null,
  }))
  return {
    id, name, avatarUrl: null, phoneMasked: '+2126••••18',
    enrolledAt: daysFrom(-120).slice(0, 10),
    statuses: ['active', 'vip'],
    level: 'B1', goalLevel: 'B2',
    courses: [{ title: 'المحادثة A2 → B1', status: 'active' }, { title: 'من الصفر A0', status: 'completed' }],
    learning: {
      course: 'المحادثة B1', unit: 'الوحدة 6 — العمل والمهن', lesson: 'الدرس 24 — مقابلة عمل',
      teacher: 'سارة بن يوسف', progressPct: 68, nextMilestone: 'امتحان الوحدة 6 — بعد درسين',
      weekMinutes: 245, trend: [40, 55, 38, 62, 70, 58, 81, 68],
    },
    classes: [
      { id: 'c1', title: 'المحادثة A2 — مساءً', teacher: 'سارة بن يوسف', mode: 'group', schedule: 'الإثنين والأربعاء 18:00',
        status: 'active', sessionsDone: 14, meetingUrl: 'https://meet.google.com/demo', nextAt: daysFrom(0, 18), level: 'B1' },
      { id: 'c2', title: 'إعداد مقابلات العمل — فردي', teacher: 'سارة بن يوسف', mode: 'private', schedule: 'الخميس 20:00',
        status: 'active', sessionsDone: 6, meetingUrl: 'https://meet.google.com/demo', nextAt: daysFrom(1, 20), level: 'B1' },
      { id: 'c3', title: 'حصة تجريبية — الكتابة', teacher: 'أنس بلحاج', mode: 'trial', schedule: 'السبت 10:00',
        status: 'waitlisted', sessionsDone: 0, meetingUrl: null, nextAt: daysFrom(4, 10), level: 'B1' },
    ],
    sessions: [
      { id: 's1', title: 'المحادثة — وصف التجارب', startsAt: daysFrom(0, 18), durationMin: 60, teacher: 'سارة بن يوسف', mode: 'group', meetingUrl: 'https://meet.google.com/demo', location: null, status: 'scheduled', attendance: null, reminder: true },
      { id: 's2', title: 'مقابلة عمل تجريبية', startsAt: daysFrom(1, 20), durationMin: 45, teacher: 'سارة بن يوسف', mode: 'private', meetingUrl: 'https://meet.google.com/demo', location: null, status: 'scheduled', attendance: null, reminder: true },
      { id: 's3', title: 'المحادثة — السفر والمطار', startsAt: daysFrom(2, 18), durationMin: 60, teacher: 'سارة بن يوسف', mode: 'group', meetingUrl: 'https://meet.google.com/demo', location: null, status: 'scheduled', attendance: null, reminder: false },
      { id: 's4', title: 'حصة تجريبية — الكتابة', startsAt: daysFrom(4, 10), durationMin: 30, teacher: 'أنس بلحاج', mode: 'trial', meetingUrl: null, location: 'القاعة 2', status: 'scheduled', attendance: null, reminder: false },
      { id: 's5', title: 'المحادثة — مراجعة الوحدة', startsAt: daysFrom(7, 18), durationMin: 60, teacher: 'سارة بن يوسف', mode: 'group', meetingUrl: 'https://meet.google.com/demo', location: null, status: 'scheduled', attendance: null, reminder: false },
      { id: 's6', title: 'المحادثة — التسوق', startsAt: daysFrom(-1, 18), durationMin: 60, teacher: 'سارة بن يوسف', mode: 'group', meetingUrl: null, location: null, status: 'done', attendance: 'present', reminder: false },
    ],
    attendance,
    study: {
      lessonsCompleted: 42, exercises: 128, quizzesPassed: 19, vocabulary: 640, videosWatched: 37,
      hoursWatched: 28.5, practiceMinutes: 1260, avgScore: 84, lastExerciseAt: daysFrom(-1, 21), targetPct: 72,
      skills: [
        { key: 'speaking', label: 'المحادثة', pct: 72 }, { key: 'listening', label: 'الاستماع', pct: 78 },
        { key: 'reading', label: 'القراءة', pct: 66 }, { key: 'writing', label: 'الكتابة', pct: 54 },
        { key: 'vocabulary', label: 'المفردات', pct: 81 }, { key: 'grammar', label: 'القواعد', pct: 63 },
      ],
      weekly: [{ label: '1', value: 9 }, { label: '2', value: 14 }, { label: '3', value: 11 }, { label: '4', value: 17 },
               { label: '5', value: 12 }, { label: '6', value: 19 }, { label: '7', value: 16 }, { label: '8', value: 21 }],
    },
    levelInfo: {
      current: 'B1', goal: 'B2', improvement: 18, nextStep: 'التركيز على الكتابة: فقرة قصيرة يومياً لمدة أسبوعين',
      trend: [{ label: 'يونيو', level: 'A1' }, { label: 'يوليوز', level: 'A2' }, { label: 'شتنبر', level: 'A2' }, { label: 'أكتوبر', level: 'B1' }],
    },
    payment: {
      totalPaid: 2400, balance: 600, nextDueAt: daysFrom(8).slice(0, 10), lastPaidAt: daysFrom(-22).slice(0, 10), status: 'due',
      history: [
        { id: 'p1', at: daysFrom(-22), amount: 600, label: 'اشتراك شهري — أكتوبر', status: 'paid', receiptUrl: '#' },
        { id: 'p2', at: daysFrom(-52), amount: 600, label: 'اشتراك شهري — شتنبر', status: 'paid', receiptUrl: '#' },
        { id: 'p3', at: daysFrom(-82), amount: 600, label: 'اشتراك شهري — غشت', status: 'paid', receiptUrl: '#' },
        { id: 'p4', at: daysFrom(-112), amount: 600, label: 'رسوم التسجيل', status: 'paid', receiptUrl: '#' },
      ],
    },
    teachers: [
      { id: 't1', name: 'سارة بن يوسف', avatarUrl: null, specialty: 'المحادثة وتحضير IELTS', rating: 4.8, role: 'المدرّبة الرئيسية', isMe: true },
      { id: 't2', name: 'أنس بلحاج', avatarUrl: null, specialty: 'الكتابة الأكاديمية', rating: 4.6, role: 'أستاذ الكتابة', isMe: false },
      { id: 't3', name: 'مريم الشرقاوي', avatarUrl: null, specialty: 'المتابعة والتحفيز', rating: null, role: 'المرشدة', isMe: false },
    ],
    certificates: [
      { id: 'cert1', title: 'شهادة المستوى A1', issuedAt: daysFrom(-90), url: '#' },
      { id: 'cert2', title: 'شهادة المستوى A2', issuedAt: daysFrom(-30), url: '#' },
    ],
    nextCertificate: { title: 'شهادة المستوى B1', pct: 68 },
    achievements: [
      { title: '14 يوماً متتالية من الدراسة', at: daysFrom(-2), kind: 'streak' },
      { title: '500 كلمة جديدة', at: daysFrom(-9), kind: 'milestone' },
      { title: 'أفضل مشاركة في القسم', at: daysFrom(-16), kind: 'badge' },
    ],
    activity: [
      { kind: 'lesson', title: 'أكمل درساً', sub: 'الدرس 24 — مقابلة عمل', at: daysFrom(-1, 21) },
      { kind: 'homework', title: 'سلّم واجباً', sub: 'تسجيل صوتي: تقديم النفس', at: daysFrom(-1, 19) },
      { kind: 'attendance', title: 'حضر حصة', sub: 'المحادثة — التسوق', at: daysFrom(-1, 18) },
      { kind: 'note', title: 'ملاحظة أستاذ', sub: 'تحسّن واضح في الطلاقة، يحتاج تنويع المفردات', at: daysFrom(-2, 20) },
      { kind: 'streak', title: 'سلسلة دراسة جديدة', sub: '14 يوماً متتالية', at: daysFrom(-2, 9) },
      { kind: 'test', title: 'اجتاز اختباراً', sub: 'اختبار الوحدة 5 — 88%', at: daysFrom(-5, 17) },
      { kind: 'certificate', title: 'حصل على شهادة', sub: 'شهادة المستوى A2', at: daysFrom(-30, 12) },
      { kind: 'payment', title: 'تذكير بالدفع', sub: 'القسط القادم بعد 8 أيام', at: daysFrom(0, 9) },
    ],
    summary: {
      goal: 'اجتياز مقابلة عمل بالإنجليزية والوصول إلى B2 قبل الصيف.',
      learningStyle: 'سمعي — يتعلّم أفضل بالمحادثة والتسجيلات',
      favoriteSkill: 'المحادثة',
      motivation: 'high', participationAvg: 4.4, needsHelp: false,
      notes: [
        { at: daysFrom(-2, 20), text: 'تحسّن واضح في الطلاقة، يحتاج تنويع المفردات.', by: 'سارة بن يوسف' },
        { at: daysFrom(-9, 20), text: 'ممتاز في التحضير، يشارك دائماً أول القسم.', by: 'سارة بن يوسف' },
      ],
    },
    access: { payments: true, learning: true, certificates: true },
  }
}
