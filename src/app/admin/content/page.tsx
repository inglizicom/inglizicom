'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Upload, Wand2, Save, CheckCircle2, Shuffle,
  Play, Lightbulb, BookOpen, ChevronDown, X, Sparkles,
  Globe, FileText, Trash2, Eye, EyeOff, PencilLine,
} from 'lucide-react'
import {
  getAllContent, saveContent, togglePublish, deleteContent,
  type ContentItem, type ContentLevel, type ContentLesson, type ContentStatus,
} from '@/lib/content-store'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Level  = ContentLevel
type Lesson = ContentLesson

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const LEVELS: Level[]   = ['A1', 'A2', 'B1', 'B2']
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
// OPTION GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

function generateDistractors(sentence: string): [string, string] {
  const words = sentence.trim().split(/\s+/)

  const strategies: Array<(ws: string[]) => string> = [
    (ws) => {
      const dropCandidates = ['to', 'the', 'a', 'an', 'is', 'are', 'do', 'does', 'have', 'has']
      const idx = ws.findIndex(w => dropCandidates.includes(w.toLowerCase()))
      if (idx !== -1) { const r = [...ws]; r.splice(idx, 1); return r.join(' ') }
      const r = [...ws]
      if (r.length >= 2) [r[r.length - 1], r[r.length - 2]] = [r[r.length - 2], r[r.length - 1]]
      return r.join(' ')
    },
    (ws) => {
      const verbIdx = ws.findIndex(w =>
        /^(go|do|have|work|come|play|make|take|get|say|know|think|see|look|want|give|use|find|tell|ask|feel|try|leave|call|keep|run|move|live|bring|write|stand|lose|pay|meet|speak|read|spend|grow|open|walk|buy|send|build|stay|fall|reach|remain|raise|pass|sell|decide|pull)$/i.test(w)
      )
      if (verbIdx !== -1) {
        const r = [...ws]; const v = r[verbIdx]
        r[verbIdx] = v.endsWith('s') ? v.slice(0, -1) : v + 's'; return r.join(' ')
      }
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
      return 'I think ' + ws.join(' ')
    },
    (ws) => {
      const PAST: Record<string, string> = {
        go: 'went', do: 'did', have: 'had', come: 'came', take: 'took',
        make: 'made', get: 'got', say: 'said', know: 'knew', see: 'saw',
        give: 'gave', find: 'found', tell: 'told', feel: 'felt', leave: 'left',
        buy: 'bought', run: 'ran', speak: 'spoke', write: 'wrote', read: 'read',
        bring: 'brought', think: 'thought', meet: 'met', fall: 'fell', keep: 'kept',
      }
      const r = [...ws]
      for (let j = 0; j < r.length; j++) {
        const lower = r[j].toLowerCase()
        if (PAST[lower]) { r[j] = PAST[lower]; return r.join(' ') }
        if (lower.endsWith('ed') && lower.length > 4) { r[j] = lower.slice(0, -2); return r.join(' ') }
      }
      if (words.length >= 2) { const r2 = [...ws]; r2.splice(1, 0, 'not'); return r2.join(' ') }
      return ws.join(' ') + '?'
    },
  ]

  const used = new Set<string>([sentence])
  const results: string[] = []
  const strats = [...strategies].sort(() => Math.random() - 0.5)
  for (const strat of strats) {
    if (results.length === 2) break
    const c = strat(words)
    if (c !== sentence && !used.has(c)) { used.add(c); results.push(c) }
  }
  while (results.length < 2) results.push(sentence + (results.length === 0 ? '?' : '!'))
  return [results[0], results[1]]
}

