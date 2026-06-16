'use client'

import { useEffect, useState } from 'react'
import { useRef } from 'react'
import {
  BookOpen, Plus, Trash2, Loader2, ChevronDown, ChevronLeft, X, Lock, Unlock,
  Video, FileText, PenLine, HelpCircle, Mic, Layers, GripVertical, ChevronUp,
  Pencil, Check, Sparkles, Wand2, CheckCircle2, Upload, Download, Paperclip, Clock,
} from 'lucide-react'
import { useStaff } from '@/lib/staff-context'
import {
  fetchCourses, createCourse, deleteCourse, setCourseDaysPerUnit,
  fetchModules, addModule, updateModule, deleteModule, reorderModules,
  fetchLessons, addLesson, updateLesson, deleteLesson, toggleLessonLock, reorderLessons,
  generateQuiz, updateModuleReading, updateModuleExam,
  fetchCourseResources, uploadCourseResource, deleteCourseResource, resourceUrl,
  LESSON_TYPES, type LmsCourse, type LmsModule, type LmsLesson, type LessonQuiz, type CourseResource,
} from '@/lib/lms'
import QuizEditor from '@/components/QuizEditor'

const fmtSize = (b?: number | null) => !b ? '' : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`

const INP = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400'
const TYPE_ICON: Record<string, any> = { video: Video, reading: FileText, exercise: PenLine, quiz: HelpCircle, speaking: Mic }

export default function CoursesPage() {
  const staff = useStaff()
  const [courses, setCourses] = useState<LmsCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [openCourse, setOpenCourse] = useState<string | null>(null)

  const [showNew, setShowNew] = useState(false)
  const [cTitle, setCTitle] = useState(''); const [cLevel, setCLevel] = useState(''); const [cDesc, setCDesc] = useState('')
  const [creating, setCreating] = useState(false)

  async function load() { setLoading(true); setCourses(await fetchCourses()); setLoading(false) }
  useEffect(() => { load() }, [])

  async function createC() {
    if (!cTitle.trim()) return
    setCreating(true)
    const id = await createCourse({ title: cTitle.trim(), level: cLevel || undefined, description: cDesc || undefined, createdBy: staff.id })
    setCTitle(''); setCLevel(''); setCDesc(''); setShowNew(false); setCreating(false)
    await load(); if (id) setOpenCourse(id)
  }
  async function removeCourse(id: string) {
    if (!confirm('حذف الدورة وكل وحداتها ودروسها نهائيًا؟')) return
    await deleteCourse(id); setOpenCourse(null); await load()
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><BookOpen size={20} className="text-blue-600" /></div>
          <div>
            <h2 className="text-[17px] font-black text-zinc-900">الدورات</h2>
            <p className="text-[12px] text-zinc-400">صمّم المحتوى مرّة واحدة — كل طالب مسجَّل يراه تلقائيًا</p>
          </div>
        </div>
        <button onClick={() => setShowNew(v => !v)} className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 bg-yellow-400 text-black rounded-xl hover:bg-yellow-300"><Plus size={14} /> دورة جديدة</button>
      </div>

      {showNew && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input value={cTitle} onChange={e => setCTitle(e.target.value)} placeholder="اسم الدورة * (مثال: A0/A1 — المبتدئون)" className={INP + ' sm:col-span-2'} />
            <input value={cLevel} onChange={e => setCLevel(e.target.value)} placeholder="المستوى (A0)" dir="ltr" className={INP + ' text-right'} />
          </div>
          <input value={cDesc} onChange={e => setCDesc(e.target.value)} placeholder="وصف (اختياري)" className={INP} />
          <div className="flex gap-2">
            <button onClick={createC} disabled={creating || !cTitle.trim()} className="flex-1 py-2 bg-black text-white rounded-lg font-bold text-[13px] disabled:opacity-50">{creating ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'إنشاء الدورة'}</button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 border border-zinc-200 rounded-lg text-[13px] text-zinc-500">إلغاء</button>
          </div>
        </div>
      )}

      {loading ? <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={26} /></div>
        : courses.length === 0 ? <div className="text-center py-16 text-zinc-400"><div className="text-4xl mb-2">📚</div><div className="text-[14px]">لا توجد دورات بعد — أنشئ أول دورة</div></div>
        : courses.map(c => (
          <div key={c.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
            <button onClick={() => setOpenCourse(o => o === c.id ? null : c.id)} className="w-full flex items-center gap-3 p-4 text-right hover:bg-zinc-50">
              {openCourse === c.id ? <ChevronDown size={16} className="text-zinc-400" /> : <ChevronLeft size={16} className="text-zinc-400" />}
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><BookOpen size={16} className="text-blue-500" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] text-zinc-900">{c.title}{c.level && <span className="mr-2 text-[11px] font-bold bg-zinc-100 text-zinc-600 px-1.5 rounded">{c.level}</span>}</div>
                {c.description && <div className="text-[12px] text-zinc-400 truncate">{c.description}</div>}
              </div>
              <button onClick={e => { e.stopPropagation(); removeCourse(c.id) }} className="text-zinc-300 hover:text-red-500"><Trash2 size={15} /></button>
            </button>
            {openCourse === c.id && <CourseBuilder courseId={c.id} initialDays={c.days_per_unit ?? 7} />}
          </div>
        ))}
    </div>
  )
}

/* ── Modules + lessons builder ─────────────────────────── */
function CourseBuilder({ courseId, initialDays }: { courseId: string; initialDays: number }) {
  const [modules, setModules] = useState<LmsModule[]>([])
  const [loading, setLoading] = useState(true)
  const [newMod, setNewMod] = useState('')
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const [days, setDays] = useState(initialDays)

  async function load() { setLoading(true); setModules(await fetchModules(courseId)); setLoading(false) }
  useEffect(() => { load() }, [courseId])

  async function add() {
    if (!newMod.trim()) return
    await addModule(courseId, newMod.trim(), modules.length + 1); setNewMod(''); load()
  }
  async function rm(id: string) { if (confirm('حذف الوحدة ودروسها؟')) { await deleteModule(id); load() } }
  async function rename(id: string, title: string) {
    setModules(ms => ms.map(m => m.id === id ? { ...m, title } : m))
    await updateModule(id, title)
  }

  /* reorder — shared by drag-drop and the up/down buttons */
  async function applyOrder(next: LmsModule[]) {
    setModules(next)
    await reorderModules(next.map(m => m.id))
  }
  function move(from: number, to: number) {
    if (to < 0 || to >= modules.length) return
    const next = [...modules]
    const [it] = next.splice(from, 1); next.splice(to, 0, it)
    applyOrder(next)
  }
  function onDrop(to: number) {
    if (dragIdx === null || dragIdx === to) { setDragIdx(null); setOverIdx(null); return }
    move(dragIdx, to); setDragIdx(null); setOverIdx(null)
  }

  if (loading) return <div className="p-4 flex justify-center border-t border-zinc-50"><Loader2 className="animate-spin text-zinc-300" size={20} /></div>

  const totalDays = days * Math.max(1, modules.length)

  return (
    <div className="border-t border-zinc-50 p-4 space-y-3 bg-zinc-50/40">
      {/* Schedule: fixed days per unit → drives student deadlines */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 flex flex-wrap items-center gap-2">
        <Clock size={14} className="text-blue-600" />
        <span className="text-[12px] font-bold text-blue-800">مدة كل وحدة:</span>
        <input type="number" min={1} value={days}
          onChange={e => setDays(Math.max(1, Number(e.target.value) || 1))}
          onBlur={() => setCourseDaysPerUnit(courseId, days)}
          className="w-16 border border-blue-200 rounded-lg px-2 py-1 text-[13px] text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-300" />
        <span className="text-[12px] text-blue-700">يوم</span>
        <span className="text-[11px] text-zinc-500 mr-auto">المدة الكلية ≈ <b>{totalDays} يوم</b> ({modules.length} وحدة) — يحدّد مواعيد الطلاب تلقائيًا من تاريخ التسجيل.</span>
      </div>
      {modules.length > 1 && <div className="text-[11px] text-zinc-400 flex items-center gap-1"><GripVertical size={12} /> اسحب الوحدة لإعادة ترتيبها، أو استخدم الأسهم</div>}
      {modules.map((m, i) => (
        <div
          key={m.id}
          draggable
          onDragStart={() => setDragIdx(i)}
          onDragOver={e => { e.preventDefault(); if (overIdx !== i) setOverIdx(i) }}
          onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
          onDrop={() => onDrop(i)}
          className={`transition-all ${dragIdx === i ? 'opacity-40' : ''} ${overIdx === i && dragIdx !== null && dragIdx !== i ? 'ring-2 ring-yellow-400 rounded-xl' : ''}`}
        >
          <ModuleBlock
            module={m} index={i} total={modules.length}
            onDelete={() => rm(m.id)}
            onRename={t => rename(m.id, t)}
            onMoveUp={() => move(i, i - 1)}
            onMoveDown={() => move(i, i + 1)}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <input value={newMod} onChange={e => setNewMod(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="إضافة وحدة جديدة (مثال: الوحدة 1 — التحية)" className={INP} />
        <button onClick={add} disabled={!newMod.trim()} className="flex items-center gap-1 text-[13px] font-bold px-3 py-2 rounded-lg bg-zinc-900 text-white disabled:opacity-50"><Layers size={13} /> وحدة</button>
      </div>

      <CourseResources courseId={courseId} />
    </div>
  )
}

/* Shared course files — every enrolled student can download these (e.g. the A0/A1 PDF book). */
function CourseResources({ courseId }: { courseId: string }) {
  const staff = useStaff()
  const [items, setItems] = useState<CourseResource[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() { setLoading(true); setItems(await fetchCourseResources(courseId)); setLoading(false) }
  useEffect(() => { load() }, [courseId])

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setBusy(true)
    const ok = await uploadCourseResource(courseId, f, staff.id)
    setBusy(false); if (fileRef.current) fileRef.current.value = ''
    if (!ok) { alert('تعذّر رفع الملف'); return }
    load()
  }
  async function rm(r: CourseResource) { if (confirm('حذف هذا الملف للجميع؟')) { await deleteCourseResource(r.id, r.file_path); load() } }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Paperclip size={14} className="text-emerald-600" />
        <span className="flex-1 text-[12px] font-bold text-emerald-800">ملفات الدورة — متاحة لكل الطلاب المسجَّلين</span>
      </div>
      {loading ? <div className="py-2 flex justify-center"><Loader2 size={16} className="animate-spin text-emerald-400" /></div>
        : items.length === 0 ? <div className="text-[11px] text-zinc-400">لا ملفات بعد — ارفع كتاب PDF أو مرجعًا ليصل كل الطلاب.</div>
        : items.map(r => (
          <div key={r.id} className="flex items-center gap-2 bg-white rounded-lg border border-zinc-100 p-2">
            <FileText size={15} className="text-rose-500 flex-shrink-0" />
            <div className="flex-1 min-w-0"><div className="text-[12px] font-semibold text-zinc-800 truncate">{r.title}</div><div className="text-[10px] text-zinc-400">{(r.file_type || '').toUpperCase()} {fmtSize(r.size_bytes)}</div></div>
            <a href={resourceUrl(r.file_path)} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-blue-600" title="تحميل"><Download size={14} /></a>
            <button onClick={() => rm(r)} className="text-zinc-300 hover:text-red-500"><Trash2 size={13} /></button>
          </div>
        ))}
      <input ref={fileRef} type="file" onChange={onPick} className="hidden" />
      <button onClick={() => fileRef.current?.click()} disabled={busy} className="w-full py-2 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[12px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50">
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} رفع ملف للدورة (PDF...)
      </button>
    </div>
  )
}

function ModuleBlock({ module, index, total, onDelete, onRename, onMoveUp, onMoveDown }: {
  module: LmsModule; index: number; total: number
  onDelete: () => void; onRename: (t: string) => void; onMoveUp: () => void; onMoveDown: () => void
}) {
  const [lessons, setLessons] = useState<LmsLesson[]>([])
  const [open, setOpen] = useState(false)
  const [editTitle, setEditTitle] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editLesson, setEditLesson] = useState<LmsLesson | null>(null)

  async function load() { setLessons(await fetchLessons(module.id)) }
  useEffect(() => { if (open) load() }, [open])

  async function rmLesson(id: string) { await deleteLesson(id); load() }
  async function lock(l: LmsLesson) { await toggleLessonLock(l.id, !l.is_locked); load() }
  async function moveLesson(from: number, to: number) {
    if (to < 0 || to >= lessons.length) return
    const next = [...lessons]
    const [it] = next.splice(from, 1); next.splice(to, 0, it)
    setLessons(next); await reorderLessons(next.map(l => l.id))
  }

  function saveTitle() { const t = (editTitle ?? '').trim(); if (t && t !== module.title) onRename(t); setEditTitle(null) }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl">
      <div className="flex items-center gap-2 p-3">
        <span className="text-zinc-300 cursor-grab active:cursor-grabbing flex-shrink-0" title="اسحب لإعادة الترتيب"><GripVertical size={15} /></span>
        <span className="w-6 h-6 rounded bg-zinc-100 text-zinc-500 text-[11px] font-black flex items-center justify-center flex-shrink-0">{index + 1}</span>
        {editTitle !== null ? (
          <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditTitle(null) }}
            className="flex-1 border border-yellow-300 rounded px-2 py-1 text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400" />
        ) : (
          <button onClick={() => setOpen(o => !o)} className="flex-1 text-right font-bold text-[13px] text-zinc-800 truncate">{module.title}</button>
        )}
        {/* reorder arrows */}
        <div className="flex flex-col -my-1">
          <button onClick={onMoveUp} disabled={index === 0} className="text-zinc-300 hover:text-zinc-700 disabled:opacity-30" title="أعلى"><ChevronUp size={13} /></button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="text-zinc-300 hover:text-zinc-700 disabled:opacity-30" title="أسفل"><ChevronDown size={13} /></button>
        </div>
        {editTitle !== null ? (
          <button onClick={saveTitle} className="text-emerald-500 hover:text-emerald-700" title="حفظ"><Check size={15} /></button>
        ) : (
          <button onClick={() => setEditTitle(module.title)} className="text-zinc-300 hover:text-zinc-700" title="تعديل الاسم"><Pencil size={13} /></button>
        )}
        <button onClick={() => setOpen(o => !o)} className="text-[11px] text-zinc-400 flex-shrink-0">{open ? 'إغلاق' : 'الدروس'}</button>
        <button onClick={onDelete} className="text-zinc-300 hover:text-red-500 flex-shrink-0"><Trash2 size={14} /></button>
      </div>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-zinc-50 pt-2">
          {lessons.map((l, i) => {
            const Icon = TYPE_ICON[l.lesson_type] ?? Video
            const isEditing = editLesson?.id === l.id
            if (isEditing) return (
              <LessonForm key={l.id} moduleId={module.id} lesson={l}
                onCancel={() => setEditLesson(null)}
                onSaved={() => { setEditLesson(null); load() }} />
            )
            return (
              <div key={l.id} className="flex items-center gap-2.5 border border-zinc-100 rounded-lg p-2">
                <div className="flex flex-col -my-1">
                  <button onClick={() => moveLesson(i, i - 1)} disabled={i === 0} className="text-zinc-300 hover:text-zinc-700 disabled:opacity-30"><ChevronUp size={12} /></button>
                  <button onClick={() => moveLesson(i, i + 1)} disabled={i === lessons.length - 1} className="text-zinc-300 hover:text-zinc-700 disabled:opacity-30"><ChevronDown size={12} /></button>
                </div>
                <span className="text-[10px] text-zinc-400 w-4">{i + 1}</span>
                <Icon size={14} className="text-zinc-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-800 truncate">{l.title}</div>
                  <div className="text-[10px] text-zinc-400 flex gap-1.5">
                    {LESSON_TYPES.find(t => t.id === l.lesson_type)?.label}
                    {l.video_url && <span>· فيديو</span>}{l.file_url && <span>· ملف</span>}{l.exercise_url && <span>· تمرين</span>}{l.has_quiz && <span>· اختبار</span>}
                  </div>
                </div>
                <button onClick={() => { setShowForm(false); setEditLesson(l) }} className="text-zinc-300 hover:text-blue-600" title="تعديل"><Pencil size={13} /></button>
                <button onClick={() => lock(l)} className={l.is_locked ? 'text-amber-500' : 'text-zinc-300'} title={l.is_locked ? 'مقفل' : 'مفتوح'}>{l.is_locked ? <Lock size={14} /> : <Unlock size={14} />}</button>
                <button onClick={() => rmLesson(l.id)} className="text-zinc-300 hover:text-red-500"><X size={14} /></button>
              </div>
            )
          })}

          {showForm ? (
            <LessonForm moduleId={module.id} nextOrder={lessons.length + 1}
              onCancel={() => setShowForm(false)}
              onSaved={() => { setShowForm(false); load() }} />
          ) : (
            <button onClick={() => { setEditLesson(null); setShowForm(true) }} className="w-full py-2 rounded-lg border-2 border-dashed border-zinc-200 text-zinc-500 hover:border-yellow-400 hover:text-yellow-600 text-[12px] font-semibold flex items-center justify-center gap-1.5"><Plus size={13} /> إضافة درس</button>
          )}
          <p className="text-[10px] text-zinc-400 text-center">استخدم الأسهم ↑↓ لنقل الدرس بين المواضع</p>

          <ReadingEditor module={module} />
          <ExamEditor module={module} />
        </div>
      )}
    </div>
  )
}

/* Per-unit TEST: team-authored auto-graded quiz. Student must pass it (≥60%)
   AND get the conversation reviewed before the next unit unlocks. */
function ExamEditor({ module }: { module: LmsModule }) {
  const [open, setOpen] = useState(false)
  const [quiz, setQuiz] = useState<LessonQuiz | null>(module.exam_quiz ?? null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const count = quiz?.questions?.length ?? 0
  async function save() {
    setSaving(true)
    await updateModuleExam(module.id, count > 0 ? quiz : null)
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 1500)
  }
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2 px-3 py-2 text-right">
        <HelpCircle size={14} className="text-amber-600" />
        <span className="flex-1 text-[12px] font-bold text-amber-800">اختبار الوحدة (إجباري للانتقال)</span>
        {count > 0 && <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12} /> {count} سؤال</span>}
        <ChevronDown size={14} className={`text-amber-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          <QuizEditor value={quiz} onChange={setQuiz} />
          <button onClick={save} disabled={saving} className="w-full py-2 rounded-lg bg-amber-600 text-white font-bold text-[12px] flex items-center justify-center gap-1.5 disabled:opacity-50">
            {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <><Check size={13} /> تم الحفظ</> : 'حفظ اختبار الوحدة'}
          </button>
        </div>
      )}
    </div>
  )
}

