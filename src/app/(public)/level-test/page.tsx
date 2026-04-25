'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, XCircle, Brain, Trophy, Volume2,
  ArrowLeft, ChevronRight, MessageCircle, RotateCcw,
  AlertTriangle, Star, TrendingUp, BarChart2, Play, Crown,
} from 'lucide-react'
import { getPlan } from '@/data/plans'
import { COURSES } from '@/data/courses'
import { openSubscribe } from '@/lib/lead-source'
import { createSubscriptionLead, getAttribution } from '@/lib/leads-db'

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
type QType     = 'grammar' | 'vocabulary' | 'correction' | 'ordering' | 'reading' | 'listening'
type SkillKey  = 'grammar' | 'vocabulary' | 'comprehension' | 'structure'

interface Question {
  id:            number
  level:         CEFRLevel
  type:          QType
  skill:         SkillKey
  question:      string
  arabicHint:    string
  passage?:      string
  audioText?:    string
  options?:      string[]
  answer?:       number
  words?:        string[]
  correctOrder?: number[]
  explanation:   string
}

interface SkillStat { correct: number; total: number }

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */

const LEVEL_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']
const MISTAKES_TO_FAIL = 3
const WHATSAPP = '212707902091'
const waUrl = (msg: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`

const LEVEL_STYLE: Record<CEFRLevel, {
  bg: string; color: string; border: string; glow: string; label: string
}> = {
  A1: { bg:'bg-amber-500',   color:'text-amber-400',   border:'border-amber-400',   glow:'shadow-amber-500/40',   label:'مبتدئ'       },
  A2: { bg:'bg-orange-500',  color:'text-orange-400',  border:'border-orange-400',  glow:'shadow-orange-500/40',  label:'أساسي'       },
  B1: { bg:'bg-blue-500',    color:'text-blue-400',    border:'border-blue-400',    glow:'shadow-blue-500/40',    label:'متوسط'       },
  B2: { bg:'bg-purple-500',  color:'text-purple-400',  border:'border-purple-400',  glow:'shadow-purple-500/40',  label:'فوق المتوسط' },
  C1: { bg:'bg-emerald-500', color:'text-emerald-400', border:'border-emerald-400', glow:'shadow-emerald-500/40', label:'متقدم'       },
}

const CEFR_FEEDBACK: Record<CEFRLevel, { ar: string; canDo: string[]; focus: string[] }> = {
  A1: {
    ar: 'أنت في بداية رحلتك. تفهم الكلمات البسيطة والتعبيرات اليومية. كل المتحدثين بدأوا من هنا!',
    canDo: ['تقديم نفسك والآخرين', 'فهم الكلمات اليومية البسيطة', 'الإجابة على أسئلة بسيطة عن نفسك'],
    focus:  ['الأفعال الأساسية: be, have, do', 'المفردات اليومية الأساسية', 'الجملة البسيطة: Subject + Verb + Object'],
  },
  A2: {
    ar: 'تستطيع التواصل في المواقف اليومية البسيطة. أساسك جيد — الآن نبنيه للطلاقة الحقيقية!',
    canDo: ['وصف حياتك اليومية والمحيط', 'التعامل مع مواقف التسوق والسفر البسيطة', 'فهم الرسائل والإشعارات القصيرة'],
    focus:  ['الماضي البسيط والمستمر', 'Present Perfect للتجارب', 'حروف الجر والتعابير الاصطلاحية'],
  },
  B1: {
    ar: 'مستوى ممتاز! تستطيع التعبير عن آرائك والتعامل مع معظم المواقف. أنت قريب من الطلاقة!',
    canDo: ['التعبير عن أفكارك ومشاعرك بوضوح', 'التعامل مع معظم مواقف العمل والسفر', 'فهم معظم المحادثات العادية'],
    focus:  ['جمل الشرط (Conditionals)', 'المبني للمجهول (Passive Voice)', 'الخطاب غير المباشر (Reported Speech)'],
  },
  B2: {
    ar: 'مستوى متقدم جداً! تناقش موضوعات معقدة وتتفاعل بثقة مع المتحدثين الأصليين.',
    canDo: ['فهم الأفكار الرئيسية في نصوص معقدة', 'التعبير بطلاقة دون بحث عن كلمات', 'المشاركة في نقاشات متخصصة'],
    focus:  ['الجمل الوصفية المعقدة', 'أسلوب الكتابة الرسمية والأكاديمية', 'المفردات المتقدمة والأكاديمية'],
  },
  C1: {
    ar: 'مستوى احترافي! إنجليزيتك قريبة من مستوى الناطقين الأصليين. يمكنك تعليم الآخرين!',
    canDo: ['التعبير عن أفكار معقدة بمرونة ودقة', 'فهم النصوص الطويلة والضمنية', 'الكتابة الأكاديمية المتقنة'],
    focus:  ['الفروق الأسلوبية الدقيقة', 'أساليب الخطابة والإقناع', 'الأساليب البلاغية المتقدمة'],
  },
}

const SKILL_LABELS: Record<SkillKey, { ar: string; en: string }> = {
  grammar:      { ar: 'القواعد',   en: 'Grammar'       },
  vocabulary:   { ar: 'المفردات',  en: 'Vocabulary'    },
  comprehension:{ ar: 'الاستيعاب', en: 'Comprehension'  },
  structure:    { ar: 'التركيب',   en: 'Structure'     },
}

const TYPE_META: Record<QType, { label: string; icon: string }> = {
  grammar:    { label: 'قواعد نحوية', icon: '📖' },
  vocabulary: { label: 'مفردات',      icon: '📝' },
  correction: { label: 'صحّح الخطأ', icon: '✏️' },
  ordering:   { label: 'رتّب الجملة',icon: '🔢' },
  reading:    { label: 'قراءة وفهم', icon: '📄' },
  listening:  { label: 'استماع',     icon: '🔊' },
}

/* ══════════════════════════════════════════════════════════════
   QUESTION BANK  —  12 questions × 5 levels = 60 questions
   CEFR-accurate, pedagogically sequenced, no randomisation
══════════════════════════════════════════════════════════════ */

const QUESTIONS: Record<CEFRLevel, Question[]> = {

  /* ─── A1  ─────────────────────────────────────────────────────────
     Target: beginners who understand simple words and basic phrases  */
  A1: [
    {
      id:101, level:'A1', type:'grammar', skill:'grammar',
      question: 'I ___ a student.',
      arabicHint: 'أكمل الجملة بالفعل الصحيح:',
      options: ['is', 'am', 'are', 'be'],
      answer: 1,
      explanation: 'مع "I" نستخدم دائماً "am". ✓ I am a student.\n(He/She/It → is | We/You/They → are)',
    },
    {
      id:102, level:'A1', type:'vocabulary', skill:'vocabulary',
      question: 'What is the opposite of "hot"?',
      arabicHint: 'ما هو عكس كلمة "hot" (حار)؟',
      options: ['warm', 'cold', 'big', 'fast'],
      answer: 1,
      explanation: '"Hot" ↔ "Cold". "It\'s very cold today — bring a jacket!" ✓',
    },
    {
      id:103, level:'A1', type:'grammar', skill:'grammar',
      question: 'She has ___ cat.',
      arabicHint: 'أضف الأداة الصحيحة (a / an):',
      options: ['a', 'an', 'the', '—'],
      answer: 0,
      explanation: '"a" قبل الأصوات الساكنة: a cat, a dog, a book. ✓\n"an" قبل الأصوات المتحركة: an apple, an egg, an umbrella.',
    },
    {
      id:104, level:'A1', type:'ordering', skill:'structure',
      question: 'Arrange the words to form a correct sentence:',
      arabicHint: 'رتّب الكلمات لتكوين جملة صحيحة:',
      words: ['I', 'morning', 'every', 'exercise'],
      correctOrder: [0, 3, 2, 1],
      explanation: '"I exercise every morning." ✓\nالترتيب: الضمير + الفعل + الظرف الزمني',
    },
    {
      id:105, level:'A1', type:'grammar', skill:'grammar',
      question: 'There are three ___ in the park.',
      arabicHint: 'اختر جمع كلمة "child":',
      options: ['child', 'childs', 'children', 'childrens'],
      answer: 2,
      explanation: '"Child" لها جمع شاذ (irregular): child → children. ✓\n(بدون -s أو -es — مثل: man→men, foot→feet, tooth→teeth)',
    },
    {
      id:106, level:'A1', type:'correction', skill:'structure',
      question: 'Find the error in this sentence:\n\n"She go to school every day."',
      arabicHint: 'ابحث عن الخطأ النحوي في الجملة:',
      options: [
        '"She" should be "Her"',
        '"go" should be "goes" — he/she/it requires -s in simple present',
        '"every day" should be "everyday"',
        'The sentence is correct',
      ],
      answer: 1,
      explanation: 'في المضارع البسيط مع he/she/it نضيف -s للفعل:\n✓ She goes to school every day.\n(I/You/We/They → go | He/She/It → goes)',
    },
    {
      id:107, level:'A1', type:'vocabulary', skill:'vocabulary',
      question: 'What does "expensive" mean?',
      arabicHint: 'ما معنى كلمة "expensive"؟',
      options: ['cheap — رخيص', 'old — قديم', 'costly — غالٍ', 'small — صغير'],
      answer: 2,
      explanation: '"Expensive" = costly = غالٍ / مكلف. ✓\nOpposite: "cheap" (رخيص). "This restaurant is too expensive for me."',
    },
    {
      id:108, level:'A1', type:'grammar', skill:'grammar',
      question: 'My parents ___ a new car.',
      arabicHint: 'اختر الفعل الصحيح مع "parents" (جمع):',
      options: ['has', 'have', 'is having', 'are have'],
      answer: 1,
      explanation: '"Have" مع الجمع (parents, they, we, you). ✓\n"Has" مع المفرد الغائب (he, she, it).\n✓ My parents have a new car.',
    },
    {
      id:109, level:'A1', type:'ordering', skill:'structure',
      question: 'Arrange the words to form a question:',
      arabicHint: 'رتّب الكلمات لتكوين سؤال صحيح:',
      words: ['you', 'Where', 'from', 'are'],
      correctOrder: [1, 3, 0, 2],
      explanation: '"Where are you from?" ✓\nالأسئلة: أداة استفهام + فعل مساعد + فاعل',
    },
    {
      id:110, level:'A1', type:'reading', skill:'comprehension',
      passage: 'Tom is 10 years old. He lives in London with his mother and father. He has a cat named Whiskers. Every morning, he eats breakfast and walks to school.',
      question: 'Where does Tom live?',
      arabicHint: 'أين يعيش توم؟',
      options: ['Paris', 'New York', 'London', 'Cairo'],
      answer: 2,
      explanation: 'من النص: "He lives in London" — لندن هي الإجابة الصحيحة. ✓',
    },
    {
      id:111, level:'A1', type:'grammar', skill:'grammar',
      question: '___ are my books. (pointing to books near you)',
      arabicHint: 'أنت تشير إلى كتب قريبة منك (جمع). أي كلمة تستخدم؟',
      options: ['This', 'That', 'These', 'Those'],
      answer: 2,
      explanation: '"These" للجمع القريب. "Those" للجمع البعيد.\n(This = مفرد قريب | That = مفرد بعيد)\n✓ These are my books.',
    },
    {
      id:112, level:'A1', type:'listening', skill:'comprehension',
      audioText: 'Hello! My name is Ahmed. I am from Morocco. I have two brothers and one sister.',
      question: 'How many siblings does Ahmed have in total?',
      arabicHint: 'كم عدد أشقاء أحمد في المجموع؟',
      options: ['One', 'Two', 'Three', 'Four'],
      answer: 2,
      explanation: 'Ahmed has two brothers + one sister = three siblings in total. ✓',
    },
  ],

  /* ─── A2  ──────────────────────────────────────────────────────────
     Target: can communicate in simple, routine situations              */
  A2: [
    {
      id:201, level:'A2', type:'grammar', skill:'grammar',
      question: 'I ___ never been to Japan.',
      arabicHint: 'أكمل الجملة بالفعل المناسب (Present Perfect):',
      options: ['have', 'had', 'am', 'did'],
      answer: 0,
      explanation: 'Present Perfect مع "never": have/has + past participle.\n✓ I have never been to Japan.\n(تجربة حياتية بدون وقت محدد)',
    },
    {
      id:202, level:'A2', type:'vocabulary', skill:'vocabulary',
      question: 'To "suggest" means to:',
      arabicHint: 'ما معنى فعل "suggest"؟',
      options: ['demand — يطلب بإلحاح', 'refuse — يرفض', 'propose — يقترح', 'complain — يشتكي'],
      answer: 2,
      explanation: '"Suggest" = to propose an idea = يقترح. ✓\n"I suggest we go to the cinema tonight." (أقترح أن نذهب للسينما الليلة)',
    },
    {
      id:203, level:'A2', type:'grammar', skill:'grammar',
      question: 'The exam is ___ Monday morning.',
      arabicHint: 'اختر حرف الجر المناسب للأيام:',
      options: ['in', 'at', 'on', 'by'],
      answer: 2,
      explanation: '"On" + أيام الأسبوع والتواريخ المحددة. ✓\non Monday | on Friday evening | on 15th March\n("in" للأشهر والفصول | "at" للأوقات كـ at 7pm)',
    },
    {
      id:204, level:'A2', type:'ordering', skill:'structure',
      question: 'Arrange the words to form a correct sentence:',
      arabicHint: 'رتّب الكلمات لتكوين جملة في الماضي البسيط:',
      words: ['She', 'book', 'interesting', 'an', 'read'],
      correctOrder: [0, 4, 3, 2, 1],
      explanation: '"She read an interesting book." ✓\n(Subject + Verb + Article + Adjective + Noun)',
    },
    {
      id:205, level:'A2', type:'correction', skill:'structure',
      question: 'Find the error in this sentence:\n\n"Yesterday I have visited my grandmother."',
      arabicHint: 'ابحث عن الخطأ النحوي:',
      options: [
        '"Yesterday" should be "Last day"',
        '"have visited" should be "visited" — use Simple Past with "yesterday"',
        '"my grandmother" should be "the grandmother"',
        'The sentence is correct',
      ],
      answer: 1,
      explanation: 'مع كلمات الماضي المحدد (yesterday, last week, in 2019) نستخدم Simple Past دائماً:\n✓ Yesterday I visited my grandmother.\n(لا يمكن استخدام Present Perfect مع "yesterday")',
    },
    {
      id:206, level:'A2', type:'grammar', skill:'grammar',
      question: 'This restaurant is ___ than the one near my house.',
      arabicHint: 'اختر شكل المقارنة الصحيح للصفة "expensive":',
      options: ['more expensive', 'most expensive', 'expensiver', 'expensivest'],
      answer: 0,
      explanation: 'الصفات الطويلة (2+ مقاطع): more/most + الصفة.\n✓ more expensive (مقارنة) | the most expensive (تفضيل)\n(الصفات القصيرة: cheaper, taller, bigger)',
    },
    {
      id:207, level:'A2', type:'reading', skill:'comprehension',
      passage: 'Last summer, Maria went on holiday to Spain. She visited many museums and tried different local foods. The weather was very hot, so she spent a lot of time at the beach. She also made new friends from different countries.',
      question: 'Why did Maria spend a lot of time at the beach?',
      arabicHint: 'لماذا أمضت ماريا وقتاً طويلاً على الشاطئ؟',
      options: [
        'She liked swimming very much',
        'The weather was very hot',
        'She wanted to meet new friends',
        'The museums were closed',
      ],
      answer: 1,
      explanation: 'من النص: "The weather was very hot, so she spent a lot of time at the beach." ✓\nالسبب المذكور صراحةً هو الطقس الحار.',
    },
    {
      id:208, level:'A2', type:'grammar', skill:'grammar',
      question: "You ___ wear a seatbelt. It's the law.",
      arabicHint: 'اختر الفعل المناسب للتعبير عن الإلزام القانوني:',
      options: ['can', 'might', 'must', 'would'],
      answer: 2,
      explanation: '"Must" = إلزام قوي (قانون / قاعدة). ✓\n"Can" = إمكانية | "Might" = احتمال | "Would" = ماضٍ / تمني\n✓ You must wear a seatbelt. (قانون)',
    },
    {
      id:209, level:'A2', type:'vocabulary', skill:'vocabulary',
      question: 'What does the phrasal verb "to give up" mean?',
      arabicHint: 'ما معنى التعبير الفعلي "give up"؟',
      options: ['to continue — يستمر', 'to start — يبدأ', 'to quit / stop trying — يستسلم', 'to improve — يتحسن'],
      answer: 2,
      explanation: '"Give up" = to stop trying, to quit = يستسلم. ✓\n"Don\'t give up — you can do it!" (لا تستسلم، تستطيع!)',
    },
    {
      id:210, level:'A2', type:'ordering', skill:'structure',
      question: 'Arrange the words to form a question:',
      arabicHint: 'رتّب الكلمات لتكوين سؤال في المضارع المستمر:',
      words: ['doing', 'are', 'you', 'What'],
      correctOrder: [3, 1, 2, 0],
      explanation: '"What are you doing?" ✓\nالأسئلة بالمضارع المستمر: Wh-word + are/is/am + subject + verb-ing',
    },
    {
      id:211, level:'A2', type:'grammar', skill:'grammar',
      question: 'I ___ TV when my phone rang.',
      arabicHint: 'اختر الزمن الصحيح: فعل مستمر انقطع بحدث مفاجئ:',
      options: ['watched', 'was watching', 'am watching', 'have watched'],
      answer: 1,
      explanation: 'الماضي المستمر (Past Continuous) = was/were + V-ing\nيُستخدم لفعل كان جارياً حين انقطع بحدث آخر.\n✓ I was watching TV when my phone rang.',
    },
    {
      id:212, level:'A2', type:'listening', skill:'comprehension',
      audioText: "Excuse me, could you tell me how to get to the train station? I need to catch the 3 o'clock train to the city.",
      question: 'Where does the person want to go?',
      arabicHint: 'أين يريد الشخص الذهاب؟',
      options: ['المستشفى — Hospital', 'المطار — Airport', 'محطة القطار — Train Station', 'الفندق — Hotel'],
      answer: 2,
      explanation: 'قال الشخص: "how to get to the train station" — محطة القطار. ✓',
    },
  ],

  /* ─── B1  ───────────────────────────────────────────────────────────
     Target: can deal with most situations likely to arise while travelling */
  B1: [
    {
      id:301, level:'B1', type:'grammar', skill:'grammar',
      question: "I ___ this film twice. It's really good.",
      arabicHint: 'اختر الزمن الصحيح للتعبير عن تجربة بدون وقت محدد:',
      options: ['saw', 'have seen', 'am seeing', 'see'],
      answer: 1,
      explanation: 'Present Perfect للتجارب بدون وقت محدد.\n✓ I have seen this film twice.\n("saw" = Simple Past — يحتاج وقتاً محدداً: "I saw it yesterday")',
    },
    {
      id:302, level:'B1', type:'vocabulary', skill:'vocabulary',
      question: 'The doctor said the treatment was ___ — it worked exactly as expected.',
      arabicHint: 'اختر الكلمة المناسبة لوصف علاج نجح كما هو متوقع:',
      options: ['disastrous — كارثي', 'effective — فعّال', 'irrelevant — غير ذي صلة', 'controversial — مثير للجدل'],
      answer: 1,
      explanation: '"Effective" = فعّال، ينجح في تحقيق النتيجة المطلوبة. ✓\n"The vaccine proved highly effective against the virus."',
    },
    {
      id:303, level:'B1', type:'grammar', skill:'grammar',
      question: 'If I ___ more money, I would travel the world.',
      arabicHint: 'اختر شكل الفعل الصحيح (Conditional Type 2 — شرط غير حقيقي):',
      options: ['had', 'have', 'will have', 'would have'],
      answer: 0,
      explanation: 'Conditional Type 2 = شرط غير حقيقي في الحاضر/المستقبل:\nIf + past simple → would + infinitive.\n✓ If I had more money, I would travel. (لكني لا أملك)',
    },
    {
      id:304, level:'B1', type:'ordering', skill:'structure',
      question: 'Arrange to form a conditional sentence:',
      arabicHint: 'رتّب الكلمات لتكوين جملة شرطية صحيحة:',
      words: ['harder', 'If', 'worked', 'would', 'Omar', 'pass', 'he'],
      correctOrder: [1, 4, 2, 0, 6, 3, 5],
      explanation: '"If Omar worked harder, he would pass." ✓\n(If + subject + past simple, subject + would + base verb)',
    },
    {
      id:305, level:'B1', type:'correction', skill:'structure',
      question: 'Find the error:\n\n"The manager asked to his team to work overtime."',
      arabicHint: 'حدّد الخطأ النحوي:',
      options: [
        '"to his team" should be "his team" — \'ask\' takes a direct object with no preposition',
        '"work overtime" should be "working overtime"',
        '"The manager" should be "A manager"',
        'The sentence is correct',
      ],
      answer: 0,
      explanation: '"Ask" + مفعول به مباشر (بدون حرف جر):\n✓ The manager asked his team to work overtime.\n("asked TO his team" = خطأ | "asked FOR help" = صحيح)',
    },
    {
      id:306, level:'B1', type:'grammar', skill:'grammar',
      question: 'The bridge ___ in 1995.',
      arabicHint: 'اختر المبني للمجهول في الماضي البسيط:',
      options: ['built', 'was built', 'has built', 'is built'],
      answer: 1,
      explanation: 'المبني للمجهول في الماضي البسيط: was/were + past participle.\n✓ The bridge was built in 1995.\n(المبني للمعلوم: "They built the bridge in 1995.")',
    },
    {
      id:307, level:'B1', type:'reading', skill:'comprehension',
      passage: 'Remote work has become increasingly common since the pandemic. While many employees appreciate the flexibility it offers, some managers argue that it reduces team cohesion and productivity. Studies show mixed results — some workers are more productive at home, while others struggle without the structure of an office environment.',
      question: 'According to the passage, what do some managers argue about remote work?',
      arabicHint: 'ماذا يجادل بعض المديرين حول العمل عن بعد؟',
      options: [
        'It improves team cohesion significantly',
        'It reduces team cohesion and productivity',
        'It makes all workers more productive',
        'It should replace office work entirely',
      ],
      answer: 1,
      explanation: 'من النص: "some managers argue that it reduces team cohesion and productivity." ✓\nلاحظ: الدراسات أظهرت نتائج مختلطة — ليس كل العمال أكثر إنتاجاً في المنزل.',
    },
    {
      id:308, level:'B1', type:'grammar', skill:'grammar',
      question: 'She said, "I am tired." → She said that she ___ tired.',
      arabicHint: 'حوّل إلى خطاب غير مباشر (Reported Speech):',
      options: ['is', 'was', 'had been', 'were'],
      answer: 1,
      explanation: 'Reported Speech: الزمن "يتراجع" خطوة للخلف:\nam/is → was | are → were | was/were → had been\n✓ She said that she was tired.',
    },
    {
      id:309, level:'B1', type:'vocabulary', skill:'vocabulary',
      question: 'You should ___ a decision soon.',
      arabicHint: 'اختر الفعل الصحيح مع "decision" (تلازم لفظي):',
      options: ['do', 'take', 'make', 'have'],
      answer: 2,
      explanation: 'التلازم اللفظي الصحيح: "make a decision". ✓\nكذلك: make an effort | make a mistake | make progress\n(vs. "take a break | take notes | do homework")',
    },
    {
      id:310, level:'B1', type:'ordering', skill:'structure',
      question: 'Arrange to form a Present Perfect Continuous sentence:',
      arabicHint: 'رتّب لتكوين جملة في المضارع التام المستمر:',
      words: ['been', 'I', 'have', 'for', 'waiting', 'two', 'hours'],
      correctOrder: [1, 2, 0, 4, 3, 5, 6],
      explanation: '"I have been waiting for two hours." ✓\nPresent Perfect Continuous: have/has + been + V-ing\nيعبّر عن فعل بدأ في الماضي ولا يزال مستمراً.',
    },
    {
      id:311, level:'B1', type:'correction', skill:'structure',
      question: 'Find the error:\n\n"The number of students in the class are increasing every year."',
      arabicHint: 'حدّد خطأ توافق الفعل مع الفاعل:',
      options: [
        '"number" should be "numbers"',
        '"are" should be "is" — "the number of" takes a singular verb',
        '"every year" should be "each years"',
        'The sentence is correct',
      ],
      answer: 1,
      explanation: '"The number of + noun" → فعل مفرد. ✓\n✓ The number of students is increasing.\n(لكن: "A number of students are..." — فعل جمع)',
    },
    {
      id:312, level:'B1', type:'listening', skill:'comprehension',
      audioText: "I've been applying for jobs for six months. I always get to the interview stage, but I freeze up when they ask me to talk about myself. My written English is fine, but speaking confidently under pressure is a completely different challenge for me.",
      question: "What is the speaker's main challenge?",
      arabicHint: 'ما هو التحدي الرئيسي للمتحدث؟',
      options: [
        'Writing a CV in English',
        'Getting invited to job interviews',
        'Speaking confidently under pressure',
        'Understanding different English accents',
      ],
      answer: 2,
      explanation: '"speaking confidently under pressure is a completely different challenge" — التحدث بثقة تحت الضغط. ✓',
    },
  ],

  /* ─── B2  ──────────────────────────────────────────────────────────
     Target: can interact with a degree of fluency and spontaneity     */
  B2: [
    {
      id:401, level:'B2', type:'grammar', skill:'grammar',
      question: 'My sister, ___ lives in Paris, is a doctor.',
      arabicHint: 'اختر الضمير الصحيح في الجملة الوصفية غير التعريفية (بعد الفاصلة):',
      options: ['that', 'which', 'who', 'whose'],
      answer: 2,
      explanation: 'الجمل الوصفية غير التعريفية (Non-defining): للأشخاص نستخدم "who" بعد الفاصلة.\n✓ My sister, who lives in Paris, is a doctor.\n("that" لا يُستخدم بعد فاصلة في هذا النوع)',
    },
    {
      id:402, level:'B2', type:'vocabulary', skill:'vocabulary',
      question: "The government's response to the crisis was criticized for being too ___.",
      arabicHint: 'اختر الكلمة التي تعني: متردد، غير حاسم:',
      options: ['proactive — استباقي', 'pragmatic — براغماتي', 'tentative — متردد', 'decisive — حاسم'],
      answer: 2,
      explanation: '"Tentative" = hesitant, uncertain = متردد، غير حاسم. ✓\n"The plan was tentative — nothing was confirmed yet."',
    },
    {
      id:403, level:'B2', type:'grammar', skill:'grammar',
      question: 'If she ___ harder at school, she would be working as an engineer now.',
      arabicHint: 'اختر الشكل الصحيح (Mixed Conditional — ماضٍ → نتيجة حاضرة):',
      options: ['studied', 'had studied', 'would study', 'has studied'],
      answer: 1,
      explanation: 'Mixed Conditional: شرط في الماضي → نتيجة في الحاضر:\nIf + past perfect → would + infinitive\n✓ If she had studied harder (past), she would be an engineer (now).',
    },
    {
      id:404, level:'B2', type:'ordering', skill:'structure',
      question: 'Arrange to form a formal participial phrase sentence:',
      arabicHint: 'رتّب لتكوين جملة رسمية بعبارة مشاركية:',
      words: ['reviewed', 'Having', 'management', 'report', 'approved', 'the', 'it'],
      correctOrder: [1, 0, 5, 3, 2, 4, 6],
      explanation: '"Having reviewed the report, management approved it." ✓\n"Having + past participle" = perfect participle (يدل على فعل اكتمل قبل الفعل الرئيسي)',
    },
    {
      id:405, level:'B2', type:'correction', skill:'structure',
      question: 'Find the error:\n\n"Despite of his wealth, he remained humble."',
      arabicHint: 'حدّد الخطأ في استخدام "despite":',
      options: [
        '"Despite of" should be "Despite" — \'despite\' is never followed by \'of\'',
        '"remained" should be "remains"',
        '"humble" should be "humbleness"',
        'The sentence is correct',
      ],
      answer: 0,
      explanation: '"Despite" لا تحتاج "of":\n✓ Despite his wealth, he remained humble.\n✓ In spite of his wealth... (هذا صحيح — لكن ليس "despite of")',
    },
    {
      id:406, level:'B2', type:'grammar', skill:'grammar',
      question: 'Not only ___ the project on time, but he also exceeded all expectations.',
      arabicHint: 'اختر الصيغة الصحيحة بعد "Not only" (قلب الترتيب النحوي):',
      options: ['he finished', 'did he finish', 'he did finish', 'has he finished'],
      answer: 1,
      explanation: 'بعد أدوات النفي في بداية الجملة (Not only, Never, Rarely, Hardly) يجب قلب الترتيب:\nNot only + auxiliary + subject + main verb\n✓ Not only did he finish... (Did + he + finish)',
    },
    {
      id:407, level:'B2', type:'reading', skill:'comprehension',
      passage: "The concept of 'digital literacy' has evolved considerably. Originally referring to basic computer skills, it now encompasses the ability to critically evaluate online information, understand algorithmic bias, and navigate privacy concerns. As artificial intelligence permeates daily life, educators argue that digital literacy must expand yet again to include an understanding of machine learning and its societal implications.",
      question: "According to the passage, how has the definition of 'digital literacy' changed?",
      arabicHint: 'كيف تغير مفهوم "محو الأمية الرقمية" وفق النص؟',
      options: [
        'It narrowed to focus only on privacy concerns',
        'It expanded to include more complex skills over time',
        'It now focuses primarily on social media use',
        'It has remained the same since it was first defined',
      ],
      answer: 1,
      explanation: 'من النص: "has evolved considerably... it now encompasses... must expand yet again" — المفهوم توسّع باستمرار. ✓',
    },
    {
      id:408, level:'B2', type:'grammar', skill:'grammar',
      question: 'The doctor recommended that he ___ more rest.',
      arabicHint: 'اختر شكل الفعل الصحيح بعد "recommended that":',
      options: ['gets', 'get', 'should gets', 'is getting'],
      answer: 1,
      explanation: 'Mandative Subjunctive بعد: recommend, suggest, insist, demand, require:\nthat + subject + base form (بدون -s حتى مع he/she/it)\n✓ The doctor recommended that he get more rest.',
    },
    {
      id:409, level:'B2', type:'vocabulary', skill:'vocabulary',
      question: 'The research paper ___ several key points that need further investigation.',
      arabicHint: 'اختر الكلمة التي تعني: يغفل عن / لا يأخذ بعين الاعتبار:',
      options: ['overlooks — يغفل عن', 'overrides — يتجاوز', 'overwhelms — يُرهق', 'overruns — يتخطى الحد'],
      answer: 0,
      explanation: '"Overlook" = to fail to notice or consider = يغفل عن. ✓\n"The report overlooks some important data." (يغفل عن بيانات مهمة)',
    },
    {
      id:410, level:'B2', type:'ordering', skill:'structure',
      question: 'Arrange to form a Present Perfect Passive sentence:',
      arabicHint: 'رتّب لتكوين جملة في المبني للمجهول التام:',
      words: ['significantly', 'The', 'policy', 'revised', 'been', 'has'],
      correctOrder: [1, 2, 5, 4, 0, 3],
      explanation: '"The policy has been significantly revised." ✓\nPresent Perfect Passive: has/have + been + past participle\n(+ adverb "significantly" قبل التصريف الثالث)',
    },
    {
      id:411, level:'B2', type:'correction', skill:'structure',
      question: 'Find the cohesion error:\n\n"The meeting was very productive. Conversely, everyone agreed on the next steps."',
      arabicHint: 'حدّد خطأ الربط المنطقي بين الجملتين:',
      options: [
        '"Conversely" should be "Moreover" — the sentences agree, not contrast',
        '"productive" should be "unproductive"',
        '"agreed" should be "disagreed"',
        'The sentences are correct',
      ],
      answer: 0,
      explanation: '"Conversely" يعني "على النقيض" — لكن الجملتين متوافقتان في المعنى. الصواب:\n✓ "Moreover / Furthermore / In addition, everyone agreed..."\n(Conversely = تناقض | Moreover = إضافة)',
    },
    {
      id:412, level:'B2', type:'listening', skill:'comprehension',
      audioText: "While I acknowledge that remote work has offered undeniable flexibility, one cannot ignore the subtle erosion of workplace culture and the challenges it poses for junior employees who need in-person mentorship to develop professionally.",
      question: "What is the speaker's overall stance on remote work?",
      arabicHint: 'ما هو الموقف الضمني للمتحدث من العمل عن بعد؟',
      options: [
        'Fully supportive of remote work',
        'Completely opposed to remote work',
        'Acknowledges benefits but concerned about negative impacts',
        'Completely neutral — presents both sides equally',
      ],
      answer: 2,
      explanation: '"While I acknowledge..." = يعترف بالفائدة. "one cannot ignore... challenges" = ينتقد.\nالموقف الضمني: يعترف بالفوائد لكنه قلق من تأثيرها السلبي. ✓',
    },
  ],

  /* ─── C1  ──────────────────────────────────────────────────────────
     Target: can express ideas fluently and spontaneously             */
  C1: [
    {
      id:501, level:'C1', type:'grammar', skill:'grammar',
      question: 'Scarcely ___ she entered the room ___ the phone rang.',
      arabicHint: 'اختر الزوج الصحيح لتركيب "Scarcely... when" الرسمي:',
      options: ['had / when', 'did / than', 'was / when', 'had / than'],
      answer: 0,
      explanation: '"Scarcely had... when" — تركيب قلب رسمي لحدثين متتاليين جداً:\n✓ Scarcely had she entered the room when the phone rang.\n(بكاد أن دخلت حتى رنّ الهاتف)',
    },
    {
      id:502, level:'C1', type:'vocabulary', skill:'vocabulary',
      question: 'His speech was full of ___ — subtle references to events and texts that only an educated audience would recognize.',
      arabicHint: 'اختر الكلمة الصحيحة: إشارات ضمنية لأحداث أو نصوص أدبية:',
      options: ['allusions — إشارات ضمنية', 'illusions — أوهام', 'delusions — أوهام مرضية', 'confusions — تشويش'],
      answer: 0,
      explanation: '"Allusion" = indirect reference = إلماح، إشارة ضمنية. ✓\nلا تخلط مع "illusion" (وهم بصري) أو "delusion" (هذيان).\n"The poem is full of biblical allusions."',
    },
    {
      id:503, level:'C1', type:'grammar', skill:'grammar',
      question: "She ___ have left early — her coat is still here.",
      arabicHint: 'اختر الفعل المناسب للاستنتاج المنطقي السلبي في الماضي:',
      options: ["can't", "mustn't", "needn't", "shouldn't"],
      answer: 0,
      explanation: '"Can\'t have + past participle" = استنتاج منطقي سلبي في الماضي (certainty it didn\'t happen).\n✓ She can\'t have left — her coat is here.\n("mustn\'t" = نهي في الحاضر | "needn\'t have" = لم يكن ضرورياً)',
    },
    {
      id:504, level:'C1', type:'ordering', skill:'structure',
      question: 'Arrange to form a formal negative Past Perfect Passive:',
      arabicHint: 'رتّب لتكوين جملة رسمية في المبني للمجهول التام الماضي المنفي:',
      words: ['been', 'properly', 'The', 'implemented', 'strategy', 'had', 'not'],
      correctOrder: [2, 4, 5, 6, 0, 1, 3],
      explanation: '"The strategy had not been properly implemented." ✓\nPast Perfect Passive: had + (not) + been + past participle\n+ adverb "properly" يأتي قبل التصريف الثالث',
    },
    {
      id:505, level:'C1', type:'correction', skill:'structure',
      question: 'Find the error in formal academic writing:\n\n"The committee discussed about the new proposals at length."',
      arabicHint: 'حدّد الخطأ في الجملة الرسمية:',
      options: [
        '"discussed about" should be "discussed" — \'discuss\' is transitive, no preposition needed',
        '"at length" should be "at large"',
        '"proposals" should be "proposal"',
        'The sentence is correct',
      ],
      answer: 0,
      explanation: '"Discuss" = فعل متعدٍّ (transitive) لا يحتاج حرف جر:\n✓ The committee discussed the new proposals.\n("talk about" ✓ | "discuss about" ✗)',
    },
    {
      id:506, level:'C1', type:'grammar', skill:'grammar',
      question: 'Mary can play the piano, and so ___ her brother.',
      arabicHint: 'اختر الفعل المناسب في الحذف الجملي (Ellipsis):',
      options: ['can', 'does', 'is', 'has'],
      answer: 0,
      explanation: 'الحذف الجملي بـ "so": so + auxiliary + subject\nنستخدم نفس الفعل المساعد: "can" → "so can her brother".\n✓ Mary can play the piano, and so can her brother.',
    },
    {
      id:507, level:'C1', type:'reading', skill:'comprehension',
      passage: "The paradox of choice, as articulated by psychologist Barry Schwartz, posits that while freedom of choice ostensibly maximizes individual welfare, an overabundance of options can paradoxically lead to decision paralysis, diminished satisfaction, and heightened regret. Modern consumers, confronted with near-infinite product varieties, often experience what Schwartz terms 'maximizers anxiety' — the relentless pursuit of the objectively best option, which ultimately undermines contentment.",
      question: 'What is the central paradox described in the passage?',
      arabicHint: 'ما هي المفارقة المحورية في النص؟',
      options: [
        'Having too many choices can decrease rather than increase satisfaction',
        'Consumers always prefer fewer, higher-quality products',
        'Freedom of choice leads directly to greater individual welfare',
        'Maximizers consistently make better decisions than others',
      ],
      answer: 0,
      explanation: 'من النص: "freedom of choice ostensibly maximizes welfare" لكن "an overabundance of options can paradoxically lead to... diminished satisfaction".\nالمفارقة: المزيد من الخيارات ≠ المزيد من السعادة. ✓',
    },
    {
      id:508, level:'C1', type:'grammar', skill:'grammar',
      question: 'It is essential that every employee ___ the new policy by Friday.',
      arabicHint: 'اختر الشكل الصحيح للمضارع الافتراضي بعد "essential that":',
      options: ['reads', 'read', 'has read', 'should reads'],
      answer: 1,
      explanation: 'Mandative Subjunctive بعد: essential / important / vital / necessary / crucial that:\nصيغة المصدر (base form) بدون -s في أي حال:\n✓ It is essential that every employee read the policy.',
    },
    {
      id:509, level:'C1', type:'vocabulary', skill:'vocabulary',
      question: 'Which word has the most NEGATIVE connotation in a professional context?',
      arabicHint: 'أي كلمة لها أكثر دلالة سلبية في السياق المهني؟',
      options: ['determined — عازم', 'tenacious — مثابر', 'obstinate — عنيد سلباً', 'persistent — مستمر'],
      answer: 2,
      explanation: '"Obstinate" = unreasonably stubborn = عنيد بشكل غير منطقي — دلالة سلبية. ✓\nبينما: determined, tenacious, persistent = إيجابية (عزم ومثابرة).\n"His obstinate refusal to compromise derailed the negotiations."',
    },
    {
      id:510, level:'C1', type:'ordering', skill:'structure',
      question: 'Arrange to form a formal sentence with "not only... but also":',
      arabicHint: 'رتّب لتكوين جملة رسمية بتركيب "not only... but also":',
      words: ['also', 'The', 'not', 'unprecedented', 'findings', 'but', 'significant', 'were', 'only'],
      correctOrder: [1, 4, 7, 2, 8, 6, 5, 0, 3],
      explanation: '"The findings were not only significant but also unprecedented." ✓\n"not only... but also" يربط صفتين أو فكرتين متوازيتين بأسلوب رسمي مؤكَّد.',
    },
    {
      id:511, level:'C1', type:'listening', skill:'comprehension',
      audioText: "Let me ask you this: if we truly believed in equal opportunity, would we not ensure that every child — regardless of their postcode, their parents' income, or the language spoken at home — had access to the same quality of education? The answer, I believe, is self-evident.",
      question: 'Which rhetorical device does the speaker primarily use?',
      arabicHint: 'ما هو الأسلوب البلاغي الذي يستخدمه المتحدث بشكل رئيسي؟',
      options: [
        'A rhetorical question — implying the answer is obvious without stating it directly',
        'Statistical evidence to prove an educational gap',
        'A personal anecdote to evoke empathy',
        'A neutral comparison between two educational systems',
      ],
      answer: 0,
      explanation: 'الاستفهام البلاغي (Rhetorical question): يطرح سؤالاً لا يتوقع إجابة — الإجابة "بديهية".\n"would we not ensure...?" = يُقنع المستمع بمسلّمة.\n"The answer, I believe, is self-evident." يؤكد ذلك. ✓',
    },
    {
      id:512, level:'C1', type:'correction', skill:'structure',
      question: 'Find the subject-verb agreement error:\n\n"The research findings, along with the committee\'s recommendations, was published last month."',
      arabicHint: 'حدّد خطأ توافق الفعل مع الفاعل الحقيقي:',
      options: [
        '"was" should be "were" — the true subject "findings" is plural',
        '"along with" should be "together with"',
        '"published" should be "publicized"',
        'The sentence is correct',
      ],
      answer: 0,
      explanation: 'الفاعل الحقيقي هو "findings" (جمع). عبارة "along with..." لا تغيّر توافق الفعل:\n✓ The research findings... were published.\n(قارن: "The manager, along with his team, was present." — "manager" مفرد → was ✓)',
    },
  ],
}

/* ══════════════════════════════════════════════════════════════
   AUDIO HELPERS
══════════════════════════════════════════════════════════════ */

function playSound(type: 'correct' | 'wrong') {
  try {
    const ctx  = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    if (type === 'correct') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime)
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12)
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24)
      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc.start(); osc.stop(ctx.currentTime + 0.6)
    } else {
      osc.frequency.setValueAtTime(311.13, ctx.currentTime)
      osc.frequency.setValueAtTime(246.94, ctx.currentTime + 0.18)
      gain.gain.setValueAtTime(0.16, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(); osc.stop(ctx.currentTime + 0.5)
    }
  } catch { /* browser may block audio ctx */ }
}

function speak(text: string) {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'; u.rate = 0.88; u.pitch = 1
  window.speechSynthesis.speak(u)
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */

const EMPTY_SKILLS: Record<SkillKey, SkillStat> = {
  grammar: {correct:0,total:0}, vocabulary: {correct:0,total:0},
  comprehension: {correct:0,total:0}, structure: {correct:0,total:0},
}

type Phase = 'intro' | 'testing' | 'levelComplete' | 'result'

/** Map a CEFR result level → the plan we recommend. */
function recommendPlanForLevel(level: string): string {
  if (level === 'A1')               return 'basic'
  if (level === 'A2' || level === 'B1') return 'pro'
  if (level === 'B2' || level === 'C1') return 'premium'
  return 'basic'
}

/** Three free sample lessons from the recommended plan's course. */
function freeSamplesForPlan(planId: string): { title: string; duration: string; youtubeId: string }[] {
  const plan = getPlan(planId)
  if (!plan?.courseSlug) return []
  const course = COURSES.find(c => c.slug === plan.courseSlug)
  if (!course) return []
  const free: { title: string; duration: string; youtubeId: string }[] = []
  for (const section of course.curriculum) {
    for (const lesson of section.lessons) {
      if (lesson.isFree && lesson.youtubeId) {
        free.push({ title: lesson.title, duration: lesson.duration, youtubeId: lesson.youtubeId })
        if (free.length >= 3) return free
      }
    }
  }
  return free
}

export default function LevelTestPage() {

  /* ── Phase ── */
  const [phase, setPhase] = useState<Phase>('intro')

  /* ── Test position ── */
  const [levelIdx,    setLevelIdx]    = useState(0)   // index in LEVEL_ORDER
  const [questionIdx, setQuestionIdx] = useState(0)   // index within current level
  const [mistakes,    setMistakes]    = useState(0)   // mistakes in current level
  const [lastPassedLevelIdx, setLastPassedLevelIdx] = useState(-1)
  const [levelCorrect, setLevelCorrect] = useState(0) // correct in current level (for level-complete screen)

  /* ── Answer state ── */
  const [answered,    setAnswered]    = useState<'waiting'|'correct'|'wrong'>('waiting')
  const [selOption,   setSelOption]   = useState<number|null>(null)
  const [reorderSel,  setReorderSel]  = useState<number[]>([])
  const [audioPlayed, setAudioPlayed] = useState(false)

  /* ── Scoring ── */
  const [skillStats,    setSkillStats]    = useState<Record<SkillKey, SkillStat>>({...EMPTY_SKILLS})
  const [totalCorrect,  setTotalCorrect]  = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)

  /* ── Derived ── */
  const currentLevel   = LEVEL_ORDER[levelIdx]
  const levelQuestions = QUESTIONS[currentLevel]
  const currentQ       = levelQuestions[questionIdx]
  const totalInLevel   = levelQuestions.length
  const progressPct    = Math.round((questionIdx / totalInLevel) * 100)

  /* ── On reaching result screen: persist locally + save anon lead to Supabase ── */
  useEffect(() => {
    if (phase !== 'result') return
    const finalLevel = lastPassedLevelIdx >= 0 ? LEVEL_ORDER[lastPassedLevelIdx] : 'A1'
    const score      = totalAnswered > 0 ? Math.round(totalCorrect / totalAnswered * 100) : 0
    const strengths: SkillKey[] = []
    const weaknesses: SkillKey[] = []
    for (const s of Object.keys(skillStats) as SkillKey[]) {
      if (skillStats[s].total === 0) continue
      const acc = skillStats[s].correct / skillStats[s].total
      if (acc >= 0.7)  strengths.push(s)
      if (acc < 0.5)   weaknesses.push(s)
    }
    const result = { level: finalLevel, score, strengths, weaknesses, date: new Date().toISOString() }
    try {
      const prev = JSON.parse(localStorage.getItem('inglizi_results') || '[]') as unknown[]
      localStorage.setItem('inglizi_results', JSON.stringify([result, ...prev].slice(0, 10)))
    } catch { /* ignore storage errors */ }

    /* Fire-and-forget anon lead save for attribution — even if the visitor
       never clicks subscribe, we know they took the test. */
    const recommended = recommendPlanForLevel(finalLevel)
    createSubscriptionLead({
      planId:          'test_completed',
      fullName:        'Anonymous test-taker',
      level:           finalLevel,
      testScore:       score,
      recommendedPlan: recommended,
      source:          'test_completed',
      ...getAttribution(),
    }).catch(() => { /* silent — non-critical */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  /* ─────────────────── HANDLERS ─────────────────── */

  function commitAnswer(ok: boolean) {
    const newMistakes = ok ? mistakes : mistakes + 1
    setAnswered(ok ? 'correct' : 'wrong')
    setMistakes(newMistakes)
    setTotalAnswered(n => n + 1)
    if (ok) { setTotalCorrect(n => n + 1); setLevelCorrect(n => n + 1) }
    setSkillStats(prev => ({
      ...prev,
      [currentQ.skill]: {
        correct: prev[currentQ.skill].correct + (ok ? 1 : 0),
        total:   prev[currentQ.skill].total + 1,
      },
    }))
    playSound(ok ? 'correct' : 'wrong')
  }

  function handleOption(idx: number) {
    if (answered !== 'waiting') return
    if (currentQ.type === 'listening' && !audioPlayed) return
    setSelOption(idx)
    commitAnswer(idx === currentQ.answer)
  }

  function handleReorderCheck() {
    if (answered !== 'waiting') return
    commitAnswer(JSON.stringify(reorderSel) === JSON.stringify(currentQ.correctOrder))
  }

  function handleContinue() {
    // Level failed: 3 mistakes reached
    if (mistakes >= MISTAKES_TO_FAIL) {
      setPhase('result')
      return
    }

    const nextIdx  = questionIdx + 1
    const isDone   = nextIdx >= totalInLevel

    if (isDone) {
      // Level passed
      setLastPassedLevelIdx(levelIdx)
      if (levelIdx >= LEVEL_ORDER.length - 1) {
        setPhase('result')
      } else {
        setPhase('levelComplete')
      }
      return
    }

    // Next question in same level
    setQuestionIdx(nextIdx)
    setAnswered('waiting')
    setSelOption(null)
    setReorderSel([])
    setAudioPlayed(false)
  }

  function startNextLevel() {
    setLevelIdx(prev => prev + 1)
    setQuestionIdx(0)
    setMistakes(0)
    setLevelCorrect(0)
    setAnswered('waiting')
    setSelOption(null)
    setReorderSel([])
    setAudioPlayed(false)
    setPhase('testing')
  }

  function resetTest() {
    setPhase('intro')
    setLevelIdx(0); setQuestionIdx(0); setMistakes(0)
    setLastPassedLevelIdx(-1); setLevelCorrect(0)
    setAnswered('waiting'); setSelOption(null)
    setReorderSel([]); setAudioPlayed(false)
    setSkillStats({...EMPTY_SKILLS})
    setTotalCorrect(0); setTotalAnswered(0)
  }

  /* ─────────────────── RENDER HELPERS ─────────────────── */

  function renderOptions() {
    if (!currentQ.options) return null
    return (
      <div className="space-y-2.5">
        {currentQ.options.map((opt, idx) => {
          const isCorrect  = idx === currentQ.answer
          const isSelected = idx === selOption
          let cls = 'w-full text-right px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all duration-200 flex items-center gap-3 '
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
            <button key={idx} onClick={() => handleOption(idx)} disabled={answered !== 'waiting'} className={cls}>
              <span className={`flex-shrink-0 w-7 h-7 rounded-full border text-[11px] font-black flex items-center justify-center ${
                answered !== 'waiting' && isCorrect ? 'bg-emerald-500 border-emerald-500 text-white'
                : answered !== 'waiting' && isSelected ? 'bg-red-500 border-red-500 text-white'
                : 'border-white/20 text-white/40'
              }`}>
                {answered !== 'waiting' && isCorrect ? <CheckCircle2 size={13}/> :
                 answered !== 'waiting' && isSelected ? <XCircle size={13}/> :
                 String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 leading-snug whitespace-pre-line">{opt}</span>
            </button>
          )
        })}
      </div>
    )
  }

  function renderQuestionBody() {
    /* Ordering */
    if (currentQ.type === 'ordering') {
      const built    = reorderSel.map(i => currentQ.words![i])
      const allPlace = reorderSel.length === currentQ.words!.length
      return (
        <div className="space-y-4">
          <div className="min-h-[52px] bg-white/[0.06] rounded-2xl border border-white/10 p-3 flex flex-wrap gap-2 items-center">
            {built.length === 0
              ? <span className="text-white/25 text-sm">انقر على الكلمات أدناه لبناء الجملة...</span>
              : built.map((w, i) => (
                <button key={i} disabled={answered !== 'waiting'}
                  onClick={() => { if (answered !== 'waiting') return; setReorderSel(p => p.filter((_,j) => j !== i)) }}
                  className="bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-bold text-sm px-3 py-1.5 rounded-xl transition-colors">
                  {w} ×
                </button>
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
                    isSel ? 'bg-white/5 text-white/20 border-white/8'
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/20 active:scale-95'
                  }`}>
                  {isSel ? '—' : w}
                </button>
              )
            })}
          </div>
          {answered === 'waiting' && (
            <button onClick={handleReorderCheck} disabled={!allPlace}
              className={`w-full py-3.5 rounded-2xl font-black text-base transition-all ${
                allPlace ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg' : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}>
              تحقق من الإجابة ✓
            </button>
          )}
        </div>
      )
    }

    /* Listening */
    if (currentQ.type === 'listening') {
      return (
        <div className="space-y-4">
          <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <button onClick={() => { speak(currentQ.audioText!); setAudioPlayed(true) }}
              className="w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-500 flex items-center justify-center text-white shadow-lg flex-shrink-0 transition-all active:scale-90">
              <Volume2 size={22}/>
            </button>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">{audioPlayed ? '✓ استمعت — يمكنك الإجابة' : 'اضغط للاستماع أولاً'}</p>
              <p className="text-white/35 text-xs mt-0.5">يمكنك الاستماع أكثر من مرة</p>
            </div>
            {audioPlayed && (
              <button onClick={() => speak(currentQ.audioText!)} className="text-xs text-blue-300 hover:text-blue-200 font-semibold shrink-0">↩ أعد</button>
            )}
          </div>
          {audioPlayed || answered !== 'waiting'
            ? renderOptions()
            : <p className="text-center text-white/30 text-sm py-2">استمع أولاً ثم ستظهر خيارات الإجابة</p>
          }
        </div>
      )
    }

    /* Reading */
    if (currentQ.type === 'reading' && currentQ.passage) {
      return (
        <div className="space-y-4">
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
            <p className="text-[11px] text-blue-300 font-black uppercase tracking-widest mb-3">📄 اقرأ النص ثم أجب</p>
            <p className="text-white/75 text-sm leading-relaxed" dir="ltr">{currentQ.passage}</p>
          </div>
          {renderOptions()}
        </div>
      )
    }

    /* MCQ / grammar / vocabulary / correction */
    return renderOptions()
  }

  /* ═══════════════════════════════════════════════════
     PHASE: INTRO
  ═══════════════════════════════════════════════════ */
  if (phase === 'intro') return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-brand-950 to-gray-950 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-brand-600 rounded-3xl shadow-2xl shadow-brand-500/40 mb-8">
          <Brain size={42} className="text-white"/>
        </div>
        <span className="inline-block bg-white/10 text-blue-200 text-sm font-bold px-4 py-1.5 rounded-full mb-5">
          اختبار تحديد المستوى الحقيقي — CEFR
        </span>
        <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 leading-tight">
          اكتشف مستواك<br/>
          <span className="text-brand-400">الحقيقي</span>
        </h1>
        <p className="text-white/55 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
          اختبار تكيّفي من مستوى A1 إلى C1 — قواعد، مفردات، قراءة، استماع.<br/>
          النتيجة فورية مع تحليل كامل لنقاط قوتك وضعفك.
        </p>

        {/* How it works */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 mb-8 text-right">
          <p className="text-white/50 text-xs font-black uppercase tracking-widest text-center mb-4">كيف يعمل الاختبار</p>
          <div className="space-y-3">
            {[
              { icon: '🎯', text: 'يبدأ الاختبار من المستوى A1 ويتقدم حتى C1' },
              { icon: '📊', text: 'كل مستوى يحتوي 12 سؤالاً متدرجاً في الصعوبة' },
              { icon: '⚠️', text: '3 أخطاء في مستوى واحد → يتوقف الاختبار ويُحدَّد مستواك' },
              { icon: '✅', text: 'اجتاز المستوى → انتقل للمستوى التالي' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-lg w-7 text-center flex-shrink-0">{icon}</span>
                <p className="text-white/65 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CEFR level pills */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {LEVEL_ORDER.map((l, i) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className={`${LEVEL_STYLE[l].bg} text-white font-black text-sm px-4 py-2 rounded-xl shadow-lg`}>{l}</span>
              {i < 4 && <ChevronRight size={13} className="text-white/25"/>}
            </div>
          ))}
        </div>

        <button onClick={() => setPhase('testing')}
          className="bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-black py-5 px-14 rounded-2xl text-xl shadow-2xl shadow-brand-500/40 transition-all flex items-center gap-3 mx-auto">
          ابدأ الاختبار <ArrowLeft size={22}/>
        </button>
        <p className="text-white/25 text-sm mt-4">مجاني 100% · بدون تسجيل · النتيجة في 15 دقيقة</p>
      </div>
    </main>
  )

  /* ═══════════════════════════════════════════════════
     PHASE: LEVEL COMPLETE
  ═══════════════════════════════════════════════════ */
  if (phase === 'levelComplete') {
    const nextLevel = LEVEL_ORDER[levelIdx + 1]
    const s         = LEVEL_STYLE[currentLevel]
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-950 via-brand-950 to-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className={`inline-flex items-center justify-center w-28 h-28 rounded-3xl ${s.bg} shadow-2xl ${s.glow} mb-6 animate-bounce`}>
            <span className="text-white font-black text-4xl">{currentLevel}</span>
          </div>
          <p className="text-white/50 text-sm font-bold uppercase tracking-widest mb-2">مرحباً — أحسنت!</p>
          <h2 className="text-4xl font-black text-white mb-2">اجتزت المستوى {currentLevel} ✓</h2>
          <p className={`text-lg font-black ${s.color} mb-6`}>{LEVEL_STYLE[currentLevel].label}</p>
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl px-8 py-4 inline-flex gap-8 mb-8">
            <div className="text-center">
              <p className="text-white/35 text-xs mb-1">صحيح</p>
              <p className="text-2xl font-black text-emerald-400">{levelCorrect}</p>
            </div>
            <div className="w-px bg-white/15"/>
            <div className="text-center">
              <p className="text-white/35 text-xs mb-1">إجمالي</p>
              <p className="text-2xl font-black text-white">{totalInLevel}</p>
            </div>
            <div className="w-px bg-white/15"/>
            <div className="text-center">
              <p className="text-white/35 text-xs mb-1">أخطاء</p>
              <p className={`text-2xl font-black ${mistakes > 0 ? 'text-amber-400' : 'text-white'}`}>{mistakes}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-white/40 text-sm">الآن ننتقل إلى</span>
            <span className={`${LEVEL_STYLE[nextLevel].bg} text-white font-black text-sm px-4 py-1.5 rounded-xl`}>{nextLevel}</span>
            <span className={`${LEVEL_STYLE[nextLevel].color} text-sm font-bold`}>{LEVEL_STYLE[nextLevel].label}</span>
          </div>
          <button onClick={startNextLevel}
            className={`${LEVEL_STYLE[nextLevel].bg} hover:opacity-90 active:scale-95 text-white font-black py-4 px-12 rounded-2xl text-lg shadow-2xl transition-all`}>
            انتقل إلى {nextLevel} →
          </button>
        </div>
      </main>
    )
  }

  /* ═══════════════════════════════════════════════════
     PHASE: RESULT
  ═══════════════════════════════════════════════════ */
  if (phase === 'result') {
    const finalLevel = lastPassedLevelIdx >= 0 ? LEVEL_ORDER[lastPassedLevelIdx] : 'A1'
    const style      = LEVEL_STYLE[finalLevel]
    const info       = CEFR_FEEDBACK[finalLevel]
    const score      = totalAnswered > 0 ? Math.round(totalCorrect / totalAnswered * 100) : 0
    const strengths: SkillKey[] = []
    const weaknesses: SkillKey[] = []
    for (const s of Object.keys(skillStats) as SkillKey[]) {
      if (skillStats[s].total === 0) continue
      const acc = skillStats[s].correct / skillStats[s].total
      if (acc >= 0.7) strengths.push(s)
      if (acc < 0.5)  weaknesses.push(s)
    }
    const resultObj = { level: finalLevel, score, strengths, weaknesses }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-brand-950 to-gray-950">
        {/* Banner */}
        <div className={`${style.bg} py-2 text-center`}>
          <p className="text-white text-sm font-bold">🎉 اكتمل الاختبار! — Test Complete!</p>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10 space-y-5">

          {/* Hero result card */}
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 sm:p-12 text-center">
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-4">نتيجة اختبار CEFR</p>
            <div className={`inline-flex items-center justify-center w-28 h-28 rounded-3xl ${style.bg} shadow-2xl ${style.glow} mb-5`}>
              <span className="text-white font-black text-4xl">{finalLevel}</span>
            </div>
            <h1 className={`text-5xl font-black ${style.color} mb-2`}>{LEVEL_STYLE[finalLevel].label}</h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto mb-7 leading-relaxed">{info.ar}</p>

            {/* Stats */}
            <div className="inline-flex items-center gap-6 bg-white/10 rounded-2xl px-8 py-4 mb-7 flex-wrap justify-center">
              {[
                { label: 'الأسئلة',   val: totalAnswered,   color: 'text-white' },
                { label: 'صحيح',      val: totalCorrect,    color: 'text-emerald-400' },
                { label: 'الدقة',     val: `${score}%`,     color: score >= 70 ? 'text-emerald-400' : 'text-amber-400' },
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

            {/* JSON result badge */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-left max-w-sm mx-auto mb-7 font-mono text-xs text-white/50 leading-relaxed">
              <span className="text-white/30">{'{'}</span>{'\n'}
              {'  '}<span className="text-blue-300">level</span>: <span className="text-amber-300">"{resultObj.level}"</span>,{'\n'}
              {'  '}<span className="text-blue-300">score</span>: <span className="text-emerald-300">{resultObj.score}</span>,{'\n'}
              {'  '}<span className="text-blue-300">strengths</span>: <span className="text-emerald-300">[{resultObj.strengths.map(s => `"${SKILL_LABELS[s].en}"`).join(', ')}]</span>,{'\n'}
              {'  '}<span className="text-blue-300">weaknesses</span>: <span className="text-red-300">[{resultObj.weaknesses.map(s => `"${SKILL_LABELS[s].en}"`).join(', ')}]</span>{'\n'}
              <span className="text-white/30">{'}'}</span>
            </div>

            <button
              type="button"
              onClick={() => openSubscribe({
                source:          `test_result_${recommendPlanForLevel(finalLevel)}`,
                planId:          recommendPlanForLevel(finalLevel),
                recommendedPlan: recommendPlanForLevel(finalLevel),
                testScore:       score,
                defaultLevel:    finalLevel,
              })}
              className={`inline-flex items-center gap-3 ${style.bg} text-white font-black py-4 px-10 rounded-2xl shadow-2xl ${style.glow} text-lg hover:opacity-90 transition-opacity`}
            >
              🚀 سجّل الآن فالباقة المناسبة
            </button>
            <p className="text-white/25 text-sm mt-3">غتفتح واتساب — كنجاوبك شخصياً فأقل من ساعة</p>
          </div>

          {/* Recommended plan card */}
          {(() => {
            const recId   = recommendPlanForLevel(finalLevel)
            const rec     = getPlan(recId)
            const samples = freeSamplesForPlan(recId)
            if (!rec) return null
            return (
              <div className="bg-gradient-to-br from-emerald-500/10 via-white/[0.04] to-emerald-500/5 border border-emerald-500/30 rounded-3xl p-6 sm:p-8">
                <div className="flex items-start gap-3 mb-4">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[11px] font-black px-3 py-1 rounded-full">
                    <Crown size={12} /> الباقة المقترحة ليك
                  </div>
                </div>
                <h2 className="text-white font-black text-2xl sm:text-3xl leading-tight mb-1">
                  {rec.title_ar}
                </h2>
                <p className="text-white/60 text-sm font-semibold mb-5">{rec.subtitle_ar}</p>

                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-white font-black text-4xl">{rec.amount_mad.toLocaleString()}</span>
                  <span className="text-white/60 text-sm font-bold">درهم</span>
                  {rec.originalAmount && rec.originalAmount > rec.amount_mad && (
                    <span className="text-white/30 text-sm font-bold line-through">
                      {rec.originalAmount.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="mb-5">
                  <p className="text-white/40 text-xs font-black uppercase tracking-wider mb-2">غتتعلّم:</p>
                  <ul className="space-y-1.5">
                    {rec.lifetimePerks.slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {samples.length > 0 && (
                  <div className="mb-5">
                    <p className="text-white/40 text-xs font-black uppercase tracking-wider mb-3">
                      🎁 {samples.length} دروس مجانية باش تجرّب قبل ما تشترك:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {samples.map((s, i) => (
                        <Link
                          key={i}
                          href={`/courses/${rec.courseSlug}/watch`}
                          className="group flex items-center gap-3 bg-white/[0.04] border border-white/10 hover:border-emerald-400/50 rounded-xl p-3 transition-colors"
                        >
                          <div className="w-10 h-10 shrink-0 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                            <Play size={14} className="text-emerald-400 fill-emerald-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-xs font-bold leading-tight line-clamp-2">{s.title}</p>
                            <p className="text-white/40 text-[10px] font-semibold mt-0.5">{s.duration}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => openSubscribe({
                      source:          `test_result_${recId}`,
                      planId:          recId,
                      recommendedPlan: recId,
                      testScore:       score,
                      defaultLevel:    finalLevel,
                    })}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/30"
                  >
                    <MessageCircle size={16} />
                    سجّل الآن — جاوبني فواتساب
                  </button>
                  <Link
                    href="/pricing"
                    onClick={() => { try { window.sessionStorage.setItem('inglizi.lead_source', 'test_result_browse') } catch {} }}
                    className="flex-1 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    شوف باقي الباقات
                  </Link>
                </div>
              </div>
            )
          })()}

          {/* Skill breakdown */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
            <h3 className="font-black text-white mb-5 flex items-center gap-2">
              <BarChart2 size={18} className="text-brand-400"/> تفصيل الأداء حسب المهارة
            </h3>
            <div className="space-y-4">
              {(Object.keys(SKILL_LABELS) as SkillKey[]).map(sk => {
                const st  = skillStats[sk]
                if (st.total === 0) return null
                const pct = Math.round((st.correct / st.total) * 100)
                return (
                  <div key={sk}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-white/65 text-sm font-semibold">
                        {SKILL_LABELS[sk].ar} <span className="text-white/30 text-xs">({SKILL_LABELS[sk].en})</span>
                      </span>
                      <span className={`text-sm font-black ${pct>=70?'text-emerald-400':pct>=50?'text-amber-400':'text-red-400'}`}>
                        {pct}% ({st.correct}/{st.total})
                      </span>
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

          {/* Strengths & Weaknesses */}
          {(strengths.length > 0 || weaknesses.length > 0) && (
            <div className="grid md:grid-cols-2 gap-5">
              {strengths.length > 0 && (
                <div className="bg-emerald-500/[0.08] border border-emerald-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Star size={16} className="text-emerald-400"/>
                    <h3 className="font-black text-white text-sm">نقاط قوتك</h3>
                  </div>
                  <div className="space-y-2">
                    {strengths.map(s => (
                      <div key={s} className="flex items-center gap-2 text-emerald-300 text-sm">
                        <CheckCircle2 size={14}/> {SKILL_LABELS[s].ar} ({SKILL_LABELS[s].en})
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {weaknesses.length > 0 && (
                <div className="bg-red-500/[0.08] border border-red-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-red-400"/>
                    <h3 className="font-black text-white text-sm">مجالات التحسين</h3>
                  </div>
                  <div className="space-y-2">
                    {weaknesses.map(s => (
                      <div key={s} className="flex items-center gap-2 text-red-300 text-sm">
                        <AlertTriangle size={14}/> {SKILL_LABELS[s].ar} ({SKILL_LABELS[s].en})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Can do / Focus areas */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={16} className="text-emerald-400"/>
                <h3 className="font-black text-white text-sm">ما تستطيع فعله الآن</h3>
              </div>
              <ul className="space-y-2.5">
                {info.canDo.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                    <span className="text-emerald-400 font-black mt-0.5 flex-shrink-0">✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-orange-400"/>
                <h3 className="font-black text-white text-sm">ركّز على تطوير</h3>
              </div>
              <ul className="space-y-2.5">
                {info.focus.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                    <span className="text-orange-400 font-black mt-0.5 flex-shrink-0">→</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/courses"
              className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-black py-4 rounded-2xl text-center text-lg transition-colors flex items-center justify-center gap-2">
              <Trophy size={20}/> عرض برامج التدريب
            </Link>
            <button onClick={resetTest}
              className="flex-1 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black py-4 rounded-2xl text-lg transition-colors flex items-center justify-center gap-2">
              <RotateCcw size={20}/> إعادة الاختبار
            </button>
          </div>

          <div className="flex justify-center">
            <a href={waUrl('Hello, I need help improving my English')} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#25d366] hover:text-[#1ebe5d] text-sm font-bold transition-colors">
              <MessageCircle size={16}/> تحدث مع المعلم مباشرة عبر واتساب
            </a>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════
     PHASE: TESTING
  ═══════════════════════════════════════════════════ */
  const style = LEVEL_STYLE[currentLevel]
  const isFailing = mistakes >= MISTAKES_TO_FAIL

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* ── Level progress bar (top) ── */}
      <div className="h-1 bg-white/10">
        <div className={`h-full ${style.bg} transition-all duration-500`} style={{width:`${progressPct}%`}}/>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Header: level + question counter + mistake dots ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className={`${style.bg} text-white font-black text-sm px-4 py-2 rounded-xl shadow-lg`}>{currentLevel}</span>
            <span className={`text-sm font-bold ${style.color}`}>{LEVEL_STYLE[currentLevel].label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-sm font-semibold">سؤال {questionIdx+1} / {totalInLevel}</span>
            {/* Mistake dots */}
            <div className="flex gap-1.5 items-center" title={`${mistakes} / ${MISTAKES_TO_FAIL} أخطاء`}>
              {[0,1,2].map(i => (
                <span key={i} className={`w-3 h-3 rounded-full transition-colors ${i < mistakes ? 'bg-red-500' : 'bg-white/15'}`}/>
              ))}
            </div>
          </div>
        </div>

        {/* ── Level progress bar (under header) ── */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-white/30 mb-1.5">
            <span>تقدمك في المستوى {currentLevel}</span>
            <span>{questionIdx}/{totalInLevel}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full ${style.bg} rounded-full transition-all duration-500`} style={{width:`${progressPct}%`}}/>
          </div>
          {/* Mistake warning */}
          {mistakes > 0 && (
            <p className={`text-xs mt-1.5 font-semibold ${mistakes >= 2 ? 'text-red-400' : 'text-amber-400'}`}>
              {mistakes === 1 ? '⚠️ خطأ واحد — تبقّى 2 قبل انتهاء المستوى' :
               mistakes === 2 ? '⚠️ خطآن — تنبّه: خطأ آخر يُنهي المستوى!' :
               '🛑 وصلت الحد الأقصى من الأخطاء في هذا المستوى'}
            </p>
          )}
        </div>

        {/* ── Question card ── */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 mb-4">

          {/* Type badge + Arabic hint */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-blue-200 text-xs font-bold px-3 py-1.5 rounded-full">
              {TYPE_META[currentQ.type].icon} {TYPE_META[currentQ.type].label}
            </span>
            <span className={`text-xs font-black px-2 py-1 rounded-lg ${style.bg} text-white`}>{currentLevel}</span>
          </div>

          {/* Question text */}
          <p className="text-white font-bold text-base md:text-lg mb-2 leading-relaxed whitespace-pre-line" dir="ltr">
            {currentQ.question}
          </p>
          {currentQ.arabicHint && (
            <p className="text-white/45 text-sm mb-5">{currentQ.arabicHint}</p>
          )}

          {/* Question body (options / reorder / reading / listening) */}
          {renderQuestionBody()}

          {/* ── Feedback after answering ── */}
          {answered !== 'waiting' && (
            <div className={`mt-5 rounded-2xl p-4 border ${
              answered === 'correct'
                ? 'bg-emerald-500/10 border-emerald-500/25'
                : 'bg-red-500/10 border-red-500/25'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {answered === 'correct'
                  ? <CheckCircle2 size={17} className="text-emerald-400"/>
                  : <XCircle size={17} className="text-red-400"/>}
                <p className={`font-black text-sm ${answered === 'correct' ? 'text-emerald-300' : 'text-red-300'}`}>
                  {answered === 'correct' ? 'إجابة صحيحة! ✓' : 'إجابة خاطئة ✗'}
                </p>
                {answered === 'wrong' && mistakes >= MISTAKES_TO_FAIL && (
                  <span className="mr-auto bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">🛑 انتهى المستوى</span>
                )}
              </div>
              <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line" dir="ltr">
                {currentQ.explanation}
              </p>
              <button onClick={handleContinue}
                className={`mt-4 w-full py-3 rounded-2xl font-black text-base transition-all active:scale-95 ${
                  isFailing
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : answered === 'correct'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
                }`}>
                {isFailing
                  ? '📊 عرض مستواي النهائي'
                  : questionIdx + 1 >= totalInLevel
                  ? levelIdx + 1 >= LEVEL_ORDER.length ? '🏆 النتيجة النهائية' : `✓ اجتزت ${currentLevel} — انتقل إلى ${LEVEL_ORDER[levelIdx+1]}`
                  : 'السؤال التالي →'
                }
              </button>
            </div>
          )}
        </div>

        {/* ── CEFR level trail ── */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {LEVEL_ORDER.map((l, i) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className={`text-xs font-black px-3 py-1.5 rounded-lg transition-all ${
                l === currentLevel ? `${LEVEL_STYLE[l].bg} text-white shadow-lg` :
                i < levelIdx      ? 'bg-white/15 text-white/70' :
                                    'bg-white/5 text-white/20'
              }`}>
                {l} {i < levelIdx ? '✓' : ''}
              </span>
              {i < 4 && <ChevronRight size={11} className="text-white/15"/>}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
