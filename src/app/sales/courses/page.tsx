'use client'

import { useEffect, useState } from 'react'
import {
  BookOpen, Plus, Trash2, Loader2, ChevronDown, ChevronLeft, X, Lock, Unlock,
  Video, FileText, PenLine, HelpCircle, Mic, Layers,
} from 'lucide-react'
import { useStaff } from '@/lib/staff-context'
import {
  fetchCourses, createCourse, deleteCourse,
  fetchModules, addModule, deleteModule,
  fetchLessons, addLesson, deleteLesson, toggleLessonLock,
  LESSON_TYPES, type LmsCourse, type LmsModule, type LmsLesson,
} from '@/lib/lms'

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
            {openCourse === c.id && <CourseBuilder courseId={c.id} />}
          </div>
        ))}
    </div>
  )
}

/* ── Modules + lessons builder ─────────────────────────── */
function CourseBuilder({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<LmsModule[]>([])
  const [loading, setLoading] = useState(true)
  const [newMod, setNewMod] = useState('')

  async function load() { setLoading(true); setModules(await fetchModules(courseId)); setLoading(false) }
  useEffect(() => { load() }, [courseId])

  async function add() {
    if (!newMod.trim()) return
    await addModule(courseId, newMod.trim(), modules.length + 1); setNewMod(''); load()
  }
  async function rm(id: string) { if (confirm('حذف الوحدة ودروسها؟')) { await deleteModule(id); load() } }

  if (loading) return <div className="p-4 flex justify-center border-t border-zinc-50"><Loader2 className="animate-spin text-zinc-300" size={20} /></div>

  return (
    <div className="border-t border-zinc-50 p-4 space-y-3 bg-zinc-50/40">
      {modules.map((m, i) => <ModuleBlock key={m.id} module={m} index={i} onDelete={() => rm(m.id)} />)}
      <div className="flex gap-2">
        <input value={newMod} onChange={e => setNewMod(e.target.value)} placeholder="إضافة وحدة جديدة (مثال: الوحدة 1 — التحية)" className={INP} />
        <button onClick={add} disabled={!newMod.trim()} className="flex items-center gap-1 text-[13px] font-bold px-3 py-2 rounded-lg bg-zinc-900 text-white disabled:opacity-50"><Layers size={13} /> وحدة</button>
      </div>
    </div>
  )
}

function ModuleBlock({ module, index, onDelete }: { module: LmsModule; index: number; onDelete: () => void }) {
  const [lessons, setLessons] = useState<LmsLesson[]>([])
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  // lesson form
  const [lTitle, setLTitle] = useState(''); const [lType, setLType] = useState('video')
  const [lVideo, setLVideo] = useState(''); const [lFile, setLFile] = useState(''); const [lEx, setLEx] = useState('')
  const [lQuiz, setLQuiz] = useState(false); const [lLock, setLLock] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() { setLessons(await fetchLessons(module.id)) }
  useEffect(() => { if (open) load() }, [open])

  async function add() {
    if (!lTitle.trim()) return
    setSaving(true)
    await addLesson({ moduleId: module.id, title: lTitle.trim(), order: lessons.length + 1, lessonType: lType, videoUrl: lVideo || undefined, fileUrl: lFile || undefined, exerciseUrl: lEx || undefined, hasQuiz: lQuiz, isLocked: lLock })
    setLTitle(''); setLVideo(''); setLFile(''); setLEx(''); setLQuiz(false); setLLock(false); setShowForm(false)
    await load(); setSaving(false)
  }
  async function rm(id: string) { await deleteLesson(id); load() }
  async function lock(l: LmsLesson) { await toggleLessonLock(l.id, !l.is_locked); load() }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2 p-3 text-right">
        <span className="w-6 h-6 rounded bg-zinc-100 text-zinc-500 text-[11px] font-black flex items-center justify-center flex-shrink-0">{index + 1}</span>
        <span className="flex-1 font-bold text-[13px] text-zinc-800">{module.title}</span>
        <span className="text-[11px] text-zinc-400">{open ? 'إغلاق' : 'الدروس'}</span>
        <button onClick={e => { e.stopPropagation(); onDelete() }} className="text-zinc-300 hover:text-red-500"><Trash2 size={14} /></button>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-zinc-50 pt-2">
          {lessons.map((l, i) => {
            const Icon = TYPE_ICON[l.lesson_type] ?? Video
            return (
              <div key={l.id} className="flex items-center gap-2.5 border border-zinc-100 rounded-lg p-2">
                <span className="text-[10px] text-zinc-400 w-4">{i + 1}</span>
                <Icon size={14} className="text-zinc-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-800 truncate">{l.title}</div>
                  <div className="text-[10px] text-zinc-400 flex gap-1.5">
                    {LESSON_TYPES.find(t => t.id === l.lesson_type)?.label}
                    {l.video_url && <span>· فيديو</span>}{l.file_url && <span>· ملف</span>}{l.exercise_url && <span>· تمرين</span>}{l.has_quiz && <span>· اختبار</span>}
                  </div>
                </div>
                <button onClick={() => lock(l)} className={l.is_locked ? 'text-amber-500' : 'text-zinc-300'} title={l.is_locked ? 'مقفل' : 'مفتوح'}>{l.is_locked ? <Lock size={14} /> : <Unlock size={14} />}</button>
                <button onClick={() => rm(l.id)} className="text-zinc-300 hover:text-red-500"><X size={14} /></button>
              </div>
            )
          })}

          {showForm ? (
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input value={lTitle} onChange={e => setLTitle(e.target.value)} placeholder="عنوان الدرس *" className={INP} />
                <select value={lType} onChange={e => setLType(e.target.value)} className={INP}>{LESSON_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
              </div>
              <input value={lVideo} onChange={e => setLVideo(e.target.value)} placeholder="رابط الفيديو (يوتيوب...)" dir="ltr" className={INP + ' text-right'} />
              <input value={lFile} onChange={e => setLFile(e.target.value)} placeholder="رابط ملف / PDF" dir="ltr" className={INP + ' text-right'} />
              <input value={lEx} onChange={e => setLEx(e.target.value)} placeholder="رابط تمرين على Inglizi.com" dir="ltr" className={INP + ' text-right'} />
              <div className="flex items-center gap-4 text-[12px] text-zinc-600">
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={lQuiz} onChange={e => setLQuiz(e.target.checked)} className="accent-yellow-400" /> يحتوي اختبارًا</label>
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={lLock} onChange={e => setLLock(e.target.checked)} className="accent-yellow-400" /> مقفل</label>
              </div>
              <div className="flex gap-2">
                <button onClick={add} disabled={saving || !lTitle.trim()} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold text-[12px] disabled:opacity-50">{saving ? <Loader2 size={13} className="animate-spin mx-auto" /> : 'حفظ الدرس'}</button>
                <button onClick={() => setShowForm(false)} className="px-3 py-2 border border-zinc-200 rounded-lg text-[12px] text-zinc-500">إلغاء</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)} className="w-full py-2 rounded-lg border-2 border-dashed border-zinc-200 text-zinc-500 hover:border-yellow-400 hover:text-yellow-600 text-[12px] font-semibold flex items-center justify-center gap-1.5"><Plus size={13} /> إضافة درس</button>
          )}
        </div>
      )}
    </div>
  )
}