function shuffleArr<T>(arr: T[]): T[] {
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

interface ToastData { message: string; type: 'success' | 'error' | 'info' }

function Toast({ data, onDone }: { data: ToastData; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t) }, [onDone])
  const icon = data.type === 'error'
    ? <X size={15} className="text-red-400 shrink-0" />
    : <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl font-semibold text-sm animate-slideUp">
      {icon}
      {data.message}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ContentStatus }) {
  return status === 'published'
    ? (
      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
        <Globe size={9} /> منشور
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
        <FileText size={9} /> مسودة
      </span>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT LIST ROW
// ─────────────────────────────────────────────────────────────────────────────

function ContentRow({
  item, onEdit, onToggle, onDelete,
}: {
  item: ContentItem
  onEdit:   (item: ContentItem) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const m = LEVEL_STYLE[item.level]
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      {/* Level badge */}
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${m.badge}`}>
        {item.level}
      </span>

      {/* Sentence */}
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 text-sm font-semibold truncate" dir="ltr">{item.sentence}</p>
        <p className="text-gray-400 text-xs mt-0.5">{item.lesson} · {new Date(item.updatedAt).toLocaleDateString('ar-MA')}</p>
      </div>

      {/* Status */}
      <StatusBadge status={item.status} />

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(item)}
          title="تحرير"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
        >
          <PencilLine size={13} />
        </button>
        <button
          onClick={() => onToggle(item.id)}
          title={item.status === 'published' ? 'سحب من النشر' : 'نشر'}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            item.status === 'published'
              ? 'text-emerald-500 hover:text-amber-500 hover:bg-amber-50'
              : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          {item.status === 'published' ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
        <button
          onClick={() => onDelete(item.id)}
          title="حذف"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW CARD
// ─────────────────────────────────────────────────────────────────────────────

interface PreviewDraft {
  sentence: string; level: Level; lesson: Lesson
  options: string[]; correctIndex: number
  videoUrl: string | null
}

function PreviewCard({ draft }: { draft: PreviewDraft }) {
  const [picked, setPicked] = useState<number | null>(null)
  const m = LEVEL_STYLE[draft.level]
  useEffect(() => { setPicked(null) }, [draft.options, draft.sentence])

  if (!draft.sentence.trim() && draft.options.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <Sparkles size={28} className="text-indigo-300" />
        </div>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
          Fill in the form on the left and click{' '}
          <span className="font-bold text-indigo-500">Generate Options</span> to see a live preview
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-2">
      {/* Video / Audio preview */}
      {draft.videoUrl ? (
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg" style={{ aspectRatio: '16/9' }}>
          {/youtube\.com|youtu\.be/i.test(draft.videoUrl) ? (
            (() => {
              const m = draft.videoUrl!.match(/(?:[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/)
              return m ? (
                <iframe
                  src={`https://www.youtube.com/embed/${m[1]}?rel=0&controls=1&autoplay=0`}
                  className="w-full h-full border-0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen title="preview"
                />
              ) : <div className="flex items-center justify-center h-full text-white/40 text-xs p-4">رابط يوتيوب غير صحيح</div>
            })()
          ) : draft.videoUrl.startsWith('data:audio') ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
              <div className="text-3xl">🎧</div>
              <audio src={draft.videoUrl} controls className="w-full" />
            </div>
          ) : (
            <video src={draft.videoUrl} controls className="w-full h-full object-cover" />
          )}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 py-7">
          <Play size={22} className="text-gray-300" />
          <span className="text-gray-400 text-xs">Video preview</span>
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-2">
        <span className={`text-xs font-black px-2.5 py-1 rounded-full ${m.badge}`}>{draft.level}</span>
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

      {/* MCQ */}
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
            } else if (isCorrect) {
              cls = 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }
            return (
              <button
                key={i}
                onClick={() => setPicked(i)}
                disabled={picked !== null}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-sm font-semibold text-left transition-all duration-150 active:scale-[0.99] ${cls}`}
                dir="ltr"
              >
                <span className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-black ${isCorrect ? 'bg-emerald-200 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {picked !== null && isCorrect ? <CheckCircle2 size={13} className="text-emerald-600" /> : String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 leading-snug">{opt}</span>
                {isCorrect && picked === null && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-100 px-1.5 py-0.5 rounded-full">صحيح</span>
                )}
              </button>
            )
          })}
          {picked !== null && (
            <button onClick={() => setPicked(null)} className="w-full text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors py-1">
              إعادة المحاولة
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminContentPage() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [editingId,        setEditingId]        = useState<string | null>(null)
  const [sentence,         setSentence]         = useState('')
  const [arabicSentence,   setArabicSentence]   = useState('')
  const [level,            setLevel]            = useState<Level>('A1')
  const [lesson,           setLesson]           = useState<Lesson>('Daily Life')
  const [videoUrl,   setVideoUrl]   = useState<string | null>(null)
  const [videoName,  setVideoName]  = useState<string | null>(null)
  const [options,    setOptions]    = useState<string[]>([])
  const [correctIdx, setCorrectIdx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [generating, setGenerating] = useState(false)

  // ── CMS state ────────────────────────────────────────────────────────────────
  const [contents, setContents] = useState<ContentItem[]>([])
  const [toast,    setToast]    = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [tab,      setTab]      = useState<'editor' | 'list'>('editor')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load on mount
  useEffect(() => { setContents(getAllContent()) }, [])

  const refresh = () => setContents(getAllContent())

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') =>
    setToast({ message, type })

  const resetForm = () => {
    setEditingId(null); setSentence(''); setArabicSentence(''); setLevel('A1'); setLesson('Daily Life')
    setVideoUrl(null); setVideoName(null); setOptions([]); setCorrectIdx(0)
  }

  // ── File handling — converts to data URL so it persists after refresh ───────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setVideoUrl((e.target?.result as string) ?? null)
      setVideoName(file.name)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  // ── Generate options ──────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    const trimmed = sentence.trim()
    if (!trimmed) return
    setGenerating(true)
    setTimeout(() => {
      const [d1, d2] = generateDistractors(trimmed)
      const raw = shuffleArr([
        { text: trimmed, isCorrect: true },
        { text: d1,      isCorrect: false },
        { text: d2,      isCorrect: false },
      ])
      setOptions(raw.map(x => x.text))
      setCorrectIdx(raw.findIndex(x => x.isCorrect))
      setGenerating(false)
      showToast('Options generated ✨')
    }, 380)
  }, [sentence])

  // ── Load item into form for editing ──────────────────────────────────────
  const handleEdit = (item: ContentItem) => {
    setEditingId(item.id)
    setSentence(item.sentence)
    setArabicSentence(item.arabicSentence ?? '')
    setLevel(item.level)
    setLesson(item.lesson)
    setVideoUrl(item.videoUrl)
    setVideoName(item.videoName)
    setOptions([...item.options])
    setCorrectIdx(item.correctIndex)
    setTab('editor')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Save as draft ─────────────────────────────────────────────────────────
  const handleSaveDraft = useCallback(() => {
    if (!sentence.trim() || options.length < 3) return
    saveContent({
      sentence: sentence.trim(),
      arabicSentence: arabicSentence.trim() || undefined,
      options:  options as [string, string, string],
      correctIndex: correctIdx as 0 | 1 | 2,
      level, lesson, status: 'draft',
      videoUrl, videoName,
    }, editingId ?? undefined)
    refresh(); resetForm()
    showToast('Draft saved')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence, arabicSentence, options, correctIdx, level, lesson, videoUrl, videoName, editingId])

  // ── Publish directly ──────────────────────────────────────────────────────
  const handlePublish = useCallback(() => {
    if (!sentence.trim() || options.length < 3) return
    saveContent({
      sentence: sentence.trim(),
      arabicSentence: arabicSentence.trim() || undefined,
      options:  options as [string, string, string],
      correctIndex: correctIdx as 0 | 1 | 2,
      level, lesson, status: 'published',
      videoUrl, videoName,
    }, editingId ?? undefined)
    refresh(); resetForm()
    showToast('Published to website 🌐')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence, arabicSentence, options, correctIdx, level, lesson, videoUrl, videoName, editingId])

  // ── Toggle publish ────────────────────────────────────────────────────────
  const handleToggle = (id: string) => {
    const updated = togglePublish(id)
    refresh()
    showToast(updated?.status === 'published' ? 'Published 🌐' : 'Moved to drafts', 'info')
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    if (!confirm('Delete this content? This cannot be undone.')) return
    deleteContent(id); refresh()
    showToast('Deleted', 'error')
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const canGenerate = sentence.trim().length >= 4
  const canSave     = canGenerate && options.length === 3
  const published   = contents.filter(c => c.status === 'published').length
  const drafts      = contents.filter(c => c.status === 'draft').length
  const previewDraft: PreviewDraft = { sentence, level, lesson, options, correctIndex: correctIdx, videoUrl }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out both; }
        .btn-generate {
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1);
          background-size: 200%;
          transition: background-position 0.4s, transform 0.15s, box-shadow 0.15s;
        }
        .btn-generate:hover {
          background-position: right center;
          box-shadow: 0 8px 30px rgba(99,102,241,0.4);
          transform: translateY(-1px);
        }
        .btn-generate:active { transform: scale(0.97); }
      `}</style>

      {toast && <Toast data={toast} onDone={() => setToast(null)} />}

      <div className="min-h-screen bg-gray-50">

        {/* ── Sub-header ───────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Wand2 size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 font-black text-sm leading-none">Content Studio</h1>
                <p className="text-gray-400 text-xs mt-0.5">إنشاء وإدارة تمارين الاستماع</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                <Globe size={12} className="text-emerald-600" />
                <span className="text-emerald-700 text-xs font-black">{published} منشور</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5">
                <FileText size={12} className="text-gray-500" />
                <span className="text-gray-600 text-xs font-black">{drafts} مسودة</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setTab('editor')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'editor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                محرر
              </button>
              <button
                onClick={() => setTab('list')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                المحتوى ({contents.length})
              </button>
            </div>
          </div>
        </div>

        {/* ── Content List Tab ─────────────────────────────────────────────── */}
        {tab === 'list' && (
          <div className="max-w-4xl mx-auto px-6 py-6">
            {contents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-center px-8">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <FileText size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm font-semibold">لا يوجد محتوى بعد</p>
                <p className="text-gray-300 text-xs mt-1">أنشئ أول تمرين من تبويب المحرر</p>
                <button
                  onClick={() => setTab('editor')}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all"
                >
                  فتح المحرر
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <span className="text-gray-500 text-xs font-bold">{contents.length} عنصر</span>
                  <button
                    onClick={() => { resetForm(); setTab('editor') }}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    + إضافة جديد
                  </button>
                </div>
                {contents.map(item => (
                  <ContentRow
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Editor Tab ───────────────────────────────────────────────────── */}
        {tab === 'editor' && (
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col xl:flex-row gap-6">

            {/* ══════════════ LEFT: Form ══════════════ */}
            <div className="w-full xl:w-[52%] shrink-0 flex flex-col gap-5">

              {/* Editing banner */}
              {editingId && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                  <span className="text-amber-700 text-sm font-bold flex items-center gap-2">
                    <PencilLine size={14} /> تحرير محتوى موجود
                  </span>
                  <button onClick={resetForm} className="text-amber-500 hover:text-amber-700 text-xs font-bold transition-colors">
                    إلغاء
                  </button>
                </div>
              )}

              {/* Video / Audio upload */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-3">
                  <h2 className="text-gray-800 font-black text-sm flex items-center gap-2">
                    <Upload size={15} className="text-indigo-500" /> الوسائط (فيديو أو صوت)
                  </h2>
                </div>

                {videoUrl ? (
                  <div className="px-5 pb-5">
                    <div className="relative rounded-xl overflow-hidden bg-black shadow" style={{ aspectRatio: '16/9' }}>
                      {/* YouTube preview */}
                      {/youtube\.com|youtu\.be/i.test(videoUrl) ? (
                        (() => {
                          const m = videoUrl.match(/(?:[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/)
                          return m ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${m[1]}?rel=0&controls=1&autoplay=0`}
                              className="w-full h-full border-0"
                              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title="preview"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-white/40 text-xs">رابط يوتيوب غير صحيح</div>
                          )
                        })()
                      ) : videoUrl.startsWith('data:audio') ? (
                        /* Audio data URL preview */
                        <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
                          <div className="text-3xl">🎧</div>
                          <audio src={videoUrl} controls className="w-full" />
                        </div>
                      ) : (
                        /* Video (data URL or direct mp4) */
                        <video src={videoUrl} controls className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={() => { setVideoUrl(null); setVideoName(null) }}
                        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 truncate">{videoName ?? videoUrl}</p>
                  </div>
                ) : (
                  <>
                    {/* Drag & drop */}
                    <div
                      className={`mx-5 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 py-8 ${
                        isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/40'
                      }`}
                      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                        <Upload size={20} className={isDragging ? 'text-indigo-500' : 'text-gray-400'} />
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 text-sm font-semibold">{isDragging ? 'أفلت الملف هنا' : 'اسحب فيديو أو صوت أو انقر للرفع'}</p>
                        <p className="text-gray-400 text-xs mt-1">MP4 · MP3 · WebM · MOV · WAV</p>
                      </div>
                      <input ref={fileInputRef} type="file" accept="video/*,audio/*" className="hidden"
                        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                    </div>

                    {/* OR — URL input */}
                    <div className="mx-5 my-3 flex items-center gap-2">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-gray-300 text-xs font-bold">أو</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <div className="px-5 pb-5">
                      <label className="text-xs text-gray-500 font-bold mb-2 flex items-center gap-1.5">
                        <Globe size={12} /> رابط مباشر (YouTube أو mp4 أو mp3)
                      </label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=... أو https://cdn.example.com/clip.mp4"
                        dir="ltr"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all"
                        onBlur={e => {
                          const val = e.target.value.trim()
                          if (val) { setVideoUrl(val); setVideoName(null) }
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim()
                            if (val) { setVideoUrl(val); setVideoName(null) }
                          }
                        }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Sentence */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h2 className="text-gray-800 font-black text-sm flex items-center gap-2 mb-3">
                  <Lightbulb size={15} className="text-amber-500" /> الجملة الإنجليزية
                </h2>
                <textarea
                  value={sentence}
                  onChange={e => setSentence(e.target.value)}
                  rows={2}
                  placeholder="Enter sentence... e.g. I go to work every day"
                  dir="ltr"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 text-sm font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all leading-relaxed"
                />
                <div className="flex items-center justify-between mt-2 mb-4">
                  <p className="text-gray-300 text-xs">{sentence.trim().split(/\s+/).filter(Boolean).length} كلمات</p>
                  {sentence.trim() && (
                    <button onClick={() => { setSentence(''); setOptions([]) }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium">
                      مسح
                    </button>
                  )}
                </div>

                {/* Arabic translation — for color chunk pairing */}
                <div className="border-t border-gray-100 pt-4">
                  <label className="text-xs text-gray-500 font-bold mb-2 flex items-center gap-1.5">
                    <span className="text-base">🇸🇦</span> الترجمة العربية
                    <span className="text-gray-300 font-normal">(اختياري — لربط الشرائح اللونية)</span>
                  </label>
                  <textarea
                    value={arabicSentence}
                    onChange={e => setArabicSentence(e.target.value)}
                    rows={2}
                    placeholder="مثال: أذهب إلى العمل كل يوم"
                    dir="rtl"
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 text-sm font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white transition-all leading-relaxed"
                  />
                  {arabicSentence.trim() && (
                    <p className="text-amber-500/70 text-xs mt-1.5 font-medium">
                      ✓ سيتم عرض الترجمة جانب الشرائح الإنجليزية في صفحة الاستماع
                    </p>
                  )}
                </div>
              </div>

              {/* Level */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h2 className="text-gray-800 font-black text-sm mb-3">المستوى</h2>
                <div className="flex gap-2">
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setLevel(l)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all duration-200 active:scale-[0.96] ${level === l ? LEVEL_STYLE[l].active : LEVEL_STYLE[l].inactive}`}
                    >{l}</button>
                  ))}
                </div>
              </div>

              {/* Lesson */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h2 className="text-gray-800 font-black text-sm mb-3">الدرس</h2>
                <div className="relative">
                  <select value={lesson} onChange={e => setLesson(e.target.value as Lesson)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent cursor-pointer transition-all"
                  >
                    {LESSONS.map(ls => <option key={ls} value={ls}>{ls}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Generated options */}
              {options.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-gray-800 font-black text-sm flex items-center gap-2">
                      <Shuffle size={13} className="text-indigo-400" /> الخيارات المُنشأة
                    </h2>
                    <button onClick={handleGenerate} disabled={!canGenerate}
                      className="text-xs text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-1 transition-colors disabled:opacity-40">
                      <Shuffle size={11} /> إعادة توليد
                    </button>
                  </div>
                  <div className="space-y-2">
                    {options.map((opt, i) => (
                      <div key={i} dir="ltr"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold ${i === correctIdx ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                      >
                        <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-xs font-black ${i === correctIdx ? 'bg-emerald-200 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                          {i === correctIdx ? '✓' : String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {i === correctIdx && <span className="text-[10px] bg-emerald-100 text-emerald-600 font-black px-2 py-0.5 rounded-full">صحيح</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate CTA */}
              <button onClick={handleGenerate} disabled={!canGenerate || generating}
                className="btn-generate w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-black text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
              >
                {generating
                  ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> جاري التوليد...</>
                  : <><Wand2 size={18} /> توليد الخيارات</>}
              </button>

              {/* Save / Publish buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={!canSave}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm border-2 transition-all active:scale-[0.97] ${
                    canSave
                      ? 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                      : 'border-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Save size={15} />
                  {editingId ? 'تحديث المسودة' : 'حفظ مسودة'}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={!canSave}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-[0.97] ${
                    canSave
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Globe size={15} />
                  {editingId ? 'تحديث ونشر' : 'نشر على الموقع'}
                </button>
              </div>
            </div>

            {/* ══════════════ RIGHT: Preview ══════════════ */}
            <div className="flex-1 flex flex-col">
              <div className="xl:sticky xl:top-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-gray-400 text-xs font-semibold">معاينة مباشرة</span>
                    <div className="w-16" />
                  </div>
                  <div className="p-5 min-h-[420px] flex flex-col">
                    <PreviewCard draft={previewDraft} />
                  </div>
                </div>

                {/* Recent items quick list */}
                {contents.length > 0 && (
                  <div className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-gray-500 text-xs font-bold">آخر المحتوى</span>
                      <button onClick={() => setTab('list')} className="text-xs text-indigo-500 hover:text-indigo-700 font-bold transition-colors">
                        عرض الكل
                      </button>
                    </div>
                    {contents.slice(0, 4).map(item => (
                      <ContentRow key={item.id} item={item} onEdit={handleEdit} onToggle={handleToggle} onDelete={handleDelete} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
