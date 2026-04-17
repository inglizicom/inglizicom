'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Gamepad2, Sparkles, Zap, Heart, Flame,
  ArrowRight, RefreshCw, Home, MessageCircle,
  Shuffle, Link2, Blocks, Star, Crown, Timer,
  CheckCircle2, XCircle, Rocket, Target, ChevronUp,
  ChevronDown, ChevronLeft, ChevronRight,
  Bug, Volume2, VolumeX,
} from 'lucide-react'

// ═════════════════════════════════════════════════════════════════════════════
//   PLAY PAGE — Word games with Teacher Hamza from Oued Zem
// ═════════════════════════════════════════════════════════════════════════════

const WHATSAPP_NUMBER = '212707902091'
const STORAGE_KEY = 'inglizi-play-progress'

// ─── Sound Engine (Web Audio API — no files needed) ──────────────────────────

const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) : null

let _ctx: AudioContext | null = null
function getCtx(): AudioContext | null {
  if (!AudioCtx) return null
  if (!_ctx) _ctx = new AudioCtx()
  return _ctx
}

function playTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) {
  const ctx = getCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(vol, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + dur)
}

function sfxCorrect() {
  playTone(523, 0.12, 'sine', 0.18)
  setTimeout(() => playTone(659, 0.12, 'sine', 0.18), 80)
  setTimeout(() => playTone(784, 0.18, 'sine', 0.22), 160)
}

function sfxWrong() {
  playTone(200, 0.15, 'square', 0.1)
  setTimeout(() => playTone(160, 0.2, 'square', 0.08), 120)
}

function sfxClick() {
  playTone(880, 0.05, 'sine', 0.06)
}

function sfxWin() {
  ;[523, 659, 784, 1047].forEach((f, i) =>
    setTimeout(() => playTone(f, 0.2, 'sine', 0.15), i * 100),
  )
}

function sfxLevelUp() {
  ;[440, 554, 659, 880, 1047].forEach((f, i) =>
    setTimeout(() => playTone(f, 0.25, 'triangle', 0.12), i * 80),
  )
}

function sfxEat() {
  playTone(660, 0.06, 'sine', 0.12)
  setTimeout(() => playTone(880, 0.08, 'sine', 0.15), 50)
}

function sfxSentenceComplete() {
  ;[523, 659, 784, 1047, 1318].forEach((f, i) =>
    setTimeout(() => playTone(f, 0.2, 'triangle', 0.14), i * 70),
  )
}

function sfxCrash() {
  playTone(150, 0.3, 'sawtooth', 0.12)
  setTimeout(() => playTone(100, 0.4, 'sawtooth', 0.1), 100)
}

// ─── Snake BGM (Web Audio looping bass line) ────────────────────────────────
let _bgmNodes: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null = null

function startBgm() {
  const ctx = getCtx()
  if (!ctx || _bgmNodes) return
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.04, ctx.currentTime)
  gain.connect(ctx.destination)

  // Subtle bass pulse
  const osc1 = ctx.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(55, ctx.currentTime)
  osc1.connect(gain)
  osc1.start()

  // Rhythmic hi-hat tick via high-pass filtered noise-like oscillator
  const osc2 = ctx.createOscillator()
  osc2.type = 'triangle'
  osc2.frequency.setValueAtTime(110, ctx.currentTime)
  const gain2 = ctx.createGain()
  gain2.gain.setValueAtTime(0.02, ctx.currentTime)
  osc2.connect(gain2)
  gain2.connect(ctx.destination)
  osc2.start()

  // Pulse the bass for rhythm
  const now = ctx.currentTime
  for (let i = 0; i < 600; i++) {
    const t = now + i * 0.5
    gain.gain.setValueAtTime(0.04, t)
    gain.gain.exponentialRampToValueAtTime(0.015, t + 0.25)
    gain.gain.setValueAtTime(0.04, t + 0.25)
    // Bass note changes
    const notes = [55, 65, 55, 73]
    osc1.frequency.setValueAtTime(notes[i % 4], t)
  }

  _bgmNodes = { osc1, osc2, gain }
}

function stopBgm() {
  if (!_bgmNodes) return
  try {
    _bgmNodes.osc1.stop()
    _bgmNodes.osc2.stop()
    _bgmNodes.gain.disconnect()
  } catch { /* ignore */ }
  _bgmNodes = null
}

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
  'لا لا، حاول مرة أخرى 😄',
  'ركز شوية، أنت قريب! 🤓',
  'Oops! جرب مرة أخرى 💪',
  'آش هاد الجواب؟ 😂 عاود',
  'قريب... حاول مرة أخرى! 📚',
  'لا تستسلم! ركز 💡',
]

const LEVEL_MESSAGES = [
  { threshold: 0,    emoji: '🌱', title: 'مبتدئ من واد زم',  desc: 'بدايتك مع تيتشر حمزة' },
  { threshold: 50,   emoji: '🌿', title: 'طالب نشيط',         desc: 'ديرها ديرها!' },
  { threshold: 150,  emoji: '🔥', title: 'طالب مميز',         desc: 'أستاذ حمزة لاحظك' },
  { threshold: 300,  emoji: '⭐', title: 'نجم الفصل',         desc: 'واد زم فخور بيك' },
  { threshold: 500,  emoji: '👑', title: 'بطل اللغة',          desc: 'تلميذ من النخبة' },
  { threshold: 1000, emoji: '🏆', title: 'أسطورة واد زم',      desc: 'Teacher Hamza approved!' },
]

function getLevel(xp: number) {
  return [...LEVEL_MESSAGES].reverse().find(l => xp >= l.threshold) ?? LEVEL_MESSAGES[0]
}

// ─── Word Pool ───────────────────────────────────────────────────────────────

type Difficulty = 1 | 2 | 3

interface WordPair {
  en: string
  ar: string
  emoji: string
  lvl: Difficulty
  hint?: string
}

const WORDS: WordPair[] = [
  // LEVEL 1
  { en: 'book',   ar: 'كتاب',  emoji: '📚', lvl: 1 },
  { en: 'pen',    ar: 'قلم',   emoji: '✒️', lvl: 1 },
  { en: 'tea',    ar: 'شاي',   emoji: '🍵', lvl: 1, hint: 'أتاي بالنعناع' },
  { en: 'water',  ar: 'ماء',   emoji: '💧', lvl: 1 },
  { en: 'bread',  ar: 'خبز',   emoji: '🍞', lvl: 1, hint: 'خبز ديال واد زم' },
  { en: 'apple',  ar: 'تفاحة', emoji: '🍎', lvl: 1 },
  { en: 'mother', ar: 'أم',    emoji: '👩', lvl: 1 },
  { en: 'father', ar: 'أب',    emoji: '👨', lvl: 1 },
  { en: 'house',  ar: 'بيت',   emoji: '🏠', lvl: 1 },
  { en: 'city',   ar: 'مدينة', emoji: '🏙️', lvl: 1, hint: 'مثل واد زم' },
  { en: 'sun',    ar: 'شمس',   emoji: '☀️', lvl: 1 },
  { en: 'moon',   ar: 'قمر',   emoji: '🌙', lvl: 1 },
  { en: 'rain',   ar: 'مطر',   emoji: '🌧️', lvl: 1 },
  { en: 'tree',   ar: 'شجرة',  emoji: '🌳', lvl: 1 },
  { en: 'happy',  ar: 'سعيد',  emoji: '😊', lvl: 1 },
  { en: 'sad',    ar: 'حزين',  emoji: '😢', lvl: 1 },
  { en: 'play',   ar: 'يلعب',  emoji: '🎮', lvl: 1 },
  { en: 'run',    ar: 'يجري',  emoji: '🏃', lvl: 1 },
  { en: 'eat',    ar: 'يأكل',  emoji: '🍴', lvl: 1 },
  { en: 'road',   ar: 'طريق',  emoji: '🛣️', lvl: 1 },
  { en: 'friend', ar: 'صديق',  emoji: '🤝', lvl: 1 },
  { en: 'car',    ar: 'سيارة', emoji: '🚗', lvl: 1 },
  { en: 'dog',    ar: 'كلب',   emoji: '🐶', lvl: 1 },
  { en: 'cat',    ar: 'قطة',   emoji: '🐱', lvl: 1 },
  // LEVEL 2
  { en: 'teacher', ar: 'أستاذ',  emoji: '👨‍🏫', lvl: 2, hint: 'مثل حمزة القصراوي' },
  { en: 'student', ar: 'طالب',   emoji: '🎓',  lvl: 2, hint: 'أنت واحد منهم!' },
  { en: 'school',  ar: 'مدرسة',  emoji: '🏫',  lvl: 2 },
  { en: 'tagine',  ar: 'طاجين',  emoji: '🍲',  lvl: 2, hint: 'الأكلة المغربية الشهيرة' },
  { en: 'coffee',  ar: 'قهوة',   emoji: '☕',  lvl: 2 },
  { en: 'orange',  ar: 'برتقال', emoji: '🍊',  lvl: 2 },
  { en: 'brother', ar: 'أخ',     emoji: '🧑',  lvl: 2 },
  { en: 'sister',  ar: 'أخت',    emoji: '👧',  lvl: 2 },
  { en: 'family',  ar: 'عائلة',  emoji: '👪',  lvl: 2 },
  { en: 'market',  ar: 'سوق',    emoji: '🛒',  lvl: 2 },
  { en: 'mosque',  ar: 'مسجد',   emoji: '🕌',  lvl: 2 },
  { en: 'garden',  ar: 'حديقة',  emoji: '🌳',  lvl: 2 },
  { en: 'tired',   ar: 'متعب',   emoji: '😴',  lvl: 2 },
  { en: 'hungry',  ar: 'جائع',   emoji: '🍽️', lvl: 2 },
  { en: 'learn',   ar: 'يتعلم',  emoji: '🧠',  lvl: 2, hint: 'الي كتديرو دابا' },
  { en: 'sleep',   ar: 'ينام',   emoji: '😴',  lvl: 2 },
  { en: 'window',  ar: 'نافذة',  emoji: '🪟',  lvl: 2 },
  { en: 'kitchen', ar: 'مطبخ',   emoji: '🍳',  lvl: 2 },
  { en: 'morning', ar: 'صباح',   emoji: '🌅',  lvl: 2 },
  { en: 'evening', ar: 'مساء',   emoji: '🌆',  lvl: 2 },
  { en: 'weather', ar: 'طقس',    emoji: '🌤️',  lvl: 2 },
  { en: 'doctor',  ar: 'طبيب',   emoji: '⚕️',  lvl: 2 },
  { en: 'music',   ar: 'موسيقى', emoji: '🎵',  lvl: 2 },
  { en: 'summer',  ar: 'صيف',    emoji: '🏖️',  lvl: 2 },
  { en: 'winter',  ar: 'شتاء',   emoji: '❄️',  lvl: 2 },
  // LEVEL 3
  { en: 'beautiful',   ar: 'جميل',        emoji: '✨',  lvl: 3 },
  { en: 'delicious',   ar: 'لذيذ',        emoji: '😋',  lvl: 3, hint: 'كتوصف بيه الطاجين' },
  { en: 'breakfast',   ar: 'فطور',        emoji: '🍳',  lvl: 3 },
  { en: 'important',   ar: 'مهم',         emoji: '⚡',  lvl: 3 },
  { en: 'beginner',    ar: 'مبتدئ',       emoji: '🌱',  lvl: 3 },
  { en: 'adventure',   ar: 'مغامرة',      emoji: '🗺️',  lvl: 3 },
  { en: 'knowledge',   ar: 'معرفة',       emoji: '🎓',  lvl: 3 },
  { en: 'different',   ar: 'مختلف',       emoji: '🔀',  lvl: 3 },
  { en: 'practice',    ar: 'تمرين',       emoji: '💪',  lvl: 3, hint: 'الي كنديرو في إنجليزي.كوم' },
  { en: 'language',    ar: 'لغة',         emoji: '🗣️',  lvl: 3 },
  { en: 'exercise',    ar: 'تمرين رياضي', emoji: '🏋️',  lvl: 3 },
  { en: 'wonderful',   ar: 'رائع',        emoji: '🌟',  lvl: 3 },
  { en: 'opportunity', ar: 'فرصة',        emoji: '🎯',  lvl: 3 },
  { en: 'experience',  ar: 'تجربة',       emoji: '🧭',  lvl: 3 },
  { en: 'discover',    ar: 'يكتشف',       emoji: '🔍',  lvl: 3 },
  { en: 'successful',  ar: 'ناجح',        emoji: '🏆',  lvl: 3 },
  { en: 'confident',   ar: 'واثق',        emoji: '💪',  lvl: 3 },
  { en: 'favourite',   ar: 'مفضل',        emoji: '❤️',  lvl: 3 },
  { en: 'vegetables',  ar: 'خضروات',      emoji: '🥬',  lvl: 3 },
  { en: 'dictionary',  ar: 'قاموس',       emoji: '📖',  lvl: 3 },
]

