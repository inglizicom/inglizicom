'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, XCircle, Volume2, Brain, Trophy,
  Zap, ArrowLeft, RotateCcw, PlayCircle, Target,
  ChevronRight, BarChart2, BookOpen, MessageSquare, Mic,
} from 'lucide-react'

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
type QType    = 'mcq' | 'fill' | 'listen' | 'video' | 'correct' | 'reorder'
type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

interface Question {
  id:              number
  type:            QType
  difficulty:      CEFRLevel
  category:        'vocabulary' | 'grammar' | 'listening' | 'video' | 'comprehension'
  points:          number
  timeLimit:       number          // seconds, 0 = no countdown shown
  question:        string
  arabicHint?:     string
  options?:        string[]
  answer?:         number          // index into options
  audioText?:      string          // TTS source
  videoId?:        string          // YouTube ID
  videoStart?:     number
  videoTranscript?: string
  words?:          string[]        // reorder tiles
  correctOrder?:   number[]        // correct word indices in order
  explanation:     string
}

interface LevelStat { c: number; t: number }   // correct / total

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const LEVEL_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

const LEVEL_STYLE: Record<CEFRLevel, {
  color: string; bg: string; border: string; glow: string; label: string
}> = {
  A1: { color: 'text-amber-400',   bg: 'bg-amber-500',   border: 'border-amber-400',   glow: 'shadow-amber-500/40',   label: 'مبتدئ' },
  A2: { color: 'text-orange-400',  bg: 'bg-orange-500',  border: 'border-orange-400',  glow: 'shadow-orange-500/40',  label: 'أساسي' },
  B1: { color: 'text-blue-400',    bg: 'bg-blue-500',    border: 'border-blue-400',    glow: 'shadow-blue-500/40',    label: 'متوسط' },
  B2: { color: 'text-purple-400',  bg: 'bg-purple-500',  border: 'border-purple-400',  glow: 'shadow-purple-500/40',  label: 'فوق المتوسط' },
  C1: { color: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-400', glow: 'shadow-emerald-500/40', label: 'متقدم' },
}

const CEFR_INFO: Record<CEFRLevel, {
  descAr: string; canDo: string[]; focus: string[]; courseLabel: string
}> = {
  A1: {
    descAr: 'أنت في بداية الرحلة. تفهم الكلمات البسيطة والتعبيرات اليومية. هذا أمر طبيعي — كل المتحدثين بدأوا من هنا!',
    canDo: ['تقديم نفسك والآخرين', 'فهم الكلمات اليومية المألوفة', 'الإجابة على أسئلة بسيطة عن نفسك'],
    focus: ['المفردات الأساسية للحياة اليومية', 'بناء الجملة البسيط (أنا / هو / هي)', 'نطق الأصوات الإنجليزية بشكل صحيح'],
    courseLabel: 'ابدأ رحلة A1 → B1 الآن',
  },
  A2: {
    descAr: 'تستطيع التواصل في مواقف يومية بسيطة. أساسك جيد — الآن نبنيه ليصبح طلاقة حقيقية.',
    canDo: ['وصف حياتك اليومية والمحيط', 'التعامل مع مواقف التسوق والسفر البسيطة', 'فهم الرسائل والإشعارات القصيرة'],
    focus: ['الأزمنة (الماضي، المستقبل، Present Perfect)', 'المحادثة في الأعمال والمواقف الاجتماعية', 'الاستماع للمحتوى البسيط بثقة'],
    courseLabel: 'انتقل من A2 إلى B1 بأسرع طريقة',
  },
  B1: {
    descAr: 'مستوى ممتاز! تستطيع التعبير عن آرائك والتعامل مع معظم المواقف. أنت على بُعد خطوة من الطلاقة الحقيقية.',
    canDo: ['التعبير عن أفكارك ومشاعرك بوضوح', 'التعامل مع معظم مواقف السفر والعمل', 'فهم المحادثات العادية بين متحدثين أصليين'],
    focus: ['القواعد المتقدمة (Conditionals, Wish, Reported Speech)', 'الطلاقة والانسيابية في الحديث', 'الاستماع للمحتوى الطبيعي بلكنات مختلفة'],
    courseLabel: 'ارتقِ من B1 → B2 — الدخل الأعلى ينتظرك',
  },
  B2: {
    descAr: 'مستوى متقدم جداً! تستطيع التفاعل مع متحدثين أصليين بثقة وتناقش موضوعات معقدة.',
    canDo: ['فهم الأفكار الرئيسية في نصوص معقدة', 'التعبير بطلاقة بدون بحث عن كلمات', 'المشاركة في نقاشات تقنية في تخصصك'],
    focus: ['الدقة الأسلوبية في الكتابة الرسمية', 'المفردات الأكاديمية والمهنية المتقدمة', 'فهم الدلالات الضمنية والفروق الدقيقة'],
    courseLabel: 'اصل إلى C1 — مستوى الاحترافيين',
  },
  C1: {
    descAr: 'مستوى احترافي ممتاز! إنجليزيتك قريبة من مستوى الناطقين الأصليين. أنت تستطيع تعليم الآخرين!',
    canDo: ['التعبير عن أفكار معقدة بمرونة ودقة عالية', 'فهم النصوص الطويلة والمعقدة ضمنياً', 'الكتابة الأكاديمية والمهنية بأسلوب متقن'],
    focus: ['الفروق الأسلوبية الدقيقة في الكتابة', 'الخطابة والإقناع المتقدم', 'اللغة الأدبية والثقافية'],
    courseLabel: 'حافظ على مستواك مع الدورة المتقدمة',
  },
}

/* ══════════════════════════════════════════════════════════════
   QUESTION BANK  — 26 questions, 5 types, A1 → C1
══════════════════════════════════════════════════════════════ */
const QUESTIONS: Question[] = [

  /* ─── A1 ─────────────────────────────────── */
  {
    id: 1, type: 'mcq', difficulty: 'A1', category: 'vocabulary',
    points: 10, timeLimit: 20,
    question: 'What does "thirsty" mean?',
    arabicHint: 'ما معنى كلمة "thirsty"؟',
    options: ['جائع', 'عطشان', 'متعب', 'نعسان'],
    answer: 1,
    explanation: '"Thirsty" = عطشان. "I\'m thirsty, can I have some water?" ✓',
  },
  {
    id: 2, type: 'fill', difficulty: 'A1', category: 'grammar',
    points: 10, timeLimit: 20,
    question: 'I ___ a student.',
    arabicHint: 'أكمل الجملة: أنا طالب. اختر الفعل الصحيح:',
    options: ['is', 'am', 'are', 'be'],
    answer: 1,
    explanation: 'مع "I" نستخدم دائماً "am". I am a student. ✓  (He/She/It → is  |  We/You/They → are)',
  },
  {
    id: 3, type: 'reorder', difficulty: 'A1', category: 'grammar',
    points: 15, timeLimit: 35,
    question: 'Arrange the words to build the correct sentence:',
    arabicHint: 'رتّب الكلمات لتكوين جملة صحيحة:',
    words: ['name', 'is', 'My', 'Hamza'],
    correctOrder: [2, 0, 1, 3],
    explanation: 'الترتيب الصحيح: My name is Hamza. (ضمير الملكية أولاً، ثم الاسم، ثم الفعل، ثم الخبر)',
  },
  {
    id: 4, type: 'mcq', difficulty: 'A1', category: 'grammar',
    points: 10, timeLimit: 20,
    question: 'Which sentence is correct?',
    arabicHint: 'أي جملة صحيحة؟',
    options: ['She have a cat.', 'She has a cat.', 'She is have a cat.', 'She having a cat.'],
    answer: 1,
    explanation: 'مع he / she / it نستخدم "has" وليس "have". She has a cat. ✓',
  },
  {
    id: 5, type: 'listen', difficulty: 'A1', category: 'listening',
    points: 15, timeLimit: 35,
    question: '🔊 Listen carefully, then choose the correct answer:',
    arabicHint: 'استمع باهتمام، ثم اختر الإجابة الصحيحة:',
    audioText: 'Hello! My name is Sara. I am from Morocco. I am a student. Nice to meet you!',
    options: [
      'Sara is from Egypt and she is a teacher.',
      'Sara is from Morocco and she is a student.',
      'Sara is from France and she is a doctor.',
      'Sara is from Morocco and she is a teacher.',
    ],
    answer: 1,
    explanation: 'Sara said: "I am from Morocco. I am a student." — كل شيء آخر غير صحيح.',
  },

  /* ─── A2 ─────────────────────────────────── */
  {
    id: 6, type: 'mcq', difficulty: 'A2', category: 'vocabulary',
    points: 15, timeLimit: 20,
    question: 'What does "to postpone" mean?',
    arabicHint: 'ما معنى "to postpone"؟',
    options: ['إلغاء نهائياً', 'تأجيل إلى وقت لاحق', 'التقدم بسرعة', 'إنهاء المهمة'],
    answer: 1,
    explanation: '"Postpone" = تأجيل. "The meeting was postponed to Friday because the manager is ill." ✓',
  },
  {
    id: 7, type: 'fill', difficulty: 'A2', category: 'grammar',
    points: 15, timeLimit: 25,
    question: 'She has been waiting ___ two hours.',
    arabicHint: 'اختر الحرف المناسب (for / since):',
    options: ['since', 'for', 'during', 'ago'],
    answer: 1,
    explanation: '"For" + مدة زمنية (two hours, 3 days). "Since" + نقطة بداية (2 PM, Monday). ✓ for two hours.',
  },
  {
    id: 8, type: 'correct', difficulty: 'A2', category: 'grammar',
    points: 20, timeLimit: 25,
    question: 'Find the ERROR in this sentence:\n\n"Yesterday I have visited my grandmother."',
    arabicHint: 'ابحث عن الخطأ النحوي:',
    options: [
      '"Yesterday" يجب أن تكون "Last day"',
      '"have visited" يجب أن تكون "visited" (Simple Past مع yesterday)',
      '"my grandmother" يجب أن تكون "the grandmother"',
      'الجملة صحيحة تماماً',
    ],
    answer: 1,
    explanation: 'مع "yesterday" نستخدم Simple Past دائماً: "I visited my grandmother." — لا يمكن استخدام Present Perfect مع "yesterday".',
  },
  {
    id: 9, type: 'listen', difficulty: 'A2', category: 'listening',
    points: 15, timeLimit: 30,
    question: '🔊 Listen and answer: Where is the person going?',
    arabicHint: 'استمع وأجب: أين يريد الشخص الذهاب؟',
    audioText: "Excuse me, could you tell me how to get to the train station? I need to catch the 3 o'clock train to the city.",
    options: ['المستشفى', 'المطار', 'محطة القطار', 'الفندق'],
    answer: 2,
    explanation: 'The person asked: "how to get to the train station" — محطة القطار هي الإجابة الصحيحة.',
  },
  {
    id: 10, type: 'video', difficulty: 'A2', category: 'video',
    points: 20, timeLimit: 0,
    videoId: 'nfWlot6h_JM',
    videoStart: 0,
    videoTranscript:
      'Barista: "Good morning! What can I get for you?"\n' +
      'Customer: "Hi, can I have a large latte please?"\n' +
      'Barista: "Sure! For here or to go?"\n' +
      'Customer: "To go please. Oh, and could I get the WiFi password?"\n' +
      'Barista: "Of course! It\'s café2024. Enjoy your coffee!"',
    question: '☕ Watch the café conversation.\n\nWhat does the customer ask for BESIDES the coffee?',
    arabicHint: 'شاهد المحادثة في المقهى. ماذا طلب الزبون بالإضافة إلى القهوة؟',
    options: [
      'طلب الحساب',
      'طلب كلمة مرور الواي فاي',
      'طلب طاولة بالخارج',
      'طلب قائمة الطعام',
    ],
    answer: 1,
    explanation: 'The customer asked: "Could I get the WiFi password?" — كلمة مرور الواي فاي. ✓',
  },

  /* ─── B1 ─────────────────────────────────── */
  {
    id: 11, type: 'mcq', difficulty: 'B1', category: 'vocabulary',
    points: 20, timeLimit: 20,
    question: 'Choose the best synonym for "persistent":',
    arabicHint: 'اختر المرادف الأنسب لـ "persistent":',
    options: ['lazy — كسول', 'determined — مصمم', 'confused — مرتبك', 'gentle — لطيف'],
    answer: 1,
    explanation: '"Persistent" = مستمر رغم الصعوبات. Synonyms: determined, tenacious, relentless, steadfast.',
  },
  {
    id: 12, type: 'fill', difficulty: 'B1', category: 'grammar',
    points: 20, timeLimit: 25,
    question: 'If I ___ more time, I would learn another language.',
    arabicHint: 'اختر شكل الفعل الصحيح (Conditional Type 2):',
    options: ['have', 'had', 'would have', 'will have'],
    answer: 1,
    explanation: 'Conditional Type 2 (unreal present/future): If + past simple → would + infinitive. "If I had..." ✓',
  },
  {
    id: 13, type: 'listen', difficulty: 'B1', category: 'listening',
    points: 20, timeLimit: 40,
    question: '🔊 Listen and identify the main challenge the speaker describes:',
    arabicHint: 'استمع وحدد التحدي الرئيسي الذي يصفه المتحدث:',
    audioText: "I've been applying for jobs for six months. I always get to the interview stage, but I freeze up when they ask me to talk about myself. My written English is fine, but speaking confidently under pressure is a completely different challenge for me.",
    options: [
      'صعوبة في كتابة السيرة الذاتية',
      'صعوبة التحدث بثقة تحت الضغط',
      'عدم الحصول على دعوات لمقابلات',
      'مشكلة في فهم اللهجات',
    ],
    answer: 1,
    explanation: 'The speaker said: "speaking confidently under pressure is a completely different challenge." — الإجابة B.',
  },
  {
    id: 14, type: 'mcq', difficulty: 'B1', category: 'grammar',
    points: 20, timeLimit: 25,
    question: 'Which sentence is grammatically correct?',
    arabicHint: 'أي جملة صحيحة نحوياً؟',
    options: [
      'I wish I can speak English fluently.',
      'I wish I could speak English fluently.',
      'I wish I would speak English fluently.',
      'I wish I spoken English fluently.',
    ],
    answer: 1,
    explanation: '"Wish" للتمني في الحاضر/المستقبل + past simple. "I wish I could..." ✓ (could = past of can)',
  },
  {
    id: 15, type: 'video', difficulty: 'B1', category: 'video',
    points: 25, timeLimit: 0,
    videoId: 'K-HOsVVc43s',
    videoStart: 0,
    videoTranscript:
      'Interviewer: "So, tell me a little about yourself."\n' +
      'Candidate: "Sure! I\'ve been working in digital marketing for 3 years. I recently led a campaign that increased engagement by 40%."\n' +
      'Interviewer: "Impressive. What would you say is your biggest weakness?"\n' +
      'Candidate: "I tend to be a perfectionist, but I\'ve been working on setting more realistic deadlines for myself."',
    question: '💼 Watch the job interview clip.\n\nHow does the candidate handle the "biggest weakness" question?',
    arabicHint: 'شاهد مقطع المقابلة. كيف يتعامل المرشح مع سؤال نقاط الضعف؟',
    options: [
      'يرفض الإجابة ويغيّر الموضوع',
      'يذكر نقطة ضعف ويشرح كيف يعمل على تحسينها',
      'يقول إنه لا يملك أي نقاط ضعف',
      'يتحدث فقط عن نقاط قوته دون ذكر ضعف',
    ],
    answer: 1,
    explanation: 'الإجابة الذكية في المقابلات: اذكر نقطة ضعف حقيقية + أظهر وعياً ذاتياً + وضّح كيف تتحسن.',
  },
  {
    id: 16, type: 'reorder', difficulty: 'B1', category: 'grammar',
    points: 25, timeLimit: 40,
    question: 'Build the sentence in the correct order:',
    arabicHint: 'رتّب الكلمات لتكوين جملة صحيحة:',
    words: ['studying', 'I', 'been', 'English', 'have', 'years', 'for', 'three'],
    correctOrder: [1, 4, 2, 0, 3, 6, 7, 5],
    explanation: 'Present Perfect Continuous: I have been studying English for three years. ✓ (Subject + have/has + been + V-ing + for + duration)',
  },

  /* ─── B2 ─────────────────────────────────── */
  {
    id: 17, type: 'mcq', difficulty: 'B2', category: 'vocabulary',
    points: 25, timeLimit: 20,
    question: 'Which word best describes someone who tends to see the worst in any situation?',
    arabicHint: 'أي كلمة تصف شخصاً يرى دائماً أسوأ جانب في أي موقف؟',
    options: ['optimistic', 'pragmatic', 'pessimistic', 'stoic'],
    answer: 2,
    explanation: '"Pessimistic" = متشائم — يرى الجانب السلبي دائماً. Opposite: optimistic (متفائل).',
  },
  {
    id: 18, type: 'fill', difficulty: 'B2', category: 'grammar',
    points: 25, timeLimit: 25,
    question: "The CEO's decision, ___ came as a surprise to the board, resulted in a 30% revenue increase.",
    arabicHint: 'اختر الضمير الموصول الصحيح للجملة الوصفية غير التعريفية:',
    options: ['that', 'which', 'who', 'what'],
    answer: 1,
    explanation: '"Which" في Non-defining relative clauses (بعد فاصلة). "That" لا يُستخدم بعد فاصلة في هذا السياق. ✓ which',
  },
  {
    id: 19, type: 'correct', difficulty: 'B2', category: 'grammar',
    points: 25, timeLimit: 30,
    question: 'Identify the grammatical error:\n\n"The data shows that the majority of people believes remote work is more productive."',
    arabicHint: 'حدّد الخطأ النحوي:',
    options: [
      '"data" يجب أن تكون "datas"',
      '"believes" يجب أن تكون "believe" (majority of people = جمع في السياق)',
      '"more productive" يجب أن تكون "most productive"',
      'الجملة صحيحة تماماً',
    ],
    answer: 1,
    explanation: '"The majority of people" يتبعه فعل جمع في الإنجليزية المعاصرة: "the majority believe..." ✓',
  },
  {
    id: 20, type: 'listen', difficulty: 'B2', category: 'listening',
    points: 25, timeLimit: 40,
    question: "🔊 Listen and identify the speaker's IMPLICIT stance (unstated opinion):",
    arabicHint: 'استمع وحدد الموقف الضمني (غير المصرّح به) للمتحدث:',
    audioText: "While I acknowledge that remote work has offered undeniable flexibility, one cannot ignore the subtle erosion of workplace culture and the challenges it poses for junior employees who need in-person mentorship to develop professionally.",
    options: [
      'يدعم العمل عن بعد بحماس كامل',
      'يعارض العمل عن بعد بشكل قاطع وكامل',
      'يعترف بالمزايا لكنه قلق على تأثيره على الموظفين الجدد',
      'محايد تماماً ويعرض الحجتين بتوازن دون تفضيل',
    ],
    answer: 2,
    explanation: '"While I acknowledge..." = يعترف بالفائدة. ثم "one cannot ignore... challenges" = ينتقد. هذا موقف ضمني معارض جزئياً.',
  },
  {
    id: 21, type: 'video', difficulty: 'B2', category: 'video',
    points: 30, timeLimit: 0,
    videoId: 'arj7oStGLkU',
    videoStart: 0,
    videoTranscript:
      'Speaker: "The biggest myth in language learning is that you need a perfect grammar foundation before you start speaking. In reality, fluency comes from making real mistakes in real conversations — not from memorizing rules in isolation. The fastest learners are those who embrace discomfort and speak from day one, without waiting to be \'ready\'."',
    question: '🎤 Watch the language learning talk.\n\nWhat does the speaker say is the BIGGEST MYTH in language learning?',
    arabicHint: 'شاهد المحاضرة. ما هو أكبر خرافة في تعلم اللغات وفق المتحدث؟',
    options: [
      'أن التطبيقات لا تساعد في التعلم',
      'أنك تحتاج قواعد نحوية متقنة قبل البدء بالكلام',
      'أن اللغات تُتعلم فقط في سن الطفولة',
      'أن اللكنة تعيق الفهم',
    ],
    answer: 1,
    explanation: 'The speaker: "The biggest myth is that you need a perfect grammar foundation before speaking." — الأسلوب التقليدي الخاطئ.',
  },

  /* ─── C1 ─────────────────────────────────── */
  {
    id: 22, type: 'mcq', difficulty: 'C1', category: 'vocabulary',
    points: 30, timeLimit: 20,
    question: '"Cognitive dissonance" refers to:',
    arabicHint: 'مصطلح "التنافر المعرفي" يشير إلى:',
    options: [
      'اضطراب تعلمي يؤثر على القراءة والكتابة',
      'الانزعاج الناتج عن الاحتفاظ بمعتقدين متناقضين في الوقت ذاته',
      'عدم القدرة على تكوين ذكريات طويلة المدى',
      'حالة من التركيز الإبداعي العميق',
    ],
    answer: 1,
    explanation: 'Cognitive dissonance (Leon Festinger, 1957) = الانزعاج من تناقض المعتقدات. مثال: تدخين مدمن يعرف ضرره.',
  },
  {
    id: 23, type: 'fill', difficulty: 'C1', category: 'grammar',
    points: 30, timeLimit: 30,
    question: 'Scarcely ___ she finished speaking ___ the audience erupted in applause.',
    arabicHint: 'اختر الزوج الصحيح (تركيب الانعكاس الرسمي):',
    options: ['had / when', 'did / than', 'had / than', 'was / when'],
    answer: 0,
    explanation: '"Scarcely had... when" هو تركيب انعكاس رسمي. Scarcely had she finished when the audience erupted. ✓ (بكاد/لم تكد)',
  },
  {
    id: 24, type: 'listen', difficulty: 'C1', category: 'listening',
    points: 30, timeLimit: 45,
    question: '🔊 Listen and identify: the main CLAIM and the RHETORICAL DEVICE used:',
    arabicHint: 'استمع وحدد: الادعاء الرئيسي والأسلوب البلاغي المستخدم:',
    audioText: "Let me ask you this: if we truly believed in equal opportunity, would we not ensure that every child — regardless of their postcode, their parents' income, or the language spoken at home — had access to the same quality of education? The answer, I believe, is self-evident.",
    options: [
      'يستخدم استفهاماً بلاغياً للمطالبة بتكافؤ فرص التعليم',
      'يعرض إحصاءات رسمية لإثبات فجوة تعليمية',
      'يروي قصة شخصية لاستدرار التعاطف',
      'يقارن بين نظامين تعليميين بأسلوب محايد',
    ],
    answer: 0,
    explanation: 'Rhetorical question ("would we not ensure...") = استفهام بلاغي — يجعل الإجابة تبدو "بديهية" دون إلزام المتكلم بالتصريح بها. (Erotesis)',
  },
  {
    id: 25, type: 'correct', difficulty: 'C1', category: 'grammar',
    points: 30, timeLimit: 30,
    question: 'Which version is stylistically and grammatically SUPERIOR for formal academic writing?',
    arabicHint: 'أي نسخة أفضل للكتابة الأكاديمية الرسمية المتقدمة؟',
    options: [
      '"The report, having been reviewed by the committee, was subsequently approved."',
      '"The report was reviewed by the committee and then it got approved after that."',
      '"After the committee reviewed it, they approved the report subsequently."',
      '"The committee reviewed the report and then approved it at a later point in time."',
    ],
    answer: 0,
    explanation: 'Option A: participial phrase (having been reviewed) = مختصر، رسمي، يتجنب التكرار. B/C/D فيها حشو (redundancy) أو أسلوب غير رسمي ("got approved").',
  },
  {
    id: 26, type: 'reorder', difficulty: 'C1', category: 'grammar',
    points: 30, timeLimit: 40,
    question: 'Arrange to form a correct formal sentence:',
    arabicHint: 'رتّب لتكوين جملة رسمية صحيحة:',
    words: ['been', 'had', 'the', 'implemented', 'policy', 'properly'],
    correctOrder: [2, 4, 1, 0, 3, 5],
    explanation: 'Past Perfect Passive: The policy had been implemented properly. ✓ (The + noun + had + been + past participle + adverb)',
  },
]

/* ══════════════════════════════════════════════════════════════
   ADAPTIVE ENGINE
══════════════════════════════════════════════════════════════ */
function levelUp(l: CEFRLevel): CEFRLevel {
  return LEVEL_ORDER[Math.min(LEVEL_ORDER.indexOf(l) + 1, 4)]
}
function levelDown(l: CEFRLevel): CEFRLevel {
  return LEVEL_ORDER[Math.max(LEVEL_ORDER.indexOf(l) - 1, 0)]
}
function getEstimatedLevel(stats: Record<CEFRLevel, LevelStat>): CEFRLevel {
  let best: CEFRLevel = 'A1'
  for (const l of LEVEL_ORDER) {
    const s = stats[l]
    if (s.t > 0 && s.c / s.t >= 0.5) best = l
  }
  return best
}
function pickNext(
  estimated: CEFRLevel,
  lastCorrect: boolean | null,
  usedIds: Set<number>,
  usedCats: string[],
  n: number,
): Question | null {
  let target = estimated
  if (lastCorrect === true)  target = levelUp(estimated)
  if (lastCorrect === false) target = levelDown(estimated)

  let pool = QUESTIONS.filter(q => !usedIds.has(q.id))

  // Force coverage of listen and video if not covered yet
  const needListen = !usedCats.includes('listening') && n >= 4
  const needVideo  = !usedCats.includes('video')     && n >= 7
  if (needListen) {
    const lp = pool.filter(q => q.type === 'listen')
    if (lp.length > 0) pool = lp
  } else if (needVideo) {
    const vp = pool.filter(q => q.type === 'video')
    if (vp.length > 0) pool = vp
  } else {
    const exact    = pool.filter(q => q.difficulty === target)
    const adjacent = pool.filter(q => q.difficulty === estimated || q.difficulty === target)
    if (exact.length    > 0) pool = exact
    else if (adjacent.length > 0) pool = adjacent
  }

  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
}

/* ══════════════════════════════════════════════════════════════
   SOUND HELPERS
══════════════════════════════════════════════════════════════ */
function playSound(type: 'correct' | 'wrong') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    if (type === 'correct') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime)
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12)
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24)
      gain.gain.setValueAtTime(0.22, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc.start(); osc.stop(ctx.currentTime + 0.6)
    } else {
      osc.frequency.setValueAtTime(311.13, ctx.currentTime)
      osc.frequency.setValueAtTime(246.94, ctx.currentTime + 0.18)
      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(); osc.stop(ctx.currentTime + 0.5)
    }
  } catch { /* browser may block audio */ }
}

