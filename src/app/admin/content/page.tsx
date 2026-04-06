'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Upload, Wand2, Save, CheckCircle2, Shuffle,
  Play, Lightbulb, BookOpen, ChevronDown, X, Sparkles,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Level   = 'A1' | 'A2' | 'B1' | 'B2'
type Lesson  = 'Greetings' | 'Daily Life' | 'Travel' | 'Work' | 'Shopping' | 'Health'

interface Draft {
  sentence: string
  level: Level
  lesson: Lesson
  options: string[]
  correctIndex: number
  videoUrl: string | null
  videoName: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const LEVELS: Level[]  = ['A1', 'A2', 'B1', 'B2']
const LESSONS: Lesson[] = ['Greetings', 'Daily Life', 'Travel', 'Work', 'Shopping', 'Health']

const LEVEL_STYLE: Record<Level, { active: string; inactive: string; badge: string }> = {
  A1: {
    active:   'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
    inactive: 'bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50',
    badge:    'bg-emerald-100 text-emerald-700',
  },
  A2: {
    active:   'bg-amber-500 text-white shadow-lg shadow-amber-500/30',
    inactive: 'bg-white border border-amber-200 text-amber-600 hover:bg-amber-50',
    badge:    'bg-amber-100 text-amber-700',
  },
  B1: {
    active:   'bg-violet-500 text-white shadow-lg shadow-violet-500/30',
    inactive: 'bg-white border border-violet-200 text-violet-600 hover:bg-violet-50',
    badge:    'bg-violet-100 text-violet-700',
  },
  B2: {
    active:   'bg-rose-500 text-white shadow-lg shadow-rose-500/30',
    inactive: 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50',
    badge:    'bg-rose-100 text-rose-700',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// OPTION GENERATOR  (pure logic — no API)
// ─────────────────────────────────────────────────────────────────────────────

function generateDistractors(sentence: string): [string, string] {
  const words = sentence.trim().split(/\s+/)

  // Mutation strategies — apply two different ones
  const strategies: Array<(ws: string[]) => string> = [
    // Drop a small grammatical word
    (ws) => {
      const dropCandidates = ['to', 'the', 'a', 'an', 'is', 'are', 'do', 'does', 'have', 'has']
      const idx = ws.findIndex(w => dropCandidates.includes(w.toLowerCase()))
      if (idx !== -1) {
        const r = [...ws]; r.splice(idx, 1); return r.join(' ')
      }
      // Fallback: swap last two words
      const r = [...ws]; if (r.length >= 2) [r[r.length - 1], r[r.length - 2]] = [r[r.length - 2], r[r.length - 1]]
      return r.join(' ')
    },
    // Wrong subject-verb agreement (add/remove s)
    (ws) => {
      const verbIdx = ws.findIndex(w => /^(go|do|have|work|come|play|make|take|get|say|know|think|see|look|want|give|use|find|tell|ask|seem|feel|try|leave|call|keep|let|begin|show|hear|run|move|live|believe|hold|bring|write|stand|lose|pay|meet|include|continue|set|learn|change|lead|understand|watch|follow|stop|create|speak|read|spend|grow|open|walk|win|offer|remember|love|consider|appear|buy|wait|serve|die|send|expect|build|stay|fall|cut|reach|kill|remain|suggest|raise|pass|sell|require|report|decide|pull)$/i.test(w))
      if (verbIdx !== -1) {
        const r = [...ws]
        const v = r[verbIdx]
        r[verbIdx] = v.endsWith('s') ? v.slice(0, -1) : v + 's'
        return r.join(' ')
      }
      // Fallback: replace a content word with a near-synonym
      const r = [...ws]
      const SWAPS: Record<string, string> = {
        every: 'each', always: 'usually', big: 'large', small: 'little',
        fast: 'quick', happy: 'glad', good: 'great', bad: 'poor',
        work: 'job', home: 'house', day: 'time', go: 'get',
      }
      for (let j = 0; j < r.length; j++) {
        const lower = r[j].toLowerCase()
        if (SWAPS[lower]) { r[j] = SWAPS[lower]; return r.join(' ') }
      }
      // Last resort: prepend "I think"
      return 'I think ' + ws.join(' ')
    },
    // Wrong tense (simple past ↔ present)
    (ws) => {
      const PAST_MAP: Record<string, string> = {
        go: 'went', do: 'did', have: 'had', come: 'came', take: 'took',
        make: 'made', get: 'got', say: 'said', know: 'knew', see: 'saw',
        give: 'gave', find: 'found', tell: 'told', feel: 'felt', leave: 'left',
        buy: 'bought', run: 'ran', speak: 'spoke', write: 'wrote', read: 'read',
        bring: 'brought', think: 'thought', meet: 'met', fall: 'fell', keep: 'kept',
      }
      const r = [...ws]
      for (let j = 0; j < r.length; j++) {
        const lower = r[j].toLowerCase()
        if (PAST_MAP[lower]) { r[j] = PAST_MAP[lower]; return r.join(' ') }
        if (lower.endsWith('ed') && lower.length > 4) {
          // revert simple past to base form
          const base = lower.slice(0, -2)
          r[j] = base; return r.join(' ')
        }
      }
      // Fallback: insert "not"
      if (words.length >= 2) {
        const r2 = [...ws]; r2.splice(1, 0, 'not'); return r2.join(' ')
      }
      return ws.join(' ') + '?'
    },
  ]

  const used = new Set<string>([sentence])
  const results: string[] = []
  const shuffledStrats = [...strategies].sort(() => Math.random() - 0.5)

  for (const strat of shuffledStrats) {
    if (results.length === 2) break
    const candidate = strat(words)
    if (candidate !== sentence && !used.has(candidate)) {
      used.add(candidate)
      results.push(candidate)
    }
  }

  // Safety net
  while (results.length < 2) {
    const fallback = sentence + (results.length === 0 ? '?' : '!')
    results.push(fallback)
  }

  return [results[0], results[1]]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl font-semibold text-sm animate-slideUp">
      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
      {message}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW CARD
// ─────────────────────────────────────────────────────────────────────────────

function PreviewCard({ draft }: { draft: Draft }) {
  const [picked, setPicked] = useState<number | null>(null)
  const m = LEVEL_STYLE[draft.level]

  // Reset pick when options change
  useEffect(() => { setPicked(null) }, [draft.options, draft.sentence])

  const isEmpty = !draft.sentence.trim() && draft.options.length === 0

  if (isEmpty) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <Sparkles size={28} className="text-indigo-300" />
        </div>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
          Fill in the form on the left and click <span className="font-bold text-indigo-500">Generate Options</span> to see a live preview here
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-2">
      {/* Video player placeholder */}
      {draft.videoUrl ? (
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg" style={{ aspectRatio: '16/9' }}>
          <video
            src={draft.videoUrl}
            controls
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 py-8">
          <Play size={24} className="text-gray-300" />
          <span className="text-gray-400 text-xs">Video preview</span>
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-2">
        <span className={`text-xs font-black px-2.5 py-1 rounded-full ${m.badge}`}>
          {draft.level}
        </span>
        <span className="text-xs text-gray-400 font-medium">{draft.lesson}</span>
      </div>

      {/* Sentence */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <p className="text-xs text-gray-400 font-semibold mb-1 flex items-center gap-1">
          <Lightbulb size={11} /> الجملة
        </p>
        <p className="text-gray-900 font-semibold text-base leading-snug" dir="ltr">
          {draft.sentence || <span className="text-gray-300 italic">Enter a sentence...</span>}
        </p>
      </div>

      {/* MCQ options */}
      {draft.options.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
            <BookOpen size={11} /> الخيارات
          </p>
          {draft.options.map((opt, i) => {
            const isCorrect = i === draft.correctIndex
            let cls = 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer'
            if (picked !== null) {
              if (isCorrect) cls = 'bg-emerald-50 border-emerald-400 text-emerald-800'
              else if (picked === i) cls = 'bg-red-50 border-red-300 text-red-600'
              else cls = 'bg-white border-gray-100 text-gray-400'
            } else if (picked === null && isCorrect) {
              cls = 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }

            return (
              <button
                key={i}
                onClick={() => setPicked(i)}
                disabled={picked !== null}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2
                  text-sm font-semibold text-left transition-all duration-150
                  active:scale-[0.99] ${cls}
                `}
                dir="ltr"
              >
                <span className={`
                  w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-black
                  ${isCorrect ? 'bg-emerald-200 text-emerald-700' : 'bg-gray-100 text-gray-500'}
                `}>
                  {picked !== null && isCorrect
                    ? <CheckCircle2 size={14} className="text-emerald-600" />
                    : String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 leading-snug">{opt}</span>
                {isCorrect && picked === null && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-100 px-1.5 py-0.5 rounded-full">صحيح</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {draft.options.length > 0 && picked !== null && (
        <button
          onClick={() => setPicked(null)}
          className="w-full text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors py-1"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminContentPage() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [sentence, setSentence] = useState('')
  const [level,    setLevel]    = useState<Level>('A1')
  const [lesson,   setLesson]   = useState<Lesson>('Daily Life')
  const [videoUrl,  setVideoUrl]  = useState<string | null>(null)
  const [videoName, setVideoName] = useState<string | null>(null)

  // ── Generated options ───────────────────────────────────────────────────────
  const [options,       setOptions]       = useState<string[]>([])
  const [correctIndex,  setCorrectIndex]  = useState(0)

  // ── Drafts ──────────────────────────────────────────────────────────────────
  const [drafts,  setDrafts]  = useState<Draft[]>([])
  const [toast,   setToast]   = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [generating, setGenerating] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Live preview draft ───────────────────────────────────────────────────────
  const previewDraft: Draft = { sentence, level, lesson, options, correctIndex, videoUrl, videoName }

  // ── File handling ────────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) return
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    setVideoName(file.name)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  // ── Generate options ─────────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    const trimmed = sentence.trim()
    if (!trimmed) return

    setGenerating(true)
    // Small delay for perceived performance / animation
    setTimeout(() => {
      const [d1, d2] = generateDistractors(trimmed)
      const raw = [
        { text: trimmed, isCorrect: true },
        { text: d1,      isCorrect: false },
        { text: d2,      isCorrect: false },
      ]
      const shuffled = shuffle(raw)
      setOptions(shuffled.map(x => x.text))
      setCorrectIndex(shuffled.findIndex(x => x.isCorrect))
      setGenerating(false)
      setToast('Content generated ✨')
    }, 420)
  }, [sentence])

  // ── Save draft ───────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!sentence.trim() || options.length === 0) return
    setDrafts(prev => [previewDraft, ...prev])
    setToast('Draft saved!')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence, options, level, lesson, videoUrl, videoName, correctIndex])

  const canGenerate = sentence.trim().length >= 4
  const canSave     = canGenerate && options.length > 0

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out both; }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .btn-generate {
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1);
          background-size: 200%;
          transition: background-position 0.4s, transform 0.15s, box-shadow 0.15s;
        }
        .btn-generate:hover {
          background-position: right center;
          box-shadow: 0 8px 30px rgba(99,102,241,0.45);
          transform: translateY(-1px);
        }
        .btn-generate:active { transform: scale(0.97); }
      `}</style>

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="min-h-screen bg-gray-50">
        {/* ── Top bar ── */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Wand2 size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 font-black text-base leading-none">Content Studio</h1>
                <p className="text-gray-400 text-xs mt-0.5">إنشاء تمارين الاستماع</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">{drafts.length} مسودة</span>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all
                  ${canSave
                    ? 'bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.97]'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'}
                `}
              >
                <Save size={14} /> حفظ مسودة
              </button>
            </div>
          </div>
        </div>

        {/* ── Split layout ── */}
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col xl:flex-row gap-6 min-h-[calc(100vh-65px)]">

          {/* ══════════════════════════════════════════
              LEFT: Form Panel
          ══════════════════════════════════════════ */}
          <div className="w-full xl:w-[52%] shrink-0 flex flex-col gap-5">

            {/* ── Video upload ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <h2 className="text-gray-800 font-black text-sm flex items-center gap-2">
                  <Upload size={15} className="text-indigo-500" /> رفع الفيديو
                </h2>
              </div>

              {videoUrl ? (
                <div className="px-5 pb-5">
                  <div className="relative rounded-xl overflow-hidden bg-black shadow" style={{ aspectRatio: '16/9' }}>
                    <video src={videoUrl} controls className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setVideoUrl(null); setVideoName(null) }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 truncate">{videoName}</p>
                </div>
              ) : (
                <div
                  className={`
                    mx-5 mb-5 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
                    flex flex-col items-center justify-center gap-3 py-10
                    ${isDragging
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/40'}
                  `}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                    ${isDragging ? 'bg-indigo-100' : 'bg-gray-100'}
                  `}>
                    <Upload size={22} className={isDragging ? 'text-indigo-500' : 'text-gray-400'} />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm font-semibold">
                      {isDragging ? 'أفلت الفيديو هنا' : 'اسحب فيديو أو انقر للرفع'}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">MP4, WebM, MOV حتى 500MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              )}
            </div>

            {/* ── Sentence ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-gray-800 font-black text-sm flex items-center gap-2 mb-3">
                <Lightbulb size={15} className="text-amber-500" /> الجملة
              </h2>
              <textarea
                value={sentence}
                onChange={e => setSentence(e.target.value)}
                rows={3}
                placeholder="Enter sentence... e.g. I go to work every day"
                dir="ltr"
                className="
                  w-full resize-none rounded-xl border border-gray-200
                  bg-gray-50 px-4 py-3 text-gray-800 text-sm font-medium
                  placeholder:text-gray-300 focus:outline-none focus:ring-2
                  focus:ring-indigo-400 focus:border-transparent focus:bg-white
                  transition-all leading-relaxed
                "
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-300 text-xs">{sentence.trim().split(/\s+/).filter(Boolean).length} كلمات</p>
                {sentence.trim() && (
                  <button
                    onClick={() => { setSentence(''); setOptions([]) }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium"
                  >
                    مسح
                  </button>
                )}
              </div>
            </div>

            {/* ── Level ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-gray-800 font-black text-sm mb-3">المستوى</h2>
              <div className="flex gap-2">
                {LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`
                      flex-1 py-2.5 rounded-xl text-sm font-black transition-all duration-200 active:scale-[0.96]
                      ${level === l ? LEVEL_STYLE[l].active : LEVEL_STYLE[l].inactive}
                    `}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Lesson ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-gray-800 font-black text-sm mb-3">الدرس</h2>
              <div className="relative">
                <select
                  value={lesson}
                  onChange={e => setLesson(e.target.value as Lesson)}
                  className="
                    w-full appearance-none bg-gray-50 border border-gray-200
                    rounded-xl px-4 py-3 text-gray-800 text-sm font-semibold
                    focus:outline-none focus:ring-2 focus:ring-indigo-400
                    focus:border-transparent cursor-pointer transition-all
                  "
                >
                  {LESSONS.map(ls => (
                    <option key={ls} value={ls}>{ls}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* ── Generated options preview (editable) ── */}
            {options.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-gray-800 font-black text-sm flex items-center gap-2">
                    <Shuffle size={13} className="text-indigo-400" /> الخيارات المُنشأة
                  </h2>
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="text-xs text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-1 transition-colors"
                  >
                    <Shuffle size={11} /> إعادة توليد
                  </button>
                </div>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div
                      key={i}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold
                        ${i === correctIndex
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-gray-50 border-gray-200 text-gray-600'}
                      `}
                      dir="ltr"
                    >
                      <span className={`
                        w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-xs font-black
                        ${i === correctIndex ? 'bg-emerald-200 text-emerald-700' : 'bg-gray-200 text-gray-500'}
                      `}>
                        {i === correctIndex ? '✓' : String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {i === correctIndex && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-600 font-black px-2 py-0.5 rounded-full">صحيح</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Generate CTA ── */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || generating}
              className={`
                btn-generate w-full flex items-center justify-center gap-2.5
                py-4 rounded-2xl text-white font-black text-base
                disabled:opacity-40 disabled:cursor-not-allowed
                disabled:hover:transform-none disabled:hover:shadow-none
              `}
            >
              {generating
                ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> جاري التوليد...</>
                : <><Wand2 size={18} /> توليد الخيارات</>}
            </button>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT: Live Preview
          ══════════════════════════════════════════ */}
          <div className="flex-1 flex flex-col">
            {/* Sticky panel on desktop */}
            <div className="xl:sticky xl:top-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Preview header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-gray-400 text-xs font-semibold">معاينة مباشرة</span>
                  <div className="w-16" />
                </div>

                {/* Preview content */}
                <div className="p-5 min-h-[420px] flex flex-col">
                  <PreviewCard draft={previewDraft} />
                </div>
              </div>

              {/* Drafts counter */}
              {drafts.length > 0 && (
                <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4">
                  <p className="text-indigo-700 font-black text-sm mb-1">
                    {drafts.length} مسودة محفوظة
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {drafts.map((d, i) => (
                      <div key={i} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-indigo-100">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${LEVEL_STYLE[d.level].badge}`}>{d.level}</span>
                          <span className="text-gray-700 text-xs font-semibold truncate max-w-[180px]" dir="ltr">{d.sentence}</span>
                        </div>
                        <span className="text-gray-300 text-[10px] font-medium">{d.lesson}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
