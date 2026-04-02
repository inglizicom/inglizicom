'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  CheckCircle, XCircle, ArrowLeft, RotateCcw, Trophy,
  Volume2, BookOpen, MessageCircle, Mic, Brain,
  ChevronLeft, AlertTriangle, Timer,
} from 'lucide-react'

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */
type QType = 'vocabulary' | 'grammar' | 'listening' | 'comprehension'

interface Question {
  id: number
  section: QType
  question: string
  arabicHint?: string
  options: string[]
  answer: number          // index into options[]
  audioText?: string      // TTS text (listening questions)
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
}

/* ══════════════════════════════════════════════════════════
   QUESTION BANK — 24 questions across 4 sections
══════════════════════════════════════════════════════════ */
const ALL_QUESTIONS: Question[] = [
  /* ─── SECTION 1: VOCABULARY ─── */
  {
    id: 1, section: 'vocabulary', difficulty: 'A1',
    question: 'What does the word "happy" mean?',
    arabicHint: 'ماذا تعني كلمة "happy"؟',
    options: ['حزين', 'غاضب', 'سعيد', 'خائف'],
    answer: 2,
  },
  {
    id: 2, section: 'vocabulary', difficulty: 'A1',
    question: 'Choose the correct meaning of "hungry":',
    arabicHint: 'اختر المعنى الصحيح لـ "hungry":',
    options: ['عطشان', 'جائع', 'متعب', 'نعسان'],
    answer: 1,
  },
  {
    id: 3, section: 'vocabulary', difficulty: 'A2',
    question: 'What does "reliable" mean?',
    arabicHint: 'ما معنى كلمة "reliable"؟',
    options: ['سريع', 'غالي', 'يُعتمد عليه', 'خطير'],
    answer: 2,
  },
  {
    id: 4, section: 'vocabulary', difficulty: 'A2',
    question: 'Choose the word that means "to make something bigger":',
    arabicHint: 'اختر الكلمة التي تعني "جعل شيء أكبر":',
    options: ['reduce', 'expand', 'hide', 'damage'],
    answer: 1,
  },
  {
    id: 5, section: 'vocabulary', difficulty: 'B1',
    question: 'What does "overwhelmed" mean?',
    arabicHint: 'ما معنى "overwhelmed"؟',
    options: ['محبوط', 'مبسوط جداً', 'مرهق ومضغوط بشكل زائد', 'لامبالٍ'],
    answer: 2,
  },
  {
    id: 6, section: 'vocabulary', difficulty: 'B2',
    question: 'Which word best describes someone who avoids spending money unnecessarily?',
    arabicHint: 'أي كلمة تصف شخصاً يتجنب الإنفاق غير الضروري؟',
    options: ['generous', 'frugal', 'reckless', 'indifferent'],
    answer: 1,
  },

  /* ─── SECTION 2: GRAMMAR ─── */
  {
    id: 7, section: 'grammar', difficulty: 'A1',
    question: 'Complete: "She ___ a doctor."',
    arabicHint: 'أكمل الجملة: هي طبيبة.',
    options: ['am', 'is', 'are', 'be'],
    answer: 1,
  },
  {
    id: 8, section: 'grammar', difficulty: 'A1',
    question: 'Which sentence is correct?',
    arabicHint: 'أي جملة صحيحة؟',
    options: [
      'I goes to school every day.',
      'I go to school every day.',
      'I going to school every day.',
      'I gone to school every day.',
    ],
    answer: 1,
  },
  {
    id: 9, section: 'grammar', difficulty: 'A2',
    question: 'What is the past tense of "write"?',
    arabicHint: 'ما هو زمن الماضي لكلمة "write"؟',
    options: ['writed', 'written', 'wrote', 'writing'],
    answer: 2,
  },
  {
    id: 10, section: 'grammar', difficulty: 'A2',
    question: 'Choose the correct sentence:',
    arabicHint: 'اختر الجملة الصحيحة:',
    options: [
      'He has been here since three hours.',
      'He has been here for three hours.',
      'He is here since three hours.',
      'He was here for three hours ago.',
    ],
    answer: 1,
  },
  {
    id: 11, section: 'grammar', difficulty: 'B1',
    question: 'Complete: "By the time I arrived, they ___ dinner."',
    arabicHint: 'أكمل بالزمن الصحيح:',
    options: ['finished', 'had finished', 'have finished', 'were finishing'],
    answer: 1,
  },
  {
    id: 12, section: 'grammar', difficulty: 'B2',
    question: 'Which sentence uses the subjunctive correctly?',
    arabicHint: 'أي جملة تستخدم المضارع الفرضي بشكل صحيح؟',
    options: [
      'I suggest that he goes home early.',
      'I suggest that he go home early.',
      'I suggest that he would go home early.',
      'I suggest that he is going home early.',
    ],
    answer: 1,
  },

  /* ─── SECTION 3: LISTENING ─── */
  {
    id: 13, section: 'listening', difficulty: 'A1',
    question: 'Listen and choose what the speaker says:',
    arabicHint: 'استمع واختر ما يقوله المتحدث:',
    audioText: 'Hello! My name is Sarah. I am from Morocco. Nice to meet you!',
    options: [
      'The speaker\'s name is Sara and she is from Egypt.',
      'The speaker\'s name is Sarah and she is from Morocco.',
      'The speaker\'s name is Maria and she is from Spain.',
      'The speaker\'s name is Sarah and she is from France.',
    ],
    answer: 1,
  },
  {
    id: 14, section: 'listening', difficulty: 'A2',
    question: 'Listen and answer: Where is the person going?',
    arabicHint: 'استمع وأجب: أين يذهب الشخص؟',
    audioText: 'Excuse me, can you tell me how to get to the train station? I need to catch the 3 o\'clock train to the city.',
    options: ['إلى المستشفى', 'إلى محطة القطار', 'إلى المطار', 'إلى الفندق'],
    answer: 1,
  },
  {
    id: 15, section: 'listening', difficulty: 'B1',
    question: 'Listen to the conversation and choose the main topic:',
    arabicHint: 'استمع واختر الموضوع الرئيسي للحديث:',
    audioText: 'I have been working on this project for three months now. The deadline is next week and I am worried we won\'t finish on time. We need to work overtime this weekend.',
    options: [
      'مشكلة في الراتب',
      'ضغط العمل وموعد التسليم',
      'إجازة نهاية الأسبوع',
      'اجتماع مع العميل',
    ],
    answer: 1,
  },
  {
    id: 16, section: 'listening', difficulty: 'B2',
    question: 'Listen and identify the speaker\'s attitude:',
    arabicHint: 'استمع وحدد موقف المتحدث:',
    audioText: 'While I appreciate the team\'s hard work, I must say the results are somewhat disappointing compared to last quarter. We need to rethink our strategy going forward.',
    options: [
      'متحمس وإيجابي بالكامل',
      'غير راضٍ تماماً ويريد التغيير',
      'ناقد جزئياً مع الاعتراف بالجهود',
      'محايد وغير مكترث',
    ],
    answer: 2,
  },

  /* ─── SECTION 4: COMPREHENSION ─── */
  {
    id: 17, section: 'comprehension', difficulty: 'A2',
    question: 'Read: "Tom woke up late. He missed his bus. He had to take a taxi to work."\n\nWhy did Tom take a taxi?',
    arabicHint: 'لماذا أخذ توم سيارة أجرة؟',
    options: [
      'لأن الحافلة كانت ممتلئة',
      'لأنه فاتته الحافلة بسبب الاستيقاظ المتأخر',
      'لأنه يفضل السيارات',
      'لأن الحافلة لا تذهب للعمل',
    ],
    answer: 1,
  },
  {
    id: 18, section: 'comprehension', difficulty: 'A2',
    question: 'Read: "The store is open Monday to Friday from 9 AM to 6 PM. On weekends it closes at 4 PM."\n\nAt what time does the store close on Saturday?',
    arabicHint: 'في أي وقت يغلق المتجر يوم السبت؟',
    options: ['6 مساءً', '4 مساءً', '9 صباحاً', '12 ظهراً'],
    answer: 1,
  },
  {
    id: 19, section: 'comprehension', difficulty: 'B1',
    question: 'Read: "Although the film received mixed reviews from critics, it became one of the highest-grossing movies of the year, suggesting that audiences have different tastes than reviewers."\n\nWhat can we conclude?',
    arabicHint: 'ماذا يمكننا أن نستنتج؟',
    options: [
      'الفيلم كان سيئاً والجمهور لا يفهم',
      'النقاد والجمهور لديهم أذواق مختلفة',
      'الفيلم نجح بسبب النقاد',
      'الإيرادات لا علاقة لها بالتقييمات',
    ],
    answer: 1,
  },
  {
    id: 20, section: 'comprehension', difficulty: 'B2',
    question: 'Read: "The paradox of choice suggests that while having options is generally positive, an overwhelming number of choices can lead to decision paralysis and decreased satisfaction with the final choice made."\n\nWhat is the main idea?',
    arabicHint: 'ما هي الفكرة الرئيسية؟',
    options: [
      'الاختيار دائماً أمر جيد',
      'قلة الخيارات تجعل الناس أسعد دائماً',
      'الكثير من الخيارات يمكن أن يسبب صعوبة في القرار وعدم الرضا',
      'الناس يفضلون دائماً الخيارات الأكثر',
    ],
    answer: 2,
  },
  {
    id: 21, section: 'comprehension', difficulty: 'B1',
    question: 'Read: "Despite living in a big city for ten years, Maria always felt like a stranger. She longed for the quiet countryside where she grew up."\n\nHow does Maria feel about the city?',
    arabicHint: 'كيف تشعر ماريا تجاه المدينة؟',
    options: [
      'تحبها ولا تريد المغادرة',
      'لا تشعر بالانتماء إليها وتشتاق للريف',
      'تعتاد عليها تدريجياً',
      'تكره الريف الذي كبرت فيه',
    ],
    answer: 1,
  },
  {
    id: 22, section: 'comprehension', difficulty: 'C1',
    question: 'Read: "The notion that technology is inherently neutral, merely a tool shaped entirely by human intent, is increasingly challenged by scholars who argue that every technology embeds certain values and assumptions that influence its users in subtle ways."\n\nThe passage argues that:',
    arabicHint: 'يجادل النص بأن:',
    options: [
      'التكنولوجيا محايدة تماماً وتعتمد على النية البشرية',
      'التكنولوجيا تحمل قيماً وافتراضات تؤثر على مستخدميها',
      'العلماء يتفقون على حياد التكنولوجيا',
      'التكنولوجيا سيئة بطبيعتها',
    ],
    answer: 1,
  },
  {
    id: 23, section: 'comprehension', difficulty: 'B2',
    question: 'Read: "Remote work has blurred the boundaries between professional and personal life. While employees gain flexibility, many report difficulty disconnecting, leading to longer working hours."\n\nWhat is the DOWNSIDE of remote work mentioned?',
    arabicHint: 'ما هو الجانب السلبي للعمل عن بُعد المذكور؟',
    options: [
      'قلة المرونة',
      'صعوبة الفصل بين العمل والحياة الشخصية وساعات العمل الأطول',
      'انعدام التواصل مع الزملاء',
      'ارتفاع التكاليف',
    ],
    answer: 1,
  },
  {
    id: 24, section: 'comprehension', difficulty: 'C1',
    question: 'What is the tone of this sentence: "The committee, after months of deliberation, arrived at a conclusion that surprised absolutely no one familiar with its previous decisions."',
    arabicHint: 'ما هو أسلوب هذه الجملة؟',
    options: [
      'رسمي ومباشر',
      'ساخر وانتقادي',
      'متحمس وإيجابي',
      'محايد وعلمي',
    ],
    answer: 1,
  },
]

