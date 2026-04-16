'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Gamepad2, Sparkles, Zap, Heart, Flame,
  ArrowRight, RefreshCw, Home, MessageCircle,
  Shuffle, Link2, Blocks, Star, Crown, Timer,
  CheckCircle2, XCircle, Rocket, Target,
} from 'lucide-react'

// ═════════════════════════════════════════════════════════════════════════════
//   PLAY PAGE — Word games with Teacher Hamza from Oued Zem
//   Mini-games: Scramble · Match · Sentence Builder
// ═════════════════════════════════════════════════════════════════════════════

const WHATSAPP_NUMBER = '212707902091'
const STORAGE_KEY = 'inglizi-play-progress'

// ─── Teacher Hamza personality — funny Moroccan messages ─────────────────────

const HAMZA_CORRECT = [
  'MashaAllah! تقدر تكون من طلاب تيتشر حمزة 💪',
  'يا حيا الله! واد زم فخور بيك 🏆',
  'Excellent! هاد الجواب على طريقة واد زم 🔥',
  'زوين! أستاذ حمزة القصراوي راه كيبتاسم دابا 😎',
  'Bravo! راه كتعلم الإنجليزية كما لو أنك في واد زم 🌟',
  'Perfect! ديريها ديريها، أستاذك فخور 🎯',
  'Amazing! الإنجليزية بدات تولي ساهلة ها 🚀',
]

const HAMZA_WRONG = [
  'لا لا، في واد زم ما كنديروش هكا 😄 حاول مرة أخرى',
  'قريب... بصح أستاذ حمزة كيقول لك: ركز شوية 🤓',
  'Oops! هاد غير بداية، كاين تحسن 💪',
  'آش هاد الجواب دابا؟ 😂 جرب مرة أخرى',
  'Not bad! بصح كاين شي حاجة خاصني نعلمك ليها 📚',
  'راك قريب للجواب الصحيح، لا تستسلم! 💡',
]

const LEVEL_MESSAGES = [
  { threshold: 0,    emoji: '🌱', title: 'مبتدئ من واد زم',      desc: 'بدايتك مع تيتشر حمزة' },
  { threshold: 50,   emoji: '🌿', title: 'طالب نشيط',             desc: 'ديرها ديرها!' },
  { threshold: 150,  emoji: '🔥', title: 'طالب مميز',             desc: 'أستاذ حمزة لاحظك' },
  { threshold: 300,  emoji: '⭐', title: 'نجم الفصل',             desc: 'واد زم فخور بيك' },
  { threshold: 500,  emoji: '👑', title: 'بطل اللغة',              desc: 'تلميذ من النخبة' },
  { threshold: 1000, emoji: '🏆', title: 'أسطورة واد زم',          desc: 'Teacher Hamza approved!' },
]

function getLevel(xp: number) {
  return [...LEVEL_MESSAGES].reverse().find(l => xp >= l.threshold) ?? LEVEL_MESSAGES[0]
}

// ─── Word Pool for Scramble & Match ──────────────────────────────────────────

type Difficulty = 1 | 2 | 3

interface WordPair {
  en: string
  ar: string
  emoji: string
  lvl: Difficulty
  hint?: string
}

const WORDS: WordPair[] = [
  // ─── LEVEL 1 — Easy (3-5 letters, common words) ───────────────────────────
  { en: 'book',    ar: 'كتاب',   emoji: '📚', lvl: 1 },
  { en: 'pen',     ar: 'قلم',    emoji: '✒️', lvl: 1 },
  { en: 'tea',     ar: 'شاي',    emoji: '🍵', lvl: 1, hint: 'أتاي بالنعناع' },
  { en: 'water',   ar: 'ماء',    emoji: '💧', lvl: 1 },
  { en: 'bread',   ar: 'خبز',    emoji: '🍞', lvl: 1, hint: 'خبز ديال واد زم' },
  { en: 'apple',   ar: 'تفاحة',  emoji: '🍎', lvl: 1 },
  { en: 'mother',  ar: 'أم',     emoji: '👩', lvl: 1 },
  { en: 'father',  ar: 'أب',     emoji: '👨', lvl: 1 },
  { en: 'house',   ar: 'بيت',    emoji: '🏠', lvl: 1 },
  { en: 'city',    ar: 'مدينة',  emoji: '🏙️', lvl: 1, hint: 'مثل واد زم' },
  { en: 'sun',     ar: 'شمس',    emoji: '☀️', lvl: 1 },
  { en: 'moon',    ar: 'قمر',    emoji: '🌙', lvl: 1 },
  { en: 'rain',    ar: 'مطر',    emoji: '🌧️', lvl: 1 },
  { en: 'tree',    ar: 'شجرة',   emoji: '🌳', lvl: 1 },
  { en: 'happy',   ar: 'سعيد',   emoji: '😊', lvl: 1 },
  { en: 'sad',     ar: 'حزين',   emoji: '😢', lvl: 1 },
  { en: 'play',    ar: 'يلعب',   emoji: '🎮', lvl: 1 },
  { en: 'run',     ar: 'يجري',   emoji: '🏃', lvl: 1 },
  { en: 'eat',     ar: 'يأكل',   emoji: '🍴', lvl: 1 },
  { en: 'road',    ar: 'طريق',   emoji: '🛣️', lvl: 1 },
  { en: 'friend',  ar: 'صديق',   emoji: '🤝', lvl: 1 },
  { en: 'car',     ar: 'سيارة',  emoji: '🚗', lvl: 1 },
  { en: 'dog',     ar: 'كلب',    emoji: '🐶', lvl: 1 },
  { en: 'cat',     ar: 'قطة',    emoji: '🐱', lvl: 1 },

  // ─── LEVEL 2 — Medium (5-7 letters) ───────────────────────────────────────
  { en: 'teacher',   ar: 'أستاذ',    emoji: '👨‍🏫', lvl: 2, hint: 'مثل حمزة القصراوي' },
  { en: 'student',   ar: 'طالب',     emoji: '🎓',   lvl: 2, hint: 'أنت واحد منهم!' },
  { en: 'school',    ar: 'مدرسة',    emoji: '🏫',   lvl: 2 },
  { en: 'tagine',    ar: 'طاجين',    emoji: '🍲',   lvl: 2, hint: 'الأكلة المغربية الشهيرة' },
  { en: 'coffee',    ar: 'قهوة',     emoji: '☕',   lvl: 2 },
  { en: 'orange',    ar: 'برتقال',   emoji: '🍊',   lvl: 2 },
  { en: 'brother',   ar: 'أخ',       emoji: '🧑',   lvl: 2 },
  { en: 'sister',    ar: 'أخت',      emoji: '👧',   lvl: 2 },
  { en: 'family',    ar: 'عائلة',    emoji: '👪',   lvl: 2 },
  { en: 'market',    ar: 'سوق',      emoji: '🛒',   lvl: 2 },
  { en: 'mosque',    ar: 'مسجد',     emoji: '🕌',   lvl: 2 },
  { en: 'garden',    ar: 'حديقة',    emoji: '🌳',   lvl: 2 },
  { en: 'tired',     ar: 'متعب',     emoji: '😴',   lvl: 2 },
  { en: 'hungry',    ar: 'جائع',     emoji: '🍽️',  lvl: 2 },
  { en: 'learn',     ar: 'يتعلم',    emoji: '🧠',   lvl: 2, hint: 'الي كتديرو دابا' },
  { en: 'sleep',     ar: 'ينام',     emoji: '😴',   lvl: 2 },
  { en: 'window',    ar: 'نافذة',    emoji: '🪟',   lvl: 2 },
  { en: 'kitchen',   ar: 'مطبخ',     emoji: '🍳',   lvl: 2 },
  { en: 'morning',   ar: 'صباح',     emoji: '🌅',   lvl: 2 },
  { en: 'evening',   ar: 'مساء',     emoji: '🌆',   lvl: 2 },
  { en: 'weather',   ar: 'طقس',      emoji: '🌤️',   lvl: 2 },
  { en: 'doctor',    ar: 'طبيب',     emoji: '⚕️',   lvl: 2 },
  { en: 'music',     ar: 'موسيقى',   emoji: '🎵',   lvl: 2 },
  { en: 'summer',    ar: 'صيف',      emoji: '🏖️',   lvl: 2 },
  { en: 'winter',    ar: 'شتاء',     emoji: '❄️',   lvl: 2 },

  // ─── LEVEL 3 — Hard (8+ letters or tricky) ────────────────────────────────
  { en: 'beautiful',    ar: 'جميل',         emoji: '✨',   lvl: 3 },
  { en: 'delicious',    ar: 'لذيذ',         emoji: '😋',   lvl: 3, hint: 'كتوصف بيه الطاجين' },
  { en: 'breakfast',    ar: 'فطور',         emoji: '🍳',   lvl: 3 },
  { en: 'important',    ar: 'مهم',          emoji: '⚡',   lvl: 3 },
  { en: 'beginner',     ar: 'مبتدئ',        emoji: '🌱',   lvl: 3 },
  { en: 'adventure',    ar: 'مغامرة',       emoji: '🗺️',   lvl: 3 },
  { en: 'knowledge',    ar: 'معرفة',        emoji: '🎓',   lvl: 3 },
  { en: 'different',    ar: 'مختلف',        emoji: '🔀',   lvl: 3 },
  { en: 'practice',     ar: 'تمرين',        emoji: '💪',   lvl: 3, hint: 'الي كنديرو في إنجليزي.كوم' },
  { en: 'language',     ar: 'لغة',          emoji: '🗣️',   lvl: 3 },
  { en: 'exercise',     ar: 'تمرين رياضي',  emoji: '🏋️',   lvl: 3 },
  { en: 'wonderful',    ar: 'رائع',         emoji: '🌟',   lvl: 3 },
  { en: 'opportunity',  ar: 'فرصة',         emoji: '🎯',   lvl: 3 },
  { en: 'experience',   ar: 'تجربة',        emoji: '🧭',   lvl: 3 },
  { en: 'discover',     ar: 'يكتشف',        emoji: '🔍',   lvl: 3 },
  { en: 'successful',   ar: 'ناجح',         emoji: '🏆',   lvl: 3 },
  { en: 'confident',    ar: 'واثق',         emoji: '💪',   lvl: 3 },
  { en: 'favourite',    ar: 'مفضل',         emoji: '❤️',   lvl: 3 },
  { en: 'vegetables',   ar: 'خضروات',       emoji: '🥬',   lvl: 3 },
  { en: 'dictionary',   ar: 'قاموس',        emoji: '📖',   lvl: 3 },
]

