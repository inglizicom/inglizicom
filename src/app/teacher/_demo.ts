import type {
  ClassRosterRow, ClassSession, LessonReport, MyClass, MyStudent, SessionRosterRow, TeacherMaterial, TeacherOverview,
} from '@/lib/teachers'

/**
 * `?demo=1` for the whole teaching space.
 *
 * Same convention the student portal already uses (src/lib/demo.ts): the flag
 * sticks for the session so navigating between pages keeps the preview on.
 * Nothing here touches Supabase — it exists so the design can be judged at real
 * density before a single student is assigned. Every page shows a banner.
 */

export function isTeacherDemo(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (new URLSearchParams(window.location.search).get('demo') === '1') {
      sessionStorage.setItem('inglizi.teacherDemo', '1'); return true
    }
    if (new URLSearchParams(window.location.search).get('demo') === '0') {
      sessionStorage.removeItem('inglizi.teacherDemo'); return false
    }
    return sessionStorage.getItem('inglizi.teacherDemo') === '1'
  } catch { return false }
}

const at = (dayOffset: number, h: number, m = 0) => {
  const t = new Date(); t.setDate(t.getDate() + dayOffset); t.setHours(h, m, 0, 0)
  return t.toISOString()
}
const ago = (d: number) => { const t = new Date(); t.setDate(t.getDate() - d); return t.toISOString() }

/* ── Students ──────────────────────────────────────────── */

const NAMES = [
  'يوسف العلمي', 'مريم الشرقاوي', 'أنس بلحاج', 'سلمى الإدريسي', 'خديجة نور',
  'رضا المنصوري', 'هند الفاسي', 'عمر الحسني', 'ليلى بنعمر', 'كريم الزهراوي',
  'نادية التازي', 'إلياس بركة',
]
const COURSES = ['المحادثة A2', 'IELTS B2', 'إنجليزية الأعمال C1', 'من الصفر A0', 'النطق B1']

export const DEMO_STUDENTS: MyStudent[] = NAMES.map((n, i) => {
  const classes = i % 4 === 0
    ? [{ class_id: 'demo-c3', title: 'إعداد مقابلات العمل — فردي', mode: 'private' as const }]
    : i % 3 === 1 || i % 2 === 0
      ? [{ class_id: 'demo-c1', title: 'المحادثة A2 — مساءً', mode: 'group' as const }]
      : []
  const assigned = i % 3 !== 1
  return {
    id: `demo-s${i}`,
    full_name: n,
    course: COURSES[i % COURSES.length],
    student_type: i % 4 === 0 ? 'private_student' : 'course_student',
    enrollment_date: ago(30 + i * 9).slice(0, 10),
    is_active: i !== 11,
    avatar_url: null,
    phone_masked: `+2126••••${(11 + i * 7).toString().padStart(2, '0')}`,
    assigned,
    assigned_at: assigned ? ago(28 + i * 8) : null,
    classes,
    relationship: assigned && classes.length ? 'both' : assigned ? 'assigned' : 'class',
    courses: i % 5 === 3 ? [] : [
      { course_id: `demo-k${i % 5}`, title: COURSES[i % 5], level: null,
        status: i === 7 ? 'completed' as const : 'active' as const, enrolled_at: ago(40 + i), completed_at: i === 7 ? ago(3) : null },
      ...(i === 2 ? [{ course_id: 'demo-k9', title: 'IELTS B2', level: null, status: 'active' as const,
                      enrolled_at: ago(12), completed_at: null }] : []),
    ],
    class_memberships: [
      ...classes.map(c => ({ enrollment_id: `demo-e${i}-${c.class_id}`, ...c, status: 'active' as const,
        class_status: 'active' as const, archived: false, enrolled_at: ago(35 - i), ended_at: null })),
      ...(i === 5 ? [{ enrollment_id: 'demo-e5w', class_id: 'demo-c2', title: 'IELTS B2 — مجموعة السبت', mode: 'group' as const,
        status: 'waitlisted' as const, class_status: 'active' as const, archived: false, enrolled_at: ago(4), ended_at: null }] : []),
    ],
  }
})

/* ── Overview (derived from the demo roster so the two always agree) ── */

const demoSeats = DEMO_STUDENTS.flatMap(s => (s.class_memberships ?? []).filter(m => m.status === 'active'))
const demoCourse = DEMO_STUDENTS.filter(s => (s.courses ?? []).some(c => c.status === 'active'))

