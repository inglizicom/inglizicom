import type { TeacherProfileFull } from '@/lib/teachers'

/**
 * A fully-populated profile, in memory, for `?demo=1`.
 *
 * Nothing here touches Supabase — it exists so the layout can be judged with
 * real density rather than with empty states. Every number is invented; the
 * banner on the page says so.
 */

const daysFromNow = (d: number, h: number, m = 0) => {
  const t = new Date()
  t.setDate(t.getDate() + d)
  t.setHours(h, m, 0, 0)
  return t.toISOString()
}
const daysAgo = (d: number) => {
  const t = new Date(); t.setDate(t.getDate() - d); return t.toISOString()
}

export const DEMO_PROFILE: TeacherProfileFull = {
  profile: {
    id: 'demo',
    display_name: 'سارة بن يوسف',
    headline: 'مدرّبة إنجليزية معتمدة · تحضير IELTS ومحادثة الأعمال',
    bio: 'أُدرّس الإنجليزية منذ تسع سنوات، وأغلب طلابي جاؤوا وهم يعرفون القواعد ولا يستطيعون الكلام. طريقتي تبدأ من الصوت: نتحدث في الحصة الأولى مهما كان المستوى، وأصحح النطق أثناء الحديث لا بعده.\n\nعملت مع فرق في شركات تقنية على إنجليزية الاجتماعات والعروض، ومع طلاب يحضّرون IELTS لأغراض الهجرة والدراسة. أؤمن أن الطالب لا يحتاج مزيداً من القواعد، بل يحتاج من يستمع إليه ويصحح له بلطف.',
    avatar_url: null,
    cover_url: null,
    tagline: 'من «أفهم ولا أتكلم» إلى محادثة واثقة في 12 أسبوعاً',
    english_level: 'C2 · IELTS 8.5',
    levels: ['A2', 'B1', 'B2', 'C1'],
    specialties: ['تحضير IELTS', 'إنجليزية الأعمال', 'المحادثة', 'النطق'],
    languages: ['العربية', 'الإنجليزية', 'الفرنسية'],
    whatsapp: '+212600000000',
    pay_model: 'hourly',
    hourly_rate_mad: null,
    availability: [],
    hired_at: '2021-09-01',
    is_active: true,
    rating_avg: 4.8,
    rating_count: 47,
    competences: [
      'تصحيح النطق أثناء الحديث',
      'بناء الثقة في الكلام',
      'إنجليزية الاجتماعات والعروض',
      'استراتيجيات IELTS Speaking',
      'الكتابة الأكاديمية',
      'تبسيط القواعد بلا حفظ',
    ],
    liked_qualities: ['الصبر', 'تصحيح لطيف', 'حصص منظمة', 'ردّ سريع', 'أمثلة من الواقع'],
    certificates: [
      { title: 'CELTA — Certificate in Teaching English', issuer: 'Cambridge Assessment', year: '2018' },
      { title: 'IELTS Academic — Band 8.5', issuer: 'British Council', year: '2020' },
      { title: 'Teaching Business English', issuer: 'Coursera · Arizona State University', year: '2022' },
    ],
    experiences: [
      { role: 'مدرّبة إنجليزية أولى', org: 'إنجليزي.كوم', from: '2021', to: 'الآن',
        description: 'برامج المحادثة وتحضير IELTS، ومتابعة أسبوعية لأكثر من 40 طالباً.' },
      { role: 'مدرّبة إنجليزية للشركات', org: 'مركز لغات — الدار البيضاء', from: '2019', to: '2021',
        description: 'إنجليزية الاجتماعات والعروض لفرق تقنية ومالية.' },
      { role: 'مدرّسة إنجليزية', org: 'ثانوية خاصة', from: '2016', to: '2019',
        description: 'أقسام الثانوي، وتحضير امتحانات نهاية السنة.' },
    ],
    teaches: ['IELTS', 'إنجليزية الأعمال', 'المحادثة', 'النطق', 'الكتابة الأكاديمية'],
    not_teaches: ['الأطفال دون 12 سنة', 'الترجمة الفورية', 'الإنجليزية الطبية'],
    age_min: 14,
    age_max: 55,
    years_experience: 9,
  } as TeacherProfileFull['profile'],

  identity: { email: 'demo@inglizi.com', full_name: 'سارة بن يوسف' },

  stats: {
    students_total: 63, students_active: 41,
    classes_done: 428,  hours_total: 512.5,
    reports_written: 401, materials: 37,
    exams_corrected: 156, exams_passed: 131,
    attendance_rate: 92,
    rating_avg: 4.8, rating_count: 47,
    is_top_rated: true,
  },

  gender_split: { male: 17, female: 22, unknown: 2 },

  age_bands: [
    { band: '13–17', count: 5 },
    { band: '18–24', count: 16 },
    { band: '25–34', count: 13 },
    { band: '35–49', count: 6 },
    { band: '+50',   count: 1 },
  ],
  avg_age: 27,

  level_split: [
    { level: 'A2', count: 8 },
    { level: 'B1', count: 15 },
    { level: 'B2', count: 12 },
    { level: 'C1', count: 6 },
  ],

  upcoming: [
    { id: 'd1', teacher_id: 'demo', course_id: null, title: 'IELTS Speaking — Part 2 · وصف التجارب',
      mode: 'group', level: 'B2', starts_at: daysFromNow(0, 18), duration_min: 60,
      meeting_url: 'https://meet.google.com/demo', location: null, status: 'scheduled', cancel_reason: null, notes: null },
    { id: 'd2', teacher_id: 'demo', course_id: null, title: 'محادثة — مقابلة عمل تجريبية',
      mode: 'private', level: 'B1', starts_at: daysFromNow(1, 20), duration_min: 45,
      meeting_url: 'https://meet.google.com/demo', location: null, status: 'scheduled', cancel_reason: null, notes: null },
    { id: 'd3', teacher_id: 'demo', course_id: null, title: 'النطق — الأصوات الصامتة والربط',
      mode: 'group', level: 'A2', starts_at: daysFromNow(2, 17, 30), duration_min: 60,
      meeting_url: null, location: null, status: 'scheduled', cancel_reason: null, notes: null },
    { id: 'd4', teacher_id: 'demo', course_id: null, title: 'إنجليزية الأعمال — عرض تقديمي',
      mode: 'group', level: 'C1', starts_at: daysFromNow(4, 19), duration_min: 90,
      meeting_url: 'https://meet.google.com/demo', location: null, status: 'scheduled', cancel_reason: null, notes: null },
    { id: 'd5', teacher_id: 'demo', course_id: null, title: 'الكتابة الأكاديمية — Task 1',
      mode: 'private', level: 'B2', starts_at: daysFromNow(6, 18), duration_min: 60,
      meeting_url: null, location: null, status: 'scheduled', cancel_reason: null, notes: null },
  ],

  top_students: [
    { id: 's1', name: 'يوسف العلمي',   avatar_url: null, level: 'B2', coins: 3140, streak: 46, exams_passed: 9, last_seen: daysAgo(0), score: 408 },
    { id: 's2', name: 'مريم الشرقاوي', avatar_url: null, level: 'B1', coins: 2870, streak: 38, exams_passed: 8, last_seen: daysAgo(0), score: 363 },
    { id: 's3', name: 'أنس بلحاج',     avatar_url: null, level: 'C1', coins: 2410, streak: 31, exams_passed: 7, last_seen: daysAgo(1), score: 373 },
    { id: 's4', name: 'سلمى الإدريسي', avatar_url: null, level: 'B2', coins: 2050, streak: 27, exams_passed: 6, last_seen: daysAgo(1), score: 319 },
    { id: 's5', name: 'خديجة نور',     avatar_url: null, level: 'B1', coins: 1780, streak: 22, exams_passed: 5, last_seen: daysAgo(2), score: 272 },
    { id: 's6', name: 'رضا المنصوري',  avatar_url: null, level: 'A2', coins: 1490, streak: 19, exams_passed: 4, last_seen: daysAgo(3), score: 227 },
    { id: 's7', name: 'هند الفاسي',    avatar_url: null, level: 'B2', coins: 1220, streak: 14, exams_passed: 4, last_seen: daysAgo(4), score: 190 },
    { id: 's8', name: 'عمر الحسني',    avatar_url: null, level: 'B1', coins: 980,  streak: 11, exams_passed: 3, last_seen: daysAgo(6), score: 150 },
  ],

  testimonials: [
    { id: 't1', rating: 5, comment: 'كنت أفهم كل شيء ولا أستطيع نطق جملة. بعد شهرين تكلمت في اجتماع كامل بالإنجليزية. الفرق ليس في القواعد — في الثقة.', created_at: daysAgo(3), student_name: 'يوسف العلمي', student_avatar: null },
    { id: 't2', rating: 5, comment: 'تصحّح الخطأ في نفس اللحظة وبطريقة لا تُشعرك بالإحراج أبداً. هذا وحده غيّر علاقتي باللغة.', created_at: daysAgo(9), student_name: 'مريم الشرقاوي', student_avatar: null },
    { id: 't3', rating: 5, comment: 'حصص منظمة جداً، وكل درس له هدف واضح. حصلت على 7.5 في IELTS من أول محاولة.', created_at: daysAgo(15), student_name: 'أنس بلحاج', student_avatar: null },
    { id: 't4', rating: 4, comment: 'الشرح ممتاز والأمثلة من الحياة اليومية. أتمنى فقط لو كانت الحصص أطول قليلاً.', created_at: daysAgo(22), student_name: 'سلمى الإدريسي', student_avatar: null },
    { id: 't5', rating: 5, comment: 'ترد على أسئلتي على واتساب حتى بين الحصص. شعرت أن أحداً يتابعني فعلاً.', created_at: daysAgo(30), student_name: 'خديجة نور', student_avatar: null },
    { id: 't6', rating: 5, comment: 'أفضل ما فيها الصبر. أعدت السؤال ثلاث مرات ولم تتغير نبرتها.', created_at: daysAgo(41), student_name: 'رضا المنصوري', student_avatar: null },
  ],

  rating_breakdown: { '5': 39, '4': 6, '3': 1, '2': 1, '1': 0 },
}