// ─── Sentence Pool for Builder ───────────────────────────────────────────────

interface SentenceChallenge {
  en: string          // target sentence (space-separated words)
  ar: string          // Arabic translation for the hint
  difficulty: Difficulty
  topic?: string
}

const SENTENCES: SentenceChallenge[] = [
  // ─── LEVEL 1 — Easy (short, 4-6 words) ────────────────────────────────────
  { en: 'I am a student',                           ar: 'أنا طالب',                           difficulty: 1 },
  { en: 'My name is Hamza',                         ar: 'اسمي حمزة',                          difficulty: 1 },
  { en: 'I live in Oued Zem',                       ar: 'أعيش في واد زم',                     difficulty: 1 },
  { en: 'She is my sister',                         ar: 'هي أختي',                            difficulty: 1 },
  { en: 'I drink tea every morning',                ar: 'أشرب الشاي كل صباح',                 difficulty: 1 },
  { en: 'We go to school',                          ar: 'نذهب إلى المدرسة',                   difficulty: 1 },
  { en: 'The weather is nice today',                ar: 'الطقس لطيف اليوم',                   difficulty: 1 },
  { en: 'I have a small dog',                       ar: 'عندي كلب صغير',                      difficulty: 1 },
  { en: 'He reads a book every night',              ar: 'يقرأ كتاباً كل ليلة',                difficulty: 1 },
  { en: 'My father works in the city',              ar: 'أبي يعمل في المدينة',                difficulty: 1 },

  // ─── LEVEL 2 — Medium (6-9 words) ─────────────────────────────────────────
  { en: 'I am a student from Oued Zem',             ar: 'أنا طالب من واد زم',                 difficulty: 2, topic: 'intro' },
  { en: 'My teacher is Hamza el Qasraoui',          ar: 'أستاذي هو حمزة القصراوي',            difficulty: 2, topic: 'intro' },
  { en: 'I love learning English every day',        ar: 'أحب تعلم الإنجليزية كل يوم',         difficulty: 2, topic: 'daily' },
  { en: 'She drinks tea in the morning',            ar: 'هي تشرب الشاي في الصباح',            difficulty: 2, topic: 'daily' },
  { en: 'We go to school by bus',                   ar: 'نذهب إلى المدرسة بالحافلة',          difficulty: 2, topic: 'daily' },
  { en: 'The weather is beautiful today',           ar: 'الطقس جميل اليوم',                   difficulty: 2, topic: 'weather' },
  { en: 'He is my best friend in class',            ar: 'هو صديقي المفضل في الفصل',           difficulty: 2, topic: 'friends' },
  { en: 'My mother cooks a delicious tagine',       ar: 'أمي تطبخ طاجيناً لذيذاً',            difficulty: 2, topic: 'food' },
  { en: 'I study English with Teacher Hamza',       ar: 'أدرس الإنجليزية مع تيتشر حمزة',       difficulty: 2, topic: 'learning' },
  { en: 'Oued Zem is a beautiful city',             ar: 'واد زم مدينة جميلة',                 difficulty: 2, topic: 'places' },
  { en: 'Never give up on your dreams',             ar: 'لا تتخلى أبداً عن أحلامك',           difficulty: 2, topic: 'motivation' },
  { en: 'I want to speak English fluently',         ar: 'أريد التحدث بالإنجليزية بطلاقة',      difficulty: 2, topic: 'learning' },
  { en: 'My favourite subject is English',          ar: 'مادتي المفضلة هي الإنجليزية',        difficulty: 2, topic: 'learning' },

  // ─── LEVEL 3 — Hard (9+ words, complex) ───────────────────────────────────
  { en: 'I want to travel around the world one day',           ar: 'أريد أن أسافر حول العالم يوماً ما',         difficulty: 3, topic: 'travel' },
  { en: 'Reading books every day makes me feel happy',         ar: 'قراءة الكتب كل يوم تجعلني سعيداً',          difficulty: 3, topic: 'hobbies' },
  { en: 'If you believe in yourself you can do anything',      ar: 'إذا آمنت بنفسك يمكنك فعل أي شيء',           difficulty: 3, topic: 'motivation' },
  { en: 'I practice speaking English with my teacher online',  ar: 'أتدرب على التحدث بالإنجليزية مع أستاذي',   difficulty: 3, topic: 'learning' },
  { en: 'Teacher Hamza from Oued Zem helps many students',     ar: 'تيتشر حمزة من واد زم يساعد العديد من الطلاب', difficulty: 3, topic: 'intro' },
  { en: 'Learning a new language opens many opportunities',    ar: 'تعلم لغة جديدة يفتح فرصاً كثيرة',           difficulty: 3, topic: 'motivation' },
  { en: 'I would like to become a successful doctor',          ar: 'أود أن أصبح طبيباً ناجحاً',                difficulty: 3, topic: 'goals' },
  { en: 'The students are learning English in a fun way',      ar: 'الطلاب يتعلمون الإنجليزية بطريقة ممتعة',   difficulty: 3, topic: 'learning' },
  { en: 'My favourite part of the day is the evening',         ar: 'الجزء المفضل عندي من اليوم هو المساء',      difficulty: 3, topic: 'daily' },
  { en: 'Every great journey begins with a small step',        ar: 'كل رحلة عظيمة تبدأ بخطوة صغيرة',            difficulty: 3, topic: 'motivation' },
]