export const DEMO_OVERVIEW: TeacherOverview = {
  students_total: DEMO_STUDENTS.length,
  assigned_students: DEMO_STUDENTS.filter(s => s.assigned).length,
  class_students: DEMO_STUDENTS.filter(s => (s.classes ?? []).length > 0).length,
  classes_active: 3,
  classes_month: 34, hours_month: 38.5,
  upcoming: 6, reports_owed: 2, attendance_rate: 92,
  rating_avg: 4.8, rating_count: 47,
  roster: {
    unique_students:    DEMO_STUDENTS.length,
    assigned_students:  DEMO_STUDENTS.filter(s => s.assigned).length,
    assigned_only:      DEMO_STUDENTS.filter(s => s.relationship === 'assigned').length,
    class_only:         DEMO_STUDENTS.filter(s => s.relationship === 'class').length,
    assigned_and_class: DEMO_STUDENTS.filter(s => s.relationship === 'both').length,
    course_students:    demoCourse.length,
    course_enrollments: DEMO_STUDENTS.flatMap(s => (s.courses ?? []).filter(c => c.status === 'active')).length,
    no_course_students: DEMO_STUDENTS.length - demoCourse.length,
    class_students:     DEMO_STUDENTS.filter(s => (s.class_memberships ?? []).some(m => m.status === 'active')).length,
    class_seats:        demoSeats.length,
    group_seats:        demoSeats.filter(m => m.mode === 'group').length,
    private_seats:      demoSeats.filter(m => m.mode === 'private').length,
    group_students:     DEMO_STUDENTS.filter(s => (s.classes ?? []).some(c => c.mode === 'group')).length,
    private_students:   DEMO_STUDENTS.filter(s => (s.classes ?? []).some(c => c.mode === 'private')).length,
    group_classes: 2, private_classes: 1,
  },
  period: {
    from: null, to: null, timezone: 'Africa/Casablanca',
    sessions_delivered: 12, hours_delivered: 13.5, sessions_cancelled: 1, sessions_scheduled: 6, reports_owed: 2,
    attendance: { marks: 350, present: 286, late: 31, absent: 24, excused: 9, rate: 90.6 },
  },
  upcoming_sessions: 6,
  reports_owed_all_time: 2,
}

/* ── Online classes ────────────────────────────────────── */

export const DEMO_CLASSES: MyClass[] = [
  { id: 'demo-c1', title: 'المحادثة A2 — مساءً', mode: 'group', level: 'A2', status: 'active',
    course_id: null, course_title: 'المحادثة A2', starts_on: ago(40).slice(0, 10), ends_on: null, capacity: 12,
    meeting_url: 'https://meet.google.com/demo', schedule_note: 'الإثنين والأربعاء 18:00',
    is_owner: true, archived: false, active_count: 9, waitlisted_count: 2, sessions_done: 14, reports_owed: 1,
    next_session_at: at(0, 18) },
  { id: 'demo-c2', title: 'IELTS B2 — مجموعة السبت', mode: 'group', level: 'B2', status: 'active',
    course_id: null, course_title: 'IELTS B2', starts_on: ago(20).slice(0, 10), ends_on: null, capacity: 8,
    meeting_url: null, schedule_note: 'السبت 10:00',
    is_owner: true, archived: false, active_count: 8, waitlisted_count: 0, sessions_done: 3, reports_owed: 0,
    next_session_at: at(4, 10) },
  { id: 'demo-c3', title: 'إعداد مقابلات العمل — فردي', mode: 'private', level: 'B1', status: 'active',
    course_id: null, course_title: null, starts_on: ago(10).slice(0, 10), ends_on: null, capacity: 1,
    meeting_url: null, schedule_note: 'حسب الاتفاق',
    is_owner: true, archived: false, active_count: 1, waitlisted_count: 0, sessions_done: 2, reports_owed: 1,
    next_session_at: at(1, 20) },
  { id: 'demo-c4', title: 'النطق B1 — تعويض', mode: 'group', level: 'B1', status: 'completed',
    course_id: null, course_title: null, starts_on: ago(90).slice(0, 10), ends_on: ago(30).slice(0, 10), capacity: null,
    meeting_url: null, schedule_note: null,
    is_owner: false, archived: false, active_count: 0, waitlisted_count: 0, sessions_done: 2, reports_owed: 0,
    next_session_at: null },
]

export const DEMO_CLASS_ROSTER: ClassRosterRow[] = NAMES.slice(0, 11).map((n, i) => ({
  enrollment_id: `demo-e${i}`, student_id: `demo-s${i}`, full_name: n, avatar_url: null,
  phone_masked: `+2126••••${(11 + i * 7).toString().padStart(2, '0')}`,
  status: i < 9 ? 'active' : i === 9 ? 'waitlisted' : 'cancelled',
  enrolled_at: ago(40 - i * 2), start_date: ago(38 - i * 2).slice(0, 10), end_date: null,
  ended_at: i === 10 ? ago(6) : null,
  attendance: { marked: 14 - (i % 5), present: 12 - (i % 6), absent: i % 3 },
}))