// ─── Sentence Pool ───────────────────────────────────────────────────────────

interface SentenceChallenge {
  en: string
  ar: string
  difficulty: Difficulty
}

const SENTENCES: SentenceChallenge[] = [
  // LEVEL 1
  { en: 'I am a student',              ar: 'أنا طالب',                difficulty: 1 },
  { en: 'My name is Hamza',            ar: 'اسمي حمزة',               difficulty: 1 },
  { en: 'I live in Oued Zem',          ar: 'أعيش في واد زم',          difficulty: 1 },
  { en: 'She is my sister',            ar: 'هي أختي',                 difficulty: 1 },
  { en: 'I drink tea every morning',   ar: 'أشرب الشاي كل صباح',      difficulty: 1 },
  { en: 'We go to school',             ar: 'نذهب إلى المدرسة',        difficulty: 1 },
  { en: 'The weather is nice today',   ar: 'الطقس لطيف اليوم',        difficulty: 1 },
  { en: 'I have a small dog',          ar: 'عندي كلب صغير',           difficulty: 1 },
  { en: 'He reads a book every night', ar: 'يقرأ كتاباً كل ليلة',     difficulty: 1 },
  { en: 'My father works in the city', ar: 'أبي يعمل في المدينة',     difficulty: 1 },
  // LEVEL 2
  { en: 'I am a student from Oued Zem',        ar: 'أنا طالب من واد زم',                difficulty: 2 },
  { en: 'My teacher is Hamza el Qasraoui',     ar: 'أستاذي هو حمزة القصراوي',           difficulty: 2 },
  { en: 'I love learning English every day',    ar: 'أحب تعلم الإنجليزية كل يوم',        difficulty: 2 },
  { en: 'She drinks tea in the morning',        ar: 'هي تشرب الشاي في الصباح',           difficulty: 2 },
  { en: 'We go to school by bus',               ar: 'نذهب إلى المدرسة بالحافلة',         difficulty: 2 },
  { en: 'The weather is beautiful today',       ar: 'الطقس جميل اليوم',                  difficulty: 2 },
  { en: 'He is my best friend in class',        ar: 'هو صديقي المفضل في الفصل',          difficulty: 2 },
  { en: 'My mother cooks a delicious tagine',   ar: 'أمي تطبخ طاجيناً لذيذاً',           difficulty: 2 },
  { en: 'I study English with Teacher Hamza',   ar: 'أدرس الإنجليزية مع تيتشر حمزة',     difficulty: 2 },
  { en: 'Oued Zem is a beautiful city',         ar: 'واد زم مدينة جميلة',                difficulty: 2 },
  { en: 'Never give up on your dreams',         ar: 'لا تتخلى أبداً عن أحلامك',          difficulty: 2 },
  { en: 'I want to speak English fluently',     ar: 'أريد التحدث بالإنجليزية بطلاقة',     difficulty: 2 },
  { en: 'My favourite subject is English',      ar: 'مادتي المفضلة هي الإنجليزية',       difficulty: 2 },
  // LEVEL 3
  { en: 'I want to travel around the world one day',          ar: 'أريد أن أسافر حول العالم يوماً ما',         difficulty: 3 },
  { en: 'Reading books every day makes me feel happy',        ar: 'قراءة الكتب كل يوم تجعلني سعيداً',          difficulty: 3 },
  { en: 'If you believe in yourself you can do anything',     ar: 'إذا آمنت بنفسك يمكنك فعل أي شيء',           difficulty: 3 },
  { en: 'I practice speaking English with my teacher online', ar: 'أتدرب على التحدث بالإنجليزية مع أستاذي',   difficulty: 3 },
  { en: 'Teacher Hamza from Oued Zem helps many students',    ar: 'تيتشر حمزة من واد زم يساعد العديد من الطلاب', difficulty: 3 },
  { en: 'Learning a new language opens many opportunities',   ar: 'تعلم لغة جديدة يفتح فرصاً كثيرة',           difficulty: 3 },
  { en: 'I would like to become a successful doctor',         ar: 'أود أن أصبح طبيباً ناجحاً',                difficulty: 3 },
  { en: 'The students are learning English in a fun way',     ar: 'الطلاب يتعلمون الإنجليزية بطريقة ممتعة',   difficulty: 3 },
  { en: 'My favourite part of the day is the evening',        ar: 'الجزء المفضل عندي من اليوم هو المساء',      difficulty: 3 },
  { en: 'Every great journey begins with a small step',       ar: 'كل رحلة عظيمة تبدأ بخطوة صغيرة',            difficulty: 3 },
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
  let out = word; let attempts = 0
  while (out === word && attempts < 20) { out = shuffle(word.split('')).join(''); attempts++ }
  return out
}

// ─── Difficulty Configuration ────────────────────────────────────────────────

interface DifficultyInfo {
  label: string; subtitle: string; emoji: string
  gradient: string; border: string; xpMultiplier: number
}

const DIFFICULTY_INFO: Record<Difficulty, DifficultyInfo> = {
  1: { label: 'مبتدئ', subtitle: 'Beginner',     emoji: '🌱', gradient: 'from-emerald-600/20 to-teal-600/20', border: 'border-emerald-500/30', xpMultiplier: 1 },
  2: { label: 'متوسط', subtitle: 'Intermediate', emoji: '🔥', gradient: 'from-amber-600/20 to-orange-600/20',  border: 'border-amber-500/30',  xpMultiplier: 2 },
  3: { label: 'متقدم', subtitle: 'Advanced',     emoji: '👑', gradient: 'from-red-600/20 to-rose-600/20',      border: 'border-red-500/30',    xpMultiplier: 3 },
}

const SCRAMBLE_CONFIG: Record<Difficulty, { rounds: number }> = { 1: { rounds: 6 }, 2: { rounds: 10 }, 3: { rounds: 12 } }
const MATCH_CONFIG: Record<Difficulty, { pairs: number; time: number }> = { 1: { pairs: 4, time: 45 }, 2: { pairs: 6, time: 60 }, 3: { pairs: 8, time: 75 } }
const BUILDER_CONFIG: Record<Difficulty, { rounds: number }> = { 1: { rounds: 5 }, 2: { rounds: 6 }, 3: { rounds: 8 } }

