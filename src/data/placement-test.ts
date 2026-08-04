/* ══════════════════════════════════════════════════════════════════════════
   PLACEMENT TEST — A0 → C1
   ══════════════════════════════════════════════════════════════════════════

   Six levels, ten questions each, deliberately mixed so no single skill can
   carry a student through a level. Every level contains grammar, vocabulary
   and comprehension, and every level from A1 up contains listening.

   Question types
     mcq         one correct option
     multi       several correct options — all must be found, none extra
     gap         type the missing word (fuzzy-matched, see lib/placement.ts)
     order       arrange scrambled words into a sentence
     reading     passage + question
     listenMcq   hear it, answer about it
     listenGap   hear it, fill the blanks in the transcript
     listenWrite dictation — hear it, type it back

   The bank is fixed, not randomised: a placement result has to be reproducible
   and defensible when a teacher looks at it afterwards.
   ══════════════════════════════════════════════════════════════════════════ */

export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export type QType =
  | 'mcq' | 'multi' | 'gap' | 'order'
  | 'reading' | 'listenMcq' | 'listenGap' | 'listenWrite'

export type SkillKey = 'grammar' | 'vocabulary' | 'comprehension' | 'listening' | 'writing'

export interface Question {
  id:           number
  level:        CEFRLevel
  type:         QType
  skill:        SkillKey
  /** Arabic instruction shown above the prompt. */
  hint:         string
  /** The prompt itself — English, or Arabic for translation items. */
  question:     string
  /** Reading passage, shown before the question. */
  passage?:     string
  /** Spoken text for any listen* type. */
  audio?:       string
  /** Transcript with ___ blanks (listenGap). */
  transcript?:  string
  options?:     string[]
  /** mcq / reading / listenMcq / listenGap-with-options: index of the answer. */
  answer?:      number
  /** multi: indexes that must all be selected. */
  answers?:     number[]
  /** gap / listenGap / listenWrite: accepted answers, first is canonical. */
  accept?:      string[][]
  /** order: the scrambled words. */
  words?:       string[]
  /** order: correct sequence as indexes into `words`. */
  correctOrder?: number[]
  /** Arabic explanation, shown after answering. */
  explain:      string
}

export interface WritingPrompt {
  level:    CEFRLevel
  /** Arabic instruction. */
  hint:     string
  /** English prompt. */
  prompt:   string
  minWords: number
  /** Shown as guidance while writing. */
  bullets:  string[]
}

/* ── Level order + presentation ─────────────────────────────────────────── */

const LEVEL_ORDER_VALUES: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']
export const LEVEL_ORDER: CEFRLevel[] = LEVEL_ORDER_VALUES

/**
 * Hearts per level. They grow with difficulty, because a mistake at C1 is a
 * different kind of event from a mistake at A0 — at the top a learner is being
 * asked to weigh nuance, and one slip should not end a twenty-minute test.
 *
 * Unspent hearts are banked. At the end the total says how comfortably the
 * learner held their level, which is what separates "scraped through B1" from
 * "owns B1", and it is allowed to move the final placement.
 */
export const HEARTS_BY_LEVEL: Record<CEFRLevel, number> = {
  A0: 3, A1: 3, A2: 4, B1: 4, B2: 5, C1: 5,
}

/** Total hearts available if someone clears every level. */
export const TOTAL_HEARTS = LEVEL_ORDER_VALUES.reduce((n, l) => n + HEARTS_BY_LEVEL[l], 0)

export const LEVEL_META: Record<CEFRLevel, {
  label: string; sub: string; from: string; to: string; ring: string; text: string
}> = {
  A0: { label: 'مبتدئ تماماً', sub: 'Beginner',       from: '#64748B', to: '#94A3B8', ring: 'ring-slate-400/40',   text: 'text-slate-300'   },
  A1: { label: 'مبتدئ',        sub: 'Elementary',     from: '#F59E0B', to: '#FBBF24', ring: 'ring-amber-400/40',   text: 'text-amber-300'   },
  A2: { label: 'أساسي',        sub: 'Pre-Intermediate', from: '#F97316', to: '#FB923C', ring: 'ring-orange-400/40', text: 'text-orange-300' },
  B1: { label: 'متوسط',        sub: 'Intermediate',   from: '#3B82F6', to: '#60A5FA', ring: 'ring-blue-400/40',    text: 'text-blue-300'    },
  B2: { label: 'فوق المتوسط',  sub: 'Upper-Intermediate', from: '#8B5CF6', to: '#A78BFA', ring: 'ring-violet-400/40', text: 'text-violet-300' },
  C1: { label: 'متقدم',        sub: 'Advanced',       from: '#10B981', to: '#34D399', ring: 'ring-emerald-400/40', text: 'text-emerald-300' },
}

export const SKILL_LABELS: Record<SkillKey, string> = {
  grammar:       'القواعد',
  vocabulary:    'المفردات',
  comprehension: 'الاستيعاب',
  listening:     'الاستماع',
  writing:       'الكتابة',
}

export const TYPE_LABELS: Record<QType, string> = {
  mcq:         'اختر الإجابة',
  multi:       'اختر كل الإجابات الصحيحة',
  gap:         'أكمل الفراغ',
  order:       'رتّب الجملة',
  reading:     'اقرأ وأجب',
  listenMcq:   'استمع وأجب',
  listenGap:   'استمع وأكمل',
  listenWrite: 'استمع واكتب',
}