export const DEMO_SESSION_ROSTER: SessionRosterRow[] = NAMES.slice(0, 9).map((n, i) => ({
  student_id: `demo-s${i}`, full_name: n, avatar_url: null, eligible: true,
  attendance: i === 2 ? 'absent' : i === 5 ? 'late' : null, note: null,
}))

/* ── Sessions ──────────────────────────────────────────── */

const S = (
  id: string, title: string, offset: number, h: number,
  mode: 'group' | 'private', level: string, status: ClassSession['status'],
  mins = 60, url: string | null = 'https://meet.google.com/demo',
): ClassSession => ({
  id, teacher_id: 'demo', course_id: null, title, mode, level,
  starts_at: at(offset, h), duration_min: mins, meeting_url: url,
  location: null, status, cancel_reason: null, notes: null,
})

export const DEMO_SESSIONS: ClassSession[] = [
  // ahead
  S('d1', 'IELTS Speaking — Part 2 · وصف التجارب',       0,  18, 'group',   'B2', 'scheduled'),
  S('d2', 'محادثة — مقابلة عمل تجريبية',                  1,  20, 'private', 'B1', 'scheduled', 45),
  S('d3', 'النطق — الأصوات الصامتة والربط',                2,  17, 'group',   'A2', 'scheduled', 60, null),
  S('d4', 'إنجليزية الأعمال — عرض تقديمي',                 4,  19, 'group',   'C1', 'scheduled', 90),
  S('d5', 'الكتابة الأكاديمية — Task 1',                   6,  18, 'private', 'B2', 'scheduled'),
  S('d6', 'مراجعة الوحدة 4 — الماضي البسيط',               8,  17, 'group',   'A2', 'scheduled'),
  // behind
  S('d7',  'محادثة — التسوق وطلب الطعام',                 -1,  18, 'group',   'A2', 'done'),
  S('d8',  'IELTS Writing — Task 2 · الحجج',              -2,  19, 'group',   'B2', 'done', 90),
  S('d9',  'النطق — أصوات /θ/ و /ð/',                     -3,  17, 'private', 'B1', 'done', 45),
  S('d10', 'إنجليزية الأعمال — البريد المهني',             -5,  19, 'group',   'C1', 'done'),
  S('d11', 'محادثة — السفر والمطار',                      -6,  18, 'group',   'A2', 'done'),
  S('d12', 'مراجعة عامة — الوحدة 3',                      -8,  17, 'group',   'B1', 'done'),
  S('d13', 'حصة ملغاة — عطلة',                            -9,  18, 'group',   'A2', 'cancelled'),
  S('d14', 'IELTS Listening — تمارين',                   -12, 19, 'group',   'B2', 'done'),
  S('d15', 'محادثة — العمل عن بعد',                      -15, 18, 'group',   'B1', 'done'),
  S('d16', 'النطق — النبر داخل الكلمة',                   -19, 17, 'private', 'B1', 'done', 45),
  S('d17', 'الكتابة — رسالة رسمية',                      -23, 18, 'group',   'B2', 'done'),
  S('d18', 'محادثة — تقديم النفس',                       -27, 18, 'group',   'A0', 'done'),
].map(s => ({
  ...s,
  class_id: ['d1', 'd6', 'd7', 'd11'].includes(s.id) ? 'demo-c1' : ['d2', 'd9'].includes(s.id) ? 'demo-c3' : null,
}))

/* ── Reports ───────────────────────────────────────────── */

