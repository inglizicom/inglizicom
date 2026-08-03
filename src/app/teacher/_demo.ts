import type {
  ClassSession, LessonReport, MyStudent, TeacherMaterial, TeacherOverview,
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

/* ── Overview ──────────────────────────────────────────── */

export const DEMO_OVERVIEW: TeacherOverview = {
  students_total: 41, classes_month: 34, hours_month: 38.5,
  upcoming: 6, reports_owed: 2, attendance_rate: 92,
  rating_avg: 4.8, rating_count: 47,
}

export const DEMO_ATTENDANCE = { present: 286, late: 31, absent: 24, excused: 9 }

/* ── Students ──────────────────────────────────────────── */

const NAMES = [
  'يوسف العلمي', 'مريم الشرقاوي', 'أنس بلحاج', 'سلمى الإدريسي', 'خديجة نور',
  'رضا المنصوري', 'هند الفاسي', 'عمر الحسني', 'ليلى بنعمر', 'كريم الزهراوي',
  'نادية التازي', 'إلياس بركة',
]
const COURSES = ['المحادثة A2', 'IELTS B2', 'إنجليزية الأعمال C1', 'من الصفر A0', 'النطق B1']

export const DEMO_STUDENTS: MyStudent[] = NAMES.map((n, i) => ({
  id: `demo-s${i}`,
  full_name: n,
  course: COURSES[i % COURSES.length],
  student_type: i % 4 === 0 ? 'private_student' : 'course_student',
  enrollment_date: ago(30 + i * 9).slice(0, 10),
  is_active: i !== 11,
  avatar_url: null,
  phone_masked: `+2126••••${(11 + i * 7).toString().padStart(2, '0')}`,
  assigned_at: ago(28 + i * 8),
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
]

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