// ─── Progress ────────────────────────────────────────────────────────────────

interface PlayProgress { xp: number; bestStreak: number; gamesPlayed: number }
function loadProgress(): PlayProgress {
  if (typeof window === 'undefined') return { xp: 0, bestStreak: 0, gamesPlayed: 0 }
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : { xp: 0, bestStreak: 0, gamesPlayed: 0 } } catch { return { xp: 0, bestStreak: 0, gamesPlayed: 0 } }
}
function saveProgressData(p: PlayProgress) {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

// ─── Floating Icons ──────────────────────────────────────────────────────────

function FloatingIcons() {
  const icons = [
    { icon: '🎮', x: 5,  y: 10, delay: 0,   dur: 19 },
    { icon: '🏆', x: 90, y: 15, delay: 2,   dur: 22 },
    { icon: '✨', x: 15, y: 45, delay: 4,   dur: 18 },
    { icon: '🎯', x: 88, y: 55, delay: 1,   dur: 21 },
    { icon: '🌟', x: 10, y: 80, delay: 3,   dur: 20 },
    { icon: '🚀', x: 85, y: 85, delay: 5,   dur: 24 },
    { icon: '🔥', x: 50, y: 5,  delay: 2.5, dur: 17 },
    { icon: '💡', x: 70, y: 40, delay: 1.5, dur: 23 },
  ]
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {icons.map((f, i) => (
        <div key={i} className="absolute opacity-[0.07] text-2xl"
          style={{ left: `${f.x}%`, top: `${f.y}%`, animation: `float-icon ${f.dur}s ease-in-out ${f.delay}s infinite` }}>
          {f.icon}
        </div>
      ))}
    </div>
  )
}

// ─── Inline Feedback ─────────────────────────────────────────────────────────