export const DEMO_REPORTS: LessonReport[] = [
  {
    id: 'r1', session_id: 'd7', teacher_id: 'demo',
    covered: 'تمرين محادثة على التسوق وطلب الطعام. راجعنا صيغ الطلب المهذب (Could I…, I’d like…) وتدربنا على الأرقام والأسعار. وقف أغلب الطلاب عند نطق /θ/ في thirty، فخصصنا لها خمس دقائق إضافية.',
    homework: 'تسجيل صوتي: اطلب وجبة من مطعم بالإنجليزية، دقيقة واحدة.',
    materials_used: 'ملف PDF — عبارات المطعم · بطاقات الأرقام',
    student_notes: [
      { student_id: 'demo-s0', participation: 5, needs_help: false, note: 'ينطق بثقة، جاهز للمستوى التالي.' },
      { student_id: 'demo-s3', participation: 3, needs_help: true,  note: 'تتردد كثيراً قبل الكلام — تحتاج تشجيعاً.' },
    ],
    founder_note: 'سلمى تحتاج حصة فردية إضافية هذا الأسبوع.',
    submitted_at: ago(1),
  },
  {
    id: 'r2', session_id: 'd8', teacher_id: 'demo',
    covered: 'IELTS Writing Task 2 — بناء الحجة والحجة المضادة. حللنا نموذجاً من Band 7 وقارنّاه بنموذج Band 5، ثم كتب كل طالب مقدمة وفقرة أولى.',
    homework: 'إكمال المقال (250 كلمة) وإرساله قبل الخميس.',
    materials_used: 'نموذجان مصححان · قائمة روابط الفقرات',
    student_notes: [
      { student_id: 'demo-s2', participation: 5, needs_help: false, note: 'بنية ممتازة، يحتاج تنويع المفردات فقط.' },
      { student_id: 'demo-s1', participation: 4, needs_help: false },
    ],
    founder_note: null,
    submitted_at: ago(2),
  },
  {
    id: 'r3', session_id: 'd10', teacher_id: 'demo',
    covered: 'البريد المهني: الافتتاح، الطلب، الخاتمة. كتب كل طالب رسالة متابعة بعد اجتماع، وصححناها جماعياً.',
    homework: 'كتابة بريد اعتذار عن تأخير تسليم.',
    materials_used: 'قوالب بريد · قائمة عبارات مهذبة',
    student_notes: [{ student_id: 'demo-s6', participation: 4, needs_help: false }],
    founder_note: null,
    submitted_at: ago(5),
  },
  {
    id: 'r4', session_id: 'd12', teacher_id: 'demo',
    covered: 'مراجعة شاملة للوحدة 3 قبل الامتحان. الأزمنة الماضية، حروف الجر، ومفردات العمل. أجرينا اختباراً قصيراً في آخر 15 دقيقة.',
    homework: 'مراجعة الأخطاء الشخصية من ورقة الاختبار.',
    materials_used: 'ورقة مراجعة الوحدة 3',
    student_notes: [
      { student_id: 'demo-s4', participation: 5, needs_help: false },
      { student_id: 'demo-s7', participation: 2, needs_help: true, note: 'غاب عن حصتين، فاته أساس الوحدة.' },
    ],
    founder_note: 'عمر تغيّب مرتين — يستحق مكالمة متابعة.',
    submitted_at: ago(8),
  },
]

/** d9 and d11 are finished with no report — the nag on the dashboard. */
export const DEMO_REPORTS_OWED: ClassSession[] = DEMO_SESSIONS.filter(
  s => ['d9', 'd11'].includes(s.id),
)

/* ── Materials ─────────────────────────────────────────── */

const M = (
  id: string, title: string, type: string, kb: number, days: number,
  visibility: TeacherMaterial['visibility'], level: string | null, downloads: number,
): TeacherMaterial => ({
  id, teacher_id: 'demo', course_id: null, title, description: null,
  file_path: `teachers/demo/${id}`, file_type: type, size_bytes: kb * 1024,
  level, unit_no: null, visibility, download_count: downloads, created_at: ago(days),
})

export const DEMO_MATERIALS: TeacherMaterial[] = [
  M('m1',  'IELTS Speaking — بنك الأسئلة الكامل.pdf',       'pdf',    2400, 2,  'students', 'B2', 87),
  M('m2',  'عبارات المطعم والتسوق.pdf',                      'pdf',     780, 4,  'course',   'A2', 64),
  M('m3',  'قوالب البريد المهني.docx',                       'doc',     310, 6,  'students', 'C1', 41),
  M('m4',  'تمارين النطق — الأصوات الصامتة.mp3',             'audio',  8600, 9,  'students', 'B1', 129),
  M('m5',  'عرض الوحدة 4 — الماضي البسيط.pptx',              'slides', 4100, 12, 'course',   'A2', 52),
  M('m6',  'ورقة مراجعة الوحدة 3.pdf',                        'pdf',     640, 15, 'course',   'B1', 73),
  M('m7',  'نماذج مقالات مصححة — Band 7.pdf',                'pdf',    1900, 18, 'students', 'B2', 96),
  M('m8',  'قائمة روابط الفقرات.pdf',                        'pdf',     220, 21, 'students', 'B2', 38),
  M('m9',  'فيديو — نبر الكلمة في الإنجليزية.mp4',            'video', 46000, 25, 'students', 'B1', 111),
  M('m10', 'بطاقات المفردات — العمل والمكتب.pdf',            'pdf',     540, 30, 'course',   'C1', 29),
  M('m11', 'ملاحظاتي الخاصة — تتبع الأخطاء الشائعة.docx',    'doc',     180, 34, 'private',  null, 0),
]
