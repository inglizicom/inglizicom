'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  GraduationCap, BookOpen, Clock, CheckCircle2, XCircle,
  ArrowRight, ArrowLeft, Home, RotateCcw, Trophy, Star,
  Volume2, VolumeX, Zap, Target, Award, ChevronRight,
  Sparkles, Crown, Flame, Lock, Unlock, FileText, AlertCircle,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
//  A0 LEVEL EXAM PAGE — Based on Teacher Hamza's PDF (Lessons 1–19)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Ambient Exam Music (Web Audio API) ────────────────────────────────────

const AudioCtx = typeof window !== 'undefined'
  ? (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
  : null

let _ctx: AudioContext | null = null
function getCtx(): AudioContext | null {
  if (!AudioCtx) return null
  if (!_ctx) _ctx = new AudioCtx()
  return _ctx
}

function playTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.08) {
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
  playTone(523, 0.12, 'sine', 0.12)
  setTimeout(() => playTone(659, 0.12, 'sine', 0.12), 80)
  setTimeout(() => playTone(784, 0.18, 'sine', 0.15), 160)
}

function sfxWrong() {
  playTone(200, 0.15, 'square', 0.06)
  setTimeout(() => playTone(160, 0.2, 'square', 0.05), 120)
}

function sfxClick() { playTone(880, 0.04, 'sine', 0.04) }

function sfxComplete() {
  ;[523, 659, 784, 1047, 1318].forEach((f, i) =>
    setTimeout(() => playTone(f, 0.25, 'triangle', 0.1), i * 100),
  )
}

// Background ambient pad
let _ambientNodes: OscillatorNode[] = []
let _ambientGain: GainNode | null = null

function startAmbient() {
  const ctx = getCtx()
  if (!ctx || _ambientNodes.length > 0) return
  _ambientGain = ctx.createGain()
  _ambientGain.gain.setValueAtTime(0, ctx.currentTime)
  _ambientGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 2)
  _ambientGain.connect(ctx.destination)

  // Lo-fi warm pad: Am7 chord with subtle detuning
  const voices: { freq: number; type: OscillatorType; detune: number; vol: number }[] = [
    { freq: 110.00, type: 'sine',     detune: -3,  vol: 1.0 },   // A2
    { freq: 130.81, type: 'triangle', detune: 5,   vol: 0.6 },   // C3
    { freq: 164.81, type: 'sine',     detune: -2,  vol: 0.7 },   // E3
    { freq: 196.00, type: 'triangle', detune: 4,   vol: 0.5 },   // G3
    { freq: 220.00, type: 'sine',     detune: -4,  vol: 0.35 },  // A3 octave
  ]

  // Low-pass filter for warmth
  const lpf = ctx.createBiquadFilter()
  lpf.type = 'lowpass'
  lpf.frequency.setValueAtTime(800, ctx.currentTime)
  lpf.Q.setValueAtTime(0.7, ctx.currentTime)
  lpf.connect(_ambientGain)

  voices.forEach(v => {
    const osc = ctx.createOscillator()
    osc.type = v.type
    osc.frequency.setValueAtTime(v.freq, ctx.currentTime)
    osc.detune.setValueAtTime(v.detune, ctx.currentTime)
    const g = ctx.createGain()
    g.gain.setValueAtTime(v.vol, ctx.currentTime)
    // Slow drift vibrato
    const lfo = ctx.createOscillator()
    const lfoG = ctx.createGain()
    lfo.frequency.setValueAtTime(0.15 + Math.random() * 0.15, ctx.currentTime)
    lfoG.gain.setValueAtTime(0.6, ctx.currentTime)
    lfo.connect(lfoG)
    lfoG.connect(osc.frequency)
    lfo.start()
    osc.connect(g)
    g.connect(lpf)
    osc.start()
    _ambientNodes.push(osc, lfo)
  })
}