// ─── Utilities ───────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function scrambleWord(word: string): string {
  if (word.length < 3) return word
  let out = word
  let attempts = 0
  while (out === word && attempts < 20) {
    out = shuffle(word.split('')).join('')
    attempts++
  }
  return out
}

// ─── Difficulty Configuration ────────────────────────────────────────────────

interface DifficultyInfo {
  label: string          // Arabic label
  subtitle: string       // English subtitle
  emoji: string
  gradient: string       // tailwind gradient
  border: string
  xpMultiplier: number
}

const DIFFICULTY_INFO: Record<Difficulty, DifficultyInfo> = {
  1: { label: 'مبتدئ',  subtitle: 'Beginner',     emoji: '🌱', gradient: 'from-emerald-600/20 to-teal-600/20', border: 'border-emerald-500/30', xpMultiplier: 1 },
  2: { label: 'متوسط',  subtitle: 'Intermediate', emoji: '🔥', gradient: 'from-amber-600/20 to-orange-600/20',  border: 'border-amber-500/30',  xpMultiplier: 2 },
  3: { label: 'متقدم',  subtitle: 'Advanced',     emoji: '👑', gradient: 'from-red-600/20 to-rose-600/20',      border: 'border-red-500/30',    xpMultiplier: 3 },
}

// Per-game difficulty settings
const SCRAMBLE_CONFIG: Record<Difficulty, { rounds: number }> = {
  1: { rounds: 6 },
  2: { rounds: 10 },
  3: { rounds: 12 },
}

const MATCH_CONFIG: Record<Difficulty, { pairs: number, time: number }> = {
  1: { pairs: 4, time: 45 },
  2: { pairs: 6, time: 60 },
  3: { pairs: 8, time: 75 },
}

const BUILDER_CONFIG: Record<Difficulty, { rounds: number }> = {
  1: { rounds: 5 },
  2: { rounds: 6 },
  3: { rounds: 8 },
}

// ─── Progress persistence ────────────────────────────────────────────────────

interface PlayProgress {
  xp: number
  bestStreak: number
  gamesPlayed: number
}

function loadProgress(): PlayProgress {
  if (typeof window === 'undefined') return { xp: 0, bestStreak: 0, gamesPlayed: 0 }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { xp: 0, bestStreak: 0, gamesPlayed: 0 }
    return JSON.parse(raw)
  } catch {
    return { xp: 0, bestStreak: 0, gamesPlayed: 0 }
  }
}

function saveProgress(p: PlayProgress) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

// ─── Floating Icons ──────────────────────────────────────────────────────────

const FLOATING_ICONS = [
  { icon: '🎮', x: 5,  y: 10, delay: 0,   dur: 19 },
  { icon: '🏆', x: 90, y: 15, delay: 2,   dur: 22 },
  { icon: '✨', x: 15, y: 45, delay: 4,   dur: 18 },
  { icon: '🎯', x: 88, y: 55, delay: 1,   dur: 21 },
  { icon: '🌟', x: 10, y: 80, delay: 3,   dur: 20 },
  { icon: '🚀', x: 85, y: 85, delay: 5,   dur: 24 },
  { icon: '🔥', x: 50, y: 5,  delay: 2.5, dur: 17 },
  { icon: '💡', x: 70, y: 40, delay: 1.5, dur: 23 },
]