export const CEFR_FEEDBACK: Record<CEFRLevel, { summary: string; canDo: string[]; focus: string[] }> = {
  A0: {
    summary: 'أنت تبدأ من الصفر تماماً — وهذا أفضل مكان للبداية، لأننا سنبني الأساس بشكل صحيح من أول يوم.',
    canDo: ['التعرّف على الحروف والأرقام', 'قول بعض الكلمات المنفردة', 'فهم التحية البسيطة'],
    focus: ['الحروف والنطق الأساسي', 'أفعال am / is / are', 'أول 300 كلمة يومية'],
  },
  A1: {
    summary: 'لديك أساس بسيط. تفهم الكلمات اليومية وتكوّن جملاً قصيرة. الآن نحوّل هذا إلى كلام حقيقي.',
    canDo: ['تقديم نفسك والآخرين', 'فهم الكلمات اليومية البسيطة', 'الإجابة عن أسئلة بسيطة عنك'],
    focus: ['المضارع البسيط والمستمر', 'أدوات التعريف a / an / the', 'الجملة: فاعل + فعل + مفعول'],
  },
  A2: {
    summary: 'تستطيع التواصل في المواقف اليومية. أساسك جيد — الآن نبنيه نحو الطلاقة.',
    canDo: ['وصف حياتك اليومية ومحيطك', 'التعامل مع التسوق والسفر البسيط', 'فهم الرسائل القصيرة'],
    focus: ['الماضي البسيط والمستمر', 'Present Perfect للتجارب', 'حروف الجر والتعابير الشائعة'],
  },
  B1: {
    summary: 'مستوى قوي. تعبّر عن رأيك وتتعامل مع معظم المواقف. أنت قريب من الطلاقة الحقيقية.',
    canDo: ['التعبير عن أفكارك بوضوح', 'التعامل مع مواقف العمل والسفر', 'فهم معظم المحادثات العادية'],
    focus: ['جمل الشرط Conditionals', 'المبني للمجهول Passive', 'الخطاب غير المباشر'],
  },
  B2: {
    summary: 'مستوى متقدم. تناقش موضوعات معقدة وتتفاعل بثقة مع الناطقين الأصليين.',
    canDo: ['فهم الأفكار في نصوص معقدة', 'التعبير بطلاقة دون توقف', 'المشاركة في نقاشات متخصصة'],
    focus: ['التراكيب الوصفية المعقدة', 'الكتابة الرسمية والأكاديمية', 'المفردات المتقدمة'],
  },
  C1: {
    summary: 'مستوى احترافي. إنجليزيتك قريبة من مستوى الناطقين الأصليين — يمكنك العمل والدراسة بها.',
    canDo: ['التعبير عن أفكار معقدة بدقة', 'فهم النصوص الطويلة والضمنية', 'الكتابة الأكاديمية المتقنة'],
    focus: ['الفروق الأسلوبية الدقيقة', 'أساليب الإقناع والخطابة', 'التعابير الاصطلاحية المتقدمة'],
  },
}

/** Which subscription tier suits each result. */
export function recommendPlan(level: CEFRLevel): string {
  if (level === 'A0' || level === 'A1') return 'basic'
  if (level === 'A2' || level === 'B1') return 'pro'
  return 'premium'
}

/* ══════════════════════════════════════════════════════════════════════════
   THE BANK
   ══════════════════════════════════════════════════════════════════════════ */

