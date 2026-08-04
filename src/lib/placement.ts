import type { CEFRLevel, Question, WritingPrompt } from '@/data/placement-test'

/* ══════════════════════════════════════════════════════════════════════════
   PLACEMENT — answer matching and writing analysis
   ══════════════════════════════════════════════════════════════════════════

   Typed answers have to be judged kindly but not loosely. A learner who writes
   "i go to work by bus" has heard the sentence correctly; one who writes
   "I go to work by boss" has not. So: normalise aggressively (case, accents,
   punctuation, curly apostrophes), then allow a one-character slip on longer
   words — but never a slip that turns one real word into another we were
   testing.
   ══════════════════════════════════════════════════════════════════════════ */

/** Lowercase, strip punctuation and diacritics, collapse whitespace. */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[.,!?;:"“”()\[\]{}…]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Levenshtein distance, capped for speed — we never care past 2. */
function distance(a: string, b: string, cap = 3): number {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > cap) return cap + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
      if (cur[j] < best) best = cur[j]
    }
    if (best > cap) return cap + 1
    prev = cur
  }
  return prev[b.length]
}

/** Tolerance grows with word length: short words must be exact. */
function slack(word: string): number {
  if (word.length <= 4) return 0
  if (word.length <= 7) return 1
  return 2
}

/** Does a typed gap answer match any accepted form? */
export function matchesGap(input: string, accepted: string[]): boolean {
  const got = norm(input)
  if (!got) return false
  return accepted.some(a => {
    const want = norm(a)
    if (got === want) return true
    // multi-word answers ("has lived") must match word by word
    const gw = got.split(' '), ww = want.split(' ')
    if (gw.length !== ww.length) return false
    return gw.every((w, i) => w === ww[i] || distance(w, ww[i]) <= slack(ww[i]))
  })
}

/** Word-level accuracy for dictation, 0–1. */
export function dictationAccuracy(input: string, target: string): number {
  const got = norm(input).split(' ').filter(Boolean)
  const want = norm(target).split(' ').filter(Boolean)
  if (want.length === 0) return 0
  // greedy alignment is enough at these sentence lengths
  let hits = 0
  const pool = [...got]
  for (const w of want) {
    const i = pool.findIndex(g => g === w || distance(g, w) <= slack(w))
    if (i !== -1) { hits++; pool.splice(i, 1) }
  }
  return hits / want.length
}

/** Dictation passes at 85% of words — a slip is forgiven, a guess is not. */
export const DICTATION_PASS = 0.85