/* ══════════════════════════════════════════════════════════
   CEFR RESULT CONFIG
══════════════════════════════════════════════════════════ */
interface CEFRResult {
  level: string
  label: string
  color: string
  bgColor: string
  borderColor: string
  emoji: string
  description: string
  canDo: string[]
  needsWork: string[]
  course: string
  courseLink: string
  message: string
}

function getCEFRResult(score: number, total: number, wrongStreak: boolean): CEFRResult {
  const pct = score / total

  if (wrongStreak || pct < 0.25) return {
    level: 'A1', label: 'مبتدئ كامل', emoji: '🌱',
    color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200',
    description: 'أنت في بداية الطريق — وهذا شيء رائع! الأساس القوي هو كل شيء.',
    canDo: ['فهم التحيات البسيطة', 'تعريف نفسك بالإنجليزية', 'فهم الأرقام والألوان'],
    needsWork: ['المفردات الأساسية', 'تكوين جمل بسيطة', 'الاستماع للإنجليزية اليومية'],
    course: 'دورة المبتدئين: من الصفر إلى المحادثة',
    courseLink: '/courses',
    message: 'لا تقلق! كل محترف كان يوماً مبتدئاً. دورتنا ستأخذ بيدك من أول حرف إلى أول محادثة حقيقية.',
  }

  if (pct < 0.45) return {
    level: 'A2', label: 'مبتدئ متقدم', emoji: '🚶',
    color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200',
    description: 'لديك أساس جيد! تفهم الجمل البسيطة ويمكنك التواصل في مواقف مألوفة.',
    canDo: ['فهم الجمل البسيطة', 'إجراء محادثات قصيرة', 'قراءة نصوص مبسطة'],
    needsWork: ['توسيع المفردات', 'تحسين قواعد النحو', 'الاستماع لمحادثات طبيعية'],
    course: 'دورة التواصل اليومي بثقة',
    courseLink: '/courses',
    message: 'ممتاز! لديك قاعدة جيدة. الآن الخطوة التالية هي تحسين مهارة الكلام والاستماع لمواقف الحياة الحقيقية.',
  }

  if (pct < 0.65) return {
    level: 'B1', label: 'متوسط', emoji: '🏃',
    color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200',
    description: 'مستوى جيد جداً! يمكنك التواصل في معظم المواقف اليومية وفهم المحتوى العام.',
    canDo: ['التواصل في المواقف اليومية', 'فهم الأخبار البسيطة', 'كتابة رسائل بسيطة'],
    needsWork: ['الطلاقة في الحديث', 'المفردات المتخصصة', 'فهم اللهجات المختلفة'],
    course: 'دورة النطق والطلاقة المتقدمة',
    courseLink: '/courses',
    message: 'رائع! أنت في نقطة انطلاق ممتازة نحو الطلاقة. دورتنا ستسرّع تقدمك بشكل كبير.',
  }

  if (pct < 0.82) return {
    level: 'B2', label: 'فوق المتوسط', emoji: '🏅',
    color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200',
    description: 'مستوى ممتاز! يمكنك التعامل مع مواضيع معقدة والتواصل بثقة في بيئات مهنية.',
    canDo: ['مناقشة مواضيع معقدة', 'التواصل المهني', 'فهم الأفلام بدون ترجمة'],
    needsWork: ['التعبيرات الاصطلاحية المتقدمة', 'الكتابة الأكاديمية', 'النطق الدقيق'],
    course: 'دورة النطق والطلاقة المتقدمة',
    courseLink: '/courses',
    message: 'مستوى رائع! أنت قريب من الإتقان. جلسات متخصصة ستنقلك إلى مستوى C1.',
  }

  return {
    level: 'C1', label: 'متقدم', emoji: '🏆',
    color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200',
    description: 'إنجاز استثنائي! مستواك متقدم جداً وتتمتع بطلاقة شبه احترافية.',
    canDo: ['التواصل بطلاقة في كل المواقف', 'فهم الفروق الدقيقة', 'الكتابة الاحترافية'],
    needsWork: ['بعض التعبيرات الأدبية', 'الأسلوب الرسمي المتقدم جداً'],
    course: 'جلسات خاصة للصقل والاحتراف',
    courseLink: '/contact',
    message: 'رائع جداً! مستواك متميز. تواصل معنا لجلسات متخصصة ترفع مستواك إلى الكمال.',
  }
}

