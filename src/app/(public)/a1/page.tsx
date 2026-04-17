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
//  A1 LEVEL EXAM PAGE — Based on Teacher Hamza's PDF (Real Life English 1)
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

let _ambientNodes: OscillatorNode[] = []
let _ambientGain: GainNode | null = null

function startAmbient() {
  const ctx = getCtx()
  if (!ctx || _ambientNodes.length > 0) return
  _ambientGain = ctx.createGain()
  _ambientGain.gain.setValueAtTime(0.025, ctx.currentTime)
  _ambientGain.connect(ctx.destination)
  const freqs = [146.83, 174.61, 220.00, 293.66] // D3, F3, A3, D4
  freqs.forEach(f => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(f, ctx.currentTime)
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.setValueAtTime(0.25, ctx.currentTime)
    lfoGain.gain.setValueAtTime(0.4, ctx.currentTime)
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    lfo.start()
    osc.connect(_ambientGain!)
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
  type?: 'mcq' | 'fill' | 'situation' | 'truefalse' | 'conversation'
  question: string
  context?: string
  options: string[]
  correct: number
  explanation: string
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

const STORAGE_KEY = 'inglizi-a1-exams'

function loadResults(): Record<string, ExamResult> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

function saveResult(r: ExamResult) {
  const all = loadResults()
  if (!all[r.unitId] || r.score > all[r.unitId].score) {
    all[r.unitId] = r
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

// ═══════════════════════════════════════════════════════════════════════════
//  QUESTION BANK — 100% based on Real Life English 1 PDF
// ═══════════════════════════════════════════════════════════════════════════

const UNITS: Unit[] = [
  // ── UNIT 1: Morning Routine & Bathroom (Lessons 1-2) ──
  {
    id: 'unit1',
    title: 'الروتين الصباحي والحمّام',
    titleEn: 'Morning Routine & Bathroom',
    lessons: 'الدرس 1 و 2',
    icon: '🌅',
    color: 'text-sky-300',
    gradient: 'from-sky-600/20 to-blue-600/20',
    border: 'border-sky-500/25',
    questions: [
      {
        id: 'u1q1', type: 'fill',
        question: 'أكمل الجملة: "I ___ my teeth with toothpaste"',
        context: 'Every morning routine',
        options: ['wash', 'brush', 'comb', 'clean'],
        correct: 1,
        explanation: 'I brush my teeth = أفرش أسناني. نستخدم brush مع الأسنان',
      },
      {
        id: 'u1q2', type: 'situation',
        question: 'ماذا تقول باللغة الإنجليزية عندما تستيقظ من النوم؟',
        options: ['I go to bed', 'I wake up', 'I go to sleep', 'I take a shower'],
        correct: 1,
        explanation: 'I wake up = أستيقظ من النوم',
      },
      {
        id: 'u1q3', type: 'mcq',
        question: 'ما معنى "I take a shower with hot water"؟',
        options: ['أغسل وجهي بماء ساخن', 'أستحم بماء ساخن', 'أغسل يدي بماء ساخن', 'أشرب ماء ساخن'],
        correct: 1,
        explanation: 'I take a shower = أستحمّ',
      },
      {
        id: 'u1q4', type: 'conversation',
        question: 'في المحادثة، قالت Hana: "No shower?" فأجاب Amal:',
        context: 'Hana: No shower? — Amal: ___',
        options: ['Yes, every day', 'At night. You?', 'I don\'t like water', 'No, never'],
        correct: 1,
        explanation: 'أمل تستحم في الليل وليس الصباح: "At night. You?"',
      },
      {
        id: 'u1q5', type: 'fill',
        question: 'أكمل: "I use a ___ to dry my body"',
        options: ['brush', 'mirror', 'towel', 'razor'],
        correct: 2,
        explanation: 'towel = منشفة. I use a towel to dry my body',
      },
      {
        id: 'u1q6', type: 'truefalse',
        question: 'صحيح أم خطأ: "I comb my hair" تعني "أغسل شعري"',
        options: ['صحيح ✓', 'خطأ ✗'],
        correct: 1,
        explanation: 'خطأ! "I comb my hair" = أمشّط شعري وليس أغسله',
      },
      {
        id: 'u1q7', type: 'mcq',
        question: 'ما هو الترتيب الصحيح باستخدام "First... Then..."؟',
        context: 'Static Sentence Pattern 4',
        options: [
          'First, I have breakfast. Then, I wake up.',
          'First, I wash my face. Then, I have breakfast.',
          'First, I go to bed. Then, I brush my teeth.',
          'First, I go to work. Then, I wake up.',
        ],
        correct: 1,
        explanation: 'First = أولاً، Then = ثم. أولاً أغسل وجهي، ثم أتناول الفطور',
      },
      {
        id: 'u1q8', type: 'fill',
        question: 'أكمل: "I always ___ my teeth in the morning"',
        context: 'Pattern: I always + [verb] + in the morning',
        options: ['brushes', 'brushing', 'brush', 'brushed'],
        correct: 2,
        explanation: 'مع I نستخدم الفعل بدون إضافات: I always brush',
      },
      {
        id: 'u1q9', type: 'situation',
        question: 'كيف تقول "أنا لا أغسل وجهي ليلاً"؟',
        context: 'Pattern: I don\'t + (verb) + at night',
        options: [
          'I not wash my face at night',
          'I don\'t wash my face at night',
          'I doesn\'t wash my face at night',
          'I no wash my face at night',
        ],
        correct: 1,
        explanation: 'النفي مع I: I don\'t + فعل',
      },
      {
        id: 'u1q10', type: 'mcq',
        question: 'ما معنى "I put on deodorant"؟',
        options: ['أضع العطر', 'أضع مزيل العرق', 'أضع المكياج', 'أضع الكريم'],
        correct: 1,
        explanation: 'deodorant = مزيل العرق',
      },
      {
        id: 'u1q11', type: 'conversation',
        question: 'في المحادثة، سأل Adam: "Cold or hot?" عن الماء. ماذا أجاب Omar؟',
        context: 'Adam: Cold or hot? — Omar: ___',
        options: ['Cold, of course', 'Hot, of course. Cold water is a punishment.', 'I don\'t care', 'Both'],
        correct: 1,
        explanation: 'Omar يفضل الماء الساخن ويعتبر البارد عقوبة!',
      },
      {
        id: 'u1q12', type: 'fill',
        question: 'أكمل: "I use a ___ to brush my teeth"',
        context: 'Pattern: I use + (object) + to + (verb)',
        options: ['towel', 'toothbrush', 'hairdryer', 'razor'],
        correct: 1,
        explanation: 'I use a toothbrush to brush my teeth = أستخدم فرشاة أسنان لتفريش أسناني',
      },
    ],
  },

  // ── UNIT 2: Kitchen & Café (Lessons 3-4) ──
  {
    id: 'unit2',
    title: 'في المطبخ والمقهى',
    titleEn: 'In the Kitchen & Café',
    lessons: 'الدرس 3 و 4',
    icon: '☕',
    color: 'text-amber-300',
    gradient: 'from-amber-600/20 to-yellow-600/20',
    border: 'border-amber-500/25',
    questions: [
      {
        id: 'u2q1', type: 'fill',
        question: 'أكمل: "I ___ water to make tea"',
        options: ['cut', 'boil', 'fry', 'wash'],
        correct: 1,
        explanation: 'I boil water = أغلي الماء. نغلي الماء لصنع الشاي',
      },
      {
        id: 'u2q2', type: 'mcq',
        question: 'ما معنى "I use a pan to fry eggs"؟',
        options: ['أستخدم سكين لتقطيع البيض', 'أستخدم مقلاة لقلي البيض', 'أستخدم ملعقة لتحريك البيض', 'أستخدم طبق للبيض'],
        correct: 1,
        explanation: 'pan = مقلاة، fry = قلي',
      },
      {
        id: 'u2q3', type: 'situation',
        question: 'أنت في المقهى وتريد طلب كابتشينو. ماذا تقول؟',
        context: 'Pattern: Can I have + [drink], please?',
        options: [
          'I need cappuccino',
          'Give me cappuccino',
          'Can I have a cappuccino, please?',
          'Cappuccino now',
        ],
        correct: 2,
        explanation: 'الطريقة المهذبة: Can I have a cappuccino, please?',
      },
      {
        id: 'u2q4', type: 'conversation',
        question: 'في محادثة المطبخ، سألت Dounia: "Where is the knife?" فأجابت Lina:',
        context: 'Dounia: Where is the knife? — Lina: ___',
        options: ['In the fridge', 'On the table', 'The knife is next to the blender', 'I don\'t have one'],
        correct: 2,
        explanation: 'Lina قالت: "The knife is next to the blender" = السكين بجانب الخلاط',
      },
      {
        id: 'u2q5', type: 'truefalse',
        question: 'صحيح أم خطأ: "I don\'t like black coffee" تعني "أنا لا أحب القهوة السوداء"',
        options: ['صحيح ✓', 'خطأ ✗'],
        correct: 0,
        explanation: 'صحيح! black coffee = قهوة سوداء (بدون حليب)',
      },
      {
        id: 'u2q6', type: 'fill',
        question: 'أكمل: "I ___ the dishes after eating"',
        options: ['cook', 'wash', 'cut', 'boil'],
        correct: 1,
        explanation: 'I wash the dishes = أغسل الصحون',
      },
      {
        id: 'u2q7', type: 'mcq',
        question: 'ما معنى "The bill, please"؟',
        options: ['القائمة من فضلك', 'الفاتورة من فضلك', 'الطعام من فضلك', 'الماء من فضلك'],
        correct: 1,
        explanation: 'The bill = الفاتورة / الحساب',
      },
      {
        id: 'u2q8', type: 'situation',
        question: 'صديقك سألك ماذا تفعل عادةً في المقهى. كيف تجيب؟',
        context: 'Pattern: I usually + [verb] + at the café',
        options: [
          'I usually cook at the café',
          'I usually sleep at the café',
          'I usually drink mint tea at the café',
          'I usually wash dishes at the café',
        ],
        correct: 2,
        explanation: 'I usually drink mint tea at the café = عادةً أشرب شاي بالنعناع في المقهى',
      },
      {
        id: 'u2q9', type: 'conversation',
        question: 'في محادثة المقهى، سأل Karim: "Who\'s gonna pay today?" فأجاب Adam:',
        context: 'Adam: You paid last time. So, ___',
        options: ['you pay again', 'I will pay today', 'let\'s not pay', 'nobody pays'],
        correct: 1,
        explanation: 'Adam قال أنه سيدفع اليوم لأن Karim دفع المرة الماضية',
      },
      {
        id: 'u2q10', type: 'fill',
        question: 'أكمل: "I use the ___ to mix the fruit"',
        options: ['knife', 'spoon', 'blender', 'pan'],
        correct: 2,
        explanation: 'blender = الخلاط. I use the blender to mix the fruit',
      },
    ],
  },

  // ── UNIT 3: Restaurant & Groceries (Lessons 5-6) ──
  {
    id: 'unit3',
    title: 'في المطعم والمواد الغذائية',
    titleEn: 'Restaurant & Groceries',
    lessons: 'الدرس 5 و 6',
    icon: '🍽️',
    color: 'text-red-300',
    gradient: 'from-red-600/20 to-rose-600/20',
    border: 'border-red-500/25',
    questions: [
      {
        id: 'u3q1', type: 'situation',
        question: 'دخلت مطعم وتريد طاولة لشخصين. ماذا تقول؟',
        options: [
          'Two tables, please',
          'A table for two, please',
          'I want two chairs',
          'Give me a place',
        ],
        correct: 1,
        explanation: 'A table for two, please = طاولة لشخصين من فضلك',
      },
      {
        id: 'u3q2', type: 'fill',
        question: 'أكمل: "Can I see the ___, please?"',
        context: 'You want to see what food the restaurant has',
        options: ['bill', 'table', 'menu', 'kitchen'],
        correct: 2,
        explanation: 'menu = قائمة الطعام. Can I see the menu, please?',
      },
      {
        id: 'u3q3', type: 'conversation',
        question: 'في المحادثة، قال Mike: "Excuse me, I didn\'t order this. This is fish." ماذا أجاب النادل؟',
        options: ['That\'s your food', 'Sorry! I bring you chicken now.', 'You must eat it', 'No changes allowed'],
        correct: 1,
        explanation: 'النادل اعتذر وقال سيحضر الدجاج الآن',
      },
      {
        id: 'u3q4', type: 'mcq',
        question: 'ما الفرق بين "Chicken" و "Beef"؟',
        options: ['كلاهما دجاج', 'Chicken = دجاج، Beef = لحم بقر', 'Chicken = سمك، Beef = دجاج', 'كلاهما لحم بقر'],
        correct: 1,
        explanation: 'Chicken = دجاج، Beef = لحم بقر',
      },
      {
        id: 'u3q5', type: 'truefalse',
        question: 'صحيح أم خطأ: "Keep the change" تعني "أعطني الباقي"',
        options: ['صحيح ✓', 'خطأ ✗'],
        correct: 1,
        explanation: 'خطأ! "Keep the change" = احتفظ بالباقي (إكرامية للنادل)',
      },
      {
        id: 'u3q6', type: 'mcq',
        question: 'أي من هذه ليست من "Dairy" (مشتقات الحليب)؟',
        options: ['Milk', 'Butter', 'Rice', 'Yogurt'],
        correct: 2,
        explanation: 'Rice = أرز وهو من المواد الجافة (Dry Foods) وليس مشتقات الحليب',
      },
      {
        id: 'u3q7', type: 'situation',
        question: 'تريد أن تسأل عن سعر طبق. كيف تسأل؟',
        context: 'Pattern: How much is + [dish]?',
        options: [
          'What price is chicken?',
          'How much is the chicken with rice?',
          'Chicken price what?',
          'Tell me chicken cost',
        ],
        correct: 1,
        explanation: 'How much is...? = كم سعر...؟',
      },
      {
        id: 'u3q8', type: 'fill',
        question: 'أكمل: "I\'d ___ some orange juice"',
        context: 'Pattern: I\'d like + [food/drink]',
        options: ['want', 'need', 'like', 'have'],
        correct: 2,
        explanation: 'I\'d like = أودّ / أرغب في. طريقة مهذبة للطلب',
      },
      {
        id: 'u3q9', type: 'mcq',
        question: '"Strawberries" تعني بالعربية...',
        options: ['عنب', 'موز', 'فراولة', 'تفاح'],
        correct: 2,
        explanation: 'Strawberries = فراولة',
      },
      {
        id: 'u3q10', type: 'conversation',
        question: 'في المطعم، سألت Sarah: "Do you accept card?" ماذا أجاب النادل؟',
        options: ['No, only cash', 'Yes, we accept both', 'We don\'t have a machine', 'Cash only today'],
        correct: 1,
        explanation: 'النادل قال: "Yes, we accept both" = نعم، نقبل الاثنين (نقد وبطاقة)',
      },
      {
        id: 'u3q11', type: 'mcq',
        question: '"Ground meat" تعني بالعربية...',
        options: ['لحم مشوي', 'لحم مفروم', 'نقانق', 'دجاج'],
        correct: 1,
        explanation: 'Ground meat = لحم مفروم',
      },
    ],
  },

  // ── UNIT 4: Supermarket & Pharmacy (Lessons 7-8) ──
  {
    id: 'unit4',
    title: 'السوبرماركت والصيدلية',
    titleEn: 'Supermarket & Pharmacy',
    lessons: 'الدرس 7 و 8',
    icon: '🛒',
    color: 'text-green-300',
    gradient: 'from-green-600/20 to-emerald-600/20',
    border: 'border-green-500/25',
    questions: [
      {
        id: 'u4q1', type: 'situation',
        question: 'أنت في السوبرماركت وتبحث عن البيض. كيف تسأل؟',
        context: 'Pattern: Where can I find + [item]?',
        options: [
          'Give me eggs',
          'Eggs where?',
          'Where can I find the eggs?',
          'I need eggs now',
        ],
        correct: 2,
        explanation: 'Where can I find...? = أين يمكنني أن أجد...؟',
      },
      {
        id: 'u4q2', type: 'fill',
        question: 'أكمل: "I\'m ___ for tomatoes"',
        context: 'Pattern: I\'m looking for + [product]',
        options: ['searching', 'looking', 'finding', 'wanting'],
        correct: 1,
        explanation: 'I\'m looking for = أنا أبحث عن',
      },
      {
        id: 'u4q3', type: 'conversation',
        question: 'في السوبرماركت، سألت Amy: "Is this on sale?" فأجاب الموظف:',
        options: [
          'No, full price',
          'Yes, all dairy products are 20% off today!',
          'I don\'t know',
          'We don\'t have sales',
        ],
        correct: 1,
        explanation: 'الموظف قال أن جميع منتجات الألبان عليها خصم 20% اليوم',
      },
      {
        id: 'u4q4', type: 'mcq',
        question: 'ما معنى "I need something for a headache"؟',
        options: ['أحتاج شيئاً للنوم', 'أحتاج شيئاً للصداع', 'أحتاج شيئاً للبطن', 'أحتاج شيئاً للحلق'],
        correct: 1,
        explanation: 'headache = صداع',
      },
      {
        id: 'u4q5', type: 'truefalse',
        question: 'صحيح أم خطأ: "Do I need a prescription?" تعني "هل أحتاج وصفة طبية؟"',
        options: ['صحيح ✓', 'خطأ ✗'],
        correct: 0,
        explanation: 'صحيح! prescription = وصفة طبية',
      },
      {
        id: 'u4q6', type: 'situation',
        question: 'أنت في الصيدلية وتريد أن تسأل: كم مرة آخذ الدواء؟',
        options: [
          'How many times should I take it?',
          'When do I eat it?',
          'How much is the medicine?',
          'Can I take two?',
        ],
        correct: 0,
        explanation: 'How many times should I take it? = كم مرة يجب أن آخذه؟',
      },
      {
        id: 'u4q7', type: 'fill',
        question: 'أكمل: "I just need a ___" (أريد فقط مسكن ألم)',
        options: ['vitamin', 'painkiller', 'cream', 'antibiotic'],
        correct: 1,
        explanation: 'painkiller = مسكن ألم',
      },
      {
        id: 'u4q8', type: 'mcq',
        question: 'ما هو "Fever" بالعربية؟',
        options: ['سعال', 'صداع', 'حمّى / سخونة', 'إسهال'],
        correct: 2,
        explanation: 'Fever = حمّى / سخونة / حرارة',
      },
      {
        id: 'u4q9', type: 'conversation',
        question: 'في الصيدلية سأل الرجل: "Can I take it with coffee?" فأجاب الصيدلي:',
        options: [
          'Yes, no problem',
          'No, better with water',
          'Only with milk',
          'Yes, with sugar',
        ],
        correct: 1,
        explanation: 'الصيدلي قال: "No, better with water" = لا، الأفضل مع الماء',
      },
      {
        id: 'u4q10', type: 'mcq',
        question: '"This is too expensive" تعني...',
        options: ['هذا رخيص جداً', 'هذا غالي جداً', 'هذا جميل جداً', 'هذا كبير جداً'],
        correct: 1,
        explanation: 'too expensive = غالي جداً',
      },
    ],
  },

  // ── UNIT 5: Bakery & Clothes Shop (Lessons 9-10) ──
  {
    id: 'unit5',
    title: 'المخبزة ومحل الملابس',
    titleEn: 'Bakery & Clothes Shop',
    lessons: 'الدرس 9 و 10',
    icon: '👕',
    color: 'text-purple-300',
    gradient: 'from-purple-600/20 to-violet-600/20',
    border: 'border-purple-500/25',
    questions: [
      {
        id: 'u5q1', type: 'situation',
        question: 'أنت في المخبزة وتريد خبز أسمر. كيف تسأل؟',
        options: [
          'Brown bread now',
          'Do you have brown bread?',
          'Where is bread?',
          'Bread color brown?',
        ],
        correct: 1,
        explanation: 'Do you have brown bread? = هل لديك خبز أسمر؟',
      },
      {
        id: 'u5q2', type: 'fill',
        question: 'أكمل: "Can I have it ___?" (أريد تقطيعه شرائح)',
        options: ['cooked', 'fried', 'sliced', 'baked'],
        correct: 2,
        explanation: 'sliced = مقطع إلى شرائح. Can I have it sliced?',
      },
      {
        id: 'u5q3', type: 'mcq',
        question: 'ما الفرق بين "Baguette" و "Round Bread"؟',
        options: [
          'لا فرق بينهما',
          'Baguette = باغيت (طويل) و Round Bread = خبز مدوّر',
          'كلاهما خبز أبيض فقط',
          'Round Bread أغلى من Baguette',
        ],
        correct: 1,
        explanation: 'Baguette = خبز طويل (باغيت)، Round Bread = خبز مدوّر',
      },
      {
        id: 'u5q4', type: 'conversation',
        question: 'في المخبزة سأل الخباز: "With sesame or without?" فأجاب الزبون:',
        options: [
          'I don\'t like bread',
          'One with sesame and one without',
          'All with sesame',
          'What is sesame?',
        ],
        correct: 1,
        explanation: 'الزبون طلب واحد بالسمسم وواحد بدون',
      },
      {
        id: 'u5q5', type: 'situation',
        question: 'أنت في محل الملابس وتريد تجربة سترة. كيف تسأل؟',
        options: [
          'I want to wear it',
          'Can I try it on?',
          'Is this my size?',
          'Give me this jacket',
        ],
        correct: 1,
        explanation: 'Can I try it on? = هل يمكنني تجربته؟',
      },
      {
        id: 'u5q6', type: 'fill',
        question: 'أكمل: "Do you have this jacket in size ___?"',
        context: 'Clothing sizes: S, M, L, XL',
        options: ['big', 'M', 'number 5', 'heavy'],
        correct: 1,
        explanation: 'المقاسات: S (صغير)، M (وسط)، L (كبير)، XL (كبير جداً)',
      },
      {
        id: 'u5q7', type: 'truefalse',
        question: 'صحيح أم خطأ: "It fits me well" تعني "إنه ضيق عليّ"',
        options: ['صحيح ✓', 'خطأ ✗'],
        correct: 1,
        explanation: 'خطأ! "It fits me well" = إنه يناسبني جيداً. الضيق = "It\'s too tight"',
      },
      {
        id: 'u5q8', type: 'mcq',
        question: '"Where is the fitting room?" تسأل عن...',
        options: ['غرفة النوم', 'غرفة القياس/التجربة', 'المخزن', 'الحمام'],
        correct: 1,
        explanation: 'fitting room = غرفة القياس / غرفة تجربة الملابس',
      },
      {
        id: 'u5q9', type: 'conversation',
        question: 'في محل الملابس، قال الزبون: "I don\'t like the color." ماذا أجاب البائع؟',
        options: [
          'Sorry, no other colors',
          'We also have it in black and navy blue',
          'This is the only one',
          'Buy it anyway',
        ],
        correct: 1,
        explanation: 'البائع عرض ألوان أخرى: أسود وأزرق داكن',
      },
      {
        id: 'u5q10', type: 'mcq',
        question: '"Hoodie" تعني بالعربية...',
        options: ['قميص', 'تنورة', 'هودي (سترة بغطاء رأس)', 'شورت'],
        correct: 2,
        explanation: 'Hoodie = هودي (سترة رياضية بقبعة)',
      },
    ],
  },

  // ── UNIT 6: Laundry & Clinic (Lessons 11-12) ──
  {
    id: 'unit6',
    title: 'المغسلة وعند الطبيب',
    titleEn: 'Laundry & At the Clinic',
    lessons: 'الدرس 11 و 12',
    icon: '🏥',
    color: 'text-teal-300',
    gradient: 'from-teal-600/20 to-cyan-600/20',
    border: 'border-teal-500/25',
    questions: [
      {
        id: 'u6q1', type: 'fill',
        question: 'أكمل: "I have ___ clothes. I want to wash them."',
        options: ['clean', 'new', 'dirty', 'dry'],
        correct: 2,
        explanation: 'dirty clothes = ملابس متسخة',
      },
      {
        id: 'u6q2', type: 'situation',
        question: 'تريد أن تسأل في المغسلة: متى يمكنني استلام ملابسي؟',
        options: [
          'Where are my clothes?',
          'When can I pick them up?',
          'How much for clothes?',
          'Do you wash blankets?',
        ],
        correct: 1,
        explanation: 'When can I pick them up? = متى يمكنني استلامها؟',
      },
      {
        id: 'u6q3', type: 'truefalse',
        question: 'صحيح أم خطأ: "Don\'t mix the colors" تعني "اخلط الألوان"',
        options: ['صحيح ✓', 'خطأ ✗'],
        correct: 1,
        explanation: 'خطأ! "Don\'t mix the colors" = لا تخلط الألوان',
      },
      {
        id: 'u6q4', type: 'conversation',
        question: 'في المغسلة، قال الزبون: "There\'s still a stain on this shirt." فأجاب العامل:',
        options: [
          'That\'s not a stain',
          'We can clean it again with cold water',
          'Buy a new shirt',
          'Sorry, we can\'t help',
        ],
        correct: 1,
        explanation: 'العامل قال: سنغسله مرة أخرى بالماء البارد',
      },
      {
        id: 'u6q5', type: 'mcq',
        question: 'ما معنى "I feel pain in my chest"؟',
        options: ['أشعر بألم في رأسي', 'أشعر بألم في صدري', 'أشعر بألم في بطني', 'أشعر بألم في ظهري'],
        correct: 1,
        explanation: 'chest = صدر. I feel pain in my chest = أشعر بألم في صدري',
      },
      {
        id: 'u6q6', type: 'fill',
        question: 'أكمل: "My blood pressure is ___"',
        context: 'The patient tells the doctor about high blood pressure',
        options: ['low', 'high', 'good', 'normal'],
        correct: 1,
        explanation: 'high blood pressure = ضغط دم مرتفع',
      },
      {
        id: 'u6q7', type: 'situation',
        question: 'كيف تقول للطبيب "لا أستطيع النوم ليلاً"؟',
        options: [
          'I don\'t like sleeping',
          'I can\'t sleep at night',
          'I sleep too much',
          'I go to bed early',
        ],
        correct: 1,
        explanation: 'I can\'t sleep at night = لا أستطيع النوم ليلاً',
      },
      {
        id: 'u6q8', type: 'mcq',
        question: '"Dizziness" تعني بالعربية...',
        options: ['تعب', 'إسهال', 'دوخة', 'سعال'],
        correct: 2,
        explanation: 'Dizziness = دوخة',
      },
      {
        id: 'u6q9', type: 'conversation',
        question: 'عند الطبيب، سأل الطبيب: "When did this start?" فأجاب المريض:',
        context: 'Doctor: Chest pain? When did this start?',
        options: ['I don\'t know', 'Since yesterday morning', 'Maybe next week', 'A long time'],
        correct: 1,
        explanation: 'المريض قال: "Since yesterday morning" = منذ صباح أمس',
      },
      {
        id: 'u6q10', type: 'fill',
        question: 'أكمل: "I want wash and ___" (أريد غسيل وكوي)',
        options: ['dry', 'fold', 'iron', 'clean'],
        correct: 2,
        explanation: 'iron = كوي. I want wash and iron = أريد غسيلاً وكيّاً',
      },
    ],
  },

  // ── UNIT 7: School, Market & Household (Lessons 13-15) ──
  {
    id: 'unit7',
    title: 'المدرسة والسوق والأدوات المنزلية',
    titleEn: 'School, Market & Household',
    lessons: 'الدرس 13 إلى 15',
    icon: '🏫',
    color: 'text-indigo-300',
    gradient: 'from-indigo-600/20 to-blue-600/20',
    border: 'border-indigo-500/25',
    questions: [
      {
        id: 'u7q1', type: 'situation',
        question: 'تأخرت عن الحصة وتريد الدخول. ماذا تقول؟',
        options: [
          'Open the door!',
          'Sorry, I\'m late. Can I come in?',
          'I\'m here now',
          'The class is boring',
        ],
        correct: 1,
        explanation: 'Sorry, I\'m late. Can I come in? = عذراً تأخرت. هل يمكنني الدخول؟',
      },
      {
        id: 'u7q2', type: 'fill',
        question: 'أكمل: "Can I ___ a pen?" (هل يمكنني استعارة قلم)',
        options: ['take', 'borrow', 'steal', 'buy'],
        correct: 1,
        explanation: 'borrow = يستعير. Can I borrow a pen? = هل يمكنني استعارة قلم؟',
      },
      {
        id: 'u7q3', type: 'conversation',
        question: 'في المدرسة، سأل التلميذ: "What page are we on?" هذا يعني...',
        options: ['كم عمرنا؟', 'في أي صفحة نحن؟', 'ما اسم الكتاب؟', 'متى ينتهي الدرس؟'],
        correct: 1,
        explanation: 'What page are we on? = في أي صفحة نحن؟',
      },
      {
        id: 'u7q4', type: 'situation',
        question: 'أنت في السوق وتريد كيلو بصل. كيف تطلب؟',
        context: 'Pattern: I want + [quantity] + of + [item]',
        options: [
          'One kilo onions give me',
          'I want one kilo of onions',
          'Onions kilo please',
          'How much onions?',
        ],
        correct: 1,
        explanation: 'I want one kilo of onions = أريد كيلو بصل',
      },
      {
        id: 'u7q5', type: 'truefalse',
        question: 'صحيح أم خطأ: "Is this fresh?" تعني "هل هذا طازج؟"',
        options: ['صحيح ✓', 'خطأ ✗'],
        correct: 0,
        explanation: 'صحيح! fresh = طازج',
      },
      {
        id: 'u7q6', type: 'mcq',
        question: '"Can you make it cheaper?" تستخدم عندما...',
        options: ['تريد شيء أكبر', 'تريد تخفيض السعر', 'تريد لون آخر', 'تريد كمية أكبر'],
        correct: 1,
        explanation: 'Can you make it cheaper? = هل يمكنك تخفيض السعر؟ (مساومة)',
      },
      {
        id: 'u7q7', type: 'fill',
        question: 'أكمل: "I want a ___, a dustpan, and a trash bin"',
        options: ['knife', 'broom', 'plate', 'towel'],
        correct: 1,
        explanation: 'broom = مكنسة، dustpan = مجرفة، trash bin = سلة مهملات',
      },
      {
        id: 'u7q8', type: 'mcq',
        question: '"Cumin" تعني بالعربية...',
        options: ['قرفة', 'كمون', 'فلفل', 'زنجبيل'],
        correct: 1,
        explanation: 'Cumin = كمون',
      },
      {
        id: 'u7q9', type: 'conversation',
        question: 'سأل الطالب الجديد: "How much does it cost?" فأجابت السكرتيرة:',
        context: 'About English course enrollment',
        options: ['It\'s free', '$200 for the full course', 'I don\'t know', 'Very expensive'],
        correct: 1,
        explanation: 'السكرتيرة قالت: "$200 for the full course" = 200 دولار للدورة الكاملة',
      },
      {
        id: 'u7q10', type: 'mcq',
        question: '"Teapot" تعني بالعربية...',
        options: ['كأس', 'طنجرة', 'إبريق شاي', 'صينية'],
        correct: 2,
        explanation: 'Teapot = إبريق شاي',
      },
      {
        id: 'u7q11', type: 'situation',
        question: 'لم تفهم ما قاله المعلم. ماذا تقول؟',
        options: [
          'I don\'t like this',
          'Can you repeat, please? I don\'t understand.',
          'This is too hard',
          'I want to go home',
        ],
        correct: 1,
        explanation: 'Can you repeat, please? I don\'t understand = هل يمكنك الإعادة؟ لم أفهم',
      },
    ],
  },

  // ── UNIT 8: Travel, Hotel, Transport & Bank (Lessons 16-20) ──
  {
    id: 'unit8',
    title: 'السفر والفندق والنقل والبنك',
    titleEn: 'Travel, Hotel, Transport & Bank',
    lessons: 'الدرس 16 إلى 20',
    icon: '✈️',
    color: 'text-orange-300',
    gradient: 'from-orange-600/20 to-red-600/20',
    border: 'border-orange-500/25',
    questions: [
      {
        id: 'u8q1', type: 'situation',
        question: 'تريد حجز رحلة طيران. ماذا تقول؟',
        options: [
          'I need a plane',
          'I want to book a flight',
          'Take me to the airport',
          'When is the plane?',
        ],
        correct: 1,
        explanation: 'I want to book a flight = أريد حجز رحلة طيران',
      },
      {
        id: 'u8q2', type: 'fill',
        question: 'أكمل: "One way or ___ trip?"',
        options: ['two', 'back', 'round', 'double'],
        correct: 2,
        explanation: 'round trip = رحلة ذهاب وعودة. One way = ذهاب فقط',
      },
      {
        id: 'u8q3', type: 'mcq',
        question: 'ما الفرق بين "Economy class" و "Business class"؟',
        options: [
          'لا فرق',
          'Economy = درجة اقتصادية (أرخص)، Business = درجة رجال أعمال (أغلى)',
          'Economy أغلى من Business',
          'كلاهما نفس السعر',
        ],
        correct: 1,
        explanation: 'Economy class = درجة اقتصادية، Business class = درجة رجال أعمال',
      },
      {
        id: 'u8q4', type: 'situation',
        question: 'وصلت الفندق وتريد تسجيل الدخول. ماذا تقول؟',
        options: [
          'I want a room',
          'I want to check in. I have a reservation.',
          'Open the door please',
          'Where is my bed?',
        ],
        correct: 1,
        explanation: 'check in = تسجيل الوصول. "I have a reservation" = لدي حجز',
      },
      {
        id: 'u8q5', type: 'conversation',
        question: 'في الفندق سأل الضيف: "Is breakfast included?" ماذا يعني؟',
        options: ['هل الغرفة نظيفة؟', 'هل الإفطار مشمول في السعر؟', 'متى الإفطار؟', 'أين المطعم؟'],
        correct: 1,
        explanation: 'Is breakfast included? = هل الإفطار مشمول (في سعر الغرفة)؟',
      },
      {
        id: 'u8q6', type: 'fill',
        question: 'أكمل: "Where is the bus ___?" (أين موقف الحافلة)',
        options: ['place', 'station', 'stop', 'park'],
        correct: 2,
        explanation: 'bus stop = موقف الحافلة',
      },
      {
        id: 'u8q7', type: 'truefalse',
        question: 'صحيح أم خطأ: "I want to withdraw money" تعني "أريد إيداع نقود"',
        options: ['صحيح ✓', 'خطأ ✗'],
        correct: 1,
        explanation: 'خطأ! withdraw = سحب (وليس إيداع). deposit = إيداع',
      },
      {
        id: 'u8q8', type: 'situation',
        question: 'أنت في التاكسي وتريد الذهاب لوسط المدينة. ماذا تقول؟',
        options: [
          'I want to walk',
          'To downtown, please',
          'How much is the bus?',
          'Where is the train?',
        ],
        correct: 1,
        explanation: 'To downtown, please = إلى وسط المدينة، من فضلك',
      },
      {
        id: 'u8q9', type: 'conversation',
        question: 'في البنك، سأل الموظف: "Do you want a savings account or a current account?" ماذا يعني؟',
        options: [
          'هل تريد قرض؟',
          'هل تريد حساب توفير أم حساب جاري؟',
          'هل تريد بطاقة؟',
          'هل تريد تحويل؟',
        ],
        correct: 1,
        explanation: 'savings account = حساب توفير، current account = حساب جاري',
      },
      {
        id: 'u8q10', type: 'fill',
        question: 'أكمل: "I want to ___ money to my brother"',
        context: 'Sending money to a family member',
        options: ['withdraw', 'deposit', 'transfer', 'change'],
        correct: 2,
        explanation: 'transfer = تحويل. I want to transfer money = أريد تحويل نقود',
      },
      {
        id: 'u8q11', type: 'mcq',
        question: '"ATM" تعني بالعربية...',
        options: ['بنك', 'بطاقة بنكية', 'الصراف الآلي', 'موظف البنك'],
        correct: 2,
        explanation: 'ATM = الصراف الآلي',
      },
      {
        id: 'u8q12', type: 'mcq',
        question: '"Housekeeping" في الفندق تعني...',
        options: ['خدمة الغرف (طعام)', 'التنظيف وترتيب الغرف', 'موظف الاستقبال', 'حامل الأمتعة'],
        correct: 1,
        explanation: 'Housekeeping = التنظيف وترتيب الغرف',
      },
    ],
  },
]

// Shuffle helper
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateFinalExam(): Question[] {
  const all = UNITS.flatMap(u => u.questions)
  return shuffle(all).slice(0, 25)
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

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

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-white/30 font-bold">{current} / {total}</span>
        <span className="text-[10px] text-white/30 font-bold">{pct}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function isUnitUnlocked(unitIndex: number, results: Record<string, ExamResult>): boolean {
  if (unitIndex === 0) return true
  const prevUnit = UNITS[unitIndex - 1]
  const prevResult = results[prevUnit.id]
  if (!prevResult) return false
  return Math.round((prevResult.score / prevResult.total) * 100) >= 60
}

// Question type badge
function TypeBadge({ type }: { type?: string }) {
  const labels: Record<string, { text: string; color: string }> = {
    fill: { text: 'أكمل الفراغ', color: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
    situation: { text: 'موقف', color: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
    truefalse: { text: 'صح / خطأ', color: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
    conversation: { text: 'محادثة', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
    mcq: { text: 'اختيار', color: 'bg-white/[0.06] text-white/40 border-white/[0.08]' },
  }
  const t = type || 'mcq'
  const l = labels[t] || labels.mcq
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${l.color}`}>
      {l.text}
    </span>
  )
}

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

      <ProgressBar current={answers.filter(a => a !== null).length} total={questions.length} />

      {/* Question dots */}
      <div className="overflow-x-auto scrollbar-hide mt-2 sm:mt-3 mb-2 sm:mb-4 -mx-3 sm:mx-0 px-3 sm:px-0">
        <div className="flex items-center justify-center gap-1 flex-nowrap sm:flex-wrap min-w-max sm:min-w-0">
          {questions.map((_, i) => (
            <button key={i} onClick={() => goToQuestion(i)}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold flex items-center justify-center transition-all shrink-0 ${
                i === current
                  ? 'bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 scale-110'
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

      {/* Question card */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="rounded-2xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-white/[0.08] shadow-2xl p-4 sm:p-6"
          style={{ backdropFilter: 'blur(20px)' }}>
          {/* Question header */}
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-300 text-xs sm:text-sm font-black">
              {current + 1}
            </div>
            <span className="text-white/25 text-[10px] sm:text-xs font-bold">من {questions.length}</span>
            <div className="mr-auto"><TypeBadge type={q.type} /></div>
          </div>

          {/* Question text */}
          <div className="mb-1" dir="rtl">
            <h2 className="text-white font-black text-sm sm:text-lg leading-relaxed">{q.question}</h2>
          </div>
          {q.context && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 mb-3 sm:mb-4" dir="ltr">
              <p className="text-emerald-200/70 text-[11px] sm:text-xs font-mono">{q.context}</p>
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
                cls = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
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
                    : isSelected ? 'bg-emerald-500/25 text-emerald-200'
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

          {/* Explanation */}
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

      {/* Bottom navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 pb-[env(safe-area-inset-bottom)]">
        <button onClick={prev} disabled={current === 0}
          className="flex items-center gap-1 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 border border-white/[0.08] text-white/60 font-bold px-3 sm:px-4 py-3 sm:py-2.5 rounded-xl transition-all text-[11px] sm:text-xs">
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">السابق</span>
        </button>

        <div className="flex-1">
          {!confirmed && selected !== null ? (
            <button onClick={confirm}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3 sm:py-2.5 rounded-xl transition-all shadow-lg active:scale-95 text-xs sm:text-sm">
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
        <div className={`rounded-2xl border shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden ${
          passed
            ? 'bg-gradient-to-br from-emerald-950/50 via-slate-900/40 to-teal-950/50 border-emerald-500/20'
            : 'bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 border-white/[0.08]'
        }`}>
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${
            passed ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500' : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'
          }`} />

          <div className="mb-3" style={{ animation: 'gradeReveal 0.6s ease-out' }}>
            <span className="text-5xl mb-2 block">{emoji}</span>
            <span className={`text-6xl font-black ${gradeColor}`}>{grade}</span>
          </div>

          <h2 className="text-xl font-black text-white mb-1" dir="rtl">{message}</h2>
          <p className="text-white/30 text-xs mb-5">{title} · {titleEn}</p>

          <div className="grid grid-cols-3 gap-2 mb-5" style={{ animation: 'scoreCount 0.5s ease-out 0.3s both' }}>
            <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] py-3 px-2">
              <Target className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
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

          <div className="space-y-2">
            <button onClick={() => { sfxClick(); onRetry() }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3 rounded-xl transition-all shadow-lg active:scale-95 text-sm">
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
      `}</style>

      {/* Hero */}
      <section className="text-center mb-6 sm:mb-8" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          <GraduationCap className="w-3.5 h-3.5" /> المستوى A1 — A2
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 leading-tight" dir="rtl">
          امتحانات <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">الإنجليزية للمواقف اليومية</span>
        </h1>
        <p className="text-white/40 text-xs sm:text-sm max-w-md mx-auto" dir="rtl">
          Real Life English 1 · {totalQuestions} سؤال متنوع من دروس تيتشر حمزة القصراوي
        </p>
      </section>

      {/* Teacher & Music */}
      <section className="mb-5 flex items-center gap-3">
        <div className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-900/20 via-teal-900/20 to-cyan-900/20 border border-emerald-500/15 p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xl font-black text-white shadow-xl shrink-0">ح</div>
          <div className="flex-1 min-w-0" dir="rtl">
            <h2 className="text-white font-black text-sm leading-tight">Teacher Hamza el Qasraoui</h2>
            <p className="text-white/30 text-[10px] mt-0.5">المستوى A1-A2 — 20 درس · 8 وحدات · أنواع أسئلة متنوعة</p>
          </div>
        </div>
        <button onClick={toggleMusic}
          className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all shrink-0">
          {musicOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </section>

      {/* Question type legend */}
      <section className="mb-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4" dir="rtl">
        <p className="text-white/50 text-xs font-bold mb-2">أنواع الأسئلة في هذا المستوى:</p>
        <div className="flex flex-wrap gap-2">
          <TypeBadge type="fill" />
          <TypeBadge type="situation" />
          <TypeBadge type="conversation" />
          <TypeBadge type="truefalse" />
          <TypeBadge type="mcq" />
        </div>
      </section>

      {/* Stats */}
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
            <UnitCard key={u.id} unit={u} result={results[u.id]} onClick={() => onPickUnit(i)} index={i}
              locked={!isUnitUnlocked(i, results)} />
          ))}
        </div>
      </section>

      {/* Final Exam */}
      <section className="mb-6">
        <h2 className="text-white font-black text-base sm:text-lg mb-3 flex items-center gap-2" dir="rtl">
          <Crown className="w-4 h-4 text-emerald-400" /> الامتحان النهائي
        </h2>
        <button onClick={() => { sfxClick(); onFinalExam() }}
          disabled={!allPassed}
          className={`w-full group rounded-2xl p-6 text-center transition-all shadow-xl ${
            allPassed
              ? 'bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-cyan-900/30 border border-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
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
            <div className="flex items-center justify-center gap-1.5 text-emerald-300 text-xs font-bold">
              <Trophy className="w-3 h-3" />
              أفضل نتيجة: {Math.round((finalResult.score / finalResult.total) * 100)}%
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-emerald-300/60 text-xs font-bold group-hover:text-emerald-300 transition-colors">
              <Unlock className="w-3 h-3" /> ابدأ الامتحان النهائي
            </div>
          )}
        </button>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/15 p-5 text-center">
        <Sparkles className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
        <h3 className="text-white font-black text-sm mb-1" dir="rtl">تعلّم المزيد مع تيتشر حمزة</h3>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Link href="/courses" className="inline-flex items-center gap-1.5 bg-white text-emerald-900 font-extrabold px-4 py-2 rounded-xl text-xs transition-all hover:-translate-y-0.5 active:scale-95">
            <Crown className="w-3.5 h-3.5" /> الدورات
          </Link>
          <Link href="/a0" className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-95">
            <ArrowRight className="w-3.5 h-3.5" /> امتحان A0
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

export default function A1Page() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [results, setResults] = useState<Record<string, ExamResult>>({})
  const [activeUnit, setActiveUnit] = useState<number | null>(null)
  const [isFinal, setIsFinal] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [lastResult, setLastResult] = useState<{ score: number; total: number; answers: (number | null)[] } | null>(null)
  const [quizKey, setQuizKey] = useState(0)
  const [musicOn, setMusicOn] = useState(false)

  useEffect(() => { setResults(loadResults()) }, [])

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
  const timerSeconds = isFinal ? 1800 : 600

  return (
    <div className="min-h-[100dvh] relative" style={{ background: 'linear-gradient(160deg,#0a1a14 0%,#0f1f18 40%,#0d1711 100%)' }}>
      <div className="h-[70px]" />

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