/** Judge any question against the learner's response. */
export function isCorrect(
  q: Question,
  res: { option?: number | null; multi?: number[]; text?: string[]; order?: number[] },
): boolean {
  switch (q.type) {
    case 'mcq':
    case 'reading':
    case 'listenMcq':
      return res.option === q.answer

    case 'multi': {
      const want = [...(q.answers ?? [])].sort().join(',')
      const got = [...(res.multi ?? [])].sort().join(',')
      return want === got && want.length > 0
    }

    case 'gap':
    case 'listenGap':
      return (q.accept ?? []).every((acc, i) => matchesGap(res.text?.[i] ?? '', acc))

    case 'listenWrite':
      return dictationAccuracy(res.text?.[0] ?? '', q.audio ?? '') >= DICTATION_PASS

    case 'order':
      return (res.order ?? []).join(',') === (q.correctOrder ?? []).join(',')

    default:
      return false
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   WRITING
   ══════════════════════════════════════════════════════════════════════════ */

export interface WritingIssue {
  /** The exact fragment we object to, so the UI can point at it. */
  fragment: string
  /** Arabic explanation of the problem. */
  note:     string
  /** Suggested replacement, when there is an obvious one. */
  fix?:     string
}

export interface WritingReport {
  /** 0–100. */
  score:      number
  words:      number
  sentences:  number
  /** What the writing alone suggests about level. */
  estimated:  CEFRLevel
  strengths:  string[]
  issues:     WritingIssue[]
  /** A cleaned-up version of the learner's text, when available. */
  corrected?: string
  /** Whether an AI pass contributed, or this is the local analysis alone. */
  source:     'ai' | 'local'
}

/** Mistakes Arabic speakers make often enough to check for by rule. */
const RULES: { re: RegExp; note: string; fix?: (m: RegExpMatchArray) => string }[] = [
  { re: /\bi\s/g, note: 'الضمير I يُكتب دائماً بحرف كبير.', fix: () => 'I ' },
  { re: /\b(he|she|it)\s+(are|am)\b/gi, note: 'مع he/she/it نستخدم is.' },
  { re: /\b(i)\s+(is|are)\b/gi, note: 'مع I نستخدم am.' },
  { re: /\b(we|they|you)\s+(is)\b/gi, note: 'مع we/they/you نستخدم are.' },
  { re: /\bdid\s+not\s+\w+ed\b/gi, note: 'بعد did not يأتي الفعل في المصدر بلا ed.' },
  { re: /\bdidn't\s+\w+ed\b/gi, note: "بعد didn't يأتي الفعل في المصدر بلا ed." },
  { re: /\b(have|has)\s+went\b/gi, note: 'التصريف الثالث لـ go هو gone وليس went.', fix: () => 'have gone' },
  { re: /\bmore\s+(better|worse|bigger|easier)\b/gi, note: 'لا نجمع more مع صيغة المقارنة.' },
  { re: /\ba\s+([aeiou])/gi, note: 'قبل حرف متحرك نستخدم an بدل a.' },
  { re: /\bin\s+the\s+home\b/gi, note: 'نقول at home بدون the.', fix: () => 'at home' },
  { re: /\bdiscuss\s+about\b/gi, note: 'الفعل discuss لا يأخذ about.', fix: () => 'discuss' },
  { re: /\bexplain\s+me\b/gi, note: 'الصحيح explain to me.', fix: () => 'explain to me' },
]

const CONNECTORS_BASIC = ['and', 'but', 'because', 'so', 'then', 'also']
const CONNECTORS_MID   = ['however', 'although', 'therefore', 'while', 'since', 'whereas', 'moreover']
const CONNECTORS_HIGH  = ['nevertheless', 'consequently', 'furthermore', 'albeit', 'notwithstanding', 'thereby']

/**
 * Deterministic analysis that always runs. It never blocks on a network call,
 * so a learner always gets a result — the AI pass, when it succeeds, layers
 * qualitative feedback on top of this.
 */
export function analyseWriting(text: string, prompt: WritingPrompt): WritingReport {
  const clean = text.trim()
  const words = clean ? clean.split(/\s+/).filter(Boolean) : []
  const sentences = clean.split(/[.!?]+/).map(s => s.trim()).filter(Boolean)
  const lower = ' ' + clean.toLowerCase() + ' '

  const issues: WritingIssue[] = []
  for (const rule of RULES) {
    const m = clean.match(rule.re)
    if (m && m.length) {
      issues.push({
        fragment: m[0].trim(),
        note: rule.note,
        fix: rule.fix ? rule.fix(m as RegExpMatchArray) : undefined,
      })
    }
    if (issues.length >= 6) break
  }

  // sentences that never end
  const runOn = sentences.filter(s => s.split(/\s+/).length > 40)
  if (runOn.length) {
    issues.push({ fragment: runOn[0].slice(0, 60) + '…', note: 'جملة طويلة جداً — قسّمها إلى جملتين أو ثلاث.' })
  }
  // no full stops at all
  if (words.length > 25 && sentences.length <= 1) {
    issues.push({ fragment: '—', note: 'لا توجد علامات ترقيم — استخدم النقطة لفصل الجمل.' })
  }

  const strengths: string[] = []
  const uniqueRatio = words.length ? new Set(words.map(w => w.toLowerCase())).size / words.length : 0
  const midUsed  = CONNECTORS_MID.filter(c => lower.includes(` ${c} `))
  const highUsed = CONNECTORS_HIGH.filter(c => lower.includes(` ${c} `))
  const basicUsed = CONNECTORS_BASIC.filter(c => lower.includes(` ${c} `))

  if (words.length >= prompt.minWords) strengths.push(`كتبت ${words.length} كلمة — استوفيت الحد المطلوب.`)
  if (uniqueRatio > 0.62 && words.length > 30) strengths.push('تنوّع جيد في المفردات دون تكرار.')
  if (midUsed.length) strengths.push(`استخدمت روابط متوسطة: ${midUsed.slice(0, 3).join(', ')}.`)
  if (highUsed.length) strengths.push(`استخدمت روابط متقدمة: ${highUsed.slice(0, 2).join(', ')}.`)
  if (basicUsed.length >= 2 && !midUsed.length) strengths.push('تربط الجمل ببعضها — الخطوة التالية روابط أقوى.')
  if (sentences.length >= 4) strengths.push('قسّمت النص إلى جمل واضحة.')

  /* ── Score ──────────────────────────────────────────────
     Length gets you to a passing mark; range and accuracy take you past it. */
  const lengthScore = Math.min(1, words.length / Math.max(prompt.minWords, 1)) * 40
  const rangeScore  = Math.min(1, uniqueRatio / 0.7) * 20
  const linkScore   = Math.min(1, (basicUsed.length * 0.5 + midUsed.length * 1.5 + highUsed.length * 2.5) / 4) * 20
  const structScore = Math.min(1, sentences.length / 4) * 10
  const errorPenalty = Math.min(20, issues.length * 5)
  const score = Math.max(0, Math.round(lengthScore + rangeScore + linkScore + structScore + 10 - errorPenalty))

  /* ── Level estimate from the writing alone ─────────────── */
  let estimated: CEFRLevel = 'A0'
  if (words.length >= 15 && issues.length <= 4) estimated = 'A1'
  if (words.length >= 35 && basicUsed.length >= 1 && issues.length <= 3) estimated = 'A2'
  if (words.length >= 70 && midUsed.length >= 1 && issues.length <= 2) estimated = 'B1'
  if (words.length >= 110 && midUsed.length >= 2 && uniqueRatio > 0.6 && issues.length <= 1) estimated = 'B2'
  if (words.length >= 140 && highUsed.length >= 1 && uniqueRatio > 0.62 && issues.length === 0) estimated = 'C1'

  return {
    score, words: words.length, sentences: sentences.length,
    estimated, strengths, issues: issues.slice(0, 6), source: 'local',
  }
}

/**
 * Ask the server to grade the writing, falling back to the local analysis on
 * any failure or timeout. The learner must never be left waiting on a model.
 */
export async function gradeWriting(
  text: string, prompt: WritingPrompt, testLevel: CEFRLevel,
): Promise<WritingReport> {
  const local = analyseWriting(text, prompt)
  if (text.trim().split(/\s+/).filter(Boolean).length < 5) return local

  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 12000)
    const res = await fetch('/api/level-test/grade-writing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, prompt: prompt.prompt, level: testLevel, minWords: prompt.minWords }),
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return local

    const ai = await res.json() as {
      score?: number; estimated?: string; strengths?: string[]
      issues?: { fragment: string; note: string; fix?: string }[]
      corrected?: string
    }

    const valid: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']
    return {
      ...local,
      // average the two estimates of quality rather than trusting either alone
      score:     typeof ai.score === 'number' ? Math.round((ai.score + local.score) / 2) : local.score,
      estimated: valid.includes(ai.estimated as CEFRLevel) ? ai.estimated as CEFRLevel : local.estimated,
      strengths: (ai.strengths?.length ? ai.strengths : local.strengths).slice(0, 4),
      issues:    (ai.issues?.length ? ai.issues : local.issues).slice(0, 6),
      corrected: ai.corrected,
      source:    'ai',
    }
  } catch {
    return local
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   FINAL PLACEMENT
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * The quiz decides the level; the writing can nudge it by one step at most.
 *
 * A learner who cleared B1 but writes like an A2 is placed at A2 — better a
 * class they can survive than one they will quietly drop out of. The reverse
 * lift is allowed too, but only by one level and only from a strong piece.
 */
export function finalLevel(quizLevel: CEFRLevel, writing: WritingReport | null): {
  level: CEFRLevel; adjusted: 'up' | 'down' | null
} {
  const order: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']
  const qi = order.indexOf(quizLevel)
  if (!writing || writing.words < 10) return { level: quizLevel, adjusted: null }

  const wi = order.indexOf(writing.estimated)
  if (wi < qi - 1) return { level: order[qi - 1], adjusted: 'down' }
  if (wi > qi + 1 && writing.score >= 75) return { level: order[qi + 1], adjusted: 'up' }
  return { level: quizLevel, adjusted: null }
}