export const QUESTIONS: Record<CEFRLevel, Question[]> = {

  /* ─── A0 — can they read at all? ─────────────────────────────────────── */
  A0: [
    { id: 1, level: 'A0', type: 'mcq', skill: 'vocabulary',
      hint: 'اختر الترجمة الصحيحة:', question: 'ما معنى كلمة "book"؟',
      options: ['قلم', 'كتاب', 'باب', 'ماء'], answer: 1,
      explain: 'book = كتاب. (قلم = pen · باب = door · ماء = water)' },

    { id: 2, level: 'A0', type: 'mcq', skill: 'grammar',
      hint: 'أكمل الجملة:', question: 'I ___ Ahmed.',
      options: ['is', 'am', 'are', 'be'], answer: 1,
      explain: 'مع I نستخدم دائماً am. ✓ I am Ahmed.' },

    { id: 3, level: 'A0', type: 'mcq', skill: 'vocabulary',
      hint: 'أي رقم هو "seven"؟', question: 'seven = ؟',
      options: ['6', '7', '8', '9'], answer: 1,
      explain: 'seven = 7. (six=6 · eight=8 · nine=9)' },

    { id: 4, level: 'A0', type: 'multi', skill: 'vocabulary',
      hint: 'اختر كل الألوان (يمكن اختيار أكثر من إجابة):', question: 'Which words are colours?',
      options: ['red', 'table', 'blue', 'green', 'chair'], answers: [0, 2, 3],
      explain: 'الألوان: red (أحمر) · blue (أزرق) · green (أخضر). أما table = طاولة و chair = كرسي.' },

    { id: 5, level: 'A0', type: 'gap', skill: 'grammar',
      hint: 'اكتب الكلمة الناقصة (كلمة واحدة):', question: 'She ___ a teacher.',
      accept: [['is']],
      explain: 'مع she / he / it نستخدم is. ✓ She is a teacher.' },

    { id: 6, level: 'A0', type: 'mcq', skill: 'vocabulary',
      hint: 'اختر الكلمة الصحيحة:', question: 'Good ___! (في الصباح)',
      options: ['night', 'morning', 'bye', 'day'], answer: 1,
      explain: 'Good morning = صباح الخير. (Good night = تصبح على خير)' },

    { id: 7, level: 'A0', type: 'order', skill: 'grammar',
      hint: 'رتّب الكلمات لتكوين جملة صحيحة:', question: 'كوّن الجملة',
      words: ['name', 'My', 'Sara', 'is'], correctOrder: [1, 0, 3, 2],
      explain: 'My name is Sara. = اسمي سارة.' },

    { id: 8, level: 'A0', type: 'mcq', skill: 'grammar',
      hint: 'اختر الصحيح:', question: 'This is ___ apple.',
      options: ['a', 'an', 'the', '—'], answer: 1,
      explain: 'قبل حرف متحرك (a, e, i, o, u) نستخدم an. ✓ an apple.' },

    { id: 9, level: 'A0', type: 'listenWrite', skill: 'listening',
      hint: 'استمع واكتب ما تسمع (جملة قصيرة):', question: 'اكتب الجملة كما سمعتها',
      audio: 'My name is Sara.', accept: [['my name is sara']],
      explain: 'الجملة: "My name is Sara." — اسمي سارة.' },

    { id: 10, level: 'A0', type: 'mcq', skill: 'comprehension',
      hint: 'اقرأ وأجب:', question: 'Ali is 10. Sara is 12. Who is older?',
      passage: 'Ali is 10 years old. Sara is 12 years old.',
      options: ['Ali', 'Sara', 'Both same', 'We don\'t know'], answer: 1,
      explain: 'Sara عمرها 12 و Ali عمره 10 — إذن Sara أكبر (older).' },

    { id: 61, level: 'A0', type: 'gap', skill: 'grammar',
      hint: 'اكتب الكلمة الناقصة:', question: 'I ___ from Morocco.',
      accept: [['am']],
      explain: 'مع I نستخدم am. ✓ I am from Morocco.' },

    { id: 62, level: 'A0', type: 'mcq', skill: 'grammar',
      hint: 'اختر الجمع الصحيح:', question: 'one book → two ___',
      options: ['book', 'books', 'bookes', 'books\''], answer: 1,
      explain: 'الجمع العادي يضيف s فقط. ✓ two books.' },

    { id: 63, level: 'A0', type: 'multi', skill: 'vocabulary',
      hint: 'اختر كل أيام الأسبوع:', question: 'Which words are days of the week?',
      options: ['Monday', 'January', 'Friday', 'Sunday', 'March'], answers: [0, 2, 3],
      explain: 'أيام: Monday · Friday · Sunday. أما January و March فشهران.' },

    { id: 64, level: 'A0', type: 'order', skill: 'grammar',
      hint: 'رتّب الكلمات لتكوين سؤال:', question: 'كوّن السؤال',
      words: ['you', 'Where', 'from', 'are', '?'], correctOrder: [1, 3, 0, 2, 4],
      explain: 'Where are you from? = من أين أنت؟' },

    { id: 65, level: 'A0', type: 'listenGap', skill: 'listening',
      hint: 'استمع ثم أكمل الفراغ:', question: 'أكمل النص',
      audio: 'I am ten years old.',
      transcript: 'I am ___ years old.',
      accept: [['ten', '10']],
      explain: '"I am ten years old." = عمري عشر سنوات.' },

    { id: 66, level: 'A0', type: 'mcq', skill: 'vocabulary',
      hint: 'اختر الكلمة الصحيحة:', question: 'How ___ are you? (السؤال عن العمر)',
      options: ['much', 'many', 'old', 'long'], answer: 2,
      explain: 'How old are you? = كم عمرك؟' },
  ],

  /* ─── A1 ─────────────────────────────────────────────────────────────── */
  A1: [
    { id: 11, level: 'A1', type: 'mcq', skill: 'grammar',
      hint: 'أكمل الجملة:', question: 'She ___ to school every day.',
      options: ['go', 'goes', 'going', 'went'], answer: 1,
      explain: 'المضارع البسيط مع she/he/it يأخذ s. ✓ She goes.' },

    { id: 12, level: 'A1', type: 'gap', skill: 'grammar',
      hint: 'اكتب الكلمة الناقصة:', question: 'They ___ playing football now.',
      accept: [['are']],
      explain: 'المضارع المستمر: are + verb-ing مع they. ✓ They are playing.' },

    { id: 13, level: 'A1', type: 'multi', skill: 'vocabulary',
      hint: 'اختر كل أفراد العائلة:', question: 'Which words are family members?',
      options: ['brother', 'kitchen', 'mother', 'uncle', 'window'], answers: [0, 2, 3],
      explain: 'brother (أخ) · mother (أم) · uncle (عم/خال). kitchen = مطبخ · window = نافذة.' },

    { id: 14, level: 'A1', type: 'mcq', skill: 'vocabulary',
      hint: 'اختر عكس الكلمة:', question: 'The opposite of "expensive" is ___',
      options: ['big', 'cheap', 'new', 'fast'], answer: 1,
      explain: 'expensive (غالي) ↔ cheap (رخيص).' },

    { id: 15, level: 'A1', type: 'order', skill: 'grammar',
      hint: 'رتّب الكلمات:', question: 'كوّن الجملة',
      words: ['coffee', 'like', 'I', "don't"], correctOrder: [2, 3, 1, 0],
      explain: "I don't like coffee. = لا أحب القهوة." },

    { id: 16, level: 'A1', type: 'listenGap', skill: 'listening',
      hint: 'استمع ثم أكمل الفراغين:', question: 'أكمل النص',
      audio: 'I have two brothers and one sister.',
      transcript: 'I have ___ brothers and ___ sister.',
      accept: [['two', '2'], ['one', '1', 'a']],
      explain: 'النص: "I have two brothers and one sister."' },

    { id: 17, level: 'A1', type: 'mcq', skill: 'grammar',
      hint: 'اختر حرف الجر الصحيح:', question: 'The book is ___ the table.',
      options: ['in', 'on', 'at', 'to'], answer: 1,
      explain: 'on = على سطح شيء. ✓ on the table.' },

    { id: 18, level: 'A1', type: 'reading', skill: 'comprehension',
      hint: 'اقرأ النص وأجب:', question: 'What time does the shop close?',
      passage: 'GREEN MARKET\nOpen: Monday to Saturday\nHours: 8:00 a.m. – 9:00 p.m.\nClosed on Sunday.',
      options: ['8:00 a.m.', '9:00 p.m.', 'Sunday', 'Monday'], answer: 1,
      explain: 'ساعات العمل حتى 9:00 p.m. — إذن يغلق الساعة التاسعة مساءً.' },

    { id: 19, level: 'A1', type: 'mcq', skill: 'grammar',
      hint: 'اختر الصحيح:', question: 'There ___ some milk in the fridge.',
      options: ['is', 'are', 'have', 'has'], answer: 0,
      explain: 'milk اسم غير معدود → There is. (لو كانت apples → There are)' },

    { id: 20, level: 'A1', type: 'listenWrite', skill: 'listening',
      hint: 'استمع واكتب الجملة:', question: 'اكتب ما تسمع',
      audio: 'I go to work by bus.',
      accept: [['i go to work by bus']],
      explain: '"I go to work by bus." = أذهب إلى العمل بالحافلة.' },

    { id: 67, level: 'A1', type: 'mcq', skill: 'grammar',
      hint: 'اختر الصحيح:', question: 'That is ___ sister. (أخت المتكلم)',
      options: ['me', 'my', 'mine', 'I'], answer: 1,
      explain: 'my + اسم (ملكية). ✓ my sister. (mine تأتي وحدها: It is mine.)' },

    { id: 68, level: 'A1', type: 'gap', skill: 'grammar',
      hint: 'اكتب الكلمة الناقصة:', question: 'There ___ three books on the desk.',
      accept: [['are']],
      explain: 'الجمع (three books) → There are.' },

    { id: 69, level: 'A1', type: 'multi', skill: 'grammar',
      hint: 'اختر كل الجمل الصحيحة:', question: 'Which sentences are correct?',
      options: [
        'He is watching TV now.',
        'He watching TV now.',
        'They are eat lunch.',
        'They are eating lunch.',
      ], answers: [0, 3],
      explain: 'المضارع المستمر = be + verb-ing. ✓ is watching · ✓ are eating. ✗ ناقصة be · ✗ are eat.' },

    { id: 70, level: 'A1', type: 'order', skill: 'grammar',
      hint: 'رتّب الكلمات لتكوين سؤال:', question: 'كوّن السؤال',
      words: ['do', 'time', 'What', 'start', 'you', 'work', '?'],
      correctOrder: [2, 1, 0, 4, 3, 5, 6],
      explain: 'What time do you start work? = في أي ساعة تبدأ العمل؟' },

    { id: 71, level: 'A1', type: 'listenMcq', skill: 'listening',
      hint: 'استمع وأجب:', question: 'Where does the speaker want to go?',
      audio: 'Excuse me, could you tell me how to get to the train station, please?',
      options: ['The airport', 'The train station', 'The hospital', 'The market'], answer: 1,
      explain: '"how to get to the train station" — يسأل عن محطة القطار.' },

    { id: 72, level: 'A1', type: 'reading', skill: 'comprehension',
      hint: 'اقرأ الرسالة وأجب:', question: 'What should Omar bring?',
      passage: 'Hi Omar,\nThe study group is at my house on Saturday at 4 p.m.\nPlease bring your notebook. I have the books already.\nSee you!\nNour',
      options: ['The books', 'His notebook', 'Nothing', 'Food'], answer: 1,
      explain: '"Please bring your notebook" — الكتب موجودة عند نور.' },
  ],

  /* ─── A2 ─────────────────────────────────────────────────────────────── */
  A2: [
    { id: 21, level: 'A2', type: 'mcq', skill: 'grammar',
      hint: 'أكمل الجملة:', question: 'Yesterday I ___ a great film.',
      options: ['see', 'saw', 'seen', 'seeing'], answer: 1,
      explain: 'Yesterday → الماضي البسيط. see → saw (فعل شاذ).' },

    { id: 22, level: 'A2', type: 'gap', skill: 'grammar',
      hint: 'اكتب الفعل في الزمن الصحيح:', question: 'She ___ (live) in Spain for five years.',
      accept: [['has lived']],
      explain: 'for five years + ما زالت → Present Perfect: has lived.' },

    { id: 23, level: 'A2', type: 'multi', skill: 'grammar',
      hint: 'اختر كل الجمل الصحيحة نحوياً:', question: 'Which sentences are correct?',
      options: [
        'I have been to Egypt.',
        'I have went to Egypt.',
        'She didn\'t went home.',
        'She didn\'t go home.',
      ],
      answers: [0, 3],
      explain: '✓ have been (التصريف الثالث) · ✓ didn\'t + مصدر (go). ✗ have went · ✗ didn\'t went.' },

    { id: 24, level: 'A2', type: 'mcq', skill: 'vocabulary',
      hint: 'اختر الكلمة المناسبة:', question: 'I need to ___ money before I travel.',
      options: ['spend', 'save', 'lose', 'pay'], answer: 1,
      explain: 'save money = يدّخر المال. (spend = ينفق · lose = يفقد)' },

    { id: 25, level: 'A2', type: 'order', skill: 'grammar',
      hint: 'رتّب الكلمات:', question: 'كوّن الجملة',
      words: ['ever', 'you', 'Have', 'been', 'abroad', '?'],
      correctOrder: [2, 1, 0, 3, 4, 5],
      explain: 'Have you ever been abroad? = هل سافرت للخارج من قبل؟' },

    { id: 26, level: 'A2', type: 'listenGap', skill: 'listening',
      hint: 'استمع ثم أكمل الفراغات:', question: 'أكمل النص',
      audio: 'The train leaves at half past six from platform four.',
      transcript: 'The train leaves at ___ past six from platform ___.',
      accept: [['half'], ['four', '4']],
      explain: '"…at half past six from platform four." — half past six = السادسة والنصف.' },

    { id: 27, level: 'A2', type: 'reading', skill: 'comprehension',
      hint: 'اقرأ وأجب:', question: 'Why does Lina prefer the evening class?',
      passage: 'Lina works in a bank from 9 to 5. She wanted to improve her English, so she looked for a course. The morning class was cheaper, but she chose the evening one because she can attend it after work without taking days off.',
      options: [
        'It is cheaper.',
        'It fits around her job.',
        'The teacher is better.',
        'It is shorter.',
      ], answer: 1,
      explain: '"she can attend it after work without taking days off" — تناسب دوامها.' },

    { id: 28, level: 'A2', type: 'mcq', skill: 'grammar',
      hint: 'اختر المقارنة الصحيحة:', question: 'This exercise is ___ than the last one.',
      options: ['difficult', 'more difficult', 'most difficult', 'difficulter'], answer: 1,
      explain: 'الكلمات الطويلة تأخذ more + adjective. ✓ more difficult than.' },

    { id: 29, level: 'A2', type: 'gap', skill: 'vocabulary',
      hint: 'اكتب حرف الجر المناسب:', question: 'I am good ___ maths.',
      accept: [['at']],
      explain: 'good at something = بارع في شيء.' },

    { id: 30, level: 'A2', type: 'listenWrite', skill: 'listening',
      hint: 'استمع واكتب الجملة كاملة:', question: 'اكتب ما تسمع',
      audio: 'She has never eaten Japanese food.',
      accept: [['she has never eaten japanese food']],
      explain: '"She has never eaten Japanese food." = لم تتذوق الطعام الياباني أبداً.' },

    { id: 73, level: 'A2', type: 'mcq', skill: 'grammar',
      hint: 'اختر الصحيح:', question: 'Look at those clouds! It ___ rain.',
      options: ['will', 'is going to', 'would', 'goes to'], answer: 1,
      explain: 'دليل حاضر أمامنا → be going to. (will للقرار اللحظي أو التوقع بلا دليل)' },

    { id: 74, level: 'A2', type: 'gap', skill: 'grammar',
      hint: 'أكمل جملة الشرط الأولى:', question: 'If it rains tomorrow, we ___ stay at home.',
      accept: [['will', "'ll", 'will probably']],
      explain: 'First conditional: If + مضارع بسيط، will + مصدر. ✓ we will stay.' },

    { id: 75, level: 'A2', type: 'multi', skill: 'vocabulary',
      hint: 'اختر كل التصريفات الماضية الصحيحة:', question: 'Which are correct past forms?',
      options: ['buyed', 'bought', 'taught', 'teached', 'went'], answers: [1, 2, 4],
      explain: 'buy→bought · teach→taught · go→went. أما buyed و teached فخاطئتان.' },

    { id: 76, level: 'A2', type: 'order', skill: 'grammar',
      hint: 'رتّب الكلمات:', question: 'كوّن الجملة',
      words: ['already', 'have', 'I', 'homework', 'my', 'finished'],
      correctOrder: [2, 1, 0, 5, 4, 3],
      explain: 'I have already finished my homework. — already تأتي بين have والتصريف الثالث.' },

    { id: 77, level: 'A2', type: 'listenGap', skill: 'listening',
      hint: 'استمع ثم أكمل الفراغات:', question: 'أكمل النص',
      audio: 'I usually wake up at seven and have breakfast with my family.',
      transcript: 'I usually ___ up at ___ and have breakfast with my family.',
      accept: [['wake'], ['seven', '7']],
      explain: '"I usually wake up at seven…" — wake up = يستيقظ.' },

    { id: 78, level: 'A2', type: 'reading', skill: 'comprehension',
      hint: 'اقرأ الإعلان وأجب:', question: 'Who can get the discount?',
      passage: 'CITY GYM — SPECIAL OFFER\n50% off the first month.\nOffer valid for new members only.\nYou must show a student card.\nEnds 30 June.',
      options: [
        'Anyone who joins.',
        'New members with a student card.',
        'Only old members.',
        'Anyone after 30 June.',
      ], answer: 1,
      explain: '"new members only" + "must show a student card" — الشرطان معاً.' },
  ],

  /* ─── B1 ─────────────────────────────────────────────────────────────── */
  B1: [
    { id: 31, level: 'B1', type: 'mcq', skill: 'grammar',
      hint: 'أكمل جملة الشرط:', question: 'If I ___ more time, I would travel more.',
      options: ['have', 'had', 'will have', 'having'], answer: 1,
      explain: 'Second conditional: If + past simple, would + مصدر. ✓ If I had…' },

    { id: 32, level: 'B1', type: 'gap', skill: 'grammar',
      hint: 'حوّل إلى المبني للمجهول (كلمتان):', question: 'The letter ___ ___ yesterday. (send)',
      accept: [['was sent']],
      explain: 'Passive في الماضي: was/were + التصريف الثالث. ✓ was sent.' },

    { id: 33, level: 'B1', type: 'multi', skill: 'vocabulary',
      hint: 'اختر كل الكلمات التي تعني "مهم":', question: 'Which words mean "important"?',
      options: ['crucial', 'trivial', 'vital', 'minor', 'significant'],
      answers: [0, 2, 4],
      explain: 'crucial · vital · significant = مهم/جوهري. أما trivial و minor = تافه/ثانوي.' },

    { id: 34, level: 'B1', type: 'reading', skill: 'comprehension',
      hint: 'اقرأ النص وأجب:', question: 'What does the writer suggest about learning vocabulary?',
      passage: 'Many learners keep long lists of new words and revise them every night, yet forget most of them within a month. Research suggests the problem is not memory but context: a word met once in a list leaves almost no trace, while the same word met three times inside real sentences — a song, a message, a conversation — tends to stay. The list is not useless, but it is only a starting point.',
      options: [
        'Word lists should be avoided completely.',
        'Meeting words in real contexts matters more than listing them.',
        'Learners have weak memories.',
        'Revising every night is enough.',
      ], answer: 1,
      explain: '"the problem is not memory but context" — السياق الحقيقي أهم من القوائم، والقائمة مجرد بداية.' },

    { id: 35, level: 'B1', type: 'order', skill: 'grammar',
      hint: 'رتّب الكلمات:', question: 'كوّن الجملة',
      words: ['been', 'has', 'The', 'cancelled', 'meeting'],
      correctOrder: [2, 4, 1, 0, 3],
      explain: 'The meeting has been cancelled. = تم إلغاء الاجتماع.' },

    { id: 36, level: 'B1', type: 'listenMcq', skill: 'listening',
      hint: 'استمع وأجب:', question: "What is the speaker's main problem?",
      audio: "I've been applying for jobs for six months. My written English is fine, but I freeze up when they ask me to talk about myself in the interview.",
      options: [
        'He cannot write in English.',
        'He struggles to speak under pressure.',
        'He has no experience.',
        'He does not get interviews.',
      ], answer: 1,
      explain: '"I freeze up when they ask me to talk about myself" — يتجمّد عند التحدث تحت الضغط.' },

    { id: 37, level: 'B1', type: 'mcq', skill: 'grammar',
      hint: 'اختر الخطاب غير المباشر الصحيح:', question: 'She said, "I am tired." → She said that she ___ tired.',
      options: ['is', 'was', 'has been', 'will be'], answer: 1,
      explain: 'في الخطاب غير المباشر يتراجع الزمن: am → was.' },

    { id: 38, level: 'B1', type: 'gap', skill: 'vocabulary',
      hint: 'أكمل بالفعل المركّب المناسب:', question: 'I need to look ___ this word in the dictionary.',
      accept: [['up']],
      explain: 'look up = يبحث عن معنى كلمة. (look after = يعتني · look for = يبحث عن شيء ضائع)' },

    { id: 39, level: 'B1', type: 'listenGap', skill: 'listening',
      hint: 'استمع ثم أكمل الفراغات:', question: 'أكمل النص',
      audio: 'Although the weather was terrible, we decided to continue the journey.',
      transcript: '___ the weather was terrible, we ___ to continue the journey.',
      accept: [['although', 'though'], ['decided']],
      explain: '"Although the weather was terrible, we decided to continue…" — although = بالرغم من أن.' },

    { id: 40, level: 'B1', type: 'mcq', skill: 'vocabulary',
      hint: 'اختر المعنى الصحيح للتعبير:', question: '"It\'s not my cup of tea" means:',
      options: [
        "I don't like it.",
        "I'm thirsty.",
        "It's too expensive.",
        "I don't understand it.",
      ], answer: 0,
      explain: 'not my cup of tea = ليس من ذوقي / لا يعجبني.' },

    { id: 79, level: 'B1', type: 'mcq', skill: 'grammar',
      hint: 'اختر الصحيح:', question: 'I ___ smoke, but I stopped three years ago.',
      options: ['use to', 'used to', 'am used to', 'was used to'], answer: 1,
      explain: 'used to + مصدر = عادة ماضية انتهت. (be used to = معتاد على)' },

    { id: 80, level: 'B1', type: 'gap', skill: 'grammar',
      hint: 'اكتب اسم الموصول المناسب:', question: 'The woman ___ helped me was very kind.',
      accept: [['who', 'that']],
      explain: 'للعاقل نستخدم who (أو that). ✓ The woman who helped me…' },

    { id: 81, level: 'B1', type: 'multi', skill: 'grammar',
      hint: 'اختر كل جمل الشرط الصحيحة:', question: 'Which conditionals are correct?',
      options: [
        'If I were you, I would apologise.',
        'If I would be you, I apologise.',
        'If she studies, she will pass.',
        'If she will study, she passes.',
      ], answers: [0, 2],
      explain: '✓ Second: If + were, would. ✓ First: If + مضارع, will. ✗ لا نضع would/will بعد if.' },

    { id: 82, level: 'B1', type: 'order', skill: 'grammar',
      hint: 'رتّب الكلمات:', question: 'كوّن الجملة',
      words: ['told', 'he', 'me', 'busy', 'He', 'was'],
      correctOrder: [4, 0, 2, 1, 5, 3],
      explain: 'He told me he was busy. — الخطاب غير المباشر: is → was.' },

    { id: 83, level: 'B1', type: 'listenMcq', skill: 'listening',
      hint: 'استمع وأجب:', question: 'What does the speaker recommend?',
      audio: 'If you want my honest advice, book the flight now. Prices always go up in the last two weeks, and you will end up paying almost double.',
      options: [
        'Wait two more weeks.',
        'Book the flight immediately.',
        'Choose a different destination.',
        'Travel by train instead.',
      ], answer: 1,
      explain: '"book the flight now" — لأن الأسعار ترتفع في الأسبوعين الأخيرين.' },

    { id: 84, level: 'B1', type: 'reading', skill: 'comprehension',
      hint: 'اقرأ وأجب:', question: 'What is the writer\'s main point about mistakes?',
      passage: 'Most learners treat a mistake as evidence that they are not good enough, and so they stop speaking. But a mistake is simply information: it shows exactly where the gap is. The learners who improve fastest are rarely the most talented — they are the ones who are willing to be wrong out loud, several times a day, in front of somebody who will correct them.',
      options: [
        'Mistakes should be avoided by preparing more.',
        'Mistakes reveal what to work on, so speaking despite them helps.',
        'Talented learners make fewer mistakes.',
        'Correction discourages learners.',
      ], answer: 1,
      explain: '"a mistake is simply information: it shows exactly where the gap is" + من يتحسّن هم من يخطئون بصوت عالٍ.' },
  ],

  /* ─── B2 ─────────────────────────────────────────────────────────────── */
  B2: [
    { id: 41, level: 'B2', type: 'mcq', skill: 'grammar',
      hint: 'أكمل الجملة:', question: 'By the time we arrived, the film ___.',
      options: ['already started', 'had already started', 'has already started', 'was already starting'], answer: 1,
      explain: 'حدث سبق حدثاً آخر في الماضي → Past Perfect: had already started.' },

    { id: 42, level: 'B2', type: 'multi', skill: 'vocabulary',
      hint: 'اختر كل الكلمات التي تصف شخصاً عنيداً:', question: 'Which words describe a stubborn person?',
      options: ['obstinate', 'flexible', 'headstrong', 'accommodating', 'inflexible'],
      answers: [0, 2, 4],
      explain: 'obstinate · headstrong · inflexible = عنيد/متصلّب. أما flexible و accommodating = مرن/متساهل.' },

    { id: 43, level: 'B2', type: 'gap', skill: 'grammar',
      hint: 'أكمل بكلمة واحدة:', question: 'Not only ___ he apologise, but he also paid for the damage.',
      accept: [['did']],
      explain: 'بعد Not only في بداية الجملة نستخدم الترتيب المقلوب: Not only did he apologise…' },

    { id: 44, level: 'B2', type: 'reading', skill: 'comprehension',
      hint: 'اقرأ وأجب:', question: "What is the author's attitude towards open-plan offices?",
      passage: 'Open-plan offices were sold to us as engines of collaboration: tear down the walls, the argument went, and ideas will flow. Two decades of data tell a more awkward story. Face-to-face interaction in such offices tends to fall, not rise, as workers retreat behind headphones to protect what little concentration they have left. The design solved a property problem, and was marketed as a cultural one.',
      options: [
        'Enthusiastic — they improve collaboration.',
        'Neutral — the evidence is unclear.',
        'Critical — their benefits were overstated.',
        'Nostalgic — he prefers older designs.',
      ], answer: 2,
      explain: '"solved a property problem, and was marketed as a cultural one" — نقد صريح: فوائدها بولغ فيها.' },

    { id: 45, level: 'B2', type: 'mcq', skill: 'grammar',
      hint: 'اختر الصحيح:', question: 'I\'d rather you ___ tell anyone about this.',
      options: ["don't", "didn't", "won't", 'not'], answer: 1,
      explain: "I'd rather + فاعل + فعل في الماضي للتعبير عن تفضيل حاضر. ✓ I'd rather you didn't." },

    { id: 46, level: 'B2', type: 'listenMcq', skill: 'listening',
      hint: 'استمع وأجب:', question: "What is the speaker's overall stance on remote work?",
      audio: 'While I acknowledge that remote work has offered undeniable flexibility, one cannot ignore the subtle erosion of workplace culture and the challenges it poses for junior employees who need in-person mentorship.',
      options: [
        'Completely against it.',
        'Strongly in favour.',
        'Balanced, but concerned about its costs.',
        'Indifferent.',
      ], answer: 2,
      explain: '"While I acknowledge… one cannot ignore…" — يعترف بالفائدة لكنه قلق من الثمن.' },

    { id: 47, level: 'B2', type: 'order', skill: 'grammar',
      hint: 'رتّب الكلمات:', question: 'كوّن الجملة',
      words: ['had', 'Had', 'would', 'known', 'I', 'have', 'come', 'I'],
      correctOrder: [1, 4, 3, 7, 2, 5, 6],
      explain: 'Had I known, I would have come. — صيغة الشرط المقلوبة (بدل If I had known).' },

    { id: 48, level: 'B2', type: 'gap', skill: 'vocabulary',
      hint: 'أكمل بالكلمة المناسبة:', question: 'The evidence was ___ ; nobody could argue against it.',
      accept: [['compelling', 'conclusive', 'overwhelming', 'irrefutable']],
      explain: 'compelling / conclusive / overwhelming / irrefutable = دامغ لا يمكن الجدال فيه.' },

    { id: 49, level: 'B2', type: 'mcq', skill: 'vocabulary',
      hint: 'اختر المعنى الأقرب:', question: '"He beat around the bush" means he ___',
      options: [
        'avoided the main point.',
        'worked in the garden.',
        'lost his temper.',
        'won easily.',
      ], answer: 0,
      explain: 'beat around the bush = يلفّ ويدور دون الدخول في صلب الموضوع.' },

    { id: 50, level: 'B2', type: 'listenWrite', skill: 'listening',
      hint: 'استمع واكتب الجملة كاملة:', question: 'اكتب ما تسمع',
      audio: 'The proposal was rejected despite widespread public support.',
      accept: [['the proposal was rejected despite widespread public support']],
      explain: '"The proposal was rejected despite widespread public support." = رُفض المقترح رغم التأييد الشعبي الواسع.' },

    { id: 85, level: 'B2', type: 'mcq', skill: 'grammar',
      hint: 'اختر الصحيح:', question: 'It was the manager ___ made the final decision.',
      options: ['which', 'who', 'whom', 'what'], answer: 1,
      explain: 'جملة cleft للتأكيد: It was + شخص + who + فعل. (whom تأتي كمفعول لا كفاعل)' },

    { id: 86, level: 'B2', type: 'gap', skill: 'vocabulary',
      hint: 'أكمل التلازم اللفظي:', question: 'The new law will come into ___ next January.',
      accept: [['force', 'effect']],
      explain: 'come into force / come into effect = يدخل حيّز التنفيذ.' },

    { id: 87, level: 'B2', type: 'multi', skill: 'vocabulary',
      hint: 'اختر كل التعبيرات الرسمية المناسبة لرسالة عمل:', question: 'Which are appropriate in a formal email?',
      options: [
        'I am writing to enquire about…',
        'Hey, quick question…',
        'I would be grateful if you could…',
        'Gimme a shout.',
        'Please find attached…',
      ], answers: [0, 2, 4],
      explain: 'الرسمية: I am writing to enquire · I would be grateful · Please find attached. أما Hey و Gimme فعاميّة.' },

    { id: 88, level: 'B2', type: 'order', skill: 'grammar',
      hint: 'رتّب الكلمات:', question: 'كوّن الجملة',
      words: ['sooner', 'No', 'had', 'left', 'she', 'than', 'rang', 'it'],
      correctOrder: [1, 0, 2, 4, 3, 5, 7, 6],
      explain: 'No sooner had she left than it rang. — قلب إجباري بعد No sooner، ويتبعه than.' },

    { id: 89, level: 'B2', type: 'listenGap', skill: 'listening',
      hint: 'استمع ثم أكمل الفراغات:', question: 'أكمل النص',
      audio: 'The findings suggest that early intervention significantly reduces long-term costs.',
      transcript: 'The findings ___ that early intervention ___ reduces long-term costs.',
      accept: [['suggest', 'suggests'], ['significantly']],
      explain: '"The findings suggest that early intervention significantly reduces…"' },

    { id: 90, level: 'B2', type: 'reading', skill: 'comprehension',
      hint: 'اقرأ وأجب:', question: 'What does the writer imply about the study?',
      passage: 'The study, funded by the very industry whose products it evaluated, concluded that the products were safe. Its methodology was sound and its authors reputable. Still, readers might reasonably ask why the only three trials showing harm were excluded on grounds that were never fully explained.',
      options: [
        'It was clearly fraudulent.',
        'Its conclusions should be treated with caution despite appearing rigorous.',
        'The methodology was weak.',
        'The authors were unqualified.',
      ], answer: 1,
      explain: 'الكاتب يقرّ بجودة المنهج والباحثين، لكنه يشير إلى التمويل واستبعاد التجارب — دعوة إلى الحذر لا اتهام صريح.' },
  ],

  /* ─── C1 ─────────────────────────────────────────────────────────────── */
  C1: [
    { id: 51, level: 'C1', type: 'mcq', skill: 'grammar',
      hint: 'اختر الصحيح:', question: 'Rarely ___ such a well-argued essay.',
      options: ['I have read', 'have I read', 'I read', 'did I have read'], answer: 1,
      explain: 'الظروف السلبية في البداية (Rarely, Seldom, Never) تفرض القلب: have I read.' },

    { id: 52, level: 'C1', type: 'reading', skill: 'comprehension',
      hint: 'اقرأ وأجب:', question: 'What does the passage imply about "productivity"?',
      passage: 'We speak of productivity as though it were a moral quality, something a person either possesses or lacks. Yet the word was borrowed from factory accounting, where it described output per hour of machine time. Applied to human beings, it quietly smuggles in an assumption that ought to be argued rather than assumed: that a life, like a production line, is best measured by what it yields.',
      options: [
        'It is an objective and useful measure.',
        'It carries hidden assumptions inherited from industry.',
        'It should be measured more carefully.',
        'It applies only to factories.',
      ], answer: 1,
      explain: '"quietly smuggles in an assumption" — الكلمة تحمل افتراضاً صناعياً مستتراً عن قيمة الحياة.' },

    { id: 53, level: 'C1', type: 'gap', skill: 'grammar',
      hint: 'أكمل بكلمة واحدة:', question: 'She insisted that the report ___ submitted by Friday.',
      accept: [['be']],
      explain: 'صيغة Subjunctive بعد insist that: الفعل يبقى مصدراً — that the report be submitted.' },

    { id: 54, level: 'C1', type: 'multi', skill: 'vocabulary',
      hint: 'اختر كل الكلمات التي تحمل معنى سلبياً:', question: 'Which words carry a negative connotation?',
      options: ['meticulous', 'pedantic', 'thorough', 'nitpicking', 'fussy'],
      answers: [1, 3, 4],
      explain: 'pedantic · nitpicking · fussy = سلبية (تدقيق ممل). أما meticulous و thorough فإيجابيتان.' },

    { id: 55, level: 'C1', type: 'listenMcq', skill: 'listening',
      hint: 'استمع وأجب:', question: 'Which rhetorical device does the speaker mainly use?',
      audio: 'Let me ask you this: if we truly believed in equal opportunity, would we not ensure that every child had access to the same quality of education? The answer, I believe, is self-evident.',
      options: ['Hyperbole', 'Rhetorical question', 'Understatement', 'Irony'], answer: 1,
      explain: 'يطرح سؤالاً لا ينتظر إجابته لأنه يعرفها — Rhetorical question.' },

    { id: 56, level: 'C1', type: 'mcq', skill: 'vocabulary',
      hint: 'اختر الأنسب أسلوبياً:', question: 'The findings ___ our earlier hypothesis.',
      options: ['corroborate', 'agree', 'tell', 'show up'], answer: 0,
      explain: 'corroborate = يؤكد/يعزّز — الفعل الأكاديمي الدقيق في هذا السياق.' },

    { id: 57, level: 'C1', type: 'order', skill: 'grammar',
      hint: 'رتّب الكلمات:', question: 'كوّن الجملة',
      words: ['circumstances', 'no', 'Under', 'should', 'this', 'be', 'repeated'],
      correctOrder: [2, 1, 0, 3, 4, 5, 6],
      explain: 'Under no circumstances should this be repeated. — قلب إجباري بعد Under no circumstances.' },

    { id: 58, level: 'C1', type: 'gap', skill: 'vocabulary',
      hint: 'أكمل التعبير:', question: 'His argument does not hold ___ under scrutiny.',
      accept: [['water']],
      explain: "hold water = يصمد منطقياً. ✓ doesn't hold water = حجّته لا تصمد." },

    { id: 59, level: 'C1', type: 'listenGap', skill: 'listening',
      hint: 'استمع ثم أكمل الفراغات:', question: 'أكمل النص',
      audio: 'The committee reluctantly conceded that the initial estimates had been wildly optimistic.',
      transcript: 'The committee reluctantly ___ that the initial estimates had been wildly ___.',
      accept: [['conceded', 'admitted'], ['optimistic']],
      explain: '"…reluctantly conceded that the initial estimates had been wildly optimistic." — conceded = أقرّ على مضض.' },

    { id: 60, level: 'C1', type: 'mcq', skill: 'comprehension',
      hint: 'اختر التفسير الصحيح:', question: '"The policy was, to put it mildly, ill-conceived." The speaker is being ___',
      options: ['enthusiastic', 'sarcastic and understated', 'neutral', 'apologetic'], answer: 1,
      explain: '"to put it mildly" تعني أن الوصف أخف مما يستحق — سخرية عبر التقليل (understatement).' },

    { id: 91, level: 'C1', type: 'mcq', skill: 'grammar',
      hint: 'اختر الصحيح:', question: 'Were it not ___ her intervention, the project would have collapsed.',
      options: ['of', 'for', 'to', 'by'], answer: 1,
      explain: 'were it not for = لولا. صيغة شرطية مقلوبة بدل If it were not for.' },

    { id: 92, level: 'C1', type: 'gap', skill: 'vocabulary',
      hint: 'أكمل التعبير الاصطلاحي:', question: 'The minister was economical with the ___ about the costs.',
      accept: [['truth']],
      explain: 'economical with the truth = يقول جزءاً من الحقيقة فقط — تهذيب ساخر لوصف الكذب.' },

    { id: 93, level: 'C1', type: 'multi', skill: 'vocabulary',
      hint: 'اختر كل ما يعني "مؤقت":', question: 'Which words mean "temporary"?',
      options: ['ephemeral', 'perennial', 'transient', 'enduring', 'fleeting'],
      answers: [0, 2, 4],
      explain: 'ephemeral · transient · fleeting = زائل/مؤقت. أما perennial و enduring = دائم/مستمر.' },

    { id: 94, level: 'C1', type: 'order', skill: 'grammar',
      hint: 'رتّب الكلمات:', question: 'كوّن الجملة',
      words: ['later', 'Only', 'did', 'we', 'realise', 'the', 'significance'],
      correctOrder: [1, 0, 2, 3, 4, 5, 6],
      explain: 'Only later did we realise the significance. — بعد Only + ظرف في بداية الجملة يجب القلب: did we realise.' },

    { id: 95, level: 'C1', type: 'listenGap', skill: 'listening',
      hint: 'استمع ثم أكمل الفراغات:', question: 'أكمل النص',
      audio: 'The argument, however elegantly framed, ultimately rests on an unexamined premise.',
      transcript: 'The argument, however ___ framed, ultimately ___ on an unexamined premise.',
      accept: [['elegantly'], ['rests']],
      explain: '"…however elegantly framed, ultimately rests on an unexamined premise." — rest on = يقوم على.' },

    { id: 96, level: 'C1', type: 'reading', skill: 'comprehension',
      hint: 'اقرأ وأجب:', question: 'Which best describes the passage\'s argumentative move?',
      passage: 'Critics of the reform insist it will burden small businesses. They are right — it will. But the question was never whether the burden exists; it was who should carry it. For thirty years that cost has been borne, invisibly, by the people the reform is designed to protect. To call its redistribution a new burden is to mistake the moment a cost becomes visible for the moment it begins.',
      options: [
        'It refutes the critics\' facts.',
        'It concedes the facts but reframes the question.',
        'It appeals to emotion instead of evidence.',
        'It avoids the criticism entirely.',
      ], answer: 1,
      explain: '"They are right — it will. But the question was never whether…" — يسلّم بالوقائع ثم يعيد صياغة السؤال نفسه.' },
  ],
}