function FloatingIcons() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {FLOATING_ICONS.map((f, i) => (
        <div key={i} className="absolute opacity-[0.07] animate-float-icon text-2xl"
          style={{ left: `${f.x}%`, top: `${f.y}%`, animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s` }}>
          {f.icon}
        </div>
      ))}
      <style jsx>{`
        @keyframes float-icon {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25%      { transform: translateY(-22px) rotate(6deg); }
          50%      { transform: translateY(-8px) rotate(-4deg); }
          75%      { transform: translateY(-26px) rotate(5deg); }
        }
        .animate-float-icon {
          animation-name: float-icon;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  )
}

// ─── Feedback Toast (inline, appears then fades) ─────────────────────────────

function FeedbackToast({ type, message, onDone }: {
  type: 'correct' | 'wrong'
  message: string
  onDone: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600)
    return () => clearTimeout(t)
  }, [onDone])
  const isGood = type === 'correct'
  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-24 z-50 pointer-events-none animate-toast-in">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border ${
        isGood
          ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-100'
          : 'bg-red-500/20 border-red-400/30 text-red-100'
      }`}>
        {isGood ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
        <p className="text-sm font-bold">{message}</p>
      </div>
      <style jsx>{`
        @keyframes toast-in {
          0%   { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          15%  { transform: translateX(-50%) translateY(0);     opacity: 1; }
          85%  { transform: translateX(-50%) translateY(0);     opacity: 1; }
          100% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        }
        .animate-toast-in { animation: toast-in 1.6s ease-in-out forwards; }
      `}</style>
    </div>
  )
}

// ─── XP/Streak Bar ───────────────────────────────────────────────────────────

function StatsBar({ xp, streak, roundXp, roundCorrect, roundTotal, onExit }: {
  xp: number
  streak: number
  roundXp: number
  roundCorrect: number
  roundTotal: number
  onExit: () => void
}) {
  return (
    <div className="sticky top-[70px] z-30 backdrop-blur-xl bg-[#0a0f1e]/80 border-b border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <button onClick={onExit}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-semibold transition-colors">
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">القائمة</span>
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-amber-200 text-xs font-bold">{streak}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-violet-200 text-xs font-bold">+{roundXp} XP</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full">
            <Target className="w-4 h-4 text-white/50" />
            <span className="text-white/60 text-xs font-bold">{roundCorrect}/{roundTotal}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   GAME 1 — WORD SCRAMBLE
// ═════════════════════════════════════════════════════════════════════════════

function ScrambleGame({ difficulty, onDone, onExit }: {
  difficulty: Difficulty
  onDone: (xp: number, correct: number, total: number, bestStreak: number) => void
  onExit: () => void
}) {
  const TOTAL = SCRAMBLE_CONFIG[difficulty].rounds
  const mult = DIFFICULTY_INFO[difficulty].xpMultiplier
  const [round, setRound]         = useState(0)
  const [words]                   = useState(() => {
    const pool = WORDS.filter(w => w.lvl === difficulty)
    const source = pool.length >= TOTAL ? pool : WORDS
    return pick(source, TOTAL)
  })
  const [scrambled, setScrambled] = useState(() => scrambleWord(words[0].en))
  const [input, setInput]         = useState('')
  const [correct, setCorrect]     = useState(0)
  const [streak, setStreak]       = useState(0)
  const [best, setBest]           = useState(0)
  const [xp, setXp]               = useState(0)
  const [toast, setToast]         = useState<{ type: 'correct' | 'wrong', msg: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const current = words[round]

  useEffect(() => { inputRef.current?.focus() }, [round])

  const submit = () => {
    const guess = input.trim().toLowerCase()
    if (!guess) return
    if (guess === current.en.toLowerCase()) {
      const gain = (10 + streak * 2) * mult
      const newStreak = streak + 1
      setCorrect(c => c + 1)
      setStreak(newStreak)
      setBest(b => Math.max(b, newStreak))
      setXp(x => x + gain)
      setToast({ type: 'correct', msg: randomFrom(HAMZA_CORRECT) })
    } else {
      setStreak(0)
      setToast({ type: 'wrong', msg: `الجواب: ${current.en} — ${randomFrom(HAMZA_WRONG)}` })
    }
    setInput('')
    setTimeout(() => {
      if (round + 1 >= TOTAL) {
        onDone(xp + (guess === current.en.toLowerCase() ? (10 + streak * 2) * mult : 0),
               correct + (guess === current.en.toLowerCase() ? 1 : 0),
               TOTAL, best)
      } else {
        const next = round + 1
        setRound(next)
        setScrambled(scrambleWord(words[next].en))
      }
    }, 1200)
  }

  const skip = () => {
    setStreak(0)
    setToast({ type: 'wrong', msg: `الجواب كان: ${current.en}` })
    setInput('')
    setTimeout(() => {
      if (round + 1 >= TOTAL) onDone(xp, correct, TOTAL, best)
      else {
        const next = round + 1
        setRound(next)
        setScrambled(scrambleWord(words[next].en))
      }
    }, 1200)
  }

  return (
    <>
      <StatsBar xp={xp} streak={streak} roundXp={xp} roundCorrect={correct} roundTotal={TOTAL} onExit={onExit} />
      {toast && <FeedbackToast type={toast.type} message={toast.msg} onDone={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-xs font-bold">السؤال {round + 1} / {TOTAL}</span>
            <span className="text-violet-300/70 text-xs font-bold">رتب الأحرف ✨</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${((round) / TOTAL) * 100}%` }} />
          </div>
        </div>

        {/* Question card */}
        <div className="rounded-3xl bg-gradient-to-br from-violet-900/30 via-indigo-900/20 to-purple-900/30 border border-white/[0.06] p-6 sm:p-10 shadow-2xl">
          {/* Emoji hint */}
          <div className="text-center mb-6">
            <div className="text-6xl sm:text-7xl mb-3 animate-bounce-slow">{current.emoji}</div>
            <p className="text-white/70 text-lg sm:text-xl font-bold">{current.ar}</p>
            {current.hint && (
              <p className="text-amber-300/60 text-xs mt-2 italic">💡 {current.hint}</p>
            )}
          </div>

          {/* Scrambled letters */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {scrambled.split('').map((ch, i) => (
              <div key={i}
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-xl sm:text-2xl font-extrabold text-white uppercase shadow-lg animate-letter-in"
                style={{ animationDelay: `${i * 50}ms` }}>
                {ch}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value.replace(/[^a-zA-Z]/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') submit() }}
              placeholder="اكتب الكلمة..."
              dir="ltr"
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 text-lg font-bold text-white placeholder:text-white/20 text-center tracking-wider focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all uppercase"
              autoComplete="off"
              spellCheck={false}
            />
            <button onClick={submit}
              disabled={!input.trim()}
              className="bg-violet-600 hover:bg-violet-500 disabled:bg-white/[0.06] disabled:text-white/20 text-white font-extrabold px-5 rounded-2xl transition-all shadow-lg shadow-violet-900/40 active:scale-95">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <button onClick={skip}
            className="w-full mt-3 text-white/30 hover:text-white/60 text-xs font-bold py-2 transition-colors">
            تخطي السؤال ←
          </button>
        </div>

        <style jsx>{`
          @keyframes bounce-slow {
            0%,100% { transform: translateY(0); }
            50%     { transform: translateY(-8px); }
          }
          .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
          @keyframes letter-in {
            0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
            100% { transform: scale(1) rotate(0);       opacity: 1; }
          }
          .animate-letter-in {
            animation: letter-in 0.4s ease-out backwards;
          }
        `}</style>
      </div>
    </>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   GAME 2 — MATCH (Memory style with timer)
// ═════════════════════════════════════════════════════════════════════════════

interface MatchCard {
  id: string
  pairKey: string
  label: string
  side: 'en' | 'ar'
  matched: boolean
}

function MatchGame({ difficulty, onDone, onExit }: {
  difficulty: Difficulty
  onDone: (xp: number, correct: number, total: number, bestStreak: number) => void
  onExit: () => void
}) {
  const PAIRS_COUNT = MATCH_CONFIG[difficulty].pairs
  const TIME_START = MATCH_CONFIG[difficulty].time
  const mult = DIFFICULTY_INFO[difficulty].xpMultiplier
  const [pairs] = useState(() => {
    const pool = WORDS.filter(w => w.lvl === difficulty)
    const source = pool.length >= PAIRS_COUNT ? pool : WORDS
    return pick(source, PAIRS_COUNT)
  })
  const [cards, setCards] = useState<MatchCard[]>(() => {
    const all: MatchCard[] = pairs.flatMap(p => [
      { id: `${p.en}-en`, pairKey: p.en, label: `${p.emoji} ${p.en}`, side: 'en', matched: false },
      { id: `${p.en}-ar`, pairKey: p.en, label: p.ar,                 side: 'ar', matched: false },
    ])
    return shuffle(all)
  })
  const [selectedEn, setSelectedEn] = useState<string | null>(null)
  const [selectedAr, setSelectedAr] = useState<string | null>(null)
  const [matches, setMatches] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_START)
  const [xp, setXp] = useState(0)
  const [toast, setToast] = useState<{ type: 'correct' | 'wrong', msg: string } | null>(null)
  const [wrongFlash, setWrongFlash] = useState<[string, string] | null>(null)

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onDone(xp, matches, PAIRS_COUNT, best)
      return
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  // Check match when both selected
  useEffect(() => {
    if (!selectedEn || !selectedAr) return
    const enCard = cards.find(c => c.id === selectedEn)
    const arCard = cards.find(c => c.id === selectedAr)
    if (!enCard || !arCard) return
    setAttempts(a => a + 1)
    if (enCard.pairKey === arCard.pairKey) {
      // Match!
      const gain = (15 + streak * 3 + Math.max(0, Math.floor(timeLeft / 10))) * mult
      const newStreak = streak + 1
      setMatches(m => m + 1)
      setStreak(newStreak)
      setBest(b => Math.max(b, newStreak))
      setXp(x => x + gain)
      setCards(cs => cs.map(c => c.pairKey === enCard.pairKey ? { ...c, matched: true } : c))
      setToast({ type: 'correct', msg: randomFrom(HAMZA_CORRECT) })
      setSelectedEn(null)
      setSelectedAr(null)
      // Check if all done
      if (matches + 1 >= PAIRS_COUNT) {
        setTimeout(() => onDone(xp + gain, matches + 1, PAIRS_COUNT, Math.max(best, newStreak)), 1000)
      }
    } else {
      // Wrong
      setStreak(0)
      setWrongFlash([selectedEn, selectedAr])
      setToast({ type: 'wrong', msg: randomFrom(HAMZA_WRONG) })
      setTimeout(() => {
        setSelectedEn(null)
        setSelectedAr(null)
        setWrongFlash(null)
      }, 700)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEn, selectedAr])

  const clickCard = (card: MatchCard) => {
    if (card.matched) return
    if (card.side === 'en') {
      if (selectedEn === card.id) setSelectedEn(null)
      else setSelectedEn(card.id)
    } else {
      if (selectedAr === card.id) setSelectedAr(null)
      else setSelectedAr(card.id)
    }
  }

  const timePct = (timeLeft / TIME_START) * 100
  const timeColor = timeLeft > TIME_START * 0.33 ? 'from-emerald-500 to-teal-500'
                  : timeLeft > TIME_START * 0.16 ? 'from-amber-500 to-orange-500'
                                                 : 'from-red-500 to-rose-500'

  return (
    <>
      <StatsBar xp={xp} streak={streak} roundXp={xp} roundCorrect={matches} roundTotal={PAIRS_COUNT} onExit={onExit} />
      {toast && <FeedbackToast type={toast.type} message={toast.msg} onDone={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Timer */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-xs font-bold">
              المطابقات: {matches} / {PAIRS_COUNT}
            </span>
            <span className="flex items-center gap-1.5 text-white/60 text-xs font-bold">
              <Timer className="w-3.5 h-3.5" />
              {timeLeft}ث
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${timeColor} transition-all duration-1000`}
              style={{ width: `${timePct}%` }} />
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {cards.map(card => {
            const isSelected = card.id === selectedEn || card.id === selectedAr
            const isWrong = wrongFlash?.includes(card.id) ?? false
            return (
              <button key={card.id}
                onClick={() => clickCard(card)}
                disabled={card.matched}
                className={`relative min-h-[68px] sm:min-h-[84px] rounded-2xl border-2 p-3 sm:p-4 text-center transition-all active:scale-95 ${
                  card.matched
                    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100 opacity-60 cursor-default'
                    : isWrong
                      ? 'bg-red-500/20 border-red-400/50 text-white animate-shake'
                      : isSelected
                        ? card.side === 'en'
                          ? 'bg-blue-500/25 border-blue-400/60 text-white shadow-xl shadow-blue-900/30 scale-[1.02]'
                          : 'bg-violet-500/25 border-violet-400/60 text-white shadow-xl shadow-violet-900/30 scale-[1.02]'
                        : card.side === 'en'
                          ? 'bg-blue-500/[0.06] border-blue-500/20 text-blue-100 hover:bg-blue-500/10 hover:border-blue-500/40'
                          : 'bg-violet-500/[0.06] border-violet-500/20 text-violet-100 hover:bg-violet-500/10 hover:border-violet-500/40'
                }`}
                dir={card.side === 'ar' ? 'rtl' : 'ltr'}>
                <span className="block font-extrabold text-base sm:text-lg break-words">{card.label}</span>
                {card.matched && (
                  <CheckCircle2 className="absolute top-1.5 right-1.5 w-4 h-4 text-emerald-400" />
                )}
              </button>
            )
          })}
        </div>

        <p className="text-center text-white/30 text-xs mt-6 italic">
          💡 اختر كلمة إنجليزية ثم ترجمتها العربية
        </p>

        <style jsx>{`
          @keyframes shake {
            0%,100% { transform: translateX(0); }
            25%     { transform: translateX(-6px); }
            75%     { transform: translateX(6px); }
          }
          .animate-shake { animation: shake 0.3s ease-in-out; }
        `}</style>
      </div>
    </>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   GAME 3 — SENTENCE BUILDER
// ═════════════════════════════════════════════════════════════════════════════

interface BuilderToken {
  id: string
  word: string
  used: boolean
}

function BuilderGame({ difficulty, onDone, onExit }: {
  difficulty: Difficulty
  onDone: (xp: number, correct: number, total: number, bestStreak: number) => void
  onExit: () => void
}) {
  const TOTAL = BUILDER_CONFIG[difficulty].rounds
  const mult = DIFFICULTY_INFO[difficulty].xpMultiplier
  const [sentences] = useState(() => {
    const pool = SENTENCES.filter(s => s.difficulty === difficulty)
    const source = pool.length >= TOTAL ? pool : SENTENCES
    return pick(source, TOTAL)
  })
  const [round, setRound] = useState(0)
  const [tokens, setTokens] = useState<BuilderToken[]>(() => {
    const words = sentences[0].en.split(' ')
    return shuffle(words.map((w, i) => ({ id: `${i}-${w}`, word: w, used: false })))
  })
  const [placed, setPlaced] = useState<BuilderToken[]>([])
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [xp, setXp] = useState(0)
  const [toast, setToast] = useState<{ type: 'correct' | 'wrong', msg: string } | null>(null)
  const [locked, setLocked] = useState(false)

  const current = sentences[round]

  const placeToken = (tok: BuilderToken) => {
    if (locked || tok.used) return
    setTokens(ts => ts.map(t => t.id === tok.id ? { ...t, used: true } : t))
    setPlaced(p => [...p, tok])
  }

  const removeToken = (tok: BuilderToken) => {
    if (locked) return
    setPlaced(p => p.filter(t => t.id !== tok.id))
    setTokens(ts => ts.map(t => t.id === tok.id ? { ...t, used: false } : t))
  }

  const resetBoard = () => {
    if (locked) return
    setTokens(ts => ts.map(t => ({ ...t, used: false })))
    setPlaced([])
  }

  const check = () => {
    if (placed.length === 0) return
    const guess = placed.map(t => t.word).join(' ')
    const target = current.en
    setLocked(true)
    if (guess === target) {
      const gain = (25 + streak * 5 + current.difficulty * 10) * mult
      const newStreak = streak + 1
      setCorrect(c => c + 1)
      setStreak(newStreak)
      setBest(b => Math.max(b, newStreak))
      setXp(x => x + gain)
      setToast({ type: 'correct', msg: randomFrom(HAMZA_CORRECT) })
    } else {
      setStreak(0)
      setToast({ type: 'wrong', msg: `الصحيح: "${target}" — ${randomFrom(HAMZA_WRONG)}` })
    }
    setTimeout(() => {
      setLocked(false)
      if (round + 1 >= TOTAL) {
        onDone(xp + (guess === target ? (25 + streak * 5 + current.difficulty * 10) * mult : 0),
               correct + (guess === target ? 1 : 0),
               TOTAL, best)
      } else {
        const next = round + 1
        setRound(next)
        const words = sentences[next].en.split(' ')
        setTokens(shuffle(words.map((w, i) => ({ id: `${next}-${i}-${w}`, word: w, used: false }))))
        setPlaced([])
      }
    }, 1800)
  }

  return (
    <>
      <StatsBar xp={xp} streak={streak} roundXp={xp} roundCorrect={correct} roundTotal={TOTAL} onExit={onExit} />
      {toast && <FeedbackToast type={toast.type} message={toast.msg} onDone={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-xs font-bold">الجملة {round + 1} / {TOTAL}</span>
            <span className="flex items-center gap-1 text-amber-300/70 text-xs font-bold">
              {Array.from({ length: current.difficulty }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
              style={{ width: `${(round / TOTAL) * 100}%` }} />
          </div>
        </div>

        {/* Challenge card */}
        <div className="rounded-3xl bg-gradient-to-br from-pink-900/20 via-rose-900/20 to-red-900/20 border border-white/[0.06] p-5 sm:p-8 shadow-2xl">
          {/* Arabic prompt */}
          <div className="text-center mb-6">
            <p className="text-white/40 text-xs font-bold mb-2 tracking-widest uppercase">رتب الجملة بالإنجليزية</p>
            <p className="text-white text-lg sm:text-xl font-extrabold leading-relaxed" dir="rtl">{current.ar}</p>
          </div>

          {/* Placed (answer) area */}
          <div className="min-h-[80px] rounded-2xl bg-black/30 border-2 border-dashed border-white/[0.1] p-3 mb-4 flex flex-wrap items-center gap-2" dir="ltr">
            {placed.length === 0 ? (
              <span className="mx-auto text-white/20 text-sm italic">اضغط الكلمات بالأسفل لترتيبها هنا ↓</span>
            ) : (
              placed.map(tok => (
                <button key={tok.id} onClick={() => removeToken(tok)}
                  disabled={locked}
                  className="px-3 py-2 rounded-xl bg-pink-500/20 border border-pink-400/40 text-white font-bold text-sm hover:bg-pink-500/30 transition-all active:scale-95">
                  {tok.word}
                </button>
              ))
            )}
          </div>

          {/* Word tokens */}
          <div className="flex flex-wrap items-center justify-center gap-2 min-h-[60px]" dir="ltr">
            {tokens.filter(t => !t.used).map(tok => (
              <button key={tok.id} onClick={() => placeToken(tok)}
                disabled={locked}
                className="px-3 sm:px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white font-bold text-sm sm:text-base hover:bg-white/[0.1] hover:border-white/[0.2] transition-all shadow-md active:scale-95 animate-token-in">
                {tok.word}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-6">
            <button onClick={resetBoard}
              disabled={locked || placed.length === 0}
              className="flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] disabled:opacity-30 text-white/60 font-bold px-4 py-3 rounded-xl transition-all text-sm">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">إعادة</span>
            </button>
            <button onClick={check}
              disabled={locked || placed.length === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 disabled:from-white/[0.06] disabled:to-white/[0.06] text-white font-extrabold px-5 py-3 rounded-xl transition-all shadow-lg shadow-pink-900/40 active:scale-95">
              <CheckCircle2 className="w-5 h-5" />
              تحقق من الجواب
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes token-in {
            0%   { transform: scale(0.5) translateY(10px); opacity: 0; }
            100% { transform: scale(1)   translateY(0);     opacity: 1; }
          }
          .animate-token-in { animation: token-in 0.3s ease-out backwards; }
        `}</style>
      </div>
    </>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   RESULTS SCREEN
// ═════════════════════════════════════════════════════════════════════════════

function ResultsScreen({ xp, correct, total, bestStreak, gameName, onPlayAgain, onMenu }: {
  xp: number
  correct: number
  total: number
  bestStreak: number
  gameName: string
  onPlayAgain: () => void
  onMenu: () => void
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const [title, sub, emoji] = pct >= 90
    ? ['أسطورة! 🏆', 'واد زم فخور بيك، تيتشر حمزة كيباركلك!', '🌟']
    : pct >= 70
      ? ['ممتاز! 🔥', 'Bravo! استمر على هاد المنوال', '💪']
      : pct >= 50
        ? ['جيد! 👍', 'تقدم ملموس، كاين شي حاجة خاصنا نحسنوها', '✨']
        : ['حاول مرة أخرى 🌱', 'Don\'t give up! كل أسطورة بدات بخطوة', '💡']

  const waMsg = `مرحباً تيتشر حمزة! لعبت لعبة ${gameName} في إنجليزي.كوم وحصلت على ${xp} XP 🎮 أريد أن أتعلم أكثر معك!`
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-900/40 via-violet-900/30 to-purple-900/40 border border-white/[0.08] p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
        {/* Confetti-style background */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500" />
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="text-6xl sm:text-7xl mb-4 animate-bounce-in">{emoji}</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">{title}</h2>
          <p className="text-white/50 text-sm sm:text-base mb-8">{sub}</p>

          {/* Score grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="rounded-2xl bg-violet-500/10 border border-violet-500/20 p-4">
              <Zap className="w-5 h-5 text-violet-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-violet-200">+{xp}</p>
              <p className="text-xs text-white/40 mt-0.5">XP</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-emerald-200">{correct}/{total}</p>
              <p className="text-xs text-white/40 mt-0.5">صحيح</p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
              <Flame className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-amber-200">{bestStreak}</p>
              <p className="text-xs text-white/40 mt-0.5">أفضل سلسلة</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button onClick={onPlayAgain}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold px-6 py-4 rounded-2xl transition-all shadow-xl shadow-violet-900/40 active:scale-95">
              <RefreshCw className="w-5 h-5" />
              العب مرة أخرى
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onMenu}
                className="flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 hover:text-white font-bold px-5 py-3 rounded-2xl transition-all">
                <Home className="w-4 h-4" />
                القائمة
              </button>
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-900/30">
                <MessageCircle className="w-4 h-4" />
                شارك معي
              </a>
            </div>
          </div>

          <p className="text-white/30 text-xs mt-6 italic">
            💬 أرسل نتيجتك لتيتشر حمزة عبر واتساب
          </p>
        </div>

        <style jsx>{`
          @keyframes bounce-in {
            0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
            60%  { transform: scale(1.2) rotate(10deg); }
            100% { transform: scale(1) rotate(0);       opacity: 1; }
          }
          .animate-bounce-in { animation: bounce-in 0.8s ease-out; }
        `}</style>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   DIFFICULTY PICKER
// ═════════════════════════════════════════════════════════════════════════════

function DifficultyPicker({ game, onPick, onBack }: {
  game: GameMode
  onPick: (d: Difficulty) => void
  onBack: () => void
}) {
  const gameMeta: Record<GameMode, { title: string; subtitle: string; Icon: typeof Shuffle; color: string }> = {
    scramble: { title: 'قلب الحروف',     subtitle: 'Word Scramble',     Icon: Shuffle, color: 'text-violet-300' },
    match:    { title: 'طابق الكلمات',   subtitle: 'Quick Match',       Icon: Link2,   color: 'text-blue-300' },
    builder:  { title: 'ركب الجملة',     subtitle: 'Sentence Builder',  Icon: Blocks,  color: 'text-pink-300' },
  }
  const m = gameMeta[game]

  const levelDetails: Record<Difficulty, { rounds: string; desc: string }> = {
    1: {
      rounds: game === 'match'
        ? `${MATCH_CONFIG[1].pairs} أزواج · ${MATCH_CONFIG[1].time}ث`
        : `${game === 'scramble' ? SCRAMBLE_CONFIG[1].rounds : BUILDER_CONFIG[1].rounds} جولات`,
      desc: 'كلمات قصيرة ومألوفة — مثالي للبداية',
    },
    2: {
      rounds: game === 'match'
        ? `${MATCH_CONFIG[2].pairs} أزواج · ${MATCH_CONFIG[2].time}ث`
        : `${game === 'scramble' ? SCRAMBLE_CONFIG[2].rounds : BUILDER_CONFIG[2].rounds} جولات`,
      desc: 'كلمات أطول وتحدٍّ أكبر · نقاط مضاعفة',
    },
    3: {
      rounds: game === 'match'
        ? `${MATCH_CONFIG[3].pairs} أزواج · ${MATCH_CONFIG[3].time}ث`
        : `${game === 'scramble' ? SCRAMBLE_CONFIG[3].rounds : BUILDER_CONFIG[3].rounds} جولات`,
      desc: 'للأبطال فقط! · نقاط ×3',
    },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
      {/* Back button */}
      <button onClick={onBack}
        className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-bold mb-6 transition-colors">
        <ArrowRight className="w-4 h-4 rotate-180" />
        القائمة
      </button>

      {/* Game header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.06] border border-white/[0.1] mb-4`}>
          <m.Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${m.color}`} />
        </div>
        <p className="text-white/30 text-xs font-bold tracking-widest uppercase mb-2">{m.subtitle}</p>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{m.title}</h1>
        <p className="text-white/50 text-sm sm:text-base">اختر مستوى الصعوبة للبدء</p>
      </div>

      {/* Difficulty tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {([1, 2, 3] as Difficulty[]).map(d => {
          const info = DIFFICULTY_INFO[d]
          const det = levelDetails[d]
          return (
            <button key={d} onClick={() => onPick(d)}
              className={`group text-center rounded-3xl bg-gradient-to-br ${info.gradient} border ${info.border} p-6 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl hover:shadow-2xl`}>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                {info.emoji}
              </div>
              <p className="text-white/30 text-[10px] font-bold tracking-widest uppercase mb-1">{info.subtitle}</p>
              <h3 className="text-white font-black text-xl mb-2">{info.label}</h3>
              <p className="text-white/50 text-xs mb-3">{det.rounds}</p>
              <p className="text-white/40 text-xs leading-relaxed">{det.desc}</p>
              {info.xpMultiplier > 1 && (
                <div className="inline-flex items-center gap-1 mt-3 bg-white/[0.08] border border-white/[0.12] text-white/70 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <Zap className="w-3 h-3" />
                  XP ×{info.xpMultiplier}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <p className="text-center text-white/25 text-xs mt-8 italic">
        💡 كلما اخترت مستوى أصعب، كلما ربحت نقاط XP أكثر!
      </p>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   MENU SCREEN
// ═════════════════════════════════════════════════════════════════════════════

function MenuScreen({ progress, onPick }: {
  progress: PlayProgress
  onPick: (game: GameMode) => void
}) {
  const level = getLevel(progress.xp)

  const games: Array<{
    id: GameMode
    title: string
    subtitle: string
    desc: string
    Icon: typeof Shuffle
    gradient: string
    border: string
    badge: string
  }> = [
    {
      id: 'scramble',
      title: 'قلب الحروف',
      subtitle: 'Word Scramble',
      desc: 'رتب الحروف المخلوطة وشكّل الكلمة الصحيحة',
      Icon: Shuffle,
      gradient: 'from-violet-600/20 to-indigo-600/20',
      border: 'border-violet-500/30',
      badge: '٣ مستويات',
    },
    {
      id: 'match',
      title: 'طابق الكلمات',
      subtitle: 'Quick Match',
      desc: 'اربط الكلمة الإنجليزية بترجمتها قبل أن ينتهي الوقت',
      Icon: Link2,
      gradient: 'from-blue-600/20 to-cyan-600/20',
      border: 'border-blue-500/30',
      badge: '٣ مستويات',
    },
    {
      id: 'builder',
      title: 'ركب الجملة',
      subtitle: 'Sentence Builder',
      desc: 'رتب الكلمات لتكوين جملة إنجليزية صحيحة',
      Icon: Blocks,
      gradient: 'from-pink-600/20 to-rose-600/20',
      border: 'border-pink-500/30',
      badge: '٣ مستويات',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
      {/* Hero */}
      <section className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold px-4 py-2 rounded-full mb-5">
          <Gamepad2 className="w-4 h-4" />
          العب وتعلم — Play & Learn
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
          كنز اللغة{' '}
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            الإنجليزية
          </span>
        </h1>
        <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          ألعاب ممتعة ستعلمك الكلمات والجمل بطريقة واد زمية! 😎
          <br />
          مع تيتشر حمزة القصراوي من{' '}
          <span className="text-amber-300 font-bold">واد زم</span>
        </p>
      </section>

      {/* Teacher Hamza badge */}
      <section className="mb-8">
        <div className="rounded-3xl bg-gradient-to-r from-amber-900/20 via-orange-900/20 to-red-900/20 border border-amber-500/20 p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-xl shrink-0">
            ح
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-300/70 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-0.5">أستاذك اليوم</p>
            <h2 className="text-white font-black text-lg sm:text-xl leading-tight">
              Teacher Hamza el Qasraoui
            </h2>
            <p className="text-white/50 text-xs sm:text-sm mt-1">
              📍 من واد زم · معلم الإنجليزية للمبتدئين والمتقدمين
            </p>
          </div>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً تيتشر حمزة! أريد معلومات عن الدروس.')}`}
             target="_blank" rel="noopener noreferrer"
             className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 active:scale-95 text-sm shrink-0">
            <MessageCircle className="w-4 h-4" />
            تواصل
          </a>
        </div>
      </section>

      {/* Player stats */}
      <section className="mb-8 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
          <span className="block text-2xl mb-1">{level.emoji}</span>
          <p className="text-white/60 text-[10px] sm:text-xs font-bold">{level.title}</p>
        </div>
        <div className="rounded-2xl bg-violet-500/10 border border-violet-500/20 p-4 text-center">
          <Zap className="w-5 h-5 text-violet-400 mx-auto mb-1" />
          <p className="text-xl sm:text-2xl font-black text-violet-200">{progress.xp}</p>
          <p className="text-[10px] sm:text-xs text-white/40 mt-0.5 font-bold">XP</p>
        </div>
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-center">
          <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-xl sm:text-2xl font-black text-amber-200">{progress.bestStreak}</p>
          <p className="text-[10px] sm:text-xs text-white/40 mt-0.5 font-bold">أفضل سلسلة</p>
        </div>
      </section>

      {/* Games grid */}
      <section className="mb-10">
        <h2 className="text-white font-black text-xl mb-5 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-pink-400" />
          اختر لعبتك
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {games.map(g => (
            <button key={g.id} onClick={() => onPick(g.id)}
              className={`group text-right rounded-3xl bg-gradient-to-br ${g.gradient} border ${g.border} p-6 hover:scale-[1.03] transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <g.Icon className="w-7 h-7 text-white" />
                </div>
                <span className="bg-white/[0.08] border border-white/[0.12] text-white/60 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {g.badge}
                </span>
              </div>
              <h3 className="text-white font-black text-lg mb-1">{g.title}</h3>
              <p className="text-white/30 text-[11px] font-bold tracking-wider uppercase mb-2.5">{g.subtitle}</p>
              <p className="text-white/50 text-sm leading-relaxed">{g.desc}</p>
              <div className="flex items-center gap-1.5 mt-4 text-white/40 text-xs font-bold group-hover:text-white transition-colors">
                <span>ابدأ اللعب</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* How it works / motivation */}
      <section className="rounded-3xl bg-white/[0.02] border border-white/[0.06] p-6 sm:p-8 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
          {[
            { emoji: '🎮', title: 'العب', desc: 'اختر لعبة واستمتع' },
            { emoji: '💡', title: 'تعلم', desc: 'كلمات وجمل جديدة' },
            { emoji: '🏆', title: 'اربح', desc: 'نقاط XP وسلاسل' },
          ].map(s => (
            <div key={s.title}>
              <div className="text-3xl mb-2">{s.emoji}</div>
              <h3 className="text-white font-extrabold text-base mb-1">{s.title}</h3>
              <p className="text-white/40 text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — bring more students */}
      <section className="rounded-3xl bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/20 p-6 sm:p-8 text-center">
        <Sparkles className="w-7 h-7 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-white font-black text-lg sm:text-xl mb-2">استمتعت باللعب؟</h3>
        <p className="text-white/50 text-sm mb-5 max-w-md mx-auto">
          انضم لحصص تيتشر حمزة المباشرة من واد زم وارفع مستواك في الإنجليزية بطريقة ممتعة 🚀
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/courses"
            className="inline-flex items-center gap-2 bg-white text-emerald-900 font-extrabold px-6 py-3 rounded-2xl transition-all shadow-xl hover:-translate-y-0.5 active:scale-95">
            <Crown className="w-4 h-4" />
            شاهد الدورات
          </Link>
          <Link href="/live"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-900/30 active:scale-95">
            <Heart className="w-4 h-4" />
            الحصص المباشرة
          </Link>
        </div>
      </section>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════

type GameMode = 'scramble' | 'match' | 'builder'
type Screen = 'menu' | 'picker' | GameMode | 'results'

interface LastResult {
  xp: number
  correct: number
  total: number
  bestStreak: number
  gameName: string
  from: GameMode
  difficulty: Difficulty
}

const GAME_NAMES: Record<GameMode, string> = {
  scramble: 'قلب الحروف',
  match:    'طابق الكلمات',
  builder:  'ركب الجملة',
}

export default function PlayPage() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [pickerGame, setPickerGame] = useState<GameMode | null>(null)
  const [activeGame, setActiveGame] = useState<GameMode | null>(null)
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>(1)
  const [progress, setProgress] = useState<PlayProgress>({ xp: 0, bestStreak: 0, gamesPlayed: 0 })
  const [lastResult, setLastResult] = useState<LastResult | null>(null)

  useEffect(() => { setProgress(loadProgress()) }, [])

  const finishGame = useCallback((
    xp: number, correct: number, total: number, bestStreak: number,
  ) => {
    if (!activeGame) return
    const newProgress: PlayProgress = {
      xp: progress.xp + xp,
      bestStreak: Math.max(progress.bestStreak, bestStreak),
      gamesPlayed: progress.gamesPlayed + 1,
    }
    setProgress(newProgress)
    saveProgress(newProgress)
    setLastResult({
      xp, correct, total, bestStreak,
      gameName: GAME_NAMES[activeGame],
      from: activeGame,
      difficulty: activeDifficulty,
    })
    setScreen('results')
  }, [progress, activeGame, activeDifficulty])

  const openPicker = (g: GameMode) => {
    setPickerGame(g)
    setScreen('picker')
  }

  const startGame = (d: Difficulty) => {
    if (!pickerGame) return
    setActiveGame(pickerGame)
    setActiveDifficulty(d)
    setScreen(pickerGame)
  }

  const goMenu = () => {
    setScreen('menu')
    setPickerGame(null)
    setActiveGame(null)
  }

  const playAgain = () => {
    if (!lastResult) return
    setActiveGame(lastResult.from)
    setActiveDifficulty(lastResult.difficulty)
    setScreen(lastResult.from)
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(160deg,#0a0f1e 0%,#111827 50%,#0a0f1e 100%)' }}>
      <FloatingIcons />

      {/* Spacer for fixed header */}
      <div className="h-[70px]" />

      {screen === 'menu' && (
        <MenuScreen progress={progress} onPick={openPicker} />
      )}

      {screen === 'picker' && pickerGame && (
        <DifficultyPicker
          game={pickerGame}
          onPick={startGame}
          onBack={goMenu}
        />
      )}

      {screen === 'scramble' && activeGame === 'scramble' && (
        <ScrambleGame
          difficulty={activeDifficulty}
          onDone={finishGame}
          onExit={goMenu}
        />
      )}

      {screen === 'match' && activeGame === 'match' && (
        <MatchGame
          difficulty={activeDifficulty}
          onDone={finishGame}
          onExit={goMenu}
        />
      )}

      {screen === 'builder' && activeGame === 'builder' && (
        <BuilderGame
          difficulty={activeDifficulty}
          onDone={finishGame}
          onExit={goMenu}
        />
      )}

      {screen === 'results' && lastResult && (
        <ResultsScreen
          xp={lastResult.xp}
          correct={lastResult.correct}
          total={lastResult.total}
          bestStreak={lastResult.bestStreak}
          gameName={`${lastResult.gameName} · ${DIFFICULTY_INFO[lastResult.difficulty].label}`}
          onPlayAgain={playAgain}
          onMenu={goMenu}
        />
      )}
    </div>
  )
}