function InlineFeedback({ type, message }: { type: 'correct' | 'wrong'; message: string }) {
  const isGood = type === 'correct'
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold animate-[fadeInUp_0.3s_ease-out] ${
      isGood ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-200' : 'bg-red-500/15 border border-red-400/30 text-red-200'
    }`}>
      {isGood ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
      <span className="line-clamp-2">{message}</span>
    </div>
  )
}

// ─── Top bar inside games ────────────────────────────────────────────────────

function GameBar({ streak, xp, current, total, onExit }: {
  streak: number; xp: number; current: number; total: number; onExit: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-4">
      <button onClick={onExit} className="text-white/40 hover:text-white transition-colors p-1">
        <Home className="w-4 h-4" />
      </button>
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden mx-2">
        <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500 rounded-full"
          style={{ width: `${(current / total) * 100}%` }} />
      </div>
      <div className="flex items-center gap-2">
        {streak > 0 && (
          <span className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-full text-amber-200 text-[11px] font-bold">
            <Flame className="w-3 h-3" />{streak}
          </span>
        )}
        <span className="flex items-center gap-1 bg-violet-500/15 border border-violet-500/25 px-2 py-0.5 rounded-full text-violet-200 text-[11px] font-bold">
          <Zap className="w-3 h-3" />+{xp}
        </span>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   GAME 1 — WORD SCRAMBLE (stay on word until correct)
// ═════════════════════════════════════════════════════════════════════════════

function ScrambleGame({ difficulty, onDone, onExit }: {
  difficulty: Difficulty
  onDone: (xp: number, correct: number, total: number, bestStreak: number) => void
  onExit: () => void
}) {
  const TOTAL = SCRAMBLE_CONFIG[difficulty].rounds
  const mult = DIFFICULTY_INFO[difficulty].xpMultiplier
  const [round, setRound] = useState(0)
  const [words] = useState(() => {
    const pool = WORDS.filter(w => w.lvl === difficulty)
    return pick(pool.length >= TOTAL ? pool : WORDS, TOTAL)
  })
  const [scrambled, setScrambled] = useState(() => scrambleWord(words[0].en))
  const [input, setInput] = useState('')
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [xp, setXp] = useState(0)
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; msg: string } | null>(null)
  const [locked, setLocked] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const current = words[round]

  useEffect(() => { if (!locked) inputRef.current?.focus() }, [round, locked])

  const advance = useCallback(() => {
    if (round + 1 >= TOTAL) {
      sfxWin()
      onDone(xp, correct, TOTAL, best)
    } else {
      const next = round + 1
      setRound(next)
      setScrambled(scrambleWord(words[next].en))
      setFeedback(null)
    }
  }, [round, TOTAL, xp, correct, best, onDone, words])

  const submit = () => {
    if (locked || !input.trim()) return
    const guess = input.trim().toLowerCase()
    if (guess === current.en.toLowerCase()) {
      sfxCorrect()
      const gain = (10 + streak * 2) * mult
      const newStreak = streak + 1
      setCorrect(c => c + 1)
      setStreak(newStreak)
      setBest(b => Math.max(b, newStreak))
      setXp(x => x + gain)
      setFeedback({ type: 'correct', msg: randomFrom(HAMZA_CORRECT) })
      setInput('')
      setLocked(true)
      setTimeout(() => { setLocked(false); advance() }, 1000)
    } else {
      // WRONG — stay on same word, re-scramble, let them retry
      sfxWrong()
      setStreak(0)
      setFeedback({ type: 'wrong', msg: randomFrom(HAMZA_WRONG) })
      setInput('')
      // Re-scramble after short delay
      setTimeout(() => {
        setScrambled(scrambleWord(current.en))
        setFeedback(null)
      }, 1200)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-70px)] max-w-2xl mx-auto px-4 sm:px-6 py-4 relative z-10">
      <GameBar streak={streak} xp={xp} current={round} total={TOTAL} onExit={onExit} />

      {/* Card — centered, fills available space */}
      <div className="flex-1 flex flex-col justify-center min-h-0">
        <div className="rounded-2xl bg-gradient-to-br from-violet-900/30 via-indigo-900/20 to-purple-900/30 border border-white/[0.06] p-5 sm:p-8 shadow-2xl">
          {/* Emoji + Arabic */}
          <div className="text-center mb-4">
            <div className="text-5xl sm:text-6xl mb-2">{current.emoji}</div>
            <p className="text-white/70 text-lg font-bold">{current.ar}</p>
            {current.hint && <p className="text-amber-300/50 text-xs mt-1 italic">💡 {current.hint}</p>}
          </div>

          {/* Scrambled letters */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {scrambled.split('').map((ch, i) => (
              <div key={`${round}-${i}-${ch}`}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-lg sm:text-xl font-extrabold text-white uppercase"
                style={{ animation: `scaleIn 0.3s ease-out ${i * 40}ms backwards` }}>
                {ch}
              </div>
            ))}
          </div>

          {/* Feedback inline */}
          {feedback && <div className="mb-3"><InlineFeedback type={feedback.type} message={feedback.msg} /></div>}

          {/* Input */}
          <div className="flex gap-2">
            <input ref={inputRef} type="text" value={input}
              onChange={e => setInput(e.target.value.replace(/[^a-zA-Z]/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') submit() }}
              placeholder="اكتب الكلمة..." dir="ltr" autoComplete="off" spellCheck={false}
              disabled={locked}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-base font-bold text-white placeholder:text-white/20 text-center tracking-wider focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all uppercase disabled:opacity-50" />
            <button onClick={submit} disabled={locked || !input.trim()}
              className="bg-violet-600 hover:bg-violet-500 disabled:bg-white/[0.06] disabled:text-white/20 text-white font-extrabold px-4 rounded-xl transition-all active:scale-95">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-white/20 text-[10px] mt-2">{round + 1} / {TOTAL}</p>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   GAME 2 — MATCH (stay on same pairs, just deselect on wrong)
// ═════════════════════════════════════════════════════════════════════════════

interface MatchCard { id: string; pairKey: string; label: string; side: 'en' | 'ar'; matched: boolean }

function MatchGame({ difficulty, onDone, onExit }: {
  difficulty: Difficulty
  onDone: (xp: number, correct: number, total: number, bestStreak: number) => void
  onExit: () => void
}) {
  const PAIRS_COUNT = MATCH_CONFIG[difficulty].pairs
  const TIME_START = MATCH_CONFIG[difficulty].time
  const mult = DIFFICULTY_INFO[difficulty].xpMultiplier
  const [pairs] = useState(() => { const p = WORDS.filter(w => w.lvl === difficulty); return pick(p.length >= PAIRS_COUNT ? p : WORDS, PAIRS_COUNT) })
  const [cards, setCards] = useState<MatchCard[]>(() =>
    shuffle(pairs.flatMap(p => [
      { id: `${p.en}-en`, pairKey: p.en, label: `${p.emoji} ${p.en}`, side: 'en' as const, matched: false },
      { id: `${p.en}-ar`, pairKey: p.en, label: p.ar, side: 'ar' as const, matched: false },
    ])),
  )
  const [selEn, setSelEn] = useState<string | null>(null)
  const [selAr, setSelAr] = useState<string | null>(null)
  const [matches, setMatches] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_START)
  const [xp, setXp] = useState(0)
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current || timeLeft <= 0) {
      if (!doneRef.current) { doneRef.current = true; onDone(xp, matches, PAIRS_COUNT, best) }
      return
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  useEffect(() => {
    if (!selEn || !selAr) return
    const en = cards.find(c => c.id === selEn)
    const ar = cards.find(c => c.id === selAr)
    if (!en || !ar) return
    if (en.pairKey === ar.pairKey) {
      sfxCorrect()
      const gain = (15 + streak * 3 + Math.max(0, Math.floor(timeLeft / 10))) * mult
      const ns = streak + 1
      setMatches(m => m + 1)
      setStreak(ns)
      setBest(b => Math.max(b, ns))
      setXp(x => x + gain)
      setCards(cs => cs.map(c => c.pairKey === en.pairKey ? { ...c, matched: true } : c))
      setSelEn(null); setSelAr(null)
      if (matches + 1 >= PAIRS_COUNT && !doneRef.current) {
        doneRef.current = true
        sfxWin()
        setTimeout(() => onDone(xp + gain, matches + 1, PAIRS_COUNT, Math.max(best, ns)), 600)
      }
    } else {
      sfxWrong()
      setStreak(0)
      setWrongIds([selEn, selAr])
      setTimeout(() => { setSelEn(null); setSelAr(null); setWrongIds([]) }, 500)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selEn, selAr])

  const click = (c: MatchCard) => {
    if (c.matched || wrongIds.length > 0) return
    sfxClick()
    if (c.side === 'en') setSelEn(selEn === c.id ? null : c.id)
    else setSelAr(selAr === c.id ? null : c.id)
  }

  const timePct = (timeLeft / TIME_START) * 100

  return (
    <div className="flex flex-col h-[calc(100dvh-70px)] max-w-3xl mx-auto px-3 sm:px-6 py-4 relative z-10">
      {/* Timer bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/40 text-[11px] font-bold">{matches}/{PAIRS_COUNT}</span>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <span className="flex items-center gap-1 text-amber-200 text-[11px] font-bold"><Flame className="w-3 h-3" />{streak}</span>
            )}
            <span className="flex items-center gap-1 text-violet-200 text-[11px] font-bold"><Zap className="w-3 h-3" />+{xp}</span>
            <span className={`flex items-center gap-1 text-[11px] font-bold ${timeLeft <= 10 ? 'text-red-300 animate-pulse' : 'text-white/50'}`}>
              <Timer className="w-3 h-3" />{timeLeft}ث
            </span>
          </div>
        </div>
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${
            timePct > 33 ? 'bg-emerald-500' : timePct > 16 ? 'bg-amber-500' : 'bg-red-500'
          }`} style={{ width: `${timePct}%` }} />
        </div>
      </div>

      <button onClick={onExit} className="text-white/30 hover:text-white text-[11px] font-bold flex items-center gap-1 mb-2 self-start transition-colors">
        <Home className="w-3 h-3" /> خروج
      </button>

      {/* Cards grid — fills viewport */}
      <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3 auto-rows-fr min-h-0 content-center">
        {cards.map(c => {
          const isSel = c.id === selEn || c.id === selAr
          const isWrong = wrongIds.includes(c.id)
          return (
            <button key={c.id} onClick={() => click(c)} disabled={c.matched}
              className={`rounded-xl border-2 p-2 sm:p-3 text-center transition-all active:scale-95 ${
                c.matched ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200/60 cursor-default'
                : isWrong ? 'bg-red-500/20 border-red-400/50 text-white animate-[shake_0.3s_ease-in-out]'
                : isSel
                  ? c.side === 'en' ? 'bg-blue-500/25 border-blue-400/60 text-white scale-[1.02] shadow-lg' : 'bg-violet-500/25 border-violet-400/60 text-white scale-[1.02] shadow-lg'
                  : c.side === 'en' ? 'bg-blue-500/[0.06] border-blue-500/20 text-blue-100 hover:bg-blue-500/10' : 'bg-violet-500/[0.06] border-violet-500/20 text-violet-100 hover:bg-violet-500/10'
              }`}
              dir={c.side === 'ar' ? 'rtl' : 'ltr'}>
              <span className="block font-extrabold text-sm sm:text-base break-words">{c.label}</span>
              {c.matched && <CheckCircle2 className="absolute top-1 right-1 w-3.5 h-3.5 text-emerald-400" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   GAME 3 — SENTENCE BUILDER (stay until correct)
// ═════════════════════════════════════════════════════════════════════════════

interface BuilderToken { id: string; word: string; used: boolean }

function BuilderGame({ difficulty, onDone, onExit }: {
  difficulty: Difficulty
  onDone: (xp: number, correct: number, total: number, bestStreak: number) => void
  onExit: () => void
}) {
  const TOTAL = BUILDER_CONFIG[difficulty].rounds
  const mult = DIFFICULTY_INFO[difficulty].xpMultiplier
  const [sentences] = useState(() => {
    const p = SENTENCES.filter(s => s.difficulty === difficulty)
    return pick(p.length >= TOTAL ? p : SENTENCES, TOTAL)
  })
  const [round, setRound] = useState(0)
  const mkTokens = (idx: number) => {
    const ws = sentences[idx].en.split(' ')
    return shuffle(ws.map((w, i) => ({ id: `${idx}-${i}-${w}`, word: w, used: false })))
  }
  const [tokens, setTokens] = useState<BuilderToken[]>(() => mkTokens(0))
  const [placed, setPlaced] = useState<BuilderToken[]>([])
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [xp, setXp] = useState(0)
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; msg: string } | null>(null)
  const [locked, setLocked] = useState(false)

  const current = sentences[round]

  const placeToken = (tok: BuilderToken) => {
    if (locked || tok.used) return
    sfxClick()
    setTokens(ts => ts.map(t => t.id === tok.id ? { ...t, used: true } : t))
    setPlaced(p => [...p, tok])
  }

  const removeToken = (tok: BuilderToken) => {
    if (locked) return
    sfxClick()
    setPlaced(p => p.filter(t => t.id !== tok.id))
    setTokens(ts => ts.map(t => t.id === tok.id ? { ...t, used: false } : t))
  }

  const resetBoard = () => {
    if (locked) return
    setTokens(ts => ts.map(t => ({ ...t, used: false })))
    setPlaced([])
    setFeedback(null)
  }

  const advance = useCallback(() => {
    if (round + 1 >= TOTAL) {
      sfxWin()
      onDone(xp, correct, TOTAL, best)
    } else {
      const next = round + 1
      setRound(next)
      setTokens(mkTokens(next))
      setPlaced([])
      setFeedback(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, TOTAL, xp, correct, best, onDone])

  const check = () => {
    if (locked || placed.length === 0) return
    const guess = placed.map(t => t.word).join(' ')
    if (guess === current.en) {
      sfxCorrect()
      const gain = (25 + streak * 5 + current.difficulty * 10) * mult
      const ns = streak + 1
      setCorrect(c => c + 1)
      setStreak(ns)
      setBest(b => Math.max(b, ns))
      setXp(x => x + gain)
      setFeedback({ type: 'correct', msg: randomFrom(HAMZA_CORRECT) })
      setLocked(true)
      setTimeout(() => { setLocked(false); advance() }, 1000)
    } else {
      // WRONG — reset board, let them retry
      sfxWrong()
      setStreak(0)
      setFeedback({ type: 'wrong', msg: randomFrom(HAMZA_WRONG) })
      setTimeout(() => {
        setTokens(ts => ts.map(t => ({ ...t, used: false })))
        setPlaced([])
        // Keep feedback visible briefly
        setTimeout(() => setFeedback(null), 800)
      }, 600)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-70px)] max-w-3xl mx-auto px-4 sm:px-6 py-4 relative z-10">
      <GameBar streak={streak} xp={xp} current={round} total={TOTAL} onExit={onExit} />

      <div className="flex-1 flex flex-col justify-center min-h-0">
        <div className="rounded-2xl bg-gradient-to-br from-pink-900/20 via-rose-900/20 to-red-900/20 border border-white/[0.06] p-4 sm:p-6 shadow-2xl">
          {/* Arabic prompt */}
          <div className="text-center mb-4">
            <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-1.5">رتب الجملة بالإنجليزية</p>
            <p className="text-white text-base sm:text-lg font-extrabold leading-relaxed" dir="rtl">{current.ar}</p>
          </div>

          {/* Placed area */}
          <div className="min-h-[56px] rounded-xl bg-black/30 border-2 border-dashed border-white/[0.1] p-2.5 mb-3 flex flex-wrap items-center gap-1.5" dir="ltr">
            {placed.length === 0 ? (
              <span className="mx-auto text-white/20 text-xs italic">اضغط الكلمات لترتيبها هنا ↓</span>
            ) : placed.map(tok => (
              <button key={tok.id} onClick={() => removeToken(tok)} disabled={locked}
                className="px-2.5 py-1.5 rounded-lg bg-pink-500/20 border border-pink-400/40 text-white font-bold text-sm hover:bg-pink-500/30 transition-all active:scale-95">
                {tok.word}
              </button>
            ))}
          </div>

          {/* Word tokens */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 min-h-[44px] mb-3" dir="ltr">
            {tokens.filter(t => !t.used).map(tok => (
              <button key={tok.id} onClick={() => placeToken(tok)} disabled={locked}
                className="px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white font-bold text-sm hover:bg-white/[0.1] hover:border-white/[0.2] transition-all active:scale-95">
                {tok.word}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {feedback && <div className="mb-3"><InlineFeedback type={feedback.type} message={feedback.msg} /></div>}

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={resetBoard} disabled={locked || placed.length === 0}
              className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] disabled:opacity-30 text-white/60 font-bold px-3 py-2.5 rounded-xl transition-all text-sm">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button onClick={check} disabled={locked || placed.length === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 text-white font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              تحقق
            </button>
          </div>
          <p className="text-center text-white/20 text-[10px] mt-2">{round + 1} / {TOTAL}</p>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   GAME 4 — WORD SNAKE (endless, grid-based, eat words to form sentences)
// ═════════════════════════════════════════════════════════════════════════════

const SNAKE_SENTENCES = [
  { en: ['I', 'am', 'happy'],                       ar: 'أنا سعيد' },
  { en: ['She', 'is', 'my', 'friend'],              ar: 'هي صديقتي' },
  { en: ['I', 'love', 'tea'],                        ar: 'أحب الشاي' },
  { en: ['He', 'is', 'a', 'teacher'],               ar: 'هو أستاذ' },
  { en: ['We', 'go', 'to', 'school'],               ar: 'نذهب إلى المدرسة' },
  { en: ['My', 'name', 'is', 'Hamza'],              ar: 'اسمي حمزة' },
  { en: ['I', 'live', 'in', 'Oued', 'Zem'],         ar: 'أعيش في واد زم' },
  { en: ['This', 'is', 'my', 'book'],               ar: 'هذا كتابي' },
  { en: ['I', 'eat', 'bread', 'every', 'morning'],  ar: 'آكل الخبز كل صباح' },
  { en: ['She', 'drinks', 'coffee'],                 ar: 'هي تشرب القهوة' },
  { en: ['The', 'sun', 'is', 'beautiful'],           ar: 'الشمس جميلة' },
  { en: ['I', 'want', 'to', 'learn', 'English'],    ar: 'أريد تعلم الإنجليزية' },
  { en: ['My', 'mother', 'cooks', 'tagine'],        ar: 'أمي تطبخ الطاجين' },
  { en: ['He', 'reads', 'a', 'book'],               ar: 'يقرأ كتاباً' },
  { en: ['I', 'play', 'every', 'day'],              ar: 'ألعب كل يوم' },
  { en: ['We', 'are', 'students'],                   ar: 'نحن طلاب' },
  { en: ['The', 'weather', 'is', 'nice'],           ar: 'الطقس لطيف' },
  { en: ['I', 'study', 'with', 'Teacher', 'Hamza'], ar: 'أدرس مع تيتشر حمزة' },
  { en: ['She', 'is', 'very', 'happy'],             ar: 'هي سعيدة جداً' },
  { en: ['My', 'father', 'works', 'hard'],          ar: 'أبي يعمل بجد' },
  { en: ['I', 'drink', 'water'],                     ar: 'أشرب الماء' },
  { en: ['Oued', 'Zem', 'is', 'great'],             ar: 'واد زم رائعة' },
  { en: ['Never', 'give', 'up'],                     ar: 'لا تستسلم' },
  { en: ['I', 'can', 'do', 'it'],                   ar: 'أستطيع فعلها' },
]

type Dir = 'up' | 'down' | 'left' | 'right'
type Cell = { r: number; c: number }

const GRID_COLS = 10
const GRID_ROWS = 10

function cellKey(r: number, c: number) { return `${r}-${c}` }

function SnakeGame({ onDone, onExit }: {
  onDone: (xp: number, sentences: number, bestCombo: number) => void
  onExit: () => void
}) {
  const [musicOn, setMusicOn] = useState(true)

  const pickSentence = useCallback(() => {
    return SNAKE_SENTENCES[Math.floor(Math.random() * SNAKE_SENTENCES.length)]
  }, [])

  const placeWord = useCallback((snake: Cell[], existing: Map<string, string>, word: string): Cell => {
    const occupied = new Set([
      ...snake.map(s => cellKey(s.r, s.c)),
      ...existing.keys(),
    ])
    const free: Cell[] = []
    for (let r = 0; r < GRID_ROWS; r++)
      for (let c = 0; c < GRID_COLS; c++)
        if (!occupied.has(cellKey(r, c))) free.push({ r, c })
    if (free.length === 0) return { r: 0, c: 0 }
    return free[Math.floor(Math.random() * free.length)]
  }, [])

  // State
  const [snake, setSnake] = useState<Cell[]>([{ r: 5, c: 5 }, { r: 5, c: 4 }, { r: 5, c: 3 }])
  const [dir, setDir] = useState<Dir>('right')
  const [sentence, setSentence] = useState(() => pickSentence())
  const [wordIdx, setWordIdx] = useState(0)
  const [wordCells, setWordCells] = useState<Map<string, string>>(new Map())
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [xp, setXp] = useState(0)
  const [sentencesDone, setSentencesDone] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [speed, setSpeed] = useState(300)
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)
  const [collected, setCollected] = useState<string[]>([])
  const [sentenceFlash, setSentenceFlash] = useState(false)

  const dirRef = useRef(dir)
  const snakeRef = useRef(snake)
  const wordCellsRef = useRef(wordCells)
  const sentenceRef = useRef(sentence)
  const wordIdxRef = useRef(wordIdx)
  const gameOverRef = useRef(false)

  dirRef.current = dir
  snakeRef.current = snake
  wordCellsRef.current = wordCells
  sentenceRef.current = sentence
  wordIdxRef.current = wordIdx

  // Start/stop BGM
  useEffect(() => {
    if (musicOn && !gameOver) startBgm()
    else stopBgm()
    return () => stopBgm()
  }, [musicOn, gameOver])

  // Place initial words
  useEffect(() => {
    const initial = new Map<string, string>()
    const s = snakeRef.current
    const words = sentenceRef.current.en
    const allWords = [...words]
    const distractors = ['cat', 'run', 'big', 'why', 'red', 'the', 'can', 'you', 'no', 'yes', 'is', 'it']
    for (let i = 0; i < 3; i++) allWords.push(distractors[Math.floor(Math.random() * distractors.length)])
    shuffle(allWords).forEach(w => {
      const cell = placeWord(s, initial, w)
      initial.set(cellKey(cell.r, cell.c), w)
    })
    setWordCells(initial)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Spawn new sentence words
  const spawnNewSentence = useCallback(() => {
    const ns = pickSentence()
    setSentence(ns)
    sentenceRef.current = ns
    setWordIdx(0)
    wordIdxRef.current = 0
    setCollected([])
    setWordCells(prev => {
      const next = new Map(prev)
      const allWords = [...ns.en]
      const distractors = ['cat', 'run', 'big', 'why', 'red', 'no', 'yes', 'so', 'on', 'up']
      for (let i = 0; i < 2; i++) allWords.push(distractors[Math.floor(Math.random() * distractors.length)])
      shuffle(allWords).forEach(w => {
        const cell = placeWord(snakeRef.current, next, w)
        next.set(cellKey(cell.r, cell.c), w)
      })
      return next
    })
  }, [pickSentence, placeWord])

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameOverRef.current) return
      const d = dirRef.current
      if ((e.key === 'ArrowUp'    || e.key === 'w') && d !== 'down')  setDir('up')
      if ((e.key === 'ArrowDown'  || e.key === 's') && d !== 'up')    setDir('down')
      if ((e.key === 'ArrowLeft'  || e.key === 'a') && d !== 'right') setDir('left')
      if ((e.key === 'ArrowRight' || e.key === 'd') && d !== 'left')  setDir('right')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Swipe controls (on the whole game area)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current || gameOverRef.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    const d = dirRef.current
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20 && d !== 'left') setDir('right')
      else if (dx < -20 && d !== 'right') setDir('left')
    } else {
      if (dy > 20 && d !== 'up') setDir('down')
      else if (dy < -20 && d !== 'down') setDir('up')
    }
    touchStart.current = null
  }, [])

  // Game loop
  useEffect(() => {
    if (gameOver) return
    const tick = setInterval(() => {
      const s = [...snakeRef.current]
      const head = s[0]
      const d = dirRef.current
      let nr = head.r, nc = head.c
      if (d === 'up')    nr--
      if (d === 'down')  nr++
      if (d === 'left')  nc--
      if (d === 'right') nc++

      // Wrap around
      if (nr < 0) nr = GRID_ROWS - 1
      if (nr >= GRID_ROWS) nr = 0
      if (nc < 0) nc = GRID_COLS - 1
      if (nc >= GRID_COLS) nc = 0

      // Self-collision
      if (s.some(seg => seg.r === nr && seg.c === nc)) {
        sfxCrash()
        gameOverRef.current = true
        setGameOver(true)
        return
      }

      const newHead: Cell = { r: nr, c: nc }
      const key = cellKey(nr, nc)
      const wc = wordCellsRef.current
      const hitWord = wc.get(key)

      if (hitWord) {
        const target = sentenceRef.current.en[wordIdxRef.current]
        if (hitWord === target) {
          sfxEat()
          const newIdx = wordIdxRef.current + 1
          setWordIdx(newIdx)
          wordIdxRef.current = newIdx
          setCollected(c => [...c, hitWord])
          setScore(sc => sc + 10)
          setXp(x => x + 15)
          setCombo(c => { const nc = c + 1; setBestCombo(b => Math.max(b, nc)); return nc })
          setFlash('correct')
          setTimeout(() => setFlash(null), 400)

          setWordCells(prev => { const n = new Map(prev); n.delete(key); return n })
          wordCellsRef.current = new Map(wordCellsRef.current)
          wordCellsRef.current.delete(key)

          // Grow snake
          setSnake([newHead, ...s])
          snakeRef.current = [newHead, ...s]

          // Sentence complete?
          if (newIdx >= sentenceRef.current.en.length) {
            sfxSentenceComplete()
            setSentencesDone(sd => sd + 1)
            setSentenceFlash(true)
            setTimeout(() => setSentenceFlash(false), 800)
            setScore(sc => sc + 50)
            setXp(x => x + 50)
            setSpeed(sp => Math.max(120, sp - 12))
            setTimeout(() => spawnNewSentence(), 600)
          }
        } else {
          sfxCrash()
          gameOverRef.current = true
          setGameOver(true)
          return
        }
      } else {
        const ns = [newHead, ...s.slice(0, -1)]
        setSnake(ns)
        snakeRef.current = ns
      }
    }, speed)
    return () => clearInterval(tick)
  }, [gameOver, speed, spawnNewSentence])

  // Handle exit — stop music
  const handleExit = () => { stopBgm(); onExit() }
  const handleDone = () => { stopBgm(); onDone(xp, sentencesDone, bestCombo) }

  // Game over screen
  if (gameOver) {
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`مرحباً تيتشر حمزة! لعبت Word Snake في إنجليزي.كوم وأكملت ${sentencesDone} جملة وحصلت على ${xp} XP! 🐍🔥`)}`
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-70px)] px-4 relative z-10">
        <style jsx>{`
          @keyframes snakeSlither { 0%,100%{transform:rotate(-5deg) scale(1)} 50%{transform:rotate(5deg) scale(1.1)} }
          @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(249,115,22,0.3)} 50%{box-shadow:0 0 40px rgba(249,115,22,0.5)} }
        `}</style>
        <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-orange-950/60 via-red-950/40 to-amber-950/60 border border-orange-500/20 p-6 text-center shadow-2xl relative overflow-hidden"
          style={{ animation: 'glowPulse 2s ease-in-out infinite' }}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-400 to-amber-400" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.1),transparent_60%)]" />

          <div className="text-6xl mb-3 relative" style={{ animation: 'snakeSlither 1.5s ease-in-out infinite' }}>🐍</div>
          <h2 className="text-2xl font-black text-white mb-1">انتهت اللعبة!</h2>
          <p className="text-orange-200/60 text-xs mb-4">{sentencesDone > 0 ? randomFrom(HAMZA_CORRECT) : 'حاول مرة أخرى! 💪'}</p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="rounded-xl bg-violet-500/15 border border-violet-500/25 py-2.5 px-1.5">
              <Zap className="w-4 h-4 text-violet-400 mx-auto mb-0.5" />
              <p className="text-xl font-black text-violet-200">+{xp}</p>
              <p className="text-[9px] text-white/30 font-bold">XP</p>
            </div>
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/25 py-2.5 px-1.5">
              <Target className="w-4 h-4 text-emerald-400 mx-auto mb-0.5" />
              <p className="text-xl font-black text-emerald-200">{sentencesDone}</p>
              <p className="text-[9px] text-white/30 font-bold">جمل</p>
            </div>
            <div className="rounded-xl bg-amber-500/15 border border-amber-500/25 py-2.5 px-1.5">
              <Flame className="w-4 h-4 text-amber-400 mx-auto mb-0.5" />
              <p className="text-xl font-black text-amber-200">{bestCombo}</p>
              <p className="text-[9px] text-white/30 font-bold">كومبو</p>
            </div>
          </div>

          <div className="space-y-2">
            <button onClick={handleDone}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(249,115,22,0.4)] active:scale-95 text-sm">
              <RefreshCw className="w-4 h-4" /> العب مرة أخرى
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleExit}
                className="flex items-center justify-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white/60 hover:text-white font-bold py-2.5 rounded-xl transition-all text-xs">
                <Home className="w-3.5 h-3.5" /> القائمة
              </button>
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all text-xs">
                <MessageCircle className="w-3.5 h-3.5" /> شارك
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Build grid data
  const snakeSet = new Set(snake.map(s => cellKey(s.r, s.c)))
  const headKey = cellKey(snake[0].r, snake[0].c)
  // Compute snake body index for gradient coloring
  const snakeMap = new Map<string, number>()
  snake.forEach((s, i) => snakeMap.set(cellKey(s.r, s.c), i))

  return (
    <div className="flex flex-col h-[calc(100dvh-70px)] max-w-lg mx-auto px-2 sm:px-4 py-2 relative z-10 select-none"
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

      <style jsx>{`
        @keyframes neonGlow { 0%,100%{box-shadow:0 0 8px rgba(52,211,153,0.4), inset 0 0 4px rgba(52,211,153,0.1)} 50%{box-shadow:0 0 16px rgba(52,211,153,0.6), inset 0 0 8px rgba(52,211,153,0.2)} }
        @keyframes targetPulse { 0%,100%{box-shadow:0 0 6px rgba(251,191,36,0.3)} 50%{box-shadow:0 0 14px rgba(251,191,36,0.6)} }
        @keyframes sentenceGlow { 0%{background:rgba(16,185,129,0.2)} 100%{background:transparent} }
        @keyframes dpadPress { 0%{transform:scale(1)} 50%{transform:scale(0.88)} 100%{transform:scale(1)} }
      `}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <button onClick={handleExit} className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]">
          <Home className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 bg-violet-500/15 border border-violet-500/25 px-2.5 py-1 rounded-full text-violet-200 text-[11px] font-bold">
            <Zap className="w-3 h-3" />+{xp}
          </span>
          <span className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 rounded-full text-emerald-200 text-[11px] font-bold">
            🐍 {sentencesDone}
          </span>
          {combo > 1 && (
            <span className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/25 px-2.5 py-1 rounded-full text-amber-200 text-[11px] font-bold animate-pulse">
              <Flame className="w-3 h-3" />×{combo}
            </span>
          )}
          <button onClick={() => setMusicOn(m => !m)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all">
            {musicOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Sentence target */}
      <div className={`rounded-xl border p-2.5 mb-1.5 text-center transition-all duration-300 ${
        sentenceFlash ? 'bg-emerald-500/20 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
        : flash === 'correct' ? 'bg-emerald-500/15 border-emerald-400/30'
        : flash === 'wrong' ? 'bg-red-500/15 border-red-400/30'
        : 'bg-white/[0.03] border-white/[0.08]'
      }`}>
        <p className="text-white/40 text-[10px] font-bold mb-1" dir="rtl">{sentence.ar}</p>
        <div className="flex flex-wrap items-center justify-center gap-1.5" dir="ltr">
          {sentence.en.map((w, i) => (
            <span key={i} className={`text-xs font-bold px-2 py-0.5 rounded-md transition-all duration-200 ${
              i < wordIdx
                ? 'bg-emerald-500/25 text-emerald-300 line-through'
                : i === wordIdx
                  ? 'bg-amber-500/25 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse'
                  : 'text-white/25 bg-white/[0.03]'
            }`}>{w}</span>
          ))}
        </div>
        {collected.length > 0 && (
          <p className="text-emerald-300/50 text-[10px] mt-1 font-bold" dir="ltr">{collected.join(' ')}</p>
        )}
      </div>

      {/* Game grid — neon style */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="w-full aspect-square max-h-full grid rounded-xl overflow-hidden border border-emerald-500/10"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            background: 'linear-gradient(180deg, rgba(0,20,15,0.9) 0%, rgba(0,10,20,0.95) 100%)',
            boxShadow: '0 0 30px rgba(16,185,129,0.08), inset 0 0 30px rgba(0,0,0,0.3)',
          }}>
          {Array.from({ length: GRID_ROWS }).map((_, r) =>
            Array.from({ length: GRID_COLS }).map((_, c) => {
              const k = cellKey(r, c)
              const isHead = k === headKey
              const isSnake = snakeSet.has(k)
              const bodyIdx = snakeMap.get(k) ?? -1
              const word = wordCells.get(k)
              const isTarget = word === sentence.en[wordIdx]

              // Snake body gradient: head is brightest, tail fades
              const snakeOpacity = isSnake ? Math.max(0.2, 1 - bodyIdx * 0.08) : 0

              return (
                <div key={k} className={`relative flex items-center justify-center text-[7px] sm:text-[9px] font-bold leading-none overflow-hidden transition-colors duration-100 ${
                  isHead ? 'z-10'
                  : word && isTarget ? ''
                  : word ? ''
                  : ''
                }`}
                style={{
                  borderRight: c < GRID_COLS - 1 ? '1px solid rgba(16,185,129,0.06)' : 'none',
                  borderBottom: r < GRID_ROWS - 1 ? '1px solid rgba(16,185,129,0.06)' : 'none',
                  ...(isHead ? {
                    background: 'linear-gradient(135deg, #34d399, #10b981)',
                    borderRadius: '4px',
                    boxShadow: '0 0 12px rgba(52,211,153,0.6), 0 0 4px rgba(52,211,153,0.8)',
                  } : isSnake ? {
                    background: `rgba(16,185,129,${snakeOpacity * 0.7})`,
                    boxShadow: snakeOpacity > 0.5 ? `0 0 6px rgba(52,211,153,${snakeOpacity * 0.3})` : 'none',
                    borderRadius: '2px',
                  } : word && isTarget ? {
                    background: 'rgba(251,191,36,0.15)',
                    boxShadow: '0 0 10px rgba(251,191,36,0.2)',
                  } : word ? {
                    background: 'rgba(255,255,255,0.04)',
                  } : {}),
                }}>
                  {isHead && <span className="text-[11px] sm:text-sm drop-shadow-lg">🐍</span>}
                  {!isSnake && word && (
                    <span className={`truncate px-0.5 ${
                      isTarget ? 'text-amber-300 font-extrabold drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]' : 'text-white/40'
                    }`}>{word}</span>
                  )}
                </div>
              )
            }),
          )}
        </div>
      </div>

      {/* D-pad for mobile — bigger, colored, proper icons */}
      <div className="flex items-center justify-center mt-2 sm:hidden">
        <div className="grid grid-cols-3 gap-1.5 w-40">
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); if (dirRef.current !== 'down') { setDir('up'); sfxClick() } }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
              dir === 'up'
                ? 'bg-emerald-500/30 border-2 border-emerald-400/50 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                : 'bg-white/[0.08] border border-white/[0.12] text-white/50 active:bg-emerald-500/20'
            }`}>
            <ChevronUp className="w-6 h-6" />
          </button>
          <div />

          <button
            onTouchStart={(e) => { e.preventDefault(); if (dirRef.current !== 'right') { setDir('left'); sfxClick() } }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
              dir === 'left'
                ? 'bg-emerald-500/30 border-2 border-emerald-400/50 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                : 'bg-white/[0.08] border border-white/[0.12] text-white/50 active:bg-emerald-500/20'
            }`}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="w-12 h-12 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm">🐍</div>
          </div>
          <button
            onTouchStart={(e) => { e.preventDefault(); if (dirRef.current !== 'left') { setDir('right'); sfxClick() } }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
              dir === 'right'
                ? 'bg-emerald-500/30 border-2 border-emerald-400/50 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                : 'bg-white/[0.08] border border-white/[0.12] text-white/50 active:bg-emerald-500/20'
            }`}>
            <ChevronRight className="w-6 h-6" />
          </button>

          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); if (dirRef.current !== 'up') { setDir('down'); sfxClick() } }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
              dir === 'down'
                ? 'bg-emerald-500/30 border-2 border-emerald-400/50 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                : 'bg-white/[0.08] border border-white/[0.12] text-white/50 active:bg-emerald-500/20'
            }`}>
            <ChevronDown className="w-6 h-6" />
          </button>
          <div />
        </div>
      </div>

      <p className="text-center text-white/15 text-[9px] mt-1 hidden sm:block">
        استخدم الأسهم أو WASD للتحكم · كُل الكلمة الصحيحة = نقاط · الكلمة الغلط = انتهت اللعبة
      </p>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   RESULTS (compact — fits viewport, no scrolling)
// ═════════════════════════════════════════════════════════════════════════════

function ResultsScreen({ xp, correct, total, bestStreak, gameName, difficulty, onReplay, onNextLevel, onMenu }: {
  xp: number; correct: number; total: number; bestStreak: number
  gameName: string; difficulty: Difficulty
  onReplay: () => void; onNextLevel: () => void; onMenu: () => void
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const [title, sub, emoji] = pct >= 90
    ? ['أسطورة! 🏆', 'واد زم فخور بيك!', '🌟']
    : pct >= 70
      ? ['ممتاز! 🔥', 'Bravo! استمر على هاد المنوال', '💪']
      : pct >= 50
        ? ['جيد! 👍', 'تقدم ملموس، حسّن أكثر', '✨']
        : ['حاول مرة أخرى 🌱', 'كل أسطورة بدات بخطوة', '💡']

  const hasNext = difficulty < 3
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`مرحباً تيتشر حمزة! لعبت ${gameName} وحصلت على ${xp} XP 🎮`)}`

  useEffect(() => { sfxWin() }, [])

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100dvh-70px)] px-4 sm:px-6 relative z-10">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-indigo-900/40 via-violet-900/30 to-purple-900/40 border border-white/[0.08] p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500" />

        <div className="text-5xl mb-2" style={{ animation: 'bounceIn 0.6s ease-out' }}>{emoji}</div>
        <h2 className="text-2xl font-black text-white mb-1">{title}</h2>
        <p className="text-white/50 text-xs mb-1">{sub}</p>
        <p className="text-white/25 text-[10px] mb-4">{gameName} · {DIFFICULTY_INFO[difficulty].label}</p>

        {/* Score row */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 py-2.5 px-2">
            <Zap className="w-4 h-4 text-violet-400 mx-auto mb-1" />
            <p className="text-lg font-black text-violet-200">+{xp}</p>
            <p className="text-[10px] text-white/30">XP</p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-2.5 px-2">
            <Target className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-black text-emerald-200">{correct}/{total}</p>
            <p className="text-[10px] text-white/30">صحيح</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 py-2.5 px-2">
            <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-black text-amber-200">{bestStreak}</p>
            <p className="text-[10px] text-white/30">سلسلة</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <button onClick={() => { sfxClick(); onReplay() }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-xl transition-all shadow-lg active:scale-95 text-sm">
            <RefreshCw className="w-4 h-4" />
            أعد اللعب (كلمات جديدة)
          </button>
          {hasNext && (
            <button onClick={() => { sfxLevelUp(); onNextLevel() }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold py-3 rounded-xl transition-all shadow-lg active:scale-95 text-sm">
              <ChevronUp className="w-4 h-4" />
              المستوى التالي: {DIFFICULTY_INFO[(difficulty + 1) as Difficulty].label} {DIFFICULTY_INFO[(difficulty + 1) as Difficulty].emoji}
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onMenu}
              className="flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white font-bold py-2.5 rounded-xl transition-all text-xs">
              <Home className="w-3.5 h-3.5" /> القائمة
            </button>
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all text-xs">
              <MessageCircle className="w-3.5 h-3.5" /> شارك
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   DIFFICULTY PICKER
// ═════════════════════════════════════════════════════════════════════════════

function DifficultyPicker({ game, onPick, onBack }: {
  game: GameMode; onPick: (d: Difficulty) => void; onBack: () => void
}) {
  const gameMeta: Record<GameMode, { title: string; subtitle: string; Icon: typeof Shuffle; color: string }> = {
    scramble: { title: 'قلب الحروف',   subtitle: 'Word Scramble',    Icon: Shuffle, color: 'text-violet-300' },
    match:    { title: 'طابق الكلمات', subtitle: 'Quick Match',      Icon: Link2,   color: 'text-blue-300' },
    builder:  { title: 'ركب الجملة',   subtitle: 'Sentence Builder', Icon: Blocks,  color: 'text-pink-300' },
    snake:    { title: 'أفعى الكلمات', subtitle: 'Word Snake',       Icon: Bug,     color: 'text-orange-300' },
  }
  const m = gameMeta[game]

  const levelDetails: Record<Difficulty, { rounds: string; desc: string }> = {
    1: { rounds: game === 'match' ? `${MATCH_CONFIG[1].pairs} أزواج · ${MATCH_CONFIG[1].time}ث` : `${game === 'scramble' ? SCRAMBLE_CONFIG[1].rounds : BUILDER_CONFIG[1].rounds} جولات`, desc: 'كلمات مألوفة — مثالي للبداية' },
    2: { rounds: game === 'match' ? `${MATCH_CONFIG[2].pairs} أزواج · ${MATCH_CONFIG[2].time}ث` : `${game === 'scramble' ? SCRAMBLE_CONFIG[2].rounds : BUILDER_CONFIG[2].rounds} جولات`, desc: 'تحدٍّ أكبر · نقاط ×2' },
    3: { rounds: game === 'match' ? `${MATCH_CONFIG[3].pairs} أزواج · ${MATCH_CONFIG[3].time}ث` : `${game === 'scramble' ? SCRAMBLE_CONFIG[3].rounds : BUILDER_CONFIG[3].rounds} جولات`, desc: 'للأبطال! نقاط ×3' },
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100dvh-70px)] px-4 sm:px-6 relative z-10">
      <div className="w-full max-w-lg">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs font-bold mb-4 transition-colors">
          <ArrowRight className="w-3.5 h-3.5 rotate-180" /> القائمة
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/[0.06] border border-white/[0.1] mb-3">
            <m.Icon className={`w-7 h-7 ${m.color}`} />
          </div>
          <p className="text-white/30 text-[10px] font-bold tracking-widest uppercase mb-1">{m.subtitle}</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{m.title}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([1, 2, 3] as Difficulty[]).map(d => {
            const info = DIFFICULTY_INFO[d]
            const det = levelDetails[d]
            return (
              <button key={d} onClick={() => { sfxClick(); onPick(d) }}
                className={`group text-center rounded-2xl bg-gradient-to-br ${info.gradient} border ${info.border} p-5 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl`}>
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{info.emoji}</div>
                <h3 className="text-white font-black text-lg mb-1">{info.label}</h3>
                <p className="text-white/50 text-[11px] mb-1.5">{det.rounds}</p>
                <p className="text-white/35 text-[10px] leading-relaxed">{det.desc}</p>
                {info.xpMultiplier > 1 && (
                  <div className="inline-flex items-center gap-1 mt-2 bg-white/[0.08] text-white/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Zap className="w-2.5 h-2.5" /> ×{info.xpMultiplier}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   MENU SCREEN
// ═════════════════════════════════════════════════════════════════════════════

function MenuScreen({ progress, onPick }: { progress: PlayProgress; onPick: (game: GameMode) => void }) {
  const level = getLevel(progress.xp)
  const games: Array<{ id: GameMode; title: string; subtitle: string; desc: string; Icon: typeof Shuffle; gradient: string; border: string }> = [
    { id: 'scramble', title: 'قلب الحروف', subtitle: 'Word Scramble', desc: 'رتب الحروف المخلوطة', Icon: Shuffle, gradient: 'from-violet-600/20 to-indigo-600/20', border: 'border-violet-500/30' },
    { id: 'match',    title: 'طابق الكلمات', subtitle: 'Quick Match', desc: 'اربط الكلمة بترجمتها', Icon: Link2, gradient: 'from-blue-600/20 to-cyan-600/20', border: 'border-blue-500/30' },
    { id: 'builder',  title: 'ركب الجملة', subtitle: 'Sentence Builder', desc: 'رتب الكلمات لتكوين جملة', Icon: Blocks, gradient: 'from-pink-600/20 to-rose-600/20', border: 'border-pink-500/30' },
    { id: 'snake',    title: 'أفعى الكلمات', subtitle: 'Word Snake', desc: 'كُل الكلمات بالترتيب لتكوين جمل', Icon: Bug, gradient: 'from-orange-600/20 to-amber-600/20', border: 'border-orange-500/30' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 relative z-10">
      {/* Hero (compact) */}
      <section className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          <Gamepad2 className="w-3.5 h-3.5" /> العب وتعلم
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 leading-tight">
          كنز اللغة <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">الإنجليزية</span>
        </h1>
        <p className="text-white/50 text-xs sm:text-sm max-w-md mx-auto">
          مع تيتشر حمزة القصراوي من <span className="text-amber-300 font-bold">واد زم</span> 😎
        </p>
      </section>

      {/* Teacher badge (compact) */}
      <section className="mb-5">
        <div className="rounded-2xl bg-gradient-to-r from-amber-900/20 via-orange-900/20 to-red-900/20 border border-amber-500/20 p-4 flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-xl shrink-0">ح</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-black text-sm sm:text-base leading-tight">Teacher Hamza el Qasraoui</h2>
            <p className="text-white/40 text-[11px] mt-0.5">📍 واد زم · معلم الإنجليزية</p>
          </div>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً تيتشر حمزة! أريد معلومات عن الدروس.')}`}
            target="_blank" rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg transition-all text-xs shrink-0">
            <MessageCircle className="w-3.5 h-3.5" /> تواصل
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
          <span className="block text-xl">{level.emoji}</span>
          <p className="text-white/50 text-[10px] font-bold mt-0.5">{level.title}</p>
        </div>
        <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-3 text-center">
          <Zap className="w-4 h-4 text-violet-400 mx-auto" />
          <p className="text-lg font-black text-violet-200">{progress.xp}</p>
          <p className="text-[10px] text-white/30 font-bold">XP</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
          <Flame className="w-4 h-4 text-amber-400 mx-auto" />
          <p className="text-lg font-black text-amber-200">{progress.bestStreak}</p>
          <p className="text-[10px] text-white/30 font-bold">سلسلة</p>
        </div>
      </section>

      {/* Games grid */}
      <section className="mb-6">
        <h2 className="text-white font-black text-base sm:text-lg mb-3 flex items-center gap-2">
          <Rocket className="w-4 h-4 text-pink-400" /> اختر لعبتك
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {games.map(g => (
            <button key={g.id} onClick={() => { sfxClick(); onPick(g.id) }}
              className={`group text-right rounded-2xl bg-gradient-to-br ${g.gradient} border ${g.border} p-5 hover:scale-[1.02] transition-all shadow-lg active:scale-[0.98]`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <g.Icon className="w-5 h-5 text-white" />
                </div>
                <span className="bg-white/[0.08] text-white/50 text-[10px] font-bold px-2 py-0.5 rounded-full">{g.id === 'snake' ? 'بلا حدود 🐍' : '٣ مستويات'}</span>
              </div>
              <h3 className="text-white font-black text-base mb-0.5">{g.title}</h3>
              <p className="text-white/30 text-[10px] font-bold tracking-wider uppercase mb-1.5">{g.subtitle}</p>
              <p className="text-white/45 text-xs">{g.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-white/35 text-xs font-bold group-hover:text-white transition-colors">
                ابدأ <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/20 p-5 text-center">
        <Sparkles className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
        <h3 className="text-white font-black text-sm sm:text-base mb-1">استمتعت؟ تعلم أكثر مع تيتشر حمزة</h3>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Link href="/courses" className="inline-flex items-center gap-1.5 bg-white text-emerald-900 font-extrabold px-4 py-2 rounded-xl text-xs transition-all hover:-translate-y-0.5 active:scale-95">
            <Crown className="w-3.5 h-3.5" /> الدورات
          </Link>
          <Link href="/live" className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-95">
            <Heart className="w-3.5 h-3.5" /> حصة مباشرة
          </Link>
        </div>
      </section>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//   MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════

type GameMode = 'scramble' | 'match' | 'builder' | 'snake'
type Screen = 'menu' | 'picker' | GameMode | 'results'

interface LastResult {
  xp: number; correct: number; total: number; bestStreak: number
  gameName: string; from: GameMode; difficulty: Difficulty
}

const GAME_NAMES: Record<GameMode, string> = { scramble: 'قلب الحروف', match: 'طابق الكلمات', builder: 'ركب الجملة', snake: 'أفعى الكلمات' }

export default function PlayPage() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [pickerGame, setPickerGame] = useState<GameMode | null>(null)
  const [activeGame, setActiveGame] = useState<GameMode | null>(null)
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>(1)
  const [progress, setProgress] = useState<PlayProgress>({ xp: 0, bestStreak: 0, gamesPlayed: 0 })
  const [lastResult, setLastResult] = useState<LastResult | null>(null)
  // Key to force re-mount games (ensures fresh random words)
  const [gameKey, setGameKey] = useState(0)

  useEffect(() => { setProgress(loadProgress()) }, [])

  const finishGame = useCallback((xp: number, correct: number, total: number, bestStreak: number) => {
    if (!activeGame) return
    const np: PlayProgress = {
      xp: progress.xp + xp,
      bestStreak: Math.max(progress.bestStreak, bestStreak),
      gamesPlayed: progress.gamesPlayed + 1,
    }
    setProgress(np)
    saveProgressData(np)
    setLastResult({ xp, correct, total, bestStreak, gameName: GAME_NAMES[activeGame], from: activeGame, difficulty: activeDifficulty })
    setScreen('results')
  }, [progress, activeGame, activeDifficulty])

  const openPicker = (g: GameMode) => {
    if (g === 'snake') {
      setActiveGame('snake')
      setGameKey(k => k + 1)
      setScreen('snake')
      return
    }
    setPickerGame(g); setScreen('picker')
  }

  const startGame = (d: Difficulty) => {
    if (!pickerGame) return
    setActiveGame(pickerGame); setActiveDifficulty(d)
    setGameKey(k => k + 1) // new key = fresh words
    setScreen(pickerGame)
  }

  const goMenu = () => { setScreen('menu'); setPickerGame(null); setActiveGame(null) }

  const replay = () => {
    if (!lastResult) return
    setActiveGame(lastResult.from); setActiveDifficulty(lastResult.difficulty)
    setGameKey(k => k + 1) // new key = fresh words
    setScreen(lastResult.from)
  }

  const nextLevel = () => {
    if (!lastResult || lastResult.difficulty >= 3) return
    const nd = (lastResult.difficulty + 1) as Difficulty
    setActiveGame(lastResult.from); setActiveDifficulty(nd)
    setGameKey(k => k + 1)
    setScreen(lastResult.from)
  }

  return (
    <div className="min-h-[100dvh] relative" style={{ background: 'linear-gradient(160deg,#0a0f1e 0%,#111827 50%,#0a0f1e 100%)' }}>
      <FloatingIcons />
      <div className="h-[70px]" />

      {/* Global CSS for animations */}
      <style jsx global>{`
        @keyframes float-icon { 0%,100%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-22px) rotate(6deg)} 50%{transform:translateY(-8px) rotate(-4deg)} 75%{transform:translateY(-26px) rotate(5deg)} }
        @keyframes scaleIn { 0%{transform:scale(0) rotate(-20deg);opacity:0} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes fadeInUp { 0%{transform:translateY(8px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes bounceIn { 0%{transform:scale(0) rotate(-180deg);opacity:0} 60%{transform:scale(1.15) rotate(8deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
      `}</style>

      {screen === 'menu' && <MenuScreen progress={progress} onPick={openPicker} />}

      {screen === 'picker' && pickerGame && (
        <DifficultyPicker game={pickerGame} onPick={startGame} onBack={goMenu} />
      )}

      {screen === 'scramble' && activeGame === 'scramble' && (
        <ScrambleGame key={gameKey} difficulty={activeDifficulty} onDone={finishGame} onExit={goMenu} />
      )}
      {screen === 'match' && activeGame === 'match' && (
        <MatchGame key={gameKey} difficulty={activeDifficulty} onDone={finishGame} onExit={goMenu} />
      )}
      {screen === 'builder' && activeGame === 'builder' && (
        <BuilderGame key={gameKey} difficulty={activeDifficulty} onDone={finishGame} onExit={goMenu} />
      )}

      {screen === 'snake' && activeGame === 'snake' && (
        <SnakeGame key={gameKey} onDone={(xp, sentences, bestCombo) => {
          const np: PlayProgress = {
            xp: progress.xp + xp,
            bestStreak: Math.max(progress.bestStreak, bestCombo),
            gamesPlayed: progress.gamesPlayed + 1,
          }
          setProgress(np)
          saveProgressData(np)
          setLastResult({ xp, correct: sentences, total: sentences, bestStreak: bestCombo, gameName: GAME_NAMES.snake, from: 'snake', difficulty: 3 })
          setScreen('results')
        }} onExit={goMenu} />
      )}

      {screen === 'results' && lastResult && (
        <ResultsScreen
          xp={lastResult.xp} correct={lastResult.correct} total={lastResult.total}
          bestStreak={lastResult.bestStreak}
          gameName={lastResult.gameName} difficulty={lastResult.difficulty}
          onReplay={replay} onNextLevel={nextLevel} onMenu={goMenu}
        />
      )}
    </div>
  )
}