/* ══════════════════════════════════════════════════════════════════════════
   WRITING TASK — one per level, shown once the test ends
   ══════════════════════════════════════════════════════════════════════════ */

export const WRITING_PROMPTS: Record<CEFRLevel, WritingPrompt> = {
  A0: {
    level: 'A0', minWords: 15,
    hint: 'اكتب بالإنجليزية عن نفسك — جمل قصيرة جداً تكفي.',
    prompt: 'Write about yourself. Who are you? Where are you from?',
    bullets: ['My name is…', 'I am from…', 'I am … years old.'],
  },
  A1: {
    level: 'A1', minWords: 30,
    hint: 'اكتب فقرة قصيرة عن يومك المعتاد.',
    prompt: 'Describe your typical day. What do you do in the morning, afternoon and evening?',
    bullets: ['استخدم المضارع البسيط', 'اذكر ثلاثة أوقات على الأقل', 'اربط الجمل بـ and / then'],
  },
  A2: {
    level: 'A2', minWords: 50,
    hint: 'اكتب فقرة عن رحلة أو تجربة مررت بها.',
    prompt: 'Write about a trip or an experience you had. Where did you go? What happened? How did you feel?',
    bullets: ['استخدم الماضي البسيط', 'اذكر مكاناً وحدثاً وشعوراً', 'اربط بـ because / but / so'],
  },
  B1: {
    level: 'B1', minWords: 80,
    hint: 'اكتب رأيك في الموضوع التالي بفقرة متماسكة.',
    prompt: 'Some people say learning English online is better than in a classroom. What do you think? Give reasons.',
    bullets: ['اذكر رأيك بوضوح', 'قدّم سببين على الأقل', 'استخدم however / although / therefore'],
  },
  B2: {
    level: 'B2', minWords: 120,
    hint: 'اكتب نصاً حجاجياً متوازناً.',
    prompt: 'Remote work has changed how companies operate. Discuss the advantages and disadvantages, and give your own view.',
    bullets: ['وازن بين الإيجابيات والسلبيات', 'استخدم أمثلة محددة', 'اختم برأي واضح'],
  },
  C1: {
    level: 'C1', minWords: 150,
    hint: 'اكتب نصاً تحليلياً بأسلوب أكاديمي.',
    prompt: 'To what extent should governments regulate artificial intelligence? Argue your position and address a counter-argument.',
    bullets: ['اطرح أطروحة واضحة', 'تناول حجة مضادة وردّ عليها', 'استخدم لغة أكاديمية دقيقة'],
  },
}