/* ══════════════════════════════════════════════════════════
   SECTION CONFIG
══════════════════════════════════════════════════════════ */
const SECTIONS: { key: QType; label: string; icon: React.ElementType; desc: string; color: string }[] = [
  { key: 'vocabulary',    label: 'المفردات',     icon: BookOpen,      desc: '6 أسئلة',  color: 'bg-blue-500' },
  { key: 'grammar',       label: 'القواعد',      icon: Brain,         desc: '6 أسئلة',  color: 'bg-purple-500' },
  { key: 'listening',     label: 'الاستماع',     icon: Volume2,       desc: '4 أسئلة',  color: 'bg-green-500' },
  { key: 'comprehension', label: 'الفهم القرائي', icon: MessageCircle, desc: '8 أسئلة',  color: 'bg-orange-500' },
]

const MAX_WRONG = 3   // end test after this many consecutive wrong

/* ══════════════════════════════════════════════════════════
   HELPER: TTS
══════════════════════════════════════════════════════════ */
function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'en-US'
  utter.rate = 0.88
  utter.pitch = 1
  window.speechSynthesis.speak(utter)
}

/* ══════════════════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════════════════ */
type Stage = 'intro' | 'quiz' | 'early-end' | 'result'

export default function LevelTestPage() {
  const [stage,          setStage]          = useState<Stage>('intro')
  const [currentIdx,     setCurrentIdx]     = useState(0)
  const [answers,        setAnswers]        = useState<(number | null)[]>(Array(ALL_QUESTIONS.length).fill(null))
  const [selected,       setSelected]       = useState<number | null>(null)
  const [showFeedback,   setShowFeedback]   = useState(false)
  const [wrongStreak,    setWrongStreak]    = useState(0)   // consecutive wrong
  const [earlyEnd,       setEarlyEnd]       = useState(false)
  const [speaking,       setSpeaking]       = useState(false)
  const [timeLeft,       setTimeLeft]       = useState(25)  // seconds per question
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* ── Computed ── */
  const q           = ALL_QUESTIONS[currentIdx]
  const isListening = q?.section === 'listening'
  const totalQ      = ALL_QUESTIONS.length
  const progress    = ((currentIdx) / totalQ) * 100
  const score       = answers.filter((a, i) => a === ALL_QUESTIONS[i]?.answer).length

  /* ── Timer ── */
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    setTimeLeft(25)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          stopTimer()
          // auto-select wrong on timeout if nothing selected
          setSelected(prev => {
            if (prev === null) {
              setShowFeedback(true)
              const newAnswers = [...answers]
              newAnswers[currentIdx] = -1   // mark as timed out
              setAnswers(newAnswers)
            }
            return prev
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [stopTimer, answers, currentIdx])

  /* start timer when question changes in quiz */
  useEffect(() => {
    if (stage === 'quiz' && !showFeedback) startTimer()
    return stopTimer
  }, [stage, currentIdx, showFeedback]) // eslint-disable-line

  /* ── Auto-play audio for listening questions ── */
  useEffect(() => {
    if (stage === 'quiz' && isListening && q.audioText && !showFeedback) {
      const t = setTimeout(() => {
        speak(q.audioText!)
        setSpeaking(true)
        setTimeout(() => setSpeaking(false), (q.audioText!.length / 10) * 1000 + 500)
      }, 600)
      return () => clearTimeout(t)
    }
  }, [currentIdx, stage]) // eslint-disable-line

  /* ── Handlers ── */
  function handleSelect(idx: number) {
    if (showFeedback || timeLeft === 0) return
    setSelected(idx)
  }

  function handleCheck() {
    if (selected === null) return
    stopTimer()
    const correct = selected === q.answer

    const newAnswers = [...answers]
    newAnswers[currentIdx] = selected
    setAnswers(newAnswers)

    if (!correct) {
      const newStreak = wrongStreak + 1
      setWrongStreak(newStreak)
      if (newStreak >= MAX_WRONG) {
        setShowFeedback(true)
        setTimeout(() => {
          setEarlyEnd(true)
          setStage('early-end')
        }, 1800)
        return
      }
    } else {
      setWrongStreak(0)
    }
    setShowFeedback(true)
  }

  function handleNext() {
    setShowFeedback(false)
    setSelected(null)

    const nextIdx = currentIdx + 1
    if (nextIdx >= totalQ) {
      setStage('result')
    } else {
      setCurrentIdx(nextIdx)
    }
  }

  function handleRestart() {
    setStage('intro')
    setCurrentIdx(0)
    setAnswers(Array(ALL_QUESTIONS.length).fill(null))
    setSelected(null)
    setShowFeedback(false)
    setWrongStreak(0)
    setEarlyEnd(false)
    setTimeLeft(25)
    stopTimer()
  }

  const cefrResult = getCEFRResult(score, totalQ, earlyEnd)
  const timerPct   = (timeLeft / 25) * 100
  const timerColor = timeLeft > 15 ? '#22c55e' : timeLeft > 8 ? '#f59e0b' : '#ef4444'

  /* ══════════════════════════════════════
      INTRO SCREEN
  ══════════════════════════════════════ */
  if (stage === 'intro') {
    return (
      <>
        <section className="bg-hero pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-5xl font-black text-white mb-5">اختبر مستواك الحقيقي</h1>
            <p className="text-blue-100/80 text-xl leading-relaxed max-w-2xl mx-auto">
              اختبار شامل في 4 أقسام يحدد مستواك الدقيق ويوجهك للمسار الصحيح.
            </p>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
              <h2 className="text-2xl font-black text-gray-900 text-center mb-8">هيكل الاختبار</h2>

              {/* Section cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {SECTIONS.map(sec => {
                  const Icon = sec.icon
                  return (
                    <div key={sec.key} className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 ${sec.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm">{sec.label}</p>
                        <p className="text-gray-400 text-xs">{sec.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Rules */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-7">
                <p className="text-amber-800 font-black text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} /> قواعد الاختبار
                </p>
                <ul className="space-y-1.5">
                  {[
                    'مدة كل سؤال: 25 ثانية فقط',
                    '3 إجابات خاطئة متتالية تنهي الاختبار مبكراً',
                    'أقسام الاستماع تُشغَّل تلقائياً — استمع بتركيز',
                    'النتيجة النهائية مع مستواك CEFR وتوصيات',
                  ].map(r => (
                    <li key={r} className="flex items-start gap-2 text-amber-900 text-sm">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: '📝', value: `${totalQ}`, label: 'سؤال' },
                  { icon: '⏱️', value: '~10', label: 'دقائق' },
                  { icon: '🏆', value: 'CEFR', label: 'المستوى' },
                ].map(s => (
                  <div key={s.label} className="bg-brand-50 rounded-2xl p-4 text-center">
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <p className="font-black text-brand-700">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStage('quiz')}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl text-lg shadow-lg hover:shadow-brand-600/30 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                ابدأ الاختبار الآن
                <ArrowLeft size={22} />
              </button>
            </div>
          </div>
        </section>
      </>
    )
  }

  /* ══════════════════════════════════════
      EARLY END SCREEN
  ══════════════════════════════════════ */
  if (stage === 'early-end') {
    const partialResult = getCEFRResult(score, totalQ, true)
    return (
      <>
        <section className="bg-hero pt-32 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-4xl font-black text-white">انتهى الاختبار مبكراً</h1>
          </div>
        </section>
        <section className="py-16 bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={40} className="text-orange-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">
                يبدو أن مستواك يحتاج إلى تقوية الأساسيات
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                أجبت بشكل خاطئ على {MAX_WRONG} أسئلة متتالية. هذا يشير إلى أن مستواك الحالي <strong className="text-brand-700">A1</strong> وتحتاج إلى تعزيز الأساسيات أولاً.
              </p>

              <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 mb-7">
                <p className="text-brand-700 font-bold mb-3">💡 التوصية:</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {partialResult.message}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Link
                  href="/courses"
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <BookOpen size={18} /> ابدأ من الأساسيات
                </Link>
                <a
                  href="https://wa.me/212707902091?text=مرحبا،%20أريد%20تعلم%20الإنجليزية%20من%20الصفر"
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 bg-[#25d366] hover:bg-[#20b858] text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  احجز مكانك الآن
                </a>
              </div>
              <button
                onClick={handleRestart}
                className="w-full border-2 border-gray-200 hover:border-brand-400 text-gray-600 hover:text-brand-700 font-bold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> أعد الاختبار
              </button>
            </div>
          </div>
        </section>
      </>
    )
  }

  /* ══════════════════════════════════════
      QUIZ SCREEN
  ══════════════════════════════════════ */
  if (stage === 'quiz') {
    const sectionConfig = SECTIONS.find(s => s.key === q.section)!
    const SectionIcon   = sectionConfig.icon
    const isCorrect     = showFeedback && selected === q.answer

    return (
      <section className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 flex items-center justify-center py-24 px-4">
        <div className="w-full max-w-2xl">

          {/* ── Progress + meta ── */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 ${sectionConfig.color} rounded-lg flex items-center justify-center`}>
                  <SectionIcon size={14} className="text-white" />
                </div>
                <span className="font-bold">{sectionConfig.label}</span>
              </div>
              <span className="text-gray-400">
                {currentIdx + 1} / {totalQ}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Wrong counter pills */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-1">
                {Array.from({ length: MAX_WRONG }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      i < wrongStreak ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-400 mr-1">أخطاء متتالية</span>
              </div>

              {/* Timer ring */}
              <div className="flex items-center gap-1.5">
                <div className="relative w-7 h-7">
                  <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="11" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle
                      cx="14" cy="14" r="11"
                      fill="none"
                      stroke={timerColor}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 11}`}
                      strokeDashoffset={`${2 * Math.PI * 11 * (1 - timerPct / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black" style={{ color: timerColor }}>
                    {timeLeft}
                  </span>
                </div>
                <Timer size={13} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* ── Question Card ── */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

            {/* Listening audio player */}
            {isListening && q.audioText && (
              <div className="mb-6">
                <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${speaking ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'} transition-colors`}>
                  <button
                    onClick={() => {
                      speak(q.audioText!)
                      setSpeaking(true)
                      setTimeout(() => setSpeaking(false), (q.audioText!.length / 10) * 1000 + 500)
                    }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all ${speaking ? 'bg-green-500 animate-pulse' : 'bg-brand-600 hover:bg-brand-700'}`}
                  >
                    <Volume2 size={22} />
                  </button>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {speaking ? '🎧 يتم التشغيل...' : '🎧 اضغط للاستماع مرة أخرى'}
                    </p>
                    <p className="text-gray-400 text-xs">استمع جيداً قبل الإجابة</p>
                  </div>
                  {speaking && (
                    <div className="mr-auto flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <div
                          key={i}
                          className="w-1 bg-green-400 rounded-full animate-pulse"
                          style={{ height: `${8 + (i % 3) * 6}px`, animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Question text */}
            <div className="mb-6">
              <p className="text-xl font-black text-gray-900 leading-relaxed whitespace-pre-line">
                {q.question}
              </p>
              {q.arabicHint && (
                <p className="text-gray-400 text-sm mt-2">{q.arabicHint}</p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {q.options.map((opt, idx) => {
                let style = 'border-2 border-gray-200 bg-gray-50 text-gray-700 hover:border-brand-300 hover:bg-brand-50 cursor-pointer'

                if (showFeedback || timeLeft === 0) {
                  if (idx === q.answer) {
                    style = 'border-2 border-green-500 bg-green-50 text-green-800'
                  } else if (idx === selected && idx !== q.answer) {
                    style = 'border-2 border-red-400 bg-red-50 text-red-700'
                  } else {
                    style = 'border-2 border-gray-100 bg-gray-50 text-gray-400 opacity-60'
                  }
                } else if (selected === idx) {
                  style = 'border-2 border-brand-500 bg-brand-50 text-brand-800'
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-right px-5 py-4 rounded-2xl transition-all duration-200 flex items-center justify-between gap-3 font-medium ${style}`}
                  >
                    <span className="leading-snug">{opt}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {showFeedback && idx === q.answer && <CheckCircle size={18} className="text-green-500" />}
                      {showFeedback && idx === selected && idx !== q.answer && <XCircle size={18} className="text-red-500" />}
                      <span className="w-8 h-8 rounded-xl border-2 border-current flex items-center justify-center text-xs font-black opacity-50">
                        {String.fromCharCode(65 + idx)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Feedback banner */}
            {showFeedback && (
              <div className={`rounded-2xl p-4 mb-5 flex items-start gap-3 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {isCorrect
                  ? <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                  : <XCircle    size={20} className="flex-shrink-0 mt-0.5" />}
                <div>
                  <p className="font-black">
                    {isCorrect ? '✅ إجابة صحيحة! ممتاز' : '❌ إجابة خاطئة'}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm mt-0.5">
                      الإجابة الصحيحة: <strong>{q.options[q.answer]}</strong>
                      {wrongStreak > 0 && (
                        <span className="mr-2 text-red-600 font-bold">
                          ({wrongStreak}/{MAX_WRONG} أخطاء متتالية)
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={showFeedback ? handleNext : handleCheck}
              disabled={selected === null && !showFeedback}
              className={`w-full font-black py-4 rounded-2xl text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                selected === null && !showFeedback
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg hover:shadow-brand-600/30 active:scale-95'
              }`}
            >
              {!showFeedback
                ? 'تحقق من الإجابة'
                : currentIdx + 1 < totalQ
                  ? 'السؤال التالي'
                  : 'عرض النتيجة'}
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
      </section>
    )
  }

  /* ══════════════════════════════════════
      RESULT SCREEN
  ══════════════════════════════════════ */
  const pct = Math.round((score / totalQ) * 100)
  const sectionScores = SECTIONS.map(sec => {
    const secQs     = ALL_QUESTIONS.filter(q => q.section === sec.key)
    const secScore  = secQs.filter((q, i) => {
      const globalIdx = ALL_QUESTIONS.indexOf(q)
      return answers[globalIdx] === q.answer
    }).length
    return { ...sec, score: secScore, total: secQs.length, pct: Math.round((secScore / secQs.length) * 100) }
  })

  return (
    <>
      <section className="bg-hero pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-6xl mb-4">{cefrResult.emoji}</div>
          <h1 className="text-5xl font-black text-white mb-3">نتيجة اختبارك</h1>
          <p className="text-blue-100/80 text-lg">تحليل شامل لمستواك مع توصيات شخصية</p>
        </div>
      </section>

      <section className="py-14 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">

          {/* ── Level Badge ── */}
          <div className={`bg-white rounded-3xl shadow-xl border ${cefrResult.borderColor} p-8 text-center`}>
            {/* Score ring */}
            <div className="relative w-44 h-44 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-gray-900">{score}</span>
                <span className="text-gray-400 text-sm">من {totalQ}</span>
              </div>
            </div>

            {/* CEFR Badge */}
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 ${cefrResult.borderColor} ${cefrResult.bgColor} mb-4`}>
              <span className="text-2xl">{cefrResult.emoji}</span>
              <div className="text-right">
                <p className={`text-2xl font-black ${cefrResult.color}`}>{cefrResult.level}</p>
                <p className={`text-sm font-bold ${cefrResult.color} opacity-80`}>{cefrResult.label}</p>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-3 max-w-md mx-auto">{cefrResult.description}</p>

            {/* Score breakdown pills */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-green-50 rounded-2xl p-3">
                <p className="text-2xl font-black text-green-700">{score}</p>
                <p className="text-xs text-green-600 font-semibold">صحيح</p>
              </div>
              <div className="bg-red-50 rounded-2xl p-3">
                <p className="text-2xl font-black text-red-600">{totalQ - score}</p>
                <p className="text-xs text-red-500 font-semibold">خطأ</p>
              </div>
              <div className="bg-brand-50 rounded-2xl p-3">
                <p className="text-2xl font-black text-brand-700">{pct}%</p>
                <p className="text-xs text-brand-600 font-semibold">النسبة</p>
              </div>
            </div>
          </div>

          {/* ── Section Analysis ── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
            <h2 className="text-xl font-black text-gray-900 mb-5">تحليل أدائك في كل قسم</h2>
            <div className="space-y-4">
              {sectionScores.map(sec => {
                const Icon = sec.icon
                return (
                  <div key={sec.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${sec.color} rounded-lg flex items-center justify-center`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{sec.label}</span>
                      </div>
                      <span className="text-sm font-black text-gray-700">{sec.score}/{sec.total}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${sec.color}`}
                        style={{ width: `${sec.pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 text-left">{sec.pct}%</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Can Do / Needs Work ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                ما يمكنك فعله الآن
              </h3>
              <ul className="space-y-2">
                {cefrResult.canDo.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <Brain size={20} className="text-orange-500" />
                ما تحتاج تطويره
              </h3>
              <ul className="space-y-2">
                {cefrResult.needsWork.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-orange-500 flex-shrink-0 mt-0.5">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Personalized Recommendation ── */}
          <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-3xl p-8 text-white">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                {cefrResult.emoji}
              </div>
              <div>
                <p className="text-blue-200 text-sm font-semibold mb-1">توصية شخصية لك</p>
                <h3 className="text-xl font-black">{cefrResult.course}</h3>
              </div>
            </div>
            <p className="text-blue-100/80 leading-relaxed mb-6">{cefrResult.message}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={cefrResult.courseLink}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 px-6 rounded-2xl text-center transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                <BookOpen size={18} />
                ابدأ التعلم الآن
              </Link>
              <a
                href="https://wa.me/212707902091?text=مرحبا%20حمزة،%20أكملت%20الاختبار%20وأريد%20الانضمام"
                target="_blank" rel="noopener noreferrer"
                className="flex-1 bg-[#25d366] hover:bg-[#20b858] text-white font-black py-3.5 px-6 rounded-2xl text-center transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Mic size={18} />
                احجز مكانك عبر واتساب
              </a>
            </div>
          </div>

          {/* ── Answers Review + Restart ── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
            <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
              <Trophy size={22} className="text-amber-500" />
              مراجعة إجاباتك
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {ALL_QUESTIONS.map((question, i) => {
                const userAnswer = answers[i]
                const correct    = userAnswer === question.answer
                const secCfg     = SECTIONS.find(s => s.key === question.section)!
                return (
                  <div
                    key={question.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl text-sm ${correct ? 'bg-green-50' : 'bg-red-50'}`}
                  >
                    {correct
                      ? <CheckCircle size={17} className="text-green-500 flex-shrink-0 mt-0.5" />
                      : <XCircle    size={17} className="text-red-500 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${secCfg.color} text-white`}>
                          {secCfg.label}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 line-clamp-1">{question.question.split('\n')[0]}</p>
                      {!correct && (
                        <p className="text-red-600 text-xs mt-0.5">
                          الصحيح: <strong>{question.options[question.answer]}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={handleRestart}
              className="mt-5 w-full border-2 border-gray-200 hover:border-brand-400 text-gray-600 hover:text-brand-700 font-bold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              أعد الاختبار
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
