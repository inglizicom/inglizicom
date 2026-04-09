'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface VocabWord {
  word: string
  pronunciation: string
  translation_ar: string
  emoji: string
  example: string
}
interface Sentence {
  english: string
  arabic: string
}
interface DialogueLine {
  speaker: 'A' | 'B'
  name: string
  english: string
  arabic: string
}
type ExType = 'mc' | 'fill' | 'en_ar' | 'ar_en' | 'order'
interface Exercise {
  type: ExType
  tip_ar: string
  prompt: string
  options: string[]
  correct: number
  words?: string[]
  answer?: string[]
}
interface Lesson {
  id: string
  title: string
  title_ar: string
  level: string
  emoji: string
  color: string
  vocab: VocabWord[]
  sentences: Sentence[]
  dialogue: DialogueLine[]
  exercises: Exercise[]
}

type Phase = 'vocab' | 'sentences' | 'dialogue' | 'exercises' | 'complete'

// ─── Lesson Data ──────────────────────────────────────────────────────────────

const LESSONS: Lesson[] = [
  {
    id: 'greetings', title: 'Greetings', title_ar: 'التحيات',
    level: 'A1', emoji: '👋', color: '#10b981',
    vocab: [
      { word: 'Hello',        pronunciation: 'heh-LO',       translation_ar: 'مرحباً',     emoji: '👋', example: 'Hello! My name is Ahmed.' },
      { word: 'Hi',           pronunciation: 'haɪ',          translation_ar: 'أهلاً',       emoji: '🙌', example: 'Hi! Nice to meet you.' },
      { word: 'Good morning', pronunciation: 'gʊd MOR-nɪŋ',  translation_ar: 'صباح الخير', emoji: '🌅', example: 'Good morning! How are you?' },
      { word: 'Good evening', pronunciation: 'gʊd EEV-nɪŋ',  translation_ar: 'مساء الخير', emoji: '🌆', example: 'Good evening! Welcome.' },
      { word: 'How are you?', pronunciation: 'haʊ ɑr juː',   translation_ar: 'كيف حالك؟',  emoji: '😊', example: 'How are you? I am fine!' },
    ],
    sentences: [
      { english: 'Hello! My name is Sara.',             arabic: 'مرحباً! اسمي سارة.' },
      { english: 'Hi! Nice to meet you.',               arabic: 'أهلاً! سعيد بلقائك.' },
      { english: 'Good morning! How are you?',          arabic: 'صباح الخير! كيف حالك؟' },
      { english: 'Good evening! Welcome.',              arabic: 'مساء الخير! أهلاً وسهلاً.' },
      { english: 'How are you? I am fine, thank you.',  arabic: 'كيف حالك؟ أنا بخير، شكراً.' },
    ],
    dialogue: [
      { speaker: 'A', name: 'Ahmed', english: "Hello! I'm Ahmed.",             arabic: 'مرحباً! أنا أحمد.' },
      { speaker: 'B', name: 'Sara',  english: "Hi Ahmed! I'm Sara.",            arabic: 'أهلاً أحمد! أنا سارة.' },
      { speaker: 'A', name: 'Ahmed', english: 'Good morning! How are you?',     arabic: 'صباح الخير! كيف حالك؟' },
      { speaker: 'B', name: 'Sara',  english: "I'm fine, thanks! And you?",     arabic: 'أنا بخير، شكراً! وأنت؟' },
      { speaker: 'A', name: 'Ahmed', english: "I'm great! Good evening, Sara.", arabic: 'أنا بخير جداً! مساء الخير يا سارة.' },
    ],
    exercises: [
      { type: 'mc',    tip_ar: 'ماذا تعني هذه الكلمة؟',               prompt: '👋  Hello',               options: ['مرحباً','شكراً','وداعاً','نعم'],                                                     correct: 0 },
      { type: 'mc',    tip_ar: 'ماذا تعني هذه الكلمة؟',               prompt: '🌅  Good morning',         options: ['مساء الخير','كيف حالك؟','صباح الخير','أهلاً'],                                       correct: 2 },
      { type: 'mc',    tip_ar: 'أي تحية تستخدم في المساء؟',           prompt: 'Which greeting is for evening?', options: ['Hello','Good morning','Hi','Good evening'],                                  correct: 3 },
      { type: 'mc',    tip_ar: 'ماذا تعني هذه العبارة؟',              prompt: '😊  How are you?',         options: ['ما اسمك؟','أين أنت؟','كيف حالك؟','من أنت؟'],                                       correct: 2 },
      { type: 'fill',  tip_ar: 'أكمل الجملة باختيار الكلمة الصحيحة', prompt: '___ ! My name is Sara.',    options: ['Hello','Goodbye','Please','Sorry'],                                                  correct: 0 },
      { type: 'fill',  tip_ar: 'اختر الكلمة الصحيحة',                 prompt: 'Good ___, how are you?',    options: ['night','morning','bye','please'],                                                    correct: 1 },
      { type: 'fill',  tip_ar: 'أكمل الجملة',                         prompt: '___, nice to meet you!',    options: ['Bye','Hi','No','Yes'],                                                               correct: 1 },
      { type: 'en_ar', tip_ar: 'اختر الترجمة العربية الصحيحة',        prompt: 'Good evening!',             options: ['صباح الخير!','كيف حالك؟','مساء الخير!'],                                            correct: 2 },
      { type: 'en_ar', tip_ar: 'ترجم هذه الجملة للعربية',             prompt: 'Hi! Nice to meet you.',     options: ['مرحباً! اسمي سارة.','أهلاً! سعيد بلقائك.','كيف حالك؟ أنا بخير.'],                  correct: 1 },
      { type: 'ar_en', tip_ar: 'اختر الترجمة الإنجليزية الصحيحة',     prompt: 'مرحباً!',                   options: ['Goodbye!','Please!','Hello!'],                                                       correct: 2 },
      { type: 'ar_en', tip_ar: 'ترجم هذه العبارة للإنجليزية',          prompt: 'كيف حالك؟',                 options: ["What's your name?","Where are you?","How are you?"],                                 correct: 2 },
      { type: 'order', tip_ar: 'رتب الكلمات لتكوين جملة صحيحة',       prompt: 'Good morning, how are you?', options: [], correct: 0, words: ['are','Good','morning,','you?','how'],               answer: ['Good','morning,','how','are','you?'] },
      { type: 'order', tip_ar: 'رتب الكلمات بالترتيب الصحيح',          prompt: 'Hello! My name is Sara.',   options: [], correct: 0, words: ['Sara.','Hello!','is','name','My'],                     answer: ['Hello!','My','name','is','Sara.'] },
    ],
  },
  {
    id: 'coffee', title: 'Coffee Shop', title_ar: 'في المقهى',
    level: 'A1', emoji: '☕', color: '#f59e0b',
    vocab: [
      { word: 'order',     pronunciation: 'OR-der',    translation_ar: 'يطلب',    emoji: '🛒', example: 'I want to order a coffee.' },
      { word: 'please',    pronunciation: 'pleez',     translation_ar: 'من فضلك', emoji: '🙏', example: 'A coffee, please.' },
      { word: 'ready',     pronunciation: 'RED-ee',    translation_ar: 'جاهز',    emoji: '✅', example: 'Your order is ready.' },
      { word: 'wait',      pronunciation: 'wayt',      translation_ar: 'ينتظر',   emoji: '⏳', example: 'Please wait a moment.' },
      { word: 'thank you', pronunciation: 'θæŋk juː', translation_ar: 'شكراً',   emoji: '🤝', example: 'Thank you very much!' },
    ],
    sentences: [
      { english: 'I want to order a coffee, please.',  arabic: 'أريد أن أطلب قهوة، من فضلك.' },
      { english: 'Your order is ready!',               arabic: 'طلبك جاهز!' },
      { english: 'Please wait a moment.',              arabic: 'من فضلك انتظر لحظة.' },
      { english: 'Thank you very much!',               arabic: 'شكراً جزيلاً!' },
      { english: 'Can I order a large coffee?',        arabic: 'هل يمكنني طلب قهوة كبيرة؟' },
    ],
    dialogue: [
      { speaker: 'A', name: 'Staff', english: 'Hello! Can I take your order?',    arabic: 'مرحباً! هل يمكنني أخذ طلبك؟' },
      { speaker: 'B', name: 'You',   english: 'Hi! A large coffee, please.',       arabic: 'أهلاً! قهوة كبيرة من فضلك.' },
      { speaker: 'A', name: 'Staff', english: 'Of course! Please wait a moment.', arabic: 'بالتأكيد! من فضلك انتظر لحظة.' },
      { speaker: 'B', name: 'You',   english: 'Thank you!',                        arabic: 'شكراً!' },
      { speaker: 'A', name: 'Staff', english: 'Your order is ready. Enjoy!',       arabic: 'طلبك جاهز. استمتع!' },
    ],
    exercises: [
      { type: 'mc',    tip_ar: 'ماذا تعني هذه الكلمة؟',               prompt: '🛒  order',                options: ['يطلب','يشرب','يذهب','يجلس'],                                                        correct: 0 },
      { type: 'mc',    tip_ar: 'ماذا تعني هذه الكلمة؟',               prompt: '✅  ready',                options: ['بطيء','جاهز','كبير','جميل'],                                                        correct: 1 },
      { type: 'mc',    tip_ar: 'ماذا تعني "thank you"؟',              prompt: 'thank you',                options: ['من فضلك','مرحباً','شكراً','وداعاً'],                                                 correct: 2 },
      { type: 'fill',  tip_ar: 'أكمل الجملة',                         prompt: 'A coffee, ___ .',           options: ['please','hello','ready','wait'],                                                     correct: 0 },
      { type: 'fill',  tip_ar: 'اختر الكلمة الصحيحة',                 prompt: 'Your order is ___ .',       options: ['wait','late','ready','big'],                                                         correct: 2 },
      { type: 'fill',  tip_ar: 'أكمل الجملة',                         prompt: 'Please ___ a moment.',      options: ['go','come','wait','sit'],                                                            correct: 2 },
      { type: 'en_ar', tip_ar: 'اختر الترجمة العربية الصحيحة',        prompt: 'Your order is ready!',      options: ['من فضلك انتظر.','شكراً جزيلاً!','طلبك جاهز!'],                                      correct: 2 },
      { type: 'en_ar', tip_ar: 'ترجم هذه الجملة للعربية',             prompt: 'Please wait a moment.',     options: ['طلبك جاهز.','من فضلك انتظر لحظة.','شكراً!'],                                        correct: 1 },
      { type: 'ar_en', tip_ar: 'ترجم للإنجليزية',                     prompt: 'شكراً!',                    options: ['Please!','Thank you!','Hello!'],                                                      correct: 1 },
      { type: 'ar_en', tip_ar: 'ترجم هذه الجملة للإنجليزية',          prompt: 'من فضلك انتظر لحظة.',       options: ['Your order is ready.','Please wait a moment.','Thank you very much!'],                correct: 1 },
      { type: 'order', tip_ar: 'رتب الكلمات لتكوين جملة صحيحة',       prompt: 'A large coffee, please.',   options: [], correct: 0, words: ['please.','A','coffee,','large'],                        answer: ['A','large','coffee,','please.'] },
    ],
  },
  {
    id: 'shopping', title: 'At the Store', title_ar: 'في المتجر',
    level: 'A2', emoji: '🛍️', color: '#f43f5e',
    vocab: [
      { word: 'buy',   pronunciation: 'baɪ',   translation_ar: 'يشتري',  emoji: '🛒', example: 'I want to buy this.' },
      { word: 'price', pronunciation: 'praɪs', translation_ar: 'السعر',  emoji: '💰', example: 'What is the price?' },
      { word: 'cheap', pronunciation: 'tʃiːp', translation_ar: 'رخيص',   emoji: '🏷️', example: 'This is very cheap!' },
      { word: 'help',  pronunciation: 'help',  translation_ar: 'مساعدة', emoji: '🤝', example: 'Can you help me?' },
      { word: 'size',  pronunciation: 'saɪz',  translation_ar: 'المقاس', emoji: '📏', example: 'What size is this?' },
    ],
    sentences: [
      { english: 'I want to buy this shirt.',          arabic: 'أريد أن أشتري هذا القميص.' },
      { english: 'What is the price of this?',         arabic: 'ما هو سعر هذا؟' },
      { english: 'This is very cheap!',                arabic: 'هذا رخيص جداً!' },
      { english: 'Can you help me, please?',           arabic: 'هل يمكنك مساعدتي من فضلك؟' },
      { english: 'Do you have a bigger size?',         arabic: 'هل لديك مقاس أكبر؟' },
    ],
    dialogue: [
      { speaker: 'A', name: 'Staff', english: 'Hello! Can I help you?',             arabic: 'مرحباً! هل يمكنني مساعدتك؟' },
      { speaker: 'B', name: 'You',   english: "Yes! I want to buy this bag.",        arabic: 'نعم! أريد أن أشتري هذه الحقيبة.' },
      { speaker: 'A', name: 'Staff', english: 'Great choice! What size?',            arabic: 'اختيار رائع! أي مقاس؟' },
      { speaker: 'B', name: 'You',   english: 'Medium, please. What is the price?',  arabic: 'وسط من فضلك. ما هو السعر؟' },
      { speaker: 'A', name: 'Staff', english: "It's only $20. Very cheap!",          arabic: 'إنها ٢٠ دولار فقط. رخيصة جداً!' },
    ],
    exercises: [
      { type: 'mc',    tip_ar: 'ماذا تعني هذه الكلمة؟',               prompt: '🛒  buy',                  options: ['يبيع','يشتري','يأخذ','يعطي'],                                                       correct: 1 },
      { type: 'mc',    tip_ar: 'ماذا تعني "price"؟',                  prompt: 'price',                    options: ['الحجم','اللون','السعر','الشكل'],                                                     correct: 2 },
      { type: 'mc',    tip_ar: 'ماذا تعني "cheap"؟',                  prompt: 'cheap',                    options: ['غالي','رخيص','جميل','كبير'],                                                         correct: 1 },
      { type: 'fill',  tip_ar: 'أكمل الجملة',                         prompt: 'I want to ___ this shirt.', options: ['buy','sell','make','use'],                                                           correct: 0 },
      { type: 'fill',  tip_ar: 'اختر الكلمة الصحيحة',                 prompt: 'What is the ___ ?',         options: ['color','name','price','size'],                                                       correct: 2 },
      { type: 'fill',  tip_ar: 'أكمل الجملة',                         prompt: 'Can you ___ me?',           options: ['help','see','love','know'],                                                          correct: 0 },
      { type: 'en_ar', tip_ar: 'ترجم للعربية',                        prompt: 'I want to buy this.',       options: ['ما هو السعر؟','أريد أن أشتري هذا.','هذا رخيص جداً.'],                              correct: 1 },
      { type: 'ar_en', tip_ar: 'ترجم للإنجليزية',                     prompt: 'هذا رخيص جداً!',            options: ['This is very big!','This is very cheap!','This is very good!'],                      correct: 1 },
      { type: 'ar_en', tip_ar: 'ترجم هذه الجملة',                     prompt: 'ما هو سعر هذا؟',            options: ['Can you help me?','What is the price?','Do you have a bigger size?'],                correct: 1 },
      { type: 'order', tip_ar: 'رتب الكلمات بالترتيب الصحيح',         prompt: 'What is the price?',        options: [], correct: 0, words: ['price?','is','What','the'],                              answer: ['What','is','the','price?'] },
    ],
  },
]

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadXp(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('inglizi_total_xp') ?? '0', 10)
}
function addXp(amount: number) {
  const next = loadXp() + amount
  localStorage.setItem('inglizi_total_xp', String(next))
  return next
}
function loadCompleted(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('inglizi_completed_lessons') ?? '[]') } catch { return [] }
}
function markCompleted(id: string) {
  const c = loadCompleted()
  if (!c.includes(id)) localStorage.setItem('inglizi_completed_lessons', JSON.stringify([...c, id]))
}