function speak(text: string) {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'; u.rate = 0.86; u.pitch = 1
  window.speechSynthesis.speak(u)
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
const MAX_Q = 20
const EMPTY_STATS: Record<CEFRLevel, LevelStat> = {
  A1:{c:0,t:0}, A2:{c:0,t:0}, B1:{c:0,t:0}, B2:{c:0,t:0}, C1:{c:0,t:0},
}

export default function LevelTestPage() {
  /* ── phases ── */
  const [phase, setPhase]               = useState<'intro'|'testing'|'result'>('intro')
  const [showLvlUp, setShowLvlUp]       = useState(false)
  const [lvlUpTo, setLvlUpTo]           = useState<CEFRLevel | null>(null)

  /* ── question state ── */
  const [currentQ, setCurrentQ]         = useState<Question | null>(null)
  const [qNum, setQNum]                 = useState(0)
  const [usedIds, setUsedIds]           = useState<Set<number>>(new Set())
  const [usedCats, setUsedCats]         = useState<string[]>([])

  /* ── answer state ── */
  const [selOption, setSelOption]       = useState<number | null>(null)
  const [reorderSel, setReorderSel]     = useState<number[]>([])
  const [answered, setAnswered]         = useState<'waiting'|'correct'|'wrong'>('waiting')
  const [videoWatched, setVideoWatched] = useState(false)
  const [audioPlayed, setAudioPlayed]   = useState(false)

  /* ── scoring ── */
  const [score, setScore]               = useState(0)
  const [streak, setStreak]             = useState(0)
  const [levelStats, setLevelStats]     = useState<Record<CEFRLevel, LevelStat>>({...EMPTY_STATS})
  const [catScores, setCatScores]       = useState<Record<string, LevelStat>>({})
  const [estimated, setEstimated]       = useState<CEFRLevel>('A2')
  const [history, setHistory]           = useState<{q:Question; ok:boolean}[]>([])
  const [floatPts, setFloatPts]         = useState<{v:number; id:number}|null>(null)

  /* ── timer ── */
  const [timeLeft, setTimeLeft]         = useState(0)
  const timerRef                        = useRef<ReturnType<typeof setInterval>|null>(null)

  /* refs for adaptive logic (avoid stale closure) */
  const lastCorrectRef = useRef<boolean|null>(null)
  const estimatedRef   = useRef<CEFRLevel>('A2')
  estimatedRef.current = estimated

  /* ── level-up detection ── */
  const prevEstRef = useRef<CEFRLevel>('A2')
  useEffect(() => {
    if (LEVEL_ORDER.indexOf(estimated) > LEVEL_ORDER.indexOf(prevEstRef.current)) {
      setLvlUpTo(estimated)
      setShowLvlUp(true)
    }
    prevEstRef.current = estimated
  }, [estimated])

  /* ── timer tick ── */
  useEffect(() => {
    if (!currentQ || currentQ.timeLimit === 0 || answered !== 'waiting') return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          commitAnswer(false)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ, answered])

  /* ── helpers ── */
  function commitAnswer(ok: boolean) {
    if (!currentQ) return
    if (timerRef.current) clearInterval(timerRef.current)
    lastCorrectRef.current = ok
    setAnswered(ok ? 'correct' : 'wrong')
    playSound(ok ? 'correct' : 'wrong')

    setHistory(h => [...h, { q: currentQ, ok }])

    // Update level stats
    const newStats = { ...levelStats }
    newStats[currentQ.difficulty] = {
      c: newStats[currentQ.difficulty].c + (ok ? 1 : 0),
      t: newStats[currentQ.difficulty].t + 1,
    }
    setLevelStats(newStats)
    setEstimated(getEstimatedLevel(newStats))

    // Update category scores
    setCatScores(prev => {
      const s = { ...prev }
      const cat = currentQ.category
      if (!s[cat]) s[cat] = { c:0, t:0 }
      s[cat] = { c: s[cat].c + (ok ? 1 : 0), t: s[cat].t + 1 }
      return s
    })

    // Points + streak
    if (ok) {
      const bonus = streak >= 2 ? 5 : 0
      const pts = currentQ.points + bonus
      setScore(p => p + pts)
      setStreak(s => s + 1)
      setFloatPts({ v: pts, id: Date.now() })
      setTimeout(() => setFloatPts(null), 1300)
    } else {
      setStreak(0)
    }
  }

  function handleOption(idx: number) {
    if (answered !== 'waiting') return
    if (currentQ?.type === 'video'  && !videoWatched) return
    if (currentQ?.type === 'listen' && !audioPlayed)  return
    setSelOption(idx)
    commitAnswer(idx === currentQ?.answer)
  }

  function handleReorderCheck() {
    if (!currentQ || answered !== 'waiting') return
    commitAnswer(JSON.stringify(reorderSel) === JSON.stringify(currentQ.correctOrder))
  }

  function handleSpeak() {
    if (!currentQ?.audioText) return
    speak(currentQ.audioText)
    setAudioPlayed(true)
  }

  function startTest() {
    const first = QUESTIONS.find(q => q.difficulty === 'A2' && q.type === 'mcq')!
    setCurrentQ(first)
    setUsedIds(new Set([first.id]))
    setUsedCats([first.category])
    setQNum(0)
    setTimeLeft(first.timeLimit)
    setPhase('testing')
  }

  function goNext() {
    // If level-up overlay is showing, let it finish first
    if (showLvlUp) {
      setShowLvlUp(false)
      setLvlUpTo(null)
    }

    if (qNum + 1 >= MAX_Q) { setPhase('result'); return }

    const newUsed = new Set(usedIds)
    const next = pickNext(estimatedRef.current, lastCorrectRef.current, newUsed, usedCats, qNum + 1)
    if (!next) { setPhase('result'); return }

    newUsed.add(next.id)
    setUsedIds(newUsed)
    setUsedCats(p => [...p, next.category])
    setCurrentQ(next)
    setQNum(n => n + 1)
    setSelOption(null)
    setReorderSel([])
    setAnswered('waiting')
    setVideoWatched(false)
    setAudioPlayed(false)
    setTimeLeft(next.timeLimit)
  }

  function resetTest() {
    setPhase('intro')
    setScore(0); setStreak(0); setQNum(0)
    setHistory([]); setUsedIds(new Set()); setUsedCats([])
    setLevelStats({...EMPTY_STATS}); setCatScores({})
    setEstimated('A2'); setCurrentQ(null)
    prevEstRef.current = 'A2'
    lastCorrectRef.current = null
  }

  /* ════════════════ RENDER HELPERS ════════════════ */

  function TypeBadge() {
    if (!currentQ) return null
    const cfg: Record<QType, {icon: React.ReactNode; label: string}> = {
      mcq:     { icon: <Brain size={13}/>,        label: 'اختيار متعدد' },
      fill:    { icon: <BookOpen size={13}/>,      label: 'أكمل الفراغ' },
      listen:  { icon: <Mic size={13}/>,           label: 'استماع' },
      video:   { icon: <PlayCircle size={13}/>,    label: 'فيديو' },
      correct: { icon: <Target size={13}/>,        label: 'صحّح الخطأ' },
      reorder: { icon: <RotateCcw size={13}/>,     label: 'رتّب الجملة' },
    }
    const c = cfg[currentQ.type]
    return (
      <span className="inline-flex items-center gap-1.5 bg-white/10 text-blue-200 text-xs font-bold px-3 py-1 rounded-full">
        {c.icon}{c.label}
      </span>
    )
  }

  function renderOptions() {
    if (!currentQ?.options) return null
    return (
      <div className="space-y-2.5">
        {currentQ.options.map((opt, idx) => {
          const isCorrect  = idx === currentQ.answer
          const isSelected = idx === selOption
          let cls = 'w-full text-right px-5 py-3.5 rounded-2xl border text-sm font-medium transition-all duration-200 flex items-center gap-3 '
          if (answered === 'waiting') {
            cls += 'bg-white/[0.05] border-white/15 text-white hover:bg-white/10 hover:border-white/30 cursor-pointer active:scale-[0.99]'
          } else if (isCorrect) {
            cls += 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200'
          } else if (isSelected && answered === 'wrong') {
            cls += 'bg-red-500/15 border-red-400/50 text-red-300'
          } else {
            cls += 'bg-white/[0.02] border-white/8 text-white/30 cursor-default'
          }
          return (
            <button key={idx} onClick={() => handleOption(idx)}
              disabled={answered !== 'waiting'} className={cls}>
              <span className={`flex-shrink-0 w-7 h-7 rounded-full border text-[11px] font-black flex items-center justify-center ${
                answered !== 'waiting' && isCorrect
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : answered !== 'waiting' && isSelected
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'border-white/20 text-white/40'
              }`}>
                {answered !== 'waiting' && isCorrect
                  ? <CheckCircle2 size={13}/>
                  : answered !== 'waiting' && isSelected
                  ? <XCircle size={13}/>
                  : String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
            </button>
          )
        })}
      </div>
    )
  }

  function renderQuestionBody() {
    if (!currentQ) return null

    /* ── Reorder ── */
    if (currentQ.type === 'reorder') {
      const built = reorderSel.map(i => currentQ.words![i])
      const allPlaced = reorderSel.length === currentQ.words!.length
      return (
        <div className="space-y-4">
          <div className="min-h-[52px] bg-white/[0.06] rounded-2xl border border-white/10 p-3 flex flex-wrap gap-2 items-center">
            {built.length === 0
              ? <span className="text-white/25 text-sm">انقر على الكلمات لبناء الجملة...</span>
              : built.map((w, i) => (
                <button key={i}
                  onClick={() => { if (answered !== 'waiting') return; setReorderSel(p => p.filter((_,j) => j !== i)) }}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm px-3 py-1.5 rounded-xl transition-colors"
                >{w} ×</button>
              ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {currentQ.words!.map((w, idx) => {
              const isSel = reorderSel.includes(idx)
              return (
                <button key={idx}
                  onClick={() => { if (answered !== 'waiting' || isSel) return; setReorderSel(p => [...p, idx]) }}
                  disabled={answered !== 'waiting' || isSel}
                  className={`px-4 py-2 rounded-xl font-bold text-sm border transition-all ${
                    isSel ? 'bg-white/5 text-white/20 border-white/8' : 'bg-white/10 text-white border-white/20 hover:bg-white/20 active:scale-95'
                  }`}
                >{isSel ? '—' : w}</button>
              )
            })}
          </div>
          {answered === 'waiting' && (
            <button onClick={handleReorderCheck} disabled={!allPlaced}
              className={`w-full py-3.5 rounded-2xl font-black text-base transition-all ${
                allPlaced ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg' : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}>
              تحقق من الإجابة ✓
            </button>
          )}
        </div>
      )
    }

    /* ── Video ── */
    if (currentQ.type === 'video') {
      return (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${currentQ.videoId}?start=${currentQ.videoStart||0}&modestbranding=1&rel=0`}
              className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen
            />
          </div>
          {currentQ.videoTranscript && (
            <details className="group">
              <summary className="cursor-pointer text-blue-300 text-xs font-semibold hover:text-blue-200 list-none flex items-center gap-1.5">
                <MessageSquare size={13}/>عرض النص المكتوب / Transcript
              </summary>
              <div className="mt-2 bg-white/[0.04] rounded-xl p-4 border border-white/10 text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                {currentQ.videoTranscript}
              </div>
            </details>
          )}
          {!videoWatched && answered === 'waiting'
            ? <button onClick={() => setVideoWatched(true)}
                className="w-full py-3 bg-white/10 hover:bg-white/18 border border-white/20 text-white font-bold rounded-2xl text-sm transition-all">
                شاهدت المقطع — أعطني السؤال →
              </button>
            : renderOptions()}
        </div>
      )
    }

    /* ── Listen ── */
    if (currentQ.type === 'listen') {
      return (
        <div className="space-y-4">
          <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <button onClick={handleSpeak}
              className="w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-500 flex items-center justify-center text-white shadow-lg flex-shrink-0 transition-all active:scale-90">
              <Volume2 size={22}/>
            </button>
            <div>
              <p className="text-white font-bold text-sm">{audioPlayed ? '✓ استمعت للتسجيل' : 'اضغط للاستماع'}</p>
              <p className="text-white/35 text-xs mt-0.5">يمكنك الاستماع أكثر من مرة</p>
            </div>
            {audioPlayed && (
              <button onClick={handleSpeak} className="mr-auto text-xs text-blue-300 hover:text-blue-200 font-semibold">↩ أعد الاستماع</button>
            )}
          </div>
          {audioPlayed || answered !== 'waiting'
            ? renderOptions()
            : <p className="text-center text-white/30 text-sm py-2">استمع أولاً ثم ستظهر خيارات الإجابة</p>}
        </div>
      )
    }

    /* ── MCQ / Fill / Correct ── */
    return renderOptions()
  }

  function renderPanel() {
    const s = LEVEL_STYLE[estimated]
    const progress = Math.round((qNum / MAX_Q) * 100)
    return (
      <div className="space-y-3">
        {/* Level card */}
        <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-white/35 text-[10px] font-black uppercase tracking-widest mb-3">مستواك الحالي</p>
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${s.bg} shadow-xl ${s.glow} mb-2`}>
            <span className="text-white font-black text-xl">{estimated}</span>
          </div>
          <p className={`font-black ${s.color} mb-0.5`}>{LEVEL_STYLE[estimated].label}</p>
          <p className="text-white/25 text-[10px]">يتحدّث مع كل سؤال</p>
        </div>
        {/* Progress */}
        <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-white/40 text-xs font-semibold">التقدم</span>
            <span className="text-white font-black text-sm">{qNum}/{MAX_Q}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500" style={{width:`${progress}%`}}/>
          </div>
        </div>
        {/* Score */}
        <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 relative overflow-hidden">
          <p className="text-white/40 text-xs font-semibold mb-0.5">النقاط</p>
          <p className="text-2xl font-black text-white">{score}</p>
          {floatPts && (
            <span key={floatPts.id} className="absolute top-2 left-4 text-emerald-400 font-black text-sm animate-bounce">
              +{floatPts.v}
            </span>
          )}
        </div>
        {/* Streak */}
        {streak >= 2 && (
          <div className="bg-orange-500/15 border border-orange-400/30 rounded-2xl p-3 flex items-center gap-2.5">
            <Zap size={18} className="text-orange-400 flex-shrink-0"/>
            <div>
              <p className="text-orange-300 font-black text-sm">{streak} متتاليين 🔥</p>
              <p className="text-orange-400/50 text-[10px]">+5 نقطة مكافأة</p>
            </div>
          </div>
        )}
        {/* Level bars */}
        <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4">
          <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">مستويات CEFR</p>
          <div className="space-y-2">
            {LEVEL_ORDER.map(l => {
              const ls = levelStats[l]
              const acc = ls.t > 0 ? Math.round((ls.c / ls.t) * 100) : null
              return (
                <div key={l} className="flex items-center gap-2">
                  <span className={`text-[11px] font-black w-6 ${LEVEL_STYLE[l].color}`}>{l}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${LEVEL_STYLE[l].bg} rounded-full transition-all duration-500`}
                      style={{width: acc !== null ? `${acc}%` : '0%'}}/>
                  </div>
                  {acc !== null && <span className="text-[9px] text-white/35 w-7 text-left">{acc}%</span>}
                  {l === estimated && ls.t > 0 && <span className="text-[9px] text-white/50">◀</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  /* ════════════════ SCREENS ════════════════ */

  /* ── INTRO ── */
  if (phase === 'intro') return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-brand-950 to-gray-950 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-brand-600 rounded-3xl shadow-2xl shadow-brand-500/40 mb-8">
          <Brain size={42} className="text-white"/>
        </div>
        <span className="inline-block bg-white/10 text-blue-200 text-sm font-bold px-4 py-1.5 rounded-full mb-5">
          اكتشف مستواك الحقيقي مجاناً
        </span>
        <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 leading-tight">
          اختبار المستوى<br/>
          <span className="text-brand-400">الذكي</span>
        </h1>
        <p className="text-white/55 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          20 سؤالاً تكيّفياً يحدد مستواك الحقيقي على سلم CEFR — استماع، فيديو، قواعد، مفردات. النتيجة في أقل من 10 دقائق.
        </p>
        {/* CEFR pills */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {LEVEL_ORDER.map((l, i) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className={`${LEVEL_STYLE[l].bg} text-white font-black text-sm px-4 py-2 rounded-xl shadow-lg`}>{l}</span>
              {i < 4 && <ChevronRight size={13} className="text-white/25"/>}
            </div>
          ))}
        </div>
        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon: Brain,   label: 'تكيّفي',      sub: 'يتعلم أثناء الاختبار' },
            { icon: Zap,     label: '10 دقائق',    sub: 'سريع ودقيق' },
            { icon: Trophy,  label: 'نتيجة CEFR',  sub: 'مع خطة واضحة' },
          ].map(({icon: Icon, label, sub}) => (
            <div key={label} className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 text-center">
              <Icon size={22} className="text-brand-400 mx-auto mb-2"/>
              <p className="text-white font-black text-sm">{label}</p>
              <p className="text-white/35 text-xs mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
        <button onClick={startTest}
          className="bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-black py-5 px-14 rounded-2xl text-xl shadow-2xl shadow-brand-500/40 transition-all flex items-center gap-3 mx-auto">
          ابدأ الاختبار <ArrowLeft size={22}/>
        </button>
        <p className="text-white/25 text-sm mt-4">مجاني 100% · بدون تسجيل · بدون بطاقة ائتمان</p>
      </div>
    </main>
  )

  /* ── RESULT ── */
  if (phase === 'result') {
    let finalLevel: CEFRLevel = 'A1'
    for (const l of LEVEL_ORDER) {
      const s = levelStats[l]
      if (s.t > 0 && s.c / s.t >= 0.5) finalLevel = l
    }
    const info  = CEFR_INFO[finalLevel]
    const style = LEVEL_STYLE[finalLevel]
    const totalAnswered = history.length
    const totalCorrect  = history.filter(h => h.ok).length
    const accuracy      = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

    const catLabels: Record<string, string> = {
      vocabulary: 'المفردات', grammar: 'القواعد',
      listening: 'الاستماع', video: 'الفهم والمشاهدة', comprehension: 'القراءة',
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-brand-950 to-gray-950">
        <div className={`${style.bg} py-2 text-center`}>
          <p className="text-white text-sm font-bold">🎉 اكتمل الاختبار! — Test Complete!</p>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-10">

          {/* Hero result card */}
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 sm:p-12 text-center mb-6">
            <div className={`inline-flex items-center justify-center w-28 h-28 rounded-3xl ${style.bg} shadow-2xl ${style.glow} mb-5`}>
              <span className="text-white font-black text-4xl">{finalLevel}</span>
            </div>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-2">مستواك الحالي</p>
            <h1 className={`text-5xl font-black ${style.color} mb-3`}>{LEVEL_STYLE[finalLevel].label}</h1>
            <p className="text-white/65 text-lg max-w-xl mx-auto mb-7 leading-relaxed">{info.descAr}</p>
            {/* Stats row */}
            <div className="inline-flex items-center gap-6 bg-white/10 rounded-2xl px-8 py-4 mb-8">
              {[
                { label: 'النقاط',   val: score,          color: 'text-white' },
                { label: 'الأسئلة', val: totalAnswered,   color: 'text-white' },
                { label: 'الدقة',    val: `${accuracy}%`, color: accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400' },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center gap-6">
                  {i > 0 && <div className="w-px h-8 bg-white/20"/>}
                  <div className="text-center">
                    <p className="text-white/35 text-xs mb-0.5">{item.label}</p>
                    <p className={`text-2xl font-black ${item.color}`}>{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Main CTA */}
            <a
              href={`https://wa.me/212707902091?text=${encodeURIComponent(`مرحبا حمزة، أجريت اختبار المستوى وحصلت على مستوى ${finalLevel}. أريد البدء في تحسين مستواي.`)}`}
              target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-3 ${style.bg} text-white font-black py-4 px-10 rounded-2xl shadow-2xl ${style.glow} text-lg hover:opacity-90 transition-opacity mb-3`}
            >
              🚀 {info.courseLabel}
            </a>
            <p className="text-white/25 text-sm">تواصل مع حمزة عبر واتساب — رد خلال دقائق</p>
          </div>

          {/* Can do / Focus */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} className="text-emerald-400"/><h3 className="font-black text-white">ما تستطيع فعله الآن</h3>
              </div>
              <ul className="space-y-2.5">
                {info.canDo.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-white/60 text-sm">
                    <span className="text-emerald-400 font-black mt-0.5 flex-shrink-0">✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target size={18} className="text-orange-400"/><h3 className="font-black text-white">ركّز على تطوير</h3>
              </div>
              <ul className="space-y-2.5">
                {info.focus.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-white/60 text-sm">
                    <span className="text-orange-400 font-black mt-0.5 flex-shrink-0">→</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="font-black text-white mb-5 flex items-center gap-2">
              <BarChart2 size={18} className="text-brand-400"/>تفصيل الأداء حسب المهارة
            </h3>
            <div className="space-y-4">
              {Object.entries(catScores).map(([cat, s]) => {
                const pct = Math.round((s.c / s.t) * 100)
                return (
                  <div key={cat}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-white/60 text-sm font-semibold">{catLabels[cat] || cat}</span>
                      <span className={`text-sm font-black ${pct>=70?'text-emerald-400':pct>=50?'text-amber-400':'text-red-400'}`}>{pct}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${pct>=70?'bg-emerald-500':pct>=50?'bg-amber-500':'bg-red-500'}`}
                        style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/courses"
              className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-black py-4 rounded-2xl text-center text-lg transition-colors flex items-center justify-center gap-2">
              <Trophy size={20}/>عرض برامج التدريب
            </Link>
            <button onClick={resetTest}
              className="flex-1 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black py-4 rounded-2xl text-lg transition-colors flex items-center justify-center gap-2">
              <RotateCcw size={20}/>إعادة الاختبار
            </button>
          </div>

        </div>
      </div>
    )
  }

  /* ── TESTING ── */
  if (!currentQ) return null
  const timerPct = currentQ.timeLimit > 0 ? (timeLeft / currentQ.timeLimit) * 100 : 100

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Level-up overlay */}
      {showLvlUp && lvlUpTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-28 h-28 rounded-3xl ${LEVEL_STYLE[lvlUpTo].bg} shadow-2xl ${LEVEL_STYLE[lvlUpTo].glow} mb-5 animate-bounce`}>
              <span className="text-white font-black text-4xl">{lvlUpTo}</span>
            </div>
            <p className="text-white/50 text-base font-semibold mb-1">أنت تدخل الآن مستوى</p>
            <p className={`text-4xl font-black ${LEVEL_STYLE[lvlUpTo].color} mb-2`}>{LEVEL_STYLE[lvlUpTo].label}</p>
            <p className="text-white/35 text-sm mb-5">الأسئلة ستصبح أصعب قليلاً... استمر!</p>
            <button onClick={() => { setShowLvlUp(false); setLvlUpTo(null) }}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors">
              متابعة →
            </button>
          </div>
        </div>
      )}

      {/* Top thin progress bar */}
      <div className="h-1 bg-white/10">
        <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
          style={{width:`${(qNum/MAX_Q)*100}%`}}/>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">

          {/* ── Left: Question area ── */}
          <div>
            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <TypeBadge/>
                <span className="text-white/35 text-sm">{qNum+1} / {MAX_Q}</span>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full text-white ${LEVEL_STYLE[currentQ.difficulty].bg}`}>
                {currentQ.difficulty}
              </span>
            </div>

            {/* Question card */}
            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 mb-4">
              {/* Timer */}
              {currentQ.timeLimit > 0 && (
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/35">الوقت المتبقي</span>
                    <span className={timeLeft <= 5 ? 'text-red-400 font-black' : 'text-white/50'}>{timeLeft}s</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${timerPct>50?'bg-brand-500':timerPct>25?'bg-amber-500':'bg-red-500'}`}
                      style={{width:`${timerPct}%`}}/>
                  </div>
                </div>
              )}
              {/* Question text */}
              <div className="mb-5">
                <h2 className="text-lg sm:text-xl font-black text-white leading-relaxed whitespace-pre-line mb-2">{currentQ.question}</h2>
                {currentQ.arabicHint && <p className="text-white/35 text-sm">{currentQ.arabicHint}</p>}
              </div>
              {renderQuestionBody()}
            </div>

            {/* Feedback */}
            {answered !== 'waiting' && (
              <div className={`rounded-2xl p-4 border mb-4 ${
                answered === 'correct' ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-red-500/10 border-red-500/25'
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {answered === 'correct'
                    ? <CheckCircle2 size={16} className="text-emerald-400"/>
                    : <XCircle size={16} className="text-red-400"/>}
                  <span className={`font-black text-sm ${answered==='correct'?'text-emerald-300':'text-red-300'}`}>
                    {answered === 'correct' ? 'إجابة صحيحة! 🎉' : 'إجابة خاطئة'}
                  </span>
                </div>
                <p className="text-white/55 text-sm leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Next button */}
            {answered !== 'waiting' && (
              <button onClick={goNext}
                className="w-full bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white font-black py-4 rounded-2xl text-lg transition-all flex items-center justify-center gap-2">
                {qNum+1 >= MAX_Q ? 'عرض نتائجك' : 'السؤال التالي'} <ArrowLeft size={20}/>
              </button>
            )}
          </div>

          {/* ── Right: Stats panel (desktop) ── */}
          <div className="hidden lg:block sticky top-6">
            {renderPanel()}
          </div>

        </div>
      </div>

      {/* Mobile stats bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-white/10 px-4 py-3 flex items-center gap-4 z-30">
        <div className={`w-10 h-10 rounded-xl ${LEVEL_STYLE[estimated].bg} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
          {estimated}
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/40">{qNum}/{MAX_Q} أسئلة</span>
            <span className="text-white font-bold">{score} pts</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{width:`${(qNum/MAX_Q)*100}%`}}/>
          </div>
        </div>
        {streak >= 2 && (
          <div className="flex items-center gap-1 text-orange-400 text-sm font-black">
            <Zap size={14}/>{streak}🔥
          </div>
        )}
      </div>
      {/* Bottom padding for mobile bar */}
      <div className="lg:hidden h-20"/>

    </main>
  )
}