/* Per-unit reading passage: text + course-voice audio + how-to-read video + comprehension quiz. */
function ReadingEditor({ module }: { module: LmsModule }) {
  const [open, setOpen]   = useState(false)
  const [text, setText]   = useState(module.reading_text ?? '')
  const [audio, setAudio] = useState(module.reading_audio_url ?? '')
  const [video, setVideo] = useState(module.reading_video_url ?? '')
  const [quiz, setQuiz]   = useState<LessonQuiz | null>(module.reading_quiz ?? null)
  const [saving, setSaving] = useState(false)
  const [genning, setGenning] = useState(false)
  const [saved, setSaved] = useState(false)

  async function gen() {
    if (!text.trim()) return
    setGenning(true)
    const out = await generateQuiz({ title: `${module.title} — reading comprehension`, source: text })
    setGenning(false)
    if (out && out.questions.length) setQuiz(out)
  }
  async function save() {
    setSaving(true)
    await updateModuleReading(module.id, { text, audioUrl: audio, videoUrl: video, quiz })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 1500)
  }
  const has = !!(module.reading_text || module.reading_audio_url || module.reading_video_url)

  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50/60 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2 px-3 py-2 text-right">
        <BookOpen size={14} className="text-sky-600" />
        <span className="flex-1 text-[12px] font-bold text-sky-800">القراءة والاستماع (نص الوحدة)</span>
        {(has || quiz) && <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12} /> مُضاف</span>}
        <ChevronDown size={14} className={`text-sky-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          <textarea value={text} onChange={e => setText(e.target.value)} rows={5} dir="ltr" placeholder="نص القراءة بالإنجليزية (Reading passage)..." className={INP + ' text-left resize-y leading-relaxed'} />
          <input value={audio} onChange={e => setAudio(e.target.value)} dir="ltr" placeholder="رابط الصوت بصوت الأستاذ (mp3...)" className={INP + ' text-right'} />
          <input value={video} onChange={e => setVideo(e.target.value)} dir="ltr" placeholder="رابط فيديو: كيف تقرأ النص (يوتيوب)" className={INP + ' text-right'} />
          <div className="flex items-center gap-2">
            <button onClick={gen} disabled={genning || !text.trim()} className="flex-1 py-2 rounded-lg bg-violet-100 text-violet-700 font-bold text-[12px] flex items-center justify-center gap-1.5 disabled:opacity-50">
              {genning ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />} {quiz?.questions?.length ? `إعادة توليد الأسئلة (${quiz.questions.length})` : 'توليد أسئلة الفهم'}
            </button>
            <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-lg bg-sky-600 text-white font-bold text-[12px] flex items-center justify-center gap-1.5 disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <><Check size={13} /> تم الحفظ</> : 'حفظ القراءة'}
            </button>
          </div>
          {!!quiz?.questions?.length && <div className="text-[11px] text-zinc-500">✅ {quiz.questions.length} أسئلة فهم جاهزة — تظهر للطالب بعد القراءة.</div>}
        </div>
      )}
    </div>
  )
}

/* Shared add/edit lesson form. Pass `lesson` to edit, or `nextOrder` to add. */
function LessonForm({ moduleId, lesson, nextOrder, onSaved, onCancel }: {
  moduleId: string; lesson?: LmsLesson; nextOrder?: number; onSaved: () => void; onCancel: () => void
}) {
  const [title, setTitle] = useState(lesson?.title ?? '')
  const [type, setType]   = useState(lesson?.lesson_type ?? 'video')
  const [video, setVideo] = useState(lesson?.video_url ?? '')
  const [file, setFile]   = useState(lesson?.file_url ?? '')
  const [ex, setEx]       = useState(lesson?.exercise_url ?? '')
  const [quiz, setQuiz]   = useState(lesson?.has_quiz ?? false)
  const [lock, setLock]   = useState(lesson?.is_locked ?? false)
  const [saving, setSaving] = useState(false)
  // AI quiz
  const [aiOpen, setAiOpen]   = useState(false)
  const [source, setSource]   = useState('')
  const [genQuiz, setGenQuiz] = useState<LessonQuiz | null>(lesson?.quiz ?? null)
  const [genning, setGenning] = useState(false)
  const [genErr, setGenErr]   = useState('')

  async function generate() {
    if (!title.trim()) { setGenErr('أدخل عنوان الدرس أولًا'); return }
    setGenning(true); setGenErr('')
    const out = await generateQuiz({ title: title.trim(), source })
    setGenning(false)
    if (!out || out.questions.length === 0) { setGenErr('تعذّر التوليد، حاول مرة أخرى'); return }
    setGenQuiz(out); setQuiz(true)
  }

  async function save() {
    if (!title.trim()) return
    setSaving(true)
    const hasRealQuiz = !!(genQuiz && genQuiz.questions.length)   // has_quiz is truthful
    const common = { lessonType: type, videoUrl: video, fileUrl: file, exerciseUrl: ex, hasQuiz: hasRealQuiz, isLocked: lock, quiz: hasRealQuiz ? genQuiz : null }
    if (lesson) {
      await updateLesson(lesson.id, { title: title.trim(), ...common })
    } else {
      await addLesson({ moduleId, title: title.trim(), order: nextOrder ?? 1, lessonType: type, videoUrl: video || undefined, fileUrl: file || undefined, exerciseUrl: ex || undefined, hasQuiz: hasRealQuiz, isLocked: lock, quiz: hasRealQuiz ? genQuiz : null })
    }
    setSaving(false); onSaved()
  }

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 space-y-2">
      <div className="text-[11px] font-bold text-zinc-500">{lesson ? '✎ تعديل الدرس' : '＋ درس جديد'}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان الدرس *" className={INP} />
        <select value={type} onChange={e => setType(e.target.value)} className={INP}>{LESSON_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
      </div>
      <input value={video} onChange={e => setVideo(e.target.value)} placeholder="رابط الفيديو (يوتيوب...)" dir="ltr" className={INP + ' text-right'} />
      <input value={file} onChange={e => setFile(e.target.value)} placeholder="رابط ملف / PDF" dir="ltr" className={INP + ' text-right'} />
      <input value={ex} onChange={e => setEx(e.target.value)} placeholder="رابط تمرين على Inglizi.com" dir="ltr" className={INP + ' text-right'} />
      <div className="flex items-center gap-4 text-[12px] text-zinc-600">
        <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={lock} onChange={e => setLock(e.target.checked)} className="accent-yellow-400" /> مقفل</label>
        <span className="text-[11px] text-zinc-400">الاختبار يُضاف من القسم بالأسفل ⤵ (إجباري لإنهاء الدرس)</span>
      </div>

      {/* AI quiz generator */}
      <div className="rounded-lg border border-violet-200 bg-violet-50/60 overflow-hidden">
        <button onClick={() => setAiOpen(o => !o)} className="w-full flex items-center gap-2 px-3 py-2 text-right">
          <Sparkles size={14} className="text-violet-600" />
          <span className="flex-1 text-[12px] font-bold text-violet-800">توليد اختبار + تمرين بالذكاء الاصطناعي</span>
          {genQuiz && <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12} /> {genQuiz.questions.length} سؤال</span>}
          <ChevronDown size={14} className={`text-violet-400 transition-transform ${aiOpen ? 'rotate-180' : ''}`} />
        </button>
        {aiOpen && (
          <div className="px-3 pb-3 space-y-2">
            <textarea value={source} onChange={e => setSource(e.target.value)} rows={4}
              placeholder="الصق هنا محتوى الدرس / المقطع من ملف A0–A1 (اختياري). كلما كان المصدر أدق، كان الاختبار أدق. إن تركته فارغًا سيُولّد من عنوان الدرس."
              className={INP + ' resize-y leading-relaxed'} />
            <button onClick={generate} disabled={genning || !title.trim()} className="w-full py-2 rounded-lg bg-violet-600 text-white font-bold text-[12px] flex items-center justify-center gap-1.5 disabled:opacity-50">
              {genning ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />} {genQuiz ? 'إعادة التوليد' : 'توليد بالذكاء الاصطناعي'}
            </button>
            {genErr && <div className="text-[11px] text-red-500 text-center">{genErr}</div>}
            {/* manual editor — write the lesson test, or edit the AI draft */}
            <div className="bg-white rounded-lg border border-zinc-200 p-2.5">
              <QuizEditor value={genQuiz} onChange={q => { setGenQuiz(q); setQuiz(!!(q && q.questions.length)) }} />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={save} disabled={saving || !title.trim()} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold text-[12px] disabled:opacity-50">{saving ? <Loader2 size={13} className="animate-spin mx-auto" /> : (lesson ? 'حفظ التعديلات' : 'حفظ الدرس')}</button>
        <button onClick={onCancel} className="px-3 py-2 border border-zinc-200 rounded-lg text-[12px] text-zinc-500">إلغاء</button>
      </div>
    </div>
  )
}