// ─── SpeechSynthesis helper ───────────────────────────────────────────────────

function speak(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang  = 'en-US'
  utt.rate  = 0.88
  utt.pitch = 1.05
  if (onEnd) utt.onend = onEnd
  window.speechSynthesis.speak(utt)
}

// ─── Audio Button ─────────────────────────────────────────────────────────────

function AudioBtn({
  text, size = 'md', color = '#10b981',
}: {
  text: string; size?: 'sm' | 'md' | 'lg'; color?: string
}) {
  const [playing, setPlaying] = useState(false)

  function play(e: React.MouseEvent) {
    e.stopPropagation()
    setPlaying(true)
    speak(text, () => setPlaying(false))
  }

  const dim = size === 'lg' ? 56 : size === 'sm' ? 32 : 44
  const fs  = size === 'lg' ? 24 : size === 'sm' ? 14 : 18

  return (
    <button
      onClick={play}
      className="flex items-center justify-center rounded-full transition-all active:scale-90 shrink-0"
      style={{
        width: dim, height: dim, fontSize: fs,
        background: playing ? `${color}28` : 'rgba(255,255,255,0.07)',
        border: `1.5px solid ${playing ? color + '60' : 'rgba(255,255,255,0.12)'}`,
        boxShadow: playing ? `0 0 14px ${color}40` : 'none',
      }}
      title="استمع"
    >
      {playing ? '🔊' : '🔈'}
    </button>
  )
}