function stopAmbient() {
  _ambientNodes.forEach(n => { try { n.stop() } catch { /* */ } })
  _ambientNodes = []
  if (_ambientGain) { try { _ambientGain.disconnect() } catch { /* */ } }
  _ambientGain = null
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface Question {
  id: string
  question: string        // Arabic question text
  context?: string         // Optional English context/sentence
  options: string[]
  correct: number          // index of correct answer
  explanation: string      // Arabic explanation
}

interface Unit {
  id: string
  title: string
  titleEn: string
  lessons: string
  icon: string
  color: string
  gradient: string
  border: string
  questions: Question[]
}

interface ExamResult {
  unitId: string
  score: number
  total: number
  date: number
}

// ─── Storage ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'inglizi-a0-exams'

function loadResults(): Record<string, ExamResult> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

function saveResult(r: ExamResult) {
  const all = loadResults()
  // Keep best score
  if (!all[r.unitId] || r.score > all[r.unitId].score) {
    all[r.unitId] = r
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

// ═══════════════════════════════════════════════════════════════════════════
//  QUESTION BANK — 100% based on PDF content
// ═══════════════════════════════════════════════════════════════════════════

const UNITS: Unit[] = [
  // ── UNIT 1: Greetings & The Alphabet (Lessons 1-2) ──
  {
    id: 'unit1',
    title: 'التحيات والحروف والأرقام',
    titleEn: 'Greetings, Alphabet & Numbers',
    lessons: 'الدرس 1 و 2',
    icon: '👋',
    color: 'text-blue-300',
    gradient: 'from-blue-600/20 to-cyan-600/20',
    border: 'border-blue-500/25',
    questions: [
      {
        id: 'u1q1',
        question: 'ما هو الرد الصحيح على "How are you?"',
        options: ['My name is Hamza', 'I am fine', 'I am from Morocco', 'See you later'],
        correct: 1,
        explanation: 'الرد على "How are you?" يكون "I am fine" أو "I\'m fine"',
      },
      {
        id: 'u1q2',
        question: 'أي من هذه العبارات تُستعمل عند المغادرة؟',
        options: ['Hello', 'Good morning', 'See you tomorrow', 'How are you?'],
        correct: 2,
        explanation: '"See you tomorrow" هي عبارة مغادرة (Leaving phrase)',
      },
      {
        id: 'u1q3',
        question: 'كيف تهجّي كلمة HAMZA؟',
        context: 'How do you spell your name?',
        options: ['H-A-M-S-A', 'H-A-M-Z-A', 'H-E-M-Z-A', 'H-A-M-Z-E'],
        correct: 1,
        explanation: 'HAMZA تُهجّى H-A-M-Z-A',
      },
      {
        id: 'u1q4',
        question: 'ما هو الرد الصحيح على "Nice to meet you"؟',
        options: ['Thank you', 'Nice to meet you too', 'I am fine', 'Goodbye'],
        correct: 1,
        explanation: 'نرد بـ "Nice to meet you too" = وأنا سعيد بلقائك أيضاً',
      },
      {
        id: 'u1q5',
        question: 'ما هو الرقم "Fifteen" بالأرقام؟',
        options: ['50', '14', '15', '5'],
        correct: 2,
        explanation: 'Fifteen = 15',
      },
      {
        id: 'u1q6',
        question: 'كيف نقول الرقم 40 بالإنجليزية؟',
        options: ['Fourteen', 'Fourty', 'Forty', 'Fourth'],
        correct: 2,
        explanation: 'الرقم 40 = Forty (بدون u)',
      },
      {
        id: 'u1q7',
        question: 'كيف نقول الرقم 21 بالإنجليزية؟',
        options: ['Twelve-One', 'Twenty-One', 'Twenteen', 'Two-One'],
        correct: 1,
        explanation: '21 = Twenty-One',
      },
      {
        id: 'u1q8',
        question: 'ما معنى "One Hundred"؟',
        options: ['1000', '10', '100', '110'],
        correct: 2,
        explanation: 'One Hundred = 100',
      },
      {
        id: 'u1q9',
        question: 'ما هو الرد على "How old are you?"',
        context: 'How old are you?',
        options: ['I am from Morocco', 'I am 27 years old', 'My name is Ali', 'I am fine'],
        correct: 1,
        explanation: '"How old are you?" سؤال عن العمر، الجواب: I am ___ years old',
      },
      {
        id: 'u1q10',
        question: 'أي حرف يأتي بعد Q في الأبجدية الإنجليزية؟',
        options: ['P', 'S', 'R', 'T'],
        correct: 2,
        explanation: 'الترتيب: ...P, Q, R, S...',
      },
      {
        id: 'u1q11',
        question: '"What is your phone number?" تسأل عن...',
        options: ['العمر', 'الاسم', 'رقم الهاتف', 'الجنسية'],
        correct: 2,
        explanation: '"What is your phone number?" = ما هو رقم هاتفك؟',
      },
      {
        id: 'u1q12',
        question: 'ما معنى "Ninety"؟',
        options: ['9', '19', '90', '99'],
        correct: 2,
        explanation: 'Ninety = 90',
      },
      {
        id: 'u1q13',
        question: 'كيف تقول "صباح الخير" بالإنجليزية؟',
        options: ['Good evening', 'Good night', 'Good morning', 'Good afternoon'],
        correct: 2,
        explanation: 'Good morning = صباح الخير',
      },
      {
        id: 'u1q14',
        question: '"Seventy-three" يعني بالأرقام...',
        options: ['37', '73', '70', '33'],
        correct: 1,
        explanation: 'Seventy-three = 73',
      },
      {
        id: 'u1q15',
        question: 'ما الفرق بين "Good night" و "Good evening"؟',
        options: ['لا فرق بينهما', 'Good night للوداع و Good evening للتحية', 'Good evening للوداع و Good night للتحية', 'كلاهما للتحية فقط'],
        correct: 1,
        explanation: 'Good evening = مساء الخير (تحية). Good night = تصبح على خير (وداع)',
      },
    ],
  },

  // ── UNIT 2: Countries, Jobs & Marital Status (Lessons 3-4) ──
  {
    id: 'unit2',
    title: 'الدول والمهن والحالة العائلية',
    titleEn: 'Countries, Jobs & Marital Status',
    lessons: 'الدرس 3 و 4',
    icon: '🌍',
    color: 'text-emerald-300',
    gradient: 'from-emerald-600/20 to-teal-600/20',
    border: 'border-emerald-500/25',
    questions: [
      {
        id: 'u2q1',
        question: 'ما هي جنسية شخص من المغرب؟',
        context: 'What is your nationality?',
        options: ['Moroccan', 'Moroccish', 'Moroccian', 'Moroccin'],
        correct: 0,
        explanation: 'Country: Morocco → Nationality: Moroccan',
      },
      {
        id: 'u2q2',
        question: 'ما معنى "Where are you from?"',
        options: ['ما اسمك؟', 'كم عمرك؟', 'من أين أنت؟', 'ما مهنتك؟'],
        correct: 2,
        explanation: '"Where are you from?" = من أين أنت؟',
      },
      {
        id: 'u2q3',
        question: 'ما هي جنسية شخص من إسبانيا (Spain)؟',
        options: ['Spanian', 'Spanich', 'Spanish', 'Spainish'],
        correct: 2,
        explanation: 'Country: Spain → Nationality: Spanish',
      },
      {
        id: 'u2q4',
        question: 'أكمل: "I am ___ nurse"',
        context: 'What is your job?',
        options: ['the', 'an', 'a', 'one'],
        correct: 2,
        explanation: 'نستخدم "a" قبل المهنة: I am a nurse',
      },
      {
        id: 'u2q5',
        question: '"Are you married?" - "No, I\'m not. I\'m ___"',
        options: ['single', 'alone', 'one', 'free'],
        correct: 0,
        explanation: 'الحالة العائلية: single = أعزب',
      },
      {
        id: 'u2q6',
        question: 'أي من هذه ليست حالة عائلية (marital status)؟',
        options: ['Married', 'Single', 'Friendly', 'Divorced'],
        correct: 2,
        explanation: 'Friendly = ودود، وهي صفة شخصية وليست حالة عائلية',
      },
      {
        id: 'u2q7',
        question: 'ما معنى "What do you do?"',
        options: ['ماذا تفعل الآن؟', 'ما هي مهنتك؟', 'من أين أنت؟', 'كيف حالك؟'],
        correct: 1,
        explanation: '"What do you do?" = ما هي مهنتك؟ (What is your job?)',
      },
      {
        id: 'u2q8',
        question: 'شخص يقود الطائرات يسمى...',
        options: ['a driver', 'a pilot', 'a farmer', 'an engineer'],
        correct: 1,
        explanation: 'pilot = طيّار (يقود الطائرات)',
      },
      {
        id: 'u2q9',
        question: 'ما هي جنسية شخص من تونس (Tunisia)؟',
        options: ['Tunisien', 'Tunisian', 'Tunisi', 'Tunise'],
        correct: 1,
        explanation: 'Country: Tunisia → Nationality: Tunisian',
      },
      {
        id: 'u2q10',
        question: '"Engaged" تعني بالعربية...',
        options: ['متزوج', 'مطلق', 'مخطوب', 'أرمل'],
        correct: 2,
        explanation: 'Engaged = مخطوب',
      },
      {
        id: 'u2q11',
        question: 'أكمل: "I am ___ engineer"',
        options: ['a', 'an', 'the', 'one'],
        correct: 1,
        explanation: 'نستخدم "an" قبل الكلمات التي تبدأ بحرف متحرك: an engineer',
      },
      {
        id: 'u2q12',
        question: 'ما هي جنسية شخص من مصر (Egypt)؟',
        options: ['Egyption', 'Egyptien', 'Egyptian', 'Egyptan'],
        correct: 2,
        explanation: 'Country: Egypt → Nationality: Egyptian',
      },
      {
        id: 'u2q13',
        question: '"Widowed" تعني بالعربية...',
        options: ['مطلق', 'أعزب', 'أرمل', 'مخطوب'],
        correct: 2,
        explanation: 'Widowed = أرمل/ة',
      },
      {
        id: 'u2q14',
        question: 'شخص يعمل في المستشفى ويعالج المرضى يسمى...',
        options: ['a teacher', 'a doctor', 'a farmer', 'a driver'],
        correct: 1,
        explanation: 'doctor = طبيب (يعمل في المستشفى ويعالج المرضى)',
      },
      {
        id: 'u2q15',
        question: 'ما هي جنسية شخص من فرنسا (France)؟',
        options: ['Francish', 'Frensh', 'French', 'Francian'],
        correct: 2,
        explanation: 'Country: France → Nationality: French',
      },
    ],
  },

  // ── UNIT 3: Family Tree & Describing People (Lessons 5-6) ──
  {
    id: 'unit3',
    title: 'شجرة العائلة والوصف',
    titleEn: 'Family Tree & Descriptions',
    lessons: 'الدرس 5 و 6',
    icon: '👨‍👩‍👧‍👦',
    color: 'text-amber-300',
    gradient: 'from-amber-600/20 to-orange-600/20',
    border: 'border-amber-500/25',
    questions: [
      {
        id: 'u3q1',
        question: 'أم أبيك تسمى بالإنجليزية...',
        options: ['Mother', 'Aunt', 'Grandmother', 'Sister'],
        correct: 2,
        explanation: 'Grandmother = الجدة (أم الأب أو أم الأم)',
      },
      {
        id: 'u3q2',
        question: 'زوج أختك يسمى بالإنجليزية...',
        options: ['Brother', 'Uncle', 'Cousin', 'Brother-in-law'],
        correct: 3,
        explanation: 'Brother-in-law = زوج الأخت',
      },
      {
        id: 'u3q3',
        question: '"Tall" عكسها هو...',
        options: ['Big', 'Short', 'Thin', 'Small'],
        correct: 1,
        explanation: 'Tall (طويل) ↔ Short (قصير)',
      },
      {
        id: 'u3q4',
        question: 'أبناء عمك أو خالك يسمون بالإنجليزية...',
        options: ['Siblings', 'Nephews', 'Cousins', 'Nieces'],
        correct: 2,
        explanation: 'Cousins = أبناء العم/ة أو الخال/ة',
      },
      {
        id: 'u3q5',
        question: '"Generous" عكسها هو...',
        options: ['Rich', 'Kind', 'Mean', 'Strong'],
        correct: 2,
        explanation: 'Generous (كريم) ↔ Mean (بخيل)',
      },
      {
        id: 'u3q6',
        question: 'ابن أخيك يسمى بالإنجليزية...',
        options: ['Cousin', 'Nephew', 'Grandson', 'Son'],
        correct: 1,
        explanation: 'Nephew = ابن الأخ أو ابن الأخت',
      },
      {
        id: 'u3q7',
        question: '"Shy" عكسها هو...',
        options: ['Honest', 'Friendly', 'Outgoing', 'Smart'],
        correct: 2,
        explanation: 'Shy (خجول) ↔ Outgoing (اجتماعي)',
      },
      {
        id: 'u3q8',
        question: 'Father + Mother = ?',
        options: ['Family', 'Spouses', 'Parents', 'Grandparents'],
        correct: 2,
        explanation: 'Father + Mother = Parents (الوالدان)',
      },
      {
        id: 'u3q9',
        question: 'أكمل: "My brother is tall ___ smart"',
        options: ['but', 'or', 'and', 'because'],
        correct: 2,
        explanation: 'نستخدم "and" للربط: My brother is tall and smart',
      },
      {
        id: 'u3q10',
        question: '"Who is Ahmed to Safiya?" يسأل عن...',
        options: ['عمر أحمد', 'مهنة أحمد', 'علاقة أحمد بصفية', 'اسم أحمد'],
        correct: 2,
        explanation: '"Who is X to Y?" = ما علاقة X بـ Y؟',
      },
      {
        id: 'u3q11',
        question: 'ما هي أداة الاستفهام المناسبة: "___ are you from?"',
        options: ['What', 'Who', 'Where', 'When'],
        correct: 2,
        explanation: 'Where = أين/من أين. "Where are you from?" = من أين أنت؟',
      },
      {
        id: 'u3q12',
        question: '"Why" تعني بالعربية...',
        options: ['متى', 'أين', 'كيف', 'لماذا'],
        correct: 3,
        explanation: 'Why = لماذا / علاش',
      },
      {
        id: 'u3q13',
        question: 'ابنة أختك تسمى بالإنجليزية...',
        options: ['Cousin', 'Niece', 'Daughter', 'Granddaughter'],
        correct: 1,
        explanation: 'Niece = ابنة الأخ أو ابنة الأخت',
      },
      {
        id: 'u3q14',
        question: '"Lazy" عكسها هو...',
        options: ['Tired', 'Hardworking', 'Slow', 'Weak'],
        correct: 1,
        explanation: 'Lazy (كسول) ↔ Hardworking (مجتهد)',
      },
      {
        id: 'u3q15',
        question: '"How" تعني بالعربية...',
        options: ['ماذا', 'أين', 'كيف', 'من'],
        correct: 2,
        explanation: 'How = كيف',
      },
    ],
  },

  // ── UNIT 4: Reading & Classroom (Lessons 7-8) ──
  {
    id: 'unit4',
    title: 'القراءة ومفردات القسم',
    titleEn: 'Reading & Classroom',
    lessons: 'الدرس 7 و 8',
    icon: '📖',
    color: 'text-violet-300',
    gradient: 'from-violet-600/20 to-purple-600/20',
    border: 'border-violet-500/25',
    questions: [
      {
        id: 'u4q1',
        question: 'أكمل: "He ___ his face every morning"',
        context: 'He washes his face, brushes his teeth, and gets dressed.',
        options: ['wash', 'washes', 'washing', 'washs'],
        correct: 1,
        explanation: 'مع He/She نضيف -es: He washes',
      },
      {
        id: 'u4q2',
        question: 'ما معنى "I brush my teeth"؟',
        options: ['أغسل وجهي', 'أفرش أسناني', 'أرتب سريري', 'أرتدي ملابسي'],
        correct: 1,
        explanation: 'I brush my teeth = أفرش أسناني',
      },
      {
        id: 'u4q3',
        question: '"Can you repeat, please?" يقولها...',
        options: ['المعلم فقط', 'التلميذ فقط', 'الجميع', 'المدير فقط'],
        correct: 1,
        explanation: '"Can you repeat, please?" = هل يمكنك أن تعيد؟ — عبارة خاصة بالتلميذ',
      },
      {
        id: 'u4q4',
        question: 'ما معنى "Pencilcase" بالعربية؟',
        options: ['قلم رصاص', 'مسطرة', 'تروس', 'محاية'],
        correct: 2,
        explanation: 'Pencilcase = تروس (علبة الأقلام)',
      },
      {
        id: 'u4q5',
        question: '"Repeat after me" يقولها...',
        options: ['التلميذ', 'المعلم', 'الحارس', 'المدير'],
        correct: 1,
        explanation: '"Repeat after me" = كرروا ورائي — عبارة خاصة بالمعلم',
      },
      {
        id: 'u4q6',
        question: 'أكمل: "I ___ at a primary school"',
        context: 'He works at a primary school. I ___ at a primary school.',
        options: ['works', 'work', 'working', 'workes'],
        correct: 1,
        explanation: 'مع I نستخدم الفعل بدون -s: I work',
      },
      {
        id: 'u4q7',
        question: 'ما معنى "Board" في القسم؟',
        options: ['كرسي', 'طاولة', 'سبورة', 'باب'],
        correct: 2,
        explanation: 'Board = سبورة',
      },
      {
        id: 'u4q8',
        question: '"She likes to read a book before bed" تعني...',
        options: ['تحب القراءة بعد الأكل', 'تحب قراءة كتاب قبل النوم', 'تحب الكتب الكبيرة', 'تذهب للنوم باكراً'],
        correct: 1,
        explanation: 'before bed = قبل النوم. She likes to read = تحب القراءة',
      },
      {
        id: 'u4q9',
        question: '"I don\'t understand" تعني...',
        options: ['لا أريد', 'لا أفهم', 'لا أعرف', 'لا أسمع'],
        correct: 1,
        explanation: '"I don\'t understand" = لم أفهم / مفهمتش',
      },
      {
        id: 'u4q10',
        question: '"Eraser" تعني بالعربية...',
        options: ['مسطرة', 'محاية', 'قلم', 'دفتر'],
        correct: 1,
        explanation: 'Eraser = محاية',
      },
      {
        id: 'u4q11',
        question: 'أكمل: "She ___ her teeth every morning"',
        options: ['brush', 'brushs', 'brushes', 'brushing'],
        correct: 2,
        explanation: 'مع She نضيف -es للأفعال المنتهية بـ sh: She brushes',
      },
      {
        id: 'u4q12',
        question: 'ما معنى "Ruler" في أدوات القسم؟',
        options: ['ممحاة', 'مسطرة', 'مقص', 'قلم حبر'],
        correct: 1,
        explanation: 'Ruler = مسطرة',
      },
      {
        id: 'u4q13',
        question: '"Open your books" يقولها...',
        options: ['التلميذ', 'المعلم', 'الحارس', 'الوالد'],
        correct: 1,
        explanation: '"Open your books" = افتحوا كتبكم — عبارة خاصة بالمعلم',
      },
      {
        id: 'u4q14',
        question: 'ما معنى "He gets dressed"؟',
        options: ['يستحم', 'يرتدي ملابسه', 'يفرش أسنانه', 'يتناول الفطور'],
        correct: 1,
        explanation: 'gets dressed = يرتدي ملابسه',
      },
      {
        id: 'u4q15',
        question: '"Notebook" تعني بالعربية...',
        options: ['كتاب', 'دفتر', 'حاسوب', 'حقيبة'],
        correct: 1,
        explanation: 'Notebook = دفتر',
      },
    ],
  },

  // ── UNIT 5: Verbs, Pronouns & Home (Lessons 9-10) ──
  {
    id: 'unit5',
    title: 'الأفعال والضمائر والمنزل',
    titleEn: 'Verbs, Pronouns & Home',
    lessons: 'الدرس 9 و 10',
    icon: '🏠',
    color: 'text-rose-300',
    gradient: 'from-rose-600/20 to-pink-600/20',
    border: 'border-rose-500/25',
    questions: [
      {
        id: 'u5q1',
        question: 'أكمل: "He ___ to school every day"',
        options: ['go', 'goes', 'going', 'goed'],
        correct: 1,
        explanation: 'مع He: go → goes',
      },
      {
        id: 'u5q2',
        question: 'أكمل: "She ___ a book"',
        context: 'The verb "to have"',
        options: ['have', 'haves', 'has', 'having'],
        correct: 2,
        explanation: 'مع She: have → has',
      },
      {
        id: 'u5q3',
        question: '"The pillow is ___ the bed" — الوسادة فوق السرير',
        options: ['under', 'behind', 'on', 'next to'],
        correct: 2,
        explanation: 'on = على/فوق. The pillow is on the bed',
      },
      {
        id: 'u5q4',
        question: 'ما معنى "Wardrobe"؟',
        options: ['سرير', 'خزانة ملابس', 'طاولة', 'مرآة'],
        correct: 1,
        explanation: 'Wardrobe = خزانة ملابس',
      },
      {
        id: 'u5q5',
        question: '"between" تعني بالعربية...',
        options: ['تحت', 'فوق', 'بين', 'أمام'],
        correct: 2,
        explanation: 'between = بين',
      },
      {
        id: 'u5q6',
        question: 'أكمل: "I ___ in class"',
        context: 'The verb "to be"',
        options: ['is', 'are', 'am', 'be'],
        correct: 2,
        explanation: 'مع I: I am',
      },
      {
        id: 'u5q7',
        question: '"The lamp is next to the bed" تعني...',
        options: ['المصباح تحت السرير', 'المصباح بجانب السرير', 'المصباح فوق السرير', 'المصباح خلف السرير'],
        correct: 1,
        explanation: 'next to = بجانب',
      },
      {
        id: 'u5q8',
        question: 'أكمل: "They ___ to school"',
        context: 'The verb "to go"',
        options: ['goes', 'go', 'gos', 'going'],
        correct: 1,
        explanation: 'مع They: go (بدون تغيير)',
      },
      {
        id: 'u5q9',
        question: 'ما معنى "Carpet"؟',
        options: ['ستارة', 'سجادة', 'وسادة', 'بطانية'],
        correct: 1,
        explanation: 'Carpet = سجادة',
      },
      {
        id: 'u5q10',
        question: '"In front of" تعني بالعربية...',
        options: ['خلف', 'تحت', 'أمام', 'بجانب'],
        correct: 2,
        explanation: 'In front of = أمام',
      },
      {
        id: 'u5q11',
        question: 'أكمل: "We ___ students"',
        context: 'The verb "to be"',
        options: ['is', 'am', 'are', 'be'],
        correct: 2,
        explanation: 'مع We: We are',
      },
      {
        id: 'u5q12',
        question: '"The cat is under the table" تعني...',
        options: ['القط فوق الطاولة', 'القط تحت الطاولة', 'القط بجانب الطاولة', 'القط أمام الطاولة'],
        correct: 1,
        explanation: 'under = تحت',
      },
      {
        id: 'u5q13',
        question: 'ما معنى "Mirror"؟',
        options: ['نافذة', 'مرآة', 'باب', 'ستارة'],
        correct: 1,
        explanation: 'Mirror = مرآة',
      },
      {
        id: 'u5q14',
        question: 'أكمل: "She ___ a new car"',
        context: 'The verb "to have"',
        options: ['have', 'haves', 'has', 'had'],
        correct: 2,
        explanation: 'مع She: have → has',
      },
      {
        id: 'u5q15',
        question: '"Behind" تعني بالعربية...',
        options: ['أمام', 'بين', 'خلف', 'فوق'],
        correct: 2,
        explanation: 'Behind = خلف / وراء',
      },
    ],
  },

  // ── UNIT 6: Daily Activities & Days of the Week (Lessons 11-12) ──
  {
    id: 'unit6',
    title: 'الأنشطة اليومية وأيام الأسبوع',
    titleEn: 'Daily Activities & Days of the Week',
    lessons: 'الدرس 11 و 12',
    icon: '📅',
    color: 'text-cyan-300',
    gradient: 'from-cyan-600/20 to-sky-600/20',
    border: 'border-cyan-500/25',
    questions: [
      {
        id: 'u6q1',
        question: 'ما معنى "I wake up at 7:00 AM"؟',
        options: ['أذهب للنوم الساعة 7', 'أستيقظ الساعة 7 صباحاً', 'أخرج الساعة 7', 'آكل الساعة 7'],
        correct: 1,
        explanation: 'wake up = أستيقظ. AM = صباحاً',
      },
      {
        id: 'u6q2',
        question: '"It\'s 8:30" كيف نقرأها؟',
        options: ['Eight thirteen', 'Eight thirty', 'Eight three', 'Eighty three'],
        correct: 1,
        explanation: '8:30 = eight thirty (ثمانية ونصف)',
      },
      {
        id: 'u6q3',
        question: 'ما هو اليوم الذي يأتي بعد Tuesday؟',
        options: ['Monday', 'Thursday', 'Wednesday', 'Friday'],
        correct: 2,
        explanation: 'الترتيب: Monday, Tuesday, Wednesday...',
      },
      {
        id: 'u6q4',
        question: '"Always" تعني أن الفعل يحدث بنسبة...',
        options: ['0%', '50%', '80%', '100%'],
        correct: 3,
        explanation: 'Always = دائماً = 100%',
      },
      {
        id: 'u6q5',
        question: '"Never" تعني بالعربية...',
        options: ['أحياناً', 'غالباً', 'أبداً', 'دائماً'],
        correct: 2,
        explanation: 'Never = أبداً = 0%',
      },
      {
        id: 'u6q6',
        question: 'ما معنى "I go to sleep"؟',
        options: ['أستيقظ', 'أذهب للعمل', 'أذهب للنوم', 'أشاهد التلفاز'],
        correct: 2,
        explanation: 'go to sleep = أذهب إلى النوم',
      },
      {
        id: 'u6q7',
        question: 'نهاية الأسبوع (Weekend) هي...',
        options: ['Monday + Tuesday', 'Saturday + Sunday', 'Friday + Saturday', 'Thursday + Friday'],
        correct: 1,
        explanation: 'Weekend = Saturday + Sunday (نهاية الأسبوع)',
      },
      {
        id: 'u6q8',
        question: 'أين نضع الـ Adverb مع فعل "to be"؟',
        context: 'I am always happy',
        options: ['قبل الفعل', 'بعد الفعل', 'في البداية', 'في النهاية'],
        correct: 1,
        explanation: 'مع "to be" يأتي الـ Adverb بعد الفعل: I am always happy',
      },
      {
        id: 'u6q9',
        question: '"Sometimes" تعني أن الفعل يحدث بنسبة...',
        options: ['100%', '0%', '50%', '80%'],
        correct: 2,
        explanation: 'Sometimes = أحياناً = 50%',
      },
      {
        id: 'u6q10',
        question: 'أكمل: "I always play football ___ Monday"',
        options: ['at', 'in', 'on', 'to'],
        correct: 2,
        explanation: 'نستخدم "on" مع أيام الأسبوع: on Monday',
      },
      {
        id: 'u6q11',
        question: '"Usually" تعني أن الفعل يحدث بنسبة...',
        options: ['100%', '0%', '50%', '80%'],
        correct: 3,
        explanation: 'Usually = عادةً = 80%',
      },
      {
        id: 'u6q12',
        question: '"It\'s quarter past three" يعني الساعة...',
        options: ['3:45', '3:30', '3:15', '2:45'],
        correct: 2,
        explanation: 'Quarter past = والربع. 3:15 = quarter past three',
      },
      {
        id: 'u6q13',
        question: 'ما هو اليوم الذي يأتي قبل Friday؟',
        options: ['Wednesday', 'Saturday', 'Thursday', 'Sunday'],
        correct: 2,
        explanation: 'الترتيب: ...Wednesday, Thursday, Friday...',
      },
      {
        id: 'u6q14',
        question: '"I have breakfast at 7:00 AM" تعني...',
        options: ['أتناول الغداء الساعة 7', 'أتناول الفطور الساعة 7 صباحاً', 'أتناول العشاء الساعة 7', 'أخرج الساعة 7'],
        correct: 1,
        explanation: 'have breakfast = أتناول الفطور. AM = صباحاً',
      },
      {
        id: 'u6q15',
        question: 'أين نضع الـ Adverb مع الأفعال العادية؟',
        context: 'I always drink tea',
        options: ['بعد الفعل', 'قبل الفعل', 'في نهاية الجملة', 'بعد المفعول'],
        correct: 1,
        explanation: 'مع الأفعال العادية يأتي الـ Adverb قبل الفعل: I always drink tea',
      },
    ],
  },

  // ── UNIT 7: Food & Drinks (Lessons 13-14) ──
  {
    id: 'unit7',
    title: 'الطعام والمشروبات',
    titleEn: 'Food & Drinks',
    lessons: 'الدرس 13 و 14',
    icon: '🍽️',
    color: 'text-orange-300',
    gradient: 'from-orange-600/20 to-red-600/20',
    border: 'border-orange-500/25',
    questions: [
      {
        id: 'u7q1',
        question: 'ما معنى "Roast chicken"؟',
        options: ['دجاج مقلي', 'دجاج مشوي', 'حساء الدجاج', 'سلطة الدجاج'],
        correct: 1,
        explanation: 'Roast chicken = دجاج مشوي',
      },
      {
        id: 'u7q2',
        question: '"Do you like pizza?" — "No, ___"',
        options: ['I do', 'I don\'t', 'I am not', 'I doesn\'t'],
        correct: 1,
        explanation: 'النفي مع Do: No, I don\'t',
      },
      {
        id: 'u7q3',
        question: '"What food do you like?" تسأل عن...',
        options: ['المشروب المفضل', 'الطعام المفضل', 'المطعم المفضل', 'وقت الأكل'],
        correct: 1,
        explanation: '"What food do you like?" = ما الطعام الذي تحبه؟',
      },
      {
        id: 'u7q4',
        question: 'ما معنى "Ice cream"؟',
        options: ['عصير', 'كعكة', 'مثلجات', 'حلوى'],
        correct: 2,
        explanation: 'Ice cream = مثلجات / آيس كريم',
      },
      {
        id: 'u7q5',
        question: '"Orange juice" تعني...',
        options: ['عصير الليمون', 'عصير البرتقال', 'عصير التفاح', 'حليب'],
        correct: 1,
        explanation: 'Orange juice = عصير البرتقال',
      },
      {
        id: 'u7q6',
        question: '"What is your favourite drink?" تسأل عن...',
        options: ['الطعام المفضل', 'المشروب المفضل', 'الهواية المفضلة', 'اللون المفضل'],
        correct: 1,
        explanation: 'favourite drink = المشروب المفضل',
      },
      {
        id: 'u7q7',
        question: 'ما معنى "Bread"؟',
        options: ['أرز', 'خبز', 'معكرونة', 'كعكة'],
        correct: 1,
        explanation: 'Bread = خبز',
      },
      {
        id: 'u7q8',
        question: '"Sparkling water" تعني...',
        options: ['ماء معدني', 'ماء غازي', 'ماء بارد', 'ماء ساخن'],
        correct: 1,
        explanation: 'Sparkling water = ماء غازي',
      },
      {
        id: 'u7q9',
        question: 'أكمل: "I ___ tea every morning"',
        options: ['eat', 'drink', 'have', 'like'],
        correct: 1,
        explanation: 'نشرب الشاي: I drink tea',
      },
      {
        id: 'u7q10',
        question: '"Herbal tea" تعني...',
        options: ['شاي أخضر', 'شاي بالنعناع', 'شاي الأعشاب', 'شاي بالزنجبيل'],
        correct: 2,
        explanation: 'Herbal tea = شاي الأعشاب',
      },
      {
        id: 'u7q11',
        question: '"Rice" تعني بالعربية...',
        options: ['خبز', 'أرز', 'معكرونة', 'سلطة'],
        correct: 1,
        explanation: 'Rice = أرز',
      },
      {
        id: 'u7q12',
        question: 'أكمل: "She ___ like milk"',
        options: ["don't", "doesn't", "isn't", "not"],
        correct: 1,
        explanation: 'مع She في النفي: She doesn\'t like',
      },
      {
        id: 'u7q13',
        question: '"Grilled fish" تعني...',
        options: ['سمك مقلي', 'سمك مشوي', 'سمك مطبوخ', 'سمك نيء'],
        correct: 1,
        explanation: 'Grilled fish = سمك مشوي',
      },
      {
        id: 'u7q14',
        question: '"Does she like coffee?" — "Yes, she ___"',
        options: ['do', 'does', 'is', 'like'],
        correct: 1,
        explanation: 'مع Does: Yes, she does',
      },
      {
        id: 'u7q15',
        question: '"Vegetables" تعني بالعربية...',
        options: ['فواكه', 'حلويات', 'خضروات', 'لحوم'],
        correct: 2,
        explanation: 'Vegetables = خضروات',
      },
    ],
  },

  // ── UNIT 8: Transport, Places, Jobs & Hobbies (Lessons 15-19) ──
  {
    id: 'unit8',
    title: 'النقل والأماكن والهوايات',
    titleEn: 'Transport, Places & Hobbies',
    lessons: 'الدرس 15 إلى 19',
    icon: '🚌',
    color: 'text-indigo-300',
    gradient: 'from-indigo-600/20 to-blue-600/20',
    border: 'border-indigo-500/25',
    questions: [
      {
        id: 'u8q1',
        question: 'ما الفرق بين "This" و "That"؟',
        options: ['لا فرق', 'This للقريب و That للبعيد', 'This للجمع و That للمفرد', 'This للبعيد و That للقريب'],
        correct: 1,
        explanation: 'This = هذا (قريب)، That = ذاك (بعيد)',
      },
      {
        id: 'u8q2',
        question: '"Go straight then turn left" تعطي...',
        options: ['أمراً', 'اتجاهات', 'نصيحة', 'سؤالاً'],
        correct: 1,
        explanation: 'هذه عبارة لإعطاء الاتجاهات (giving directions)',
      },
      {
        id: 'u8q3',
        question: '"These" تُستعمل مع...',
        options: ['مفرد قريب', 'مفرد بعيد', 'جمع قريب', 'جمع بعيد'],
        correct: 2,
        explanation: 'These = هؤلاء/هذه (جمع قريب)',
      },
      {
        id: 'u8q4',
        question: 'ما معنى "Pharmacy"؟',
        options: ['مستشفى', 'صيدلية', 'مدرسة', 'مكتبة'],
        correct: 1,
        explanation: 'Pharmacy = صيدلية',
      },
      {
        id: 'u8q5',
        question: '"I can swim" تعني...',
        options: ['أحب السباحة', 'أريد السباحة', 'أستطيع السباحة', 'أتعلم السباحة'],
        correct: 2,
        explanation: 'I can = أستطيع. I can swim = أستطيع السباحة',
      },
      {
        id: 'u8q6',
        question: '"There is a bank" — نستخدم "is" لأن البنك...',
        options: ['كبير', 'مفرد', 'قريب', 'مهم'],
        correct: 1,
        explanation: 'There is = هناك (مفرد). There are = هناك (جمع)',
      },
      {
        id: 'u8q7',
        question: '"A cook can cook delicious food" — "cook" هنا تعني...',
        options: ['طبيب', 'معلم', 'طبّاخ', 'سائق'],
        correct: 2,
        explanation: 'A cook = طبّاخ/ة',
      },
      {
        id: 'u8q8',
        question: '"Does he like football?" — "Yes, he ___"',
        options: ['do', 'does', 'is', 'like'],
        correct: 1,
        explanation: 'مع Does: Yes, he does',
      },
      {
        id: 'u8q9',
        question: '"Hiking" تعني بالعربية...',
        options: ['التسلق', 'المشي لمسافات طويلة', 'السباحة', 'ركوب الخيل'],
        correct: 1,
        explanation: 'Hiking = المشي لمسافات طويلة',
      },
      {
        id: 'u8q10',
        question: 'أكمل: "She ___ like fish"',
        context: 'Negative with She',
        options: ['don\'t', 'doesn\'t', 'isn\'t', 'not'],
        correct: 1,
        explanation: 'مع She في النفي: She doesn\'t like',
      },
      {
        id: 'u8q11',
        question: '"At the roundabout" تعني...',
        options: ['عند إشارة المرور', 'عند الدوار', 'عند ممر الراجلين', 'في الشارع'],
        correct: 1,
        explanation: 'At the roundabout = عند الدوار',
      },
      {
        id: 'u8q12',
        question: '"He can\'t swim" تعني...',
        options: ['لا يحب السباحة', 'لا يستطيع السباحة', 'لا يريد السباحة', 'يستطيع السباحة'],
        correct: 1,
        explanation: 'can\'t = لا يستطيع. He can\'t swim = لا يستطيع السباحة',
      },
      {
        id: 'u8q13',
        question: '"Those" تُستعمل مع...',
        options: ['مفرد قريب', 'مفرد بعيد', 'جمع قريب', 'جمع بعيد'],
        correct: 3,
        explanation: 'Those = أولئك (جمع بعيد)',
      },
      {
        id: 'u8q14',
        question: '"There are many shops" — نستخدم "are" لأن shops...',
        options: ['كبيرة', 'مفرد', 'بعيدة', 'جمع'],
        correct: 3,
        explanation: 'There are = هناك (جمع). shops = محلات (جمع)',
      },
      {
        id: 'u8q15',
        question: '"Turn right" تعني...',
        options: ['انعطف يميناً', 'انعطف يساراً', 'امشِ مستقيماً', 'ارجع للخلف'],
        correct: 0,
        explanation: 'Turn right = انعطف يميناً',
      },
    ],
  },
]

// Shuffle array helper
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ═══════════════════════════════════════════════════════════════════════════
//  FINAL EXAM — 30 NEW unique questions covering all lessons (not from units)
// ═══════════════════════════════════════════════════════════════════════════

const FINAL_EXAM_QUESTIONS: Question[] = [
  // Greetings & Alphabet (L1-2)
  {
    id: 'fq1',
    question: 'أكمل: "Good ___, teacher!" (في الصباح الباكر)',
    options: ['night', 'evening', 'morning', 'afternoon'],
    correct: 2,
    explanation: 'في الصباح نقول: Good morning = صباح الخير',
  },
  {
    id: 'fq2',
    question: '"Eighty-six" يعني بالأرقام...',
    options: ['68', '86', '816', '806'],
    correct: 1,
    explanation: 'Eighty-six = 86',
  },
  {
    id: 'fq3',
    question: 'ما هو الحرف الأخير في الأبجدية الإنجليزية؟',
    options: ['Y', 'X', 'Z', 'W'],
    correct: 2,
    explanation: 'الحرف الأخير: Z (زِد)',
  },
  // Countries, Jobs (L3-4)
  {
    id: 'fq4',
    question: 'أكمل: "She is ___ doctor. She works at a hospital."',
    options: ['an', 'a', 'the', 'one'],
    correct: 1,
    explanation: 'نستخدم "a" قبل الحرف الساكن: a doctor',
  },
  {
    id: 'fq5',
    question: 'ما هي جنسية شخص من ألمانيا (Germany)؟',
    options: ['Germanish', 'Germanian', 'German', 'Germanise'],
    correct: 2,
    explanation: 'Country: Germany → Nationality: German',
  },
  {
    id: 'fq6',
    question: '"Separated" تعني في الحالة العائلية...',
    options: ['مطلق', 'أعزب', 'منفصل', 'أرمل'],
    correct: 2,
    explanation: 'Separated = منفصل (لا يزال متزوجاً قانونياً لكن لا يعيش مع الشريك)',
  },
  // Family & Descriptions (L5-6)
  {
    id: 'fq7',
    question: 'أخت زوجتك تسمى بالإنجليزية...',
    options: ['Cousin', 'Aunt', 'Sister-in-law', 'Niece'],
    correct: 2,
    explanation: 'Sister-in-law = أخت الزوج/الزوجة',
  },
  {
    id: 'fq8',
    question: '"Patient" كصفة شخصية تعني...',
    options: ['مريض', 'صبور', 'قوي', 'هادئ'],
    correct: 1,
    explanation: 'Patient (صفة) = صبور. لا نخلط مع patient (اسم) = مريض',
  },
  {
    id: 'fq9',
    question: 'أكمل: "___ is your father\'s name?"',
    options: ['How', 'Where', 'What', 'Why'],
    correct: 2,
    explanation: 'What is your father\'s name? = ما اسم والدك؟',
  },
  // Reading & Classroom (L7-8)
  {
    id: 'fq10',
    question: 'أكمل: "She ___ to school by bus every day"',
    options: ['go', 'goes', 'going', 'goed'],
    correct: 1,
    explanation: 'مع She نضيف -es: She goes',
  },
  {
    id: 'fq11',
    question: '"Scissors" تعني بالعربية...',
    options: ['مقلمة', 'مقص', 'دبّاسة', 'مسطرة'],
    correct: 1,
    explanation: 'Scissors = مقص',
  },
  {
    id: 'fq12',
    question: '"Close your notebooks" يقولها المعلم بمعنى...',
    options: ['افتحوا دفاتركم', 'أعطوني دفاتركم', 'أغلقوا دفاتركم', 'اكتبوا في دفاتركم'],
    correct: 2,
    explanation: 'Close your notebooks = أغلقوا دفاتركم',
  },
  // Verbs, Pronouns & Home (L9-10)
  {
    id: 'fq13',
    question: 'أكمل: "The keys are ___ the door"',
    options: ['on', 'in', 'behind', 'between'],
    correct: 2,
    explanation: 'behind the door = خلف الباب',
  },
  {
    id: 'fq14',
    question: 'أكمل: "It ___ a beautiful house"',
    options: ['am', 'are', 'is', 'be'],
    correct: 2,
    explanation: 'مع It: It is (It\'s)',
  },
  {
    id: 'fq15',
    question: '"Curtains" تعني بالعربية...',
    options: ['وسائد', 'ستائر', 'أغطية', 'رفوف'],
    correct: 1,
    explanation: 'Curtains = ستائر',
  },
  // Daily Activities & Days (L11-12)
  {
    id: 'fq16',
    question: '"It\'s half past nine" يعني الساعة...',
    options: ['9:15', '9:30', '9:45', '8:30'],
    correct: 1,
    explanation: 'Half past = والنصف. 9:30 = half past nine',
  },
  {
    id: 'fq17',
    question: 'ما هو أول يوم في الأسبوع حسب التقويم الغربي؟',
    options: ['Saturday', 'Monday', 'Sunday', 'Friday'],
    correct: 2,
    explanation: 'في التقويم الغربي، الأسبوع يبدأ يوم Sunday (الأحد)',
  },
  {
    id: 'fq18',
    question: '"Rarely" تعني أن الفعل يحدث بنسبة...',
    options: ['80%', '100%', '50%', '10%'],
    correct: 3,
    explanation: 'Rarely = نادراً = حوالي 10%',
  },
  // Food & Drinks (L13-14)
  {
    id: 'fq19',
    question: 'أكمل: "I ___ like spicy food"',
    options: ["doesn't", "don't", "isn't", "not"],
    correct: 1,
    explanation: 'مع I في النفي: I don\'t like',
  },
  {
    id: 'fq20',
    question: '"Lamb" تعني بالعربية...',
    options: ['دجاج', 'لحم خنزير', 'لحم خروف', 'سمك'],
    correct: 2,
    explanation: 'Lamb = لحم خروف/حمل',
  },
  {
    id: 'fq21',
    question: '"Still water or sparkling?" — الفرق هو...',
    options: ['ساخن أو بارد', 'عادي أو غازي', 'كبير أو صغير', 'نظيف أو متسخ'],
    correct: 1,
    explanation: 'Still water = ماء عادي، Sparkling water = ماء غازي',
  },
  // Transport, Places & Hobbies (L15-19)
  {
    id: 'fq22',
    question: '"Crossing" في إعطاء الاتجاهات تعني...',
    options: ['الدوار', 'ممر الراجلين/التقاطع', 'إشارة المرور', 'الجسر'],
    correct: 1,
    explanation: 'Crossing = تقاطع / ممر الراجلين',
  },
  {
    id: 'fq23',
    question: 'أكمل: "There ___ three parks in my city"',
    options: ['is', 'are', 'has', 'have'],
    correct: 1,
    explanation: 'There are (للجمع): There are three parks',
  },
  {
    id: 'fq24',
    question: '"A firefighter" هو شخص يعمل في...',
    options: ['المستشفى', 'المطبخ', 'إطفاء الحرائق', 'المدرسة'],
    correct: 2,
    explanation: 'Firefighter = رجل إطفاء',
  },
  {
    id: 'fq25',
    question: '"She can play the piano" تعني...',
    options: ['تحب البيانو', 'تتعلم البيانو', 'تستطيع العزف على البيانو', 'تريد شراء بيانو'],
    correct: 2,
    explanation: 'She can play = تستطيع العزف',
  },
  // Mixed comprehensive
  {
    id: 'fq26',
    question: 'ما هو الضمير المناسب: "___ is my best friend" (هي صديقتي المفضلة)',
    options: ['He', 'She', 'It', 'They'],
    correct: 1,
    explanation: 'She = هي. She is my best friend',
  },
  {
    id: 'fq27',
    question: '"At" تُستخدم مع...',
    options: ['أيام الأسبوع', 'الشهور', 'الساعة', 'السنوات'],
    correct: 2,
    explanation: 'at = مع الساعة: at 7:00. on = مع الأيام. in = مع الشهور والسنوات',
  },
  {
    id: 'fq28',
    question: 'أكمل: "My mother ___ cooking very well"',
    options: ['can', 'like', 'do', 'have'],
    correct: 0,
    explanation: 'My mother can cooking → My mother can cook. can = تستطيع',
  },
  {
    id: 'fq29',
    question: '"Straight ahead" تعني...',
    options: ['انعطف يميناً', 'ارجع للخلف', 'امشِ مستقيماً', 'توقف هنا'],
    correct: 2,
    explanation: 'Straight ahead = امشِ مستقيماً للأمام',
  },
  {
    id: 'fq30',
    question: 'أي جملة صحيحة نحوياً؟',
    options: [
      'He don\'t like tea',
      'She doesn\'t likes coffee',
      'They doesn\'t go to school',
      'He doesn\'t like tea',
    ],
    correct: 3,
    explanation: 'He doesn\'t like (بدون s بعد doesn\'t)',
  },
]

function generateFinalExam(): Question[] {
  return shuffle(FINAL_EXAM_QUESTIONS)
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Timer Component ────────────────────────────────────────────────────────

function ExamTimer({ seconds, onTimeUp }: { seconds: number; onTimeUp: () => void }) {
  const [left, setLeft] = useState(seconds)
  const leftRef = useRef(left)
  leftRef.current = left

  useEffect(() => {
    const t = setInterval(() => {
      setLeft(l => {
        if (l <= 1) { clearInterval(t); onTimeUp(); return 0 }
        return l - 1
      })
    }, 1000)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mins = Math.floor(left / 60)
  const secs = left % 60
  const urgent = left < 60
  const warning = left < 120 && !urgent

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-sm font-bold transition-all ${
      urgent ? 'bg-red-500/20 border border-red-500/40 text-red-300 animate-pulse'
      : warning ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
      : 'bg-white/[0.04] border border-white/[0.08] text-white/60'
    }`}>
      <Clock className="w-3.5 h-3.5" />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  )
}

// ─── Progress Bar ───────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-white/30 font-bold">{current} / {total}</span>
        <span className="text-[10px] text-white/30 font-bold">{pct}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── Check if a unit is unlocked (previous unit passed at 60%+) ─────────────

function isUnitUnlocked(unitIndex: number, results: Record<string, ExamResult>): boolean {
  if (unitIndex === 0) return true // Unit 1 is always open
  const prevUnit = UNITS[unitIndex - 1]
  const prevResult = results[prevUnit.id]
  if (!prevResult) return false
  return Math.round((prevResult.score / prevResult.total) * 100) >= 60
}

// ─── Unit Card (for selection screen) ───────────────────────────────────────

function UnitCard({ unit, result, onClick, index, locked }: {
  unit: Unit; result?: ExamResult; onClick: () => void; index: number; locked: boolean
}) {
  const bestPct = result ? Math.round((result.score / result.total) * 100) : null
  const passed = bestPct !== null && bestPct >= 60

  return (
    <button
      onClick={() => { if (!locked) { sfxClick(); onClick() } }}
      disabled={locked}
      className={`group text-right w-full rounded-2xl border p-4 sm:p-5 transition-all shadow-lg ${
        locked
          ? 'bg-white/[0.01] border-white/[0.05] opacity-50 cursor-not-allowed'
          : `bg-gradient-to-br ${unit.gradient} ${unit.border} hover:scale-[1.02] active:scale-[0.98]`
      }`}
      style={{ animationDelay: `${index * 60}ms`, animation: 'fadeInUp 0.4s ease-out both' }}>
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="text-2xl sm:text-3xl">{locked ? '🔒' : unit.icon}</div>
        <div className="flex items-center gap-1.5">
          {locked ? (
            <span className="flex items-center gap-1 bg-white/[0.04] text-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Lock className="w-2.5 h-2.5" /> مقفل
            </span>
          ) : passed ? (
            <span className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> {bestPct}%
            </span>
          ) : bestPct !== null ? (
            <span className="flex items-center gap-1 bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {bestPct}%
            </span>
          ) : (
            <span className="bg-white/[0.06] text-white/30 text-[10px] font-bold px-2 py-0.5 rounded-full">جديد</span>
          )}
        </div>
      </div>
      <h3 className={`font-black text-sm sm:text-base mb-0.5 ${locked ? 'text-white/30' : 'text-white'}`}>{unit.title}</h3>
      <p className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${locked ? 'text-white/15' : 'text-white/30'}`}>{unit.titleEn}</p>
      <p className={`text-xs ${locked ? 'text-white/15' : 'text-white/40'}`}>{unit.lessons} · {unit.questions.length} سؤال</p>
      {!locked && (
        <div className="flex items-center gap-1 mt-2 sm:mt-3 text-white/30 text-xs font-bold group-hover:text-white transition-colors">
          ابدأ الامتحان <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
        </div>
      )}
      {locked && (
        <p className="text-white/15 text-[10px] mt-2 font-bold" dir="rtl">أكمل الوحدة السابقة أولاً</p>
      )}
    </button>
  )
}

// ─── Quiz Engine ────────────────────────────────────────────────────────────

function QuizEngine({ questions, title, titleEn, icon, timerSeconds, onFinish, onExit, musicOn, toggleMusic }: {
  questions: Question[]
  title: string
  titleEn: string
  icon: string
  timerSeconds: number
  onFinish: (score: number, total: number, answers: (number | null)[]) => void
  onExit: () => void
  musicOn: boolean
  toggleMusic: () => void
}) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null))
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [finished, setFinished] = useState(false)

  // Auto-start music when exam begins
  useEffect(() => {
    if (!musicOn) toggleMusic()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finishExam = useCallback(() => {
    if (finished) return
    setFinished(true)
    const score = answers.reduce<number>((s, a, i) => s + (a === questions[i].correct ? 1 : 0), 0)
    sfxComplete()
    onFinish(score, questions.length, answers as number[])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, finished, questions])

  const q = questions[current]

  const selectOption = (idx: number) => {
    if (confirmed) return
    setSelected(idx)
    sfxClick()
  }

  const confirm = () => {
    if (selected === null || confirmed) return
    setConfirmed(true)
    const newAnswers = [...answers]
    newAnswers[current] = selected
    setAnswers(newAnswers)
    if (selected === q.correct) sfxCorrect()
    else sfxWrong()
  }

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
      setSelected(answers[current + 1])
      setConfirmed(answers[current + 1] !== null)
    }
  }

  const prev = () => {
    if (current > 0) {
      setCurrent(c => c - 1)
      setSelected(answers[current - 1])
      setConfirmed(answers[current - 1] !== null)
    }
  }

  const goToQuestion = (idx: number) => {
    setCurrent(idx)
    setSelected(answers[idx])
    setConfirmed(answers[idx] !== null)
    sfxClick()
  }

  if (finished) return null

  return (
    <div className="flex flex-col h-[calc(100dvh-70px)] max-w-2xl mx-auto px-3 sm:px-6 py-2 sm:py-3 relative z-10">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <button onClick={onExit} className="text-white/30 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]">
          <Home className="w-4 h-4" />
        </button>
        <div className="flex-1 text-center hidden sm:block">
          <span className="text-white/50 text-[10px] font-bold tracking-wider uppercase">{titleEn}</span>
        </div>
        <button onClick={toggleMusic}
          className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all">
          {musicOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
        <ExamTimer seconds={timerSeconds} onTimeUp={finishExam} />
      </div>

      {/* Progress */}
      <ProgressBar current={answers.filter(a => a !== null).length} total={questions.length} />

      {/* Question number dots — scrollable on mobile */}
      <div className="overflow-x-auto scrollbar-hide mt-2 sm:mt-3 mb-2 sm:mb-4 -mx-3 sm:mx-0 px-3 sm:px-0">
        <div className="flex items-center justify-center gap-1 flex-nowrap sm:flex-wrap min-w-max sm:min-w-0">
          {questions.map((_, i) => (
            <button key={i} onClick={() => goToQuestion(i)}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold flex items-center justify-center transition-all shrink-0 ${
                i === current
                  ? 'bg-amber-500/30 border border-amber-500/50 text-amber-200 scale-110'
                  : answers[i] !== null
                    ? answers[i] === questions[i].correct
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/15 border border-red-500/25 text-red-300'
                    : 'bg-white/[0.03] border border-white/[0.06] text-white/30'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question card — scrollable on mobile */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="rounded-2xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-white/[0.08] shadow-2xl p-4 sm:p-6"
          style={{ backdropFilter: 'blur(20px)' }}>
          {/* Question header */}
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-300 text-xs sm:text-sm font-black">
              {current + 1}
            </div>
            <span className="text-white/25 text-[10px] sm:text-xs font-bold">من {questions.length}</span>
          </div>

          {/* Question text */}
          <div className="mb-1" dir="rtl">
            <h2 className="text-white font-black text-sm sm:text-lg leading-relaxed">{q.question}</h2>
          </div>
          {q.context && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 mb-3 sm:mb-4" dir="ltr">
              <p className="text-amber-200/70 text-[11px] sm:text-xs font-mono">{q.context}</p>
            </div>
          )}

          {/* Options */}
          <div className="flex flex-col gap-2 my-2 sm:my-3" dir="rtl">
            {q.options.map((opt, i) => {
              const isSelected = selected === i
              const isCorrect = i === q.correct
              const showResult = confirmed

              let cls = 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06] hover:border-white/[0.12]'
              if (isSelected && !showResult) {
                cls = 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
              }
              if (showResult && isCorrect) {
                cls = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              }
              if (showResult && isSelected && !isCorrect) {
                cls = 'bg-red-500/15 border-red-500/40 text-red-200'
              }

              return (
                <button key={i} onClick={() => selectOption(i)}
                  disabled={confirmed}
                  className={`w-full flex items-center gap-2.5 sm:gap-3 border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all text-right ${cls} ${confirmed ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}`}>
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${
                    showResult && isCorrect ? 'bg-emerald-500/25 text-emerald-300'
                    : showResult && isSelected && !isCorrect ? 'bg-red-500/25 text-red-300'
                    : isSelected ? 'bg-amber-500/25 text-amber-200'
                    : 'bg-white/[0.04] text-white/30'
                  }`}>
                    {showResult && isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    : showResult && isSelected && !isCorrect ? <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    : String.fromCharCode(65 + i)}
                  </div>
                  <span className="font-semibold text-xs sm:text-sm flex-1">{opt}</span>
                </button>
              )
            })}
          </div>

          {/* Explanation (after confirming) */}
          {confirmed && (
            <div className={`rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3 mt-2 ${
              selected === q.correct
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-red-500/8 border-red-500/15'
            }`} dir="rtl" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
              <div className="flex items-start gap-2">
                {selected === q.correct
                  ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0 mt-0.5" />
                  : <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0 mt-0.5" />}
                <p className={`text-[11px] sm:text-xs leading-relaxed ${selected === q.correct ? 'text-emerald-200/70' : 'text-red-200/70'}`}>
                  {q.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation — sticky, touch-friendly */}
      <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 pb-[env(safe-area-inset-bottom)]">
        <button onClick={prev} disabled={current === 0}
          className="flex items-center gap-1 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 border border-white/[0.08] text-white/60 font-bold px-3 sm:px-4 py-3 sm:py-2.5 rounded-xl transition-all text-[11px] sm:text-xs">
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">السابق</span>
        </button>

        <div className="flex-1">
          {!confirmed && selected !== null ? (
            <button onClick={confirm}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold py-3 sm:py-2.5 rounded-xl transition-all shadow-lg active:scale-95 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4" /> تأكيد الإجابة
            </button>
          ) : confirmed && current < questions.length - 1 ? (
            <button onClick={next}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3 sm:py-2.5 rounded-xl transition-all shadow-lg active:scale-95 text-xs sm:text-sm">
              السؤال التالي <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          ) : confirmed && current === questions.length - 1 ? (
            <button onClick={finishExam}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3 sm:py-2.5 rounded-xl transition-all shadow-lg active:scale-95 text-xs sm:text-sm">
              <Trophy className="w-4 h-4" /> إنهاء الامتحان
            </button>
          ) : (
            <div className="text-center text-white/20 text-[11px] sm:text-xs font-bold py-3 sm:py-2.5">اختر إجابة</div>
          )}
        </div>

        <button onClick={next} disabled={current >= questions.length - 1}
          className="flex items-center gap-1 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 border border-white/[0.08] text-white/60 font-bold px-3 sm:px-4 py-3 sm:py-2.5 rounded-xl transition-all text-[11px] sm:text-xs">
          <span className="hidden sm:inline">التالي</span> <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Results Screen ─────────────────────────────────────────────────────────

function ExamResults({ score, total, title, titleEn, icon, answers, questions, onRetry, onMenu }: {
  score: number; total: number
  title: string; titleEn: string; icon: string
  answers: (number | null)[]
  questions: Question[]
  onRetry: () => void; onMenu: () => void
}) {
  const pct = Math.round((score / total) * 100)
  const [grade, gradeColor, emoji, message] = pct >= 90
    ? ['A+', 'text-emerald-300', '🏆', 'نتيجة استثنائية! أنت نجم!']
    : pct >= 80
      ? ['A', 'text-emerald-300', '🌟', 'ممتاز! أداء رائع!']
      : pct >= 70
        ? ['B', 'text-blue-300', '💪', 'جيد جداً! استمر!']
        : pct >= 60
          ? ['C', 'text-amber-300', '✨', 'جيد! يمكنك التحسن أكثر']
          : pct >= 50
            ? ['D', 'text-orange-300', '📝', 'راجع الدروس وحاول مرة أخرى']
            : ['F', 'text-red-300', '🌱', 'لا تستسلم! كل بداية صعبة']

  const passed = pct >= 60

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-70px)] px-4 sm:px-6 py-6 relative z-10">
      <style jsx>{`
        @keyframes gradeReveal { 0%{transform:scale(0) rotate(-20deg);opacity:0} 60%{transform:scale(1.2) rotate(5deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes scoreCount { 0%{transform:translateY(10px);opacity:0} 100%{transform:translateY(0);opacity:1} }
      `}</style>

      <div className="w-full max-w-md">
        {/* Result card */}
        <div className={`rounded-2xl border shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden ${
          passed
            ? 'bg-gradient-to-br from-emerald-950/50 via-slate-900/40 to-teal-950/50 border-emerald-500/20'
            : 'bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 border-white/[0.08]'
        }`}>
          {/* Top accent */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${
            passed ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500' : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'
          }`} />

          {/* Grade */}
          <div className="mb-3" style={{ animation: 'gradeReveal 0.6s ease-out' }}>
            <span className="text-5xl mb-2 block">{emoji}</span>
            <span className={`text-6xl font-black ${gradeColor}`}>{grade}</span>
          </div>

          <h2 className="text-xl font-black text-white mb-1" dir="rtl">{message}</h2>
          <p className="text-white/30 text-xs mb-5">{title} · {titleEn}</p>

          {/* Score details */}
          <div className="grid grid-cols-3 gap-2 mb-5" style={{ animation: 'scoreCount 0.5s ease-out 0.3s both' }}>
            <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] py-3 px-2">
              <Target className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-2xl font-black text-white">{pct}%</p>
              <p className="text-[9px] text-white/30 font-bold">النسبة</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-3 px-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-2xl font-black text-emerald-200">{score}</p>
              <p className="text-[9px] text-white/30 font-bold">صحيح</p>
            </div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 py-3 px-2">
              <XCircle className="w-4 h-4 text-red-400 mx-auto mb-1" />
              <p className="text-2xl font-black text-red-200">{total - score}</p>
              <p className="text-[9px] text-white/30 font-bold">خطأ</p>
            </div>
          </div>

          {/* Missed questions summary */}
          {score < total && (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 mb-5 text-right max-h-32 overflow-y-auto" dir="rtl">
              <p className="text-white/40 text-[10px] font-bold mb-2">الأسئلة الخاطئة:</p>
              {questions.map((q, i) => {
                if (answers[i] === q.correct) return null
                return (
                  <div key={i} className="flex items-start gap-2 mb-1.5 last:mb-0">
                    <span className="text-red-400/60 text-[10px] font-bold shrink-0">س{i + 1}:</span>
                    <span className="text-white/40 text-[10px]">{q.question} — <span className="text-emerald-300/60">{q.options[q.correct]}</span></span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button onClick={() => { sfxClick(); onRetry() }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold py-3 rounded-xl transition-all shadow-lg active:scale-95 text-sm">
              <RotateCcw className="w-4 h-4" /> أعد الامتحان
            </button>
            <button onClick={onMenu}
              className="w-full flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 font-bold py-2.5 rounded-xl transition-all text-xs">
              <Home className="w-3.5 h-3.5" /> العودة للوحدات
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Menu Screen ───────────────────────────────────────────────────────

function MenuScreen({ results, onPickUnit, onFinalExam, musicOn, toggleMusic }: {
  results: Record<string, ExamResult>
  onPickUnit: (idx: number) => void
  onFinalExam: () => void
  musicOn: boolean
  toggleMusic: () => void
}) {
  const totalQuestions = UNITS.reduce((s, u) => s + u.questions.length, 0)
  const answeredUnits = Object.keys(results).filter(k => k !== 'final').length
  const passedUnits = UNITS.filter(u => {
    const r = results[u.id]
    return r && Math.round((r.score / r.total) * 100) >= 60
  }).length
  const finalResult = results['final']
  const allPassed = passedUnits === UNITS.length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 relative z-10">
      <style jsx>{`
        @keyframes fadeInUp { 0%{transform:translateY(8px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* Hero */}
      <section className="text-center mb-6 sm:mb-8" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          <GraduationCap className="w-3.5 h-3.5" /> المستوى الأول A0
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 leading-tight" dir="rtl">
          امتحانات المستوى <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">الأول</span>
        </h1>
        <p className="text-white/40 text-xs sm:text-sm max-w-md mx-auto" dir="rtl">
          اختبر مستواك في كل وحدة · {totalQuestions} سؤال من دروس تيتشر حمزة القصراوي
        </p>
      </section>

      {/* Teacher & Music control */}
      <section className="mb-5 flex items-center gap-3">
        <div className="flex-1 rounded-2xl bg-gradient-to-r from-amber-900/20 via-orange-900/20 to-red-900/20 border border-amber-500/15 p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl font-black text-white shadow-xl shrink-0">ح</div>
          <div className="flex-1 min-w-0" dir="rtl">
            <h2 className="text-white font-black text-sm leading-tight">Teacher Hamza el Qasraoui</h2>
            <p className="text-white/30 text-[10px] mt-0.5">المستوى الأول — 19 درس · 8 وحدات</p>
          </div>
        </div>
        <button onClick={toggleMusic}
          className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all shrink-0">
          {musicOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </section>

      {/* Stats row */}
      <section className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
          <BookOpen className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <p className="text-lg font-black text-white">{UNITS.length}</p>
          <p className="text-[10px] text-white/30 font-bold">وحدات</p>
        </div>
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-lg font-black text-emerald-200">{passedUnits}/{UNITS.length}</p>
          <p className="text-[10px] text-white/30 font-bold">ناجح</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
          <FileText className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-black text-amber-200">{answeredUnits}/{UNITS.length}</p>
          <p className="text-[10px] text-white/30 font-bold">مُجتاز</p>
        </div>
      </section>

      {/* Unit exams grid */}
      <section className="mb-6">
        <h2 className="text-white font-black text-base sm:text-lg mb-3 flex items-center gap-2" dir="rtl">
          <BookOpen className="w-4 h-4 text-blue-400" /> امتحانات الوحدات
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {UNITS.map((u, i) => (
            <UnitCard key={u.id} unit={u} result={results[u.id]} onClick={() => onPickUnit(i)} index={i} locked={!isUnitUnlocked(i, results)} />
          ))}
        </div>
      </section>

      {/* Final Exam */}
      <section className="mb-6">
        <h2 className="text-white font-black text-base sm:text-lg mb-3 flex items-center gap-2" dir="rtl">
          <Crown className="w-4 h-4 text-amber-400" /> الامتحان النهائي
        </h2>
        <button onClick={() => { sfxClick(); onFinalExam() }}
          disabled={!allPassed}
          className={`w-full group rounded-2xl p-6 text-center transition-all shadow-xl ${
            allPassed
              ? 'bg-gradient-to-br from-amber-900/30 via-orange-900/20 to-red-900/30 border border-amber-500/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
              : 'bg-white/[0.02] border border-white/[0.06] opacity-60 cursor-not-allowed'
          }`}>
          <div className="text-4xl mb-2">{allPassed ? '🎓' : '🔒'}</div>
          <h3 className="text-white font-black text-lg mb-1">الامتحان النهائي الشامل</h3>
          <p className="text-white/40 text-xs mb-2">25 سؤال عشوائي من جميع الوحدات · 30 دقيقة</p>
          {!allPassed ? (
            <div className="flex items-center justify-center gap-1.5 text-white/30 text-xs font-bold">
              <Lock className="w-3 h-3" />
              أكمل جميع امتحانات الوحدات أولاً (60% على الأقل)
            </div>
          ) : finalResult ? (
            <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-bold">
              <Trophy className="w-3 h-3" />
              أفضل نتيجة: {Math.round((finalResult.score / finalResult.total) * 100)}%
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-amber-300/60 text-xs font-bold group-hover:text-amber-300 transition-colors">
              <Unlock className="w-3 h-3" /> ابدأ الامتحان النهائي
            </div>
          )}
        </button>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/15 p-5 text-center">
        <Sparkles className="w-5 h-5 text-blue-400 mx-auto mb-2" />
        <h3 className="text-white font-black text-sm mb-1" dir="rtl">تعلّم المزيد مع تيتشر حمزة</h3>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Link href="/courses" className="inline-flex items-center gap-1.5 bg-white text-blue-900 font-extrabold px-4 py-2 rounded-xl text-xs transition-all hover:-translate-y-0.5 active:scale-95">
            <Crown className="w-3.5 h-3.5" /> الدورات
          </Link>
          <Link href="/play" className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-95">
            <Flame className="w-3.5 h-3.5" /> العب وتعلم
          </Link>
        </div>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

type Screen = 'menu' | 'quiz' | 'results'

export default function A0Page() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [results, setResults] = useState<Record<string, ExamResult>>({})
  const [activeUnit, setActiveUnit] = useState<number | null>(null)
  const [isFinal, setIsFinal] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [lastResult, setLastResult] = useState<{ score: number; total: number; answers: (number | null)[] } | null>(null)
  const [quizKey, setQuizKey] = useState(0)
  const [musicOn, setMusicOn] = useState(false)

  useEffect(() => { setResults(loadResults()) }, [])

  // Music control
  useEffect(() => {
    if (musicOn) startAmbient()
    else stopAmbient()
    return () => stopAmbient()
  }, [musicOn])

  const toggleMusic = () => setMusicOn(m => !m)

  const startUnitExam = (idx: number) => {
    const unit = UNITS[idx]
    setActiveUnit(idx)
    setIsFinal(false)
    setQuizQuestions(shuffle(unit.questions))
    setQuizKey(k => k + 1)
    setScreen('quiz')
  }

  const startFinalExam = () => {
    setActiveUnit(null)
    setIsFinal(true)
    setQuizQuestions(generateFinalExam())
    setQuizKey(k => k + 1)
    setScreen('quiz')
  }

  const finishExam = (score: number, total: number, answers: (number | null)[]) => {
    const unitId = isFinal ? 'final' : UNITS[activeUnit!].id
    const result: ExamResult = { unitId, score, total, date: Date.now() }
    saveResult(result)
    setResults(loadResults())
    setLastResult({ score, total, answers })
    setScreen('results')
  }

  const goMenu = () => {
    setScreen('menu')
    setLastResult(null)
  }

  const retry = () => {
    if (isFinal) startFinalExam()
    else if (activeUnit !== null) startUnitExam(activeUnit)
  }

  const currentTitle = isFinal ? 'الامتحان النهائي الشامل' : activeUnit !== null ? UNITS[activeUnit].title : ''
  const currentTitleEn = isFinal ? 'Final Comprehensive Exam' : activeUnit !== null ? UNITS[activeUnit].titleEn : ''
  const currentIcon = isFinal ? '🎓' : activeUnit !== null ? UNITS[activeUnit].icon : ''
  const timerSeconds = isFinal ? 1800 : 600 // 30 min for final, 10 min for unit

  return (
    <div className="min-h-[100dvh] relative" style={{ background: 'linear-gradient(160deg,#0a0e1a 0%,#111827 40%,#0d1117 100%)' }}>
      <div className="h-[70px]" />

      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <style jsx global>{`
        @keyframes fadeInUp { 0%{transform:translateY(8px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes bounceIn { 0%{transform:scale(0) rotate(-180deg);opacity:0} 60%{transform:scale(1.15) rotate(8deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
      `}</style>

      {screen === 'menu' && (
        <MenuScreen results={results} onPickUnit={startUnitExam} onFinalExam={startFinalExam}
          musicOn={musicOn} toggleMusic={toggleMusic} />
      )}

      {screen === 'quiz' && (
        <QuizEngine
          key={quizKey}
          questions={quizQuestions}
          title={currentTitle}
          titleEn={currentTitleEn}
          icon={currentIcon}
          timerSeconds={timerSeconds}
          onFinish={finishExam}
          onExit={goMenu}
          musicOn={musicOn}
          toggleMusic={toggleMusic}
        />
      )}

      {screen === 'results' && lastResult && (
        <ExamResults
          score={lastResult.score}
          total={lastResult.total}
          title={currentTitle}
          titleEn={currentTitleEn}
          icon={currentIcon}
          answers={lastResult.answers}
          questions={quizQuestions}
          onRetry={retry}
          onMenu={goMenu}
        />
      )}
    </div>
  )
}