// ─── Progress Header ──────────────────────────────────────────────────────────

function ProgressHeader({
  phase, phaseStep, phaseTotal, onBack, color,
}: {
  phase: Phase; phaseStep: number; phaseTotal: number; onBack: () => void; color: string
}) {
  const labels: Record<Phase, string> = {
    vocab: 'المفردات', sentences: 'الجمل', dialogue: 'الحوار', exercises: 'التمارين', complete: 'مكتمل',
  }
  const icons: Record<Phase, string> = {
    vocab: '📚', sentences: '✏️', dialogue: '💬', exercises: '🎯', complete: '🏆',
  }
  const allPhases: Phase[] = ['vocab', 'sentences', 'dialogue', 'exercises']
  const idx = allPhases.indexOf(phase)

  return (
    <div
      className="shrink-0 px-4 pt-16 pb-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.4)' }}
        >
          ← رجوع
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-lg">{icons[phase]}</span>
          <span className="text-white font-black text-sm" dir="rtl">{labels[phase]}</span>
        </div>

        <div
          className="px-2.5 py-2 rounded-xl text-xs font-black"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)' }}
        >
          {phaseStep}/{phaseTotal}
        </div>
      </div>

      {/* Phase dots */}
      <div className="flex gap-1.5 mb-2">
        {allPhases.map((p, i) => (
          <div
            key={p}
            className="flex-1 h-1.5 rounded-full transition-all duration-500"
            style={{
              background: i < idx
                ? color
                : i === idx
                  ? `${color}80`
                  : 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>

      {/* Step dots within phase */}
      {phaseTotal > 1 && (
        <div className="flex gap-1">
          {Array.from({ length: phaseTotal }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                background: i < phaseStep
                  ? color
                  : i === phaseStep - 1
                    ? `${color}90`
                    : 'rgba(255,255,255,0.06)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Vocab Phase ──────────────────────────────────────────────────────────────

function VocabPhase({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const [index,   setIndex]   = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [visible, setVisible] = useState(true)
  const word = lesson.vocab[index]

  // Auto-play each new word
  useEffect(() => {
    const t = setTimeout(() => speak(word.word), 350)
    return () => clearTimeout(t)
  }, [index, word.word])

  function next() {
    setVisible(false)
    setTimeout(() => {
      if (index < lesson.vocab.length - 1) {
        setIndex(i => i + 1); setFlipped(false); setVisible(true)
      } else { onDone() }
    }, 200)
  }

  function prev() {
    if (index === 0) return
    setVisible(false)
    setTimeout(() => { setIndex(i => i - 1); setFlipped(false); setVisible(true) }, 200)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ProgressHeader
        phase="vocab" phaseStep={index + 1} phaseTotal={lesson.vocab.length}
        onBack={prev} color={lesson.color}
      />

      <div
        className="flex-1 flex flex-col items-center justify-between px-5 py-6 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {/* Card */}
        <button
          onClick={() => setFlipped(f => !f)}
          className="flex-1 w-full max-w-sm flex flex-col items-center justify-center gap-5 rounded-3xl border transition-all duration-300 active:scale-[0.97]"
          style={{
            background: flipped ? `${lesson.color}10` : 'rgba(255,255,255,0.03)',
            border: `2px solid ${flipped ? lesson.color + '45' : 'rgba(255,255,255,0.08)'}`,
            boxShadow: flipped ? `0 0 40px ${lesson.color}18` : 'none',
          }}
        >
          {/* Audio button row */}
          <div className="flex items-center gap-3 -mb-2">
            <AudioBtn text={word.word} size="lg" color={lesson.color} />
          </div>

          <span className="text-7xl">{word.emoji}</span>

          <div className="text-center px-6">
            <p className="text-white text-4xl font-black leading-tight mb-1">{word.word}</p>
            <p className="text-white/30 text-base font-medium">[{word.pronunciation}]</p>
          </div>

          {/* Arabic reveal */}
          <div
            className="flex flex-col items-center gap-2 overflow-hidden transition-all duration-400 px-6"
            style={{ maxHeight: flipped ? 120 : 0, opacity: flipped ? 1 : 0 }}
          >
            <div className="h-px w-16 bg-white/10" />
            <p className="text-3xl font-black" style={{ color: lesson.color }} dir="rtl">
              {word.translation_ar}
            </p>
            <p className="text-white/30 text-sm italic text-center">{word.example}</p>
          </div>

          {!flipped && (
            <p className="text-white/20 text-sm pb-2">اضغط لترى الترجمة</p>
          )}
        </button>

        {/* Dot indicators */}
        <div className="flex gap-2 py-4">
          {lesson.vocab.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width:      i === index ? 20 : 8,
                height:     8,
                background: i === index ? lesson.color : i < index ? `${lesson.color}60` : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={next}
          className="w-full max-w-sm py-4 rounded-2xl font-black text-lg text-white transition-all active:scale-[0.97] shadow-lg"
          style={{ background: lesson.color, boxShadow: `0 8px 24px ${lesson.color}40` }}
        >
          {index < lesson.vocab.length - 1 ? 'الكلمة التالية →' : 'ابدأ الجمل 🚀'}
        </button>
      </div>
    </div>
  )
}

// ─── Sentences Phase ──────────────────────────────────────────────────────────

function SentencesPhase({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const [index,    setIndex]    = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [visible,  setVisible]  = useState(true)
  const s = lesson.sentences[index]

  function next() {
    setVisible(false)
    setTimeout(() => {
      if (index < lesson.sentences.length - 1) {
        setIndex(i => i + 1); setRevealed(false); setVisible(true)
      } else { onDone() }
    }, 200)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ProgressHeader
        phase="sentences" phaseStep={index + 1} phaseTotal={lesson.sentences.length}
        onBack={() => { if (index > 0) { setIndex(i => i - 1); setRevealed(false) } }}
        color={lesson.color}
      />

      <div
        className="flex-1 flex flex-col items-center justify-between px-5 py-6 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center gap-4">
          <div
            className="w-full rounded-3xl p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* English + audio */}
            <div className="flex items-start gap-3 mb-4">
              <AudioBtn text={s.english} size="md" color={lesson.color} />
              <p className="text-white text-xl font-bold leading-relaxed">{s.english}</p>
            </div>

            {/* Arabic reveal */}
            {revealed ? (
              <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-2xl font-bold leading-relaxed" style={{ color: lesson.color }} dir="rtl">
                  {s.arabic}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="mt-1 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{ background: `${lesson.color}18`, border: `1px solid ${lesson.color}40`, color: lesson.color }}
              >
                🔍 اضغط لرؤية الترجمة
              </button>
            )}
          </div>
        </div>

        <button
          onClick={next}
          disabled={!revealed}
          className="w-full max-w-sm py-4 rounded-2xl font-black text-lg text-white transition-all active:scale-[0.97] shadow-lg disabled:opacity-30"
          style={{ background: lesson.color, boxShadow: `0 8px 24px ${lesson.color}40` }}
        >
          {index < lesson.sentences.length - 1 ? 'الجملة التالية →' : 'ابدأ الحوار 💬'}
        </button>
      </div>
    </div>
  )
}

// ─── Dialogue Phase ───────────────────────────────────────────────────────────

function DialoguePhase({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const [shown,    setShown]    = useState(0)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (shown < lesson.dialogue.length) {
      const t = setTimeout(() => setShown(s => s + 1), shown === 0 ? 500 : 800)
      return () => clearTimeout(t)
    }
  }, [shown, lesson.dialogue.length])

  const allShown = shown >= lesson.dialogue.length

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ProgressHeader
        phase="dialogue"
        phaseStep={Math.min(shown, lesson.dialogue.length)} phaseTotal={lesson.dialogue.length}
        onBack={() => {}} color={lesson.color}
      />

      <div className="flex-1 flex flex-col justify-between px-4 py-4 overflow-hidden">
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-4">
          {lesson.dialogue.map((line, i) => {
            const isA       = line.speaker === 'A'
            const isVisible = i < shown
            const isRev     = revealed.has(i)

            return (
              <div
                key={i}
                className="transition-all duration-500"
                style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(16px)' }}
              >
                <div className={`flex gap-3 items-start ${isA ? '' : 'flex-row-reverse'}`}>
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs font-black"
                    style={{
                      background: isA ? `${lesson.color}20` : 'rgba(99,102,241,0.2)',
                      color:      isA ? lesson.color         : '#818cf8',
                      border:     `1px solid ${isA ? lesson.color + '30' : 'rgba(99,102,241,0.3)'}`,
                    }}
                  >
                    {line.name[0]}
                  </div>

                  {/* Bubble */}
                  <button
                    onClick={() => {
                      setRevealed(r => new Set([...r, i]))
                      speak(line.english)
                    }}
                    className={`max-w-[72%] rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] ${isA ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}
                    style={{
                      background: isA ? `${lesson.color}12` : 'rgba(99,102,241,0.12)',
                      border:     `1px solid ${isA ? lesson.color + '25' : 'rgba(99,102,241,0.25)'}`,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <p className="text-white text-sm font-medium leading-relaxed flex-1">{line.english}</p>
                      <span className="text-base shrink-0 opacity-40">{isRev ? '🔊' : '🔈'}</span>
                    </div>
                    {isRev && (
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: isA ? lesson.color + 'aa' : '#818cf8aa' }} dir="rtl">
                        {line.arabic}
                      </p>
                    )}
                    {!isRev && isVisible && (
                      <p className="text-white/15 text-xs mt-1">اضغط للاستماع...</p>
                    )}
                  </button>
                </div>

                {/* Name */}
                {isVisible && (
                  <p
                    className="text-white/20 text-xs mt-1"
                    style={{ marginLeft: isA ? 52 : 0, marginRight: isA ? 0 : 52, textAlign: isA ? 'left' : 'right' }}
                  >
                    {line.name}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={onDone}
          disabled={!allShown}
          className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all active:scale-[0.97] shadow-lg disabled:opacity-30"
          style={{ background: lesson.color, boxShadow: `0 8px 24px ${lesson.color}40` }}
        >
          {allShown ? 'ابدأ التمارين 🎯' : 'جاري تحميل الحوار...'}
        </button>
      </div>
    </div>
  )
}

// ─── Order Exercise ───────────────────────────────────────────────────────────

function OrderExercise({
  exercise, color, onAnswer,
}: {
  exercise: Exercise; color: string; onAnswer: (correct: boolean) => void
}) {
  const words   = exercise.words   ?? []
  const answer  = exercise.answer  ?? []
  const [placed,  setPlaced]  = useState<number[]>([])
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)

  const placedWords = placed.map(i => words[i])
  const remaining   = words.map((w, i) => ({ w, i })).filter(({ i }) => !placed.includes(i))

  function place(idx: number)    { if (!checked) setPlaced(p => [...p, idx]) }
  function removeAt(pos: number) { if (!checked) setPlaced(p => p.filter((_, i) => i !== pos)) }

  function check() {
    const ok = placedWords.join(' ') === answer.join(' ')
    setCorrect(ok)
    setChecked(true)
    onAnswer(ok)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {checked && !correct && (
        <div className="px-4 py-3 rounded-2xl text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <p className="text-white/40 text-xs mb-1" dir="rtl">الجملة الصحيحة</p>
          <p className="text-green-300 font-bold">{answer.join(' ')}</p>
        </div>
      )}

      <div
        className="min-h-16 rounded-2xl p-3 flex flex-wrap gap-2 items-center"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1.5px dashed ${checked ? (correct ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)') : 'rgba(255,255,255,0.12)'}`,
        }}
      >
        {placedWords.length === 0 && (
          <p className="text-white/20 text-sm w-full text-center" dir="rtl">اضغط على الكلمات أدناه...</p>
        )}
        {placedWords.map((w, pos) => (
          <button
            key={pos}
            onClick={() => removeAt(pos)}
            disabled={checked}
            className="px-3 py-1.5 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{
              background: checked ? (correct ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') : `${color}15`,
              border:     checked ? (correct ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(239,68,68,0.4)') : `1px solid ${color}40`,
              color:      checked ? (correct ? '#6ee7b7' : '#fca5a5') : '#fff',
            }}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {remaining.map(({ w, i }) => (
          <button
            key={i}
            onClick={() => place(i)}
            disabled={checked}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {w}
          </button>
        ))}
      </div>

      {!checked && placedWords.length === words.length && (
        <button
          onClick={check}
          className="w-full py-3.5 rounded-2xl font-black text-base text-white transition-all active:scale-[0.97]"
          style={{ background: color, boxShadow: `0 6px 20px ${color}40` }}
        >
          تحقق ✓
        </button>
      )}
    </div>
  )
}

// ─── Exercises Phase ──────────────────────────────────────────────────────────

function ExercisesPhase({ lesson, onDone }: { lesson: Lesson; onDone: (score: number) => void }) {
  const [index,    setIndex]    = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [orderOk,  setOrderOk]  = useState<boolean | null>(null)
  const [score,    setScore]    = useState(0)
  const [visible,  setVisible]  = useState(true)

  const ex         = lesson.exercises[index]
  const isAnswered = ex.type === 'order' ? orderOk !== null : selected !== null
  const isCorrect  = ex.type === 'order' ? orderOk === true  : selected === ex.correct
  const totalEx    = lesson.exercises.length

  function handleSelect(i: number) {
    if (selected !== null) return
    setSelected(i)
    if (i === ex.correct) setScore(s => s + 1)
    if (ex.type !== 'order') {
      const optText = ex.options[i]
      if (optText && /^[A-Za-z]/.test(optText)) speak(optText)
    }
  }

  function handleOrderAnswer(ok: boolean) {
    setOrderOk(ok)
    if (ok) setScore(s => s + 1)
  }

  function handleNext() {
    setVisible(false)
    setTimeout(() => {
      if (index < totalEx - 1) {
        setIndex(i => i + 1); setSelected(null); setOrderOk(null); setVisible(true)
      } else {
        onDone(score)
      }
    }, 220)
  }

  const typeLabel: Record<ExType, string> = {
    mc: 'اختيار متعدد', fill: 'أكمل الجملة', en_ar: 'ترجم للعربية', ar_en: 'ترجم للإنجليزية', order: 'رتب الجملة',
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ProgressHeader
        phase="exercises" phaseStep={index + 1} phaseTotal={totalEx}
        onBack={() => {}} color={lesson.color}
      />

      <div
        className="flex-1 flex flex-col px-4 pt-4 pb-2 transition-opacity duration-200 overflow-hidden"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {/* Badge + tip */}
        <div className="mb-4 flex flex-col gap-1.5">
          <span
            className="self-start text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: `${lesson.color}15`, color: lesson.color, border: `1px solid ${lesson.color}30` }}
          >
            {typeLabel[ex.type]}
          </span>
          <p className="text-white/50 text-sm font-medium" dir="rtl">{ex.tip_ar}</p>
        </div>

        {/* Prompt */}
        {ex.type !== 'order' && (
          <div
            className="rounded-2xl p-5 mb-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3">
              {/^[A-Za-z]/.test(ex.prompt.replace(/^[^\w]*/, '')) && ex.type !== 'ar_en' && (
                <AudioBtn text={ex.prompt.replace(/^[^\w]*/, '')} size="sm" color={lesson.color} />
              )}
              <p
                className="font-black leading-relaxed flex-1 text-center"
                dir={ex.type === 'ar_en' ? 'rtl' : 'ltr'}
                style={{ fontSize: ex.prompt.length > 30 ? 18 : 22, color: '#fff' }}
              >
                {ex.prompt}
              </p>
            </div>
          </div>
        )}

        {/* Order exercise */}
        {ex.type === 'order' && (
          <div className="mb-4">
            <div className="px-4 py-3 rounded-2xl mb-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white/30 text-xs mb-1" dir="rtl">كوّن هذه الجملة</p>
              <p className="text-indigo-300 text-sm font-bold">{ex.prompt}</p>
            </div>
            <OrderExercise exercise={ex} color={lesson.color} onAnswer={handleOrderAnswer} />
          </div>
        )}

        {/* Options */}
        {ex.type !== 'order' && (
          <div className="flex flex-col gap-2.5 flex-1">
            {ex.options.map((opt, i) => {
              const isSelected = selected === i
              const isRight    = i === ex.correct

              let bg      = 'rgba(255,255,255,0.04)'
              let border  = '1px solid rgba(255,255,255,0.10)'
              let color   = 'rgba(255,255,255,0.85)'

              if (selected !== null) {
                if (isRight)                     { bg = 'rgba(16,185,129,0.15)';  border = '1.5px solid rgba(16,185,129,0.5)'; color = '#6ee7b7' }
                else if (isSelected && !isRight) { bg = 'rgba(239,68,68,0.12)';   border = '1.5px solid rgba(239,68,68,0.4)';  color = '#fca5a5' }
                else                             { bg = 'rgba(255,255,255,0.02)';  border = '1px solid rgba(255,255,255,0.04)'; color = 'rgba(255,255,255,0.2)' }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  dir={ex.type === 'en_ar' ? 'rtl' : 'ltr'}
                  className="w-full py-4 px-5 rounded-2xl text-left font-semibold text-base transition-all duration-150 active:scale-[0.97]"
                  style={{ background: bg, border, color }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {/* Feedback */}
        {isAnswered && (
          <div
            className="mt-3 rounded-2xl px-5 py-4 flex items-center justify-between shrink-0"
            style={{
              background: isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)',
              border:     isCorrect ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <div dir="rtl">
              <p className={`font-black text-lg ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '✅ ممتاز!' : '❌ حاول مجدداً!'}
              </p>
              {!isCorrect && ex.type !== 'order' && (
                <p className="text-white/40 text-xs mt-0.5">
                  الصحيح: <span className="text-green-400 font-bold">{ex.options[ex.correct]}</span>
                </p>
              )}
            </div>
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl font-black text-sm text-white transition-all active:scale-95 shadow-md"
              style={{ background: lesson.color, boxShadow: `0 4px 16px ${lesson.color}40` }}
            >
              {index < totalEx - 1 ? 'التالي →' : '🏁 النتائج'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Complete Screen ──────────────────────────────────────────────────────────

function CompleteScreen({
  lesson, score, onReplay, onBack,
}: {
  lesson: Lesson; score: number; onReplay: () => void; onBack: () => void
}) {
  const total    = lesson.exercises.length
  const pct      = Math.round((score / total) * 100)
  const xpEarned = Math.round((score / total) * 100) + 50

  useEffect(() => {
    markCompleted(lesson.id)
    addXp(xpEarned)
  }, [lesson.id, xpEarned])

  const medal = pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 60 ? '💪' : '📚'
  const msg   = pct === 100
    ? 'نتيجة مثالية! أنت رائع! 🎉'
    : pct >= 80 ? 'ممتاز جداً! استمر هكذا!'
    : pct >= 60 ? 'جيد! التدريب يصنع الفارق'
    :             'لا بأس، كرر الدرس!'

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center">
      {/* Medal */}
      <div
        className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl"
        style={{
          background: `${lesson.color}18`,
          border: `2px solid ${lesson.color}40`,
          boxShadow: `0 0 48px ${lesson.color}30`,
        }}
      >
        {medal}
      </div>

      <div dir="rtl">
        <h2 className="text-white text-4xl font-black mb-1">{pct}%</h2>
        <p className="text-white/45 text-base">{msg}</p>
        <p className="text-yellow-400 font-bold text-sm mt-1.5">+{xpEarned} XP مكتسبة ⚡</p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 w-full max-w-xs">
        <div className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl bg-green-500/10 border border-green-500/20">
          <span className="text-2xl font-black text-green-400">{score}</span>
          <span className="text-green-400/50 text-xs" dir="rtl">صحيح</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <span className="text-2xl font-black text-red-400">{total - score}</span>
          <span className="text-red-400/50 text-xs" dir="rtl">خطأ</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-2xl font-black text-amber-400">{total}</span>
          <span className="text-amber-400/50 text-xs" dir="rtl">سؤال</span>
        </div>
      </div>

      {/* Vocab review */}
      <div className="w-full max-w-xs" dir="rtl">
        <p className="text-white/25 text-xs mb-2">الكلمات التي تعلمتها</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {lesson.vocab.map((v, i) => (
            <button
              key={i}
              onClick={() => speak(v.word)}
              className="text-sm px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95"
              style={{ background: `${lesson.color}12`, border: `1px solid ${lesson.color}30`, color: lesson.color }}
            >
              {v.emoji} {v.word}
            </button>
          ))}
        </div>
        <p className="text-white/15 text-xs mt-2 text-center">اضغط على الكلمة لتسمعها 🔊</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-2xl font-bold text-sm text-white/50 transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          ← الدروس
        </button>
        <button
          onClick={onReplay}
          className="flex-1 py-4 rounded-2xl font-black text-base text-white transition-all active:scale-95 shadow-lg"
          style={{ background: lesson.color, boxShadow: `0 8px 24px ${lesson.color}40` }}
        >
          مجدداً 🔄
        </button>
      </div>
    </div>
  )
}

// ─── Lesson Player ────────────────────────────────────────────────────────────

function LessonPlayer({ lesson, onBack }: { lesson: Lesson; onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('vocab')
  const [score, setScore] = useState(0)

  function reset() { setPhase('vocab'); setScore(0) }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: 'linear-gradient(160deg,#060d1a 0%,#0a1120 60%,#060d1a 100%)' }}
    >
      {phase === 'vocab'     && <VocabPhase     lesson={lesson} onDone={() => setPhase('sentences')} />}
      {phase === 'sentences' && <SentencesPhase lesson={lesson} onDone={() => setPhase('dialogue')} />}
      {phase === 'dialogue'  && <DialoguePhase  lesson={lesson} onDone={() => setPhase('exercises')} />}
      {phase === 'exercises' && (
        <ExercisesPhase lesson={lesson} onDone={s => { setScore(s); setPhase('complete') }} />
      )}
      {phase === 'complete' && (
        <CompleteScreen lesson={lesson} score={score} onReplay={reset} onBack={onBack} />
      )}
    </div>
  )
}

// ─── Lesson List ──────────────────────────────────────────────────────────────

function LessonList({ onSelect }: { onSelect: (l: Lesson) => void }) {
  const [completed, setCompleted] = useState<string[]>([])
  const [totalXp,   setTotalXp]   = useState(0)

  useEffect(() => {
    setCompleted(loadCompleted())
    setTotalXp(loadXp())
  }, [])

  const byLevel = ['A1', 'A2'].map(lvl => ({
    lvl,
    lessons: LESSONS.filter(l => l.level === lvl),
  })).filter(g => g.lessons.length > 0)

  return (
    <div
      className="min-h-screen px-4 pt-20 pb-12"
      style={{ background: 'linear-gradient(160deg,#060d1a 0%,#0a1120 60%,#060d1a 100%)' }}
    >
      <div className="max-w-sm mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-5xl mb-3">🗣️</p>
          <h1 className="text-white text-3xl font-black mb-2" dir="rtl">تعلم المحادثة</h1>
          <p className="text-white/30 text-sm" dir="rtl">
            مفردات · جمل · حوار · تمارين — مع صوت لكل كلمة 🔊
          </p>
          {totalXp > 0 && (
            <div
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <span className="text-yellow-400 font-black">⚡ {totalXp} XP</span>
            </div>
          )}
        </div>

        {/* Lessons grouped by level */}
        <div className="flex flex-col gap-8">
          {byLevel.map(({ lvl, lessons }) => (
            <div key={lvl}>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-white/8" />
                <span
                  className="text-xs font-black px-3 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
                >
                  مستوى {lvl}
                </span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <div className="flex flex-col gap-3">
                {lessons.map(lesson => {
                  const isDone = completed.includes(lesson.id)
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onSelect(lesson)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
                      style={{
                        background: isDone ? `${lesson.color}08` : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${isDone ? lesson.color + '30' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: isDone ? `0 0 18px ${lesson.color}15` : 'none',
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                        style={{
                          background: `${lesson.color}15`,
                          border: `1px solid ${lesson.color}30`,
                          boxShadow: isDone ? `0 0 16px ${lesson.color}25` : 'none',
                        }}
                      >
                        {lesson.emoji}
                      </div>

                      <div className="flex-1" dir="rtl">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white font-black text-base">{lesson.title_ar}</p>
                          {isDone && (
                            <span className="text-xs px-1.5 py-0.5 rounded-md bg-green-500/15 text-green-400 font-bold">✓</span>
                          )}
                        </div>
                        <p className="text-white/30 text-xs">
                          {lesson.title} · {lesson.vocab.length} كلمات · {lesson.exercises.length} تمرين
                        </p>

                        {/* Vocab preview with audio hint */}
                        <div className="flex gap-1 mt-1.5 flex-wrap items-center">
                          {lesson.vocab.slice(0, 3).map((v, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-lg font-medium flex items-center gap-1"
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}
                            >
                              {v.word}
                            </span>
                          ))}
                          {lesson.vocab.length > 3 && (
                            <span className="text-xs text-white/20">+{lesson.vocab.length - 3}</span>
                          )}
                          <span className="text-xs text-white/15 mr-1">🔊</span>
                        </div>
                      </div>

                      <span className="text-white/20 text-lg shrink-0">←</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Phase guide */}
        <div
          className="mt-8 p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-white/30 text-xs font-black mb-3 text-center" dir="rtl">كيف يعمل كل درس</p>
          <div className="flex justify-around">
            {[
              { icon: '📚', label: 'مفردات' },
              { icon: '✏️', label: 'جمل' },
              { icon: '💬', label: 'حوار' },
              { icon: '🎯', label: 'تمارين' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-white/25 text-xs" dir="rtl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Inner component (needs Suspense for useSearchParams) ────────────────────

function LearnInner() {
  const searchParams = useSearchParams()
  const [active, setActive] = useState<Lesson | null>(null)

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      const lesson = LESSONS.find(l => l.id === id)
      if (lesson) setActive(lesson)
    }
  }, [searchParams])

  if (active) {
    return <LessonPlayer lesson={active} onBack={() => setActive(null)} />
  }
  return <LessonList onSelect={setActive} />
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg,#060d1a 0%,#0a1120 60%,#060d1a 100%)' }}
      >
        <p className="text-white/30 text-sm" dir="rtl">جاري التحميل...</p>
      </div>
    }>
      <LearnInner />
    </Suspense>
  )
}
